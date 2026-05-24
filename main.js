const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');

let mainWindow;
let backendProcess;
let frontendProcess;
let startupDone = false;

// Log a archivo para diagnosticar en modo empaquetado
const logFile = path.join(require('os').tmpdir(), 'iustitia-log.txt');
function log(msg, ...args) {
  const full = [msg, ...args].join(' ');
  const line = `[${new Date().toISOString()}] ${full}\n`;
  process.stdout.write(line);
  try { fs.appendFileSync(logFile, line); } catch(_) {}
}
// Limpiar log anterior al iniciar
try { fs.writeFileSync(logFile, `=== Inicio ${new Date().toISOString()} ===\n`); } catch(_) {}

function getBasePath() {
  if (!app.isPackaged) return __dirname;
  return path.join(path.dirname(process.execPath), 'resources', 'app', 'app-resources');
}

// En el exe empaquetado, node_modules fue renombrado a _modules para evitar
// que electron-builder lo excluya. Lo restauramos al primer arranque.
function restoreModules(basePath) {
  for (const sub of ['backend', 'frontend']) {
    const src = path.join(basePath, sub, '_modules');
    const dst = path.join(basePath, sub, 'node_modules');
    if (fs.existsSync(src) && !fs.existsSync(dst)) {
      try {
        fs.renameSync(src, dst);
        log(`Restaurado ${sub}/node_modules`);
      } catch (e) {
        log(`Error restaurando ${sub}/node_modules:`, e.message);
      }
    }
  }
}

// Busca node.exe real — process.execPath en Electron apunta al binario de Electron, NO a node
function findNodeExe() {
  const candidates = [
    'C:\\Program Files\\nodejs\\node.exe',
    'C:\\Program Files (x86)\\nodejs\\node.exe',
    path.join(process.env.ProgramFiles || 'C:\\Program Files', 'nodejs', 'node.exe'),
    path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'nodejs', 'node.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'node', 'node.exe'),
    path.join(process.env.APPDATA || '', '..', 'Local', 'Programs', 'node', 'node.exe'),
    path.join(process.env.USERPROFILE || '', 'AppData', 'Local', 'Programs', 'node', 'node.exe'),
    path.join(process.env.USERPROFILE || '', '.nvm', 'current', 'node.exe'),
  ];
  for (const c of candidates) {
    try { if (fs.existsSync(c)) { log('node.exe encontrado en:', c); return c; } } catch(_) {}
  }
  // Buscar en PATH manualmente
  const pathDirs = (process.env.PATH || '').split(';');
  for (const dir of pathDirs) {
    const candidate = path.join(dir.trim(), 'node.exe');
    try { if (fs.existsSync(candidate)) { log('node.exe encontrado en PATH:', candidate); return candidate; } } catch(_) {}
  }
  log('ADVERTENCIA: node.exe no encontrado, usando "node" como fallback');
  return 'node';
}

function isPortFree(port) {
  // Verificar en 0.0.0.0 (dual-stack) igual que NestJS
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port, '0.0.0.0');
  });
}

async function findFreePort(candidates) {
  for (const port of candidates) {
    if (await isPortFree(port)) return port;
  }
  return null;
}

// Espera que un puerto TCP acepte conexiones (más confiable que HTTP)
function waitForPort(port, retries = 40, delay = 1000) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const sock = net.createConnection({ port, host: '127.0.0.1' });
      sock.once('connect', () => { sock.destroy(); resolve(); });
      sock.once('error', () => {
        if (retries-- > 0) setTimeout(attempt, delay);
        else reject(new Error(`Puerto ${port} no respondió en tiempo`));
      });
    };
    attempt();
  });
}

function createWindow(frontendPort) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'IustitiaEtPax',
    icon: path.join(getBasePath(), 'frontend', 'public', 'logowithbackground.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(`http://localhost:${frontendPort}`);
  mainWindow.on('closed', () => { mainWindow = null; });
}

function startBackend(port, nodeExe) {
  return new Promise((resolve, reject) => {
    const backendPath = path.join(getBasePath(), 'backend');
    const mainJsPath = path.join(backendPath, 'dist', 'main.js');

    log('Backend path:', backendPath);
    log('dist/main.js existe:', fs.existsSync(mainJsPath));
    log('node exe:', nodeExe);

    if (!fs.existsSync(mainJsPath)) {
      return reject(new Error(`No se encontró backend/dist/main.js en:\n${mainJsPath}`));
    }

    const useShell = nodeExe === 'node';
    const proc = spawn(nodeExe, ['dist/main.js'], {
      cwd: backendPath,
      shell: useShell,
      env: { ...process.env, PORT: String(port), NODE_ENV: 'production' },
    });

    let resolved = false;

    const checkReady = (text) => {
      // Texto exacto que imprime NestJS al arrancar
      if (!resolved && text.includes('Nest application successfully started')) {
        resolved = true;
        backendProcess = proc;
        resolve(port);
      }
    };

    proc.stdout.on('data', (d) => { const t = d.toString(); log(`Backend: ${t}`); checkReady(t); });
    proc.stderr.on('data', (d) => {
      const t = d.toString();
      console.error(`Backend STDERR: ${t}`);
      checkReady(t);
      if (!resolved && t.includes('EADDRINUSE')) {
        resolved = true;
        proc.kill();
        reject(new Error(`Puerto ${port} en uso`));
      }
    });

    proc.on('error', (err) => {
      console.error('Error spawn backend:', err);
      if (!resolved) { resolved = true; reject(err); }
    });

    proc.on('close', (code) => {
      log(`Backend cerrado con código ${code}`);
      if (!resolved) { resolved = true; reject(new Error(`Backend cerró inesperadamente (código ${code})`)); }
    });

    // Fallback a 25s: si el proceso sigue vivo, asumir que arrancó
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        if (proc.exitCode === null) {
          log('Backend: timeout alcanzado pero proceso vivo, asumiendo OK');
          backendProcess = proc;
          resolve(port);
        } else {
          reject(new Error('Backend no arrancó a tiempo y el proceso terminó'));
        }
      }
    }, 25000);
  });
}

function startFrontend(port, backendPort, nodeExe) {
  return new Promise((resolve, reject) => {
    const frontendPath = path.join(getBasePath(), 'frontend');
    const nextBin = path.join(frontendPath, 'node_modules', 'next', 'dist', 'bin', 'next');

    log('Frontend path:', frontendPath);
    log('next bin existe:', fs.existsSync(nextBin));

    if (!fs.existsSync(nextBin)) {
      return reject(new Error(`No se encontró next en:\n${nextBin}`));
    }

    // Escribir .env.local para que el rewrite de next.config.mjs use el puerto correcto del backend
    const envLocalPath = path.join(frontendPath, '.env.local');
    fs.writeFileSync(
      envLocalPath,
      `NEXT_PUBLIC_API_URL=http://localhost:${backendPort}/api\n`,
      'utf-8'
    );
    log(`Escrito .env.local: NEXT_PUBLIC_API_URL=http://localhost:${backendPort}/api`);

    const useShell = nodeExe === 'node';
    const proc = spawn(nodeExe, [nextBin, 'start', '-p', String(port)], {
      cwd: frontendPath,
      shell: useShell,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: String(port),
        NEXT_PUBLIC_API_URL: `http://localhost:${backendPort}/api`,
      },
    });

    frontendProcess = proc;

    proc.stdout.on('data', (d) => log(`Frontend: ${d}`));
    proc.stderr.on('data', (d) => console.error(`Frontend STDERR: ${d}`));
    proc.on('error', (err) => { console.error('Error spawn frontend:', err); reject(err); });
    proc.on('close', (code) => log(`Frontend cerrado con código ${code}`));

    // Esperar que el puerto TCP esté abierto — Next.js imprime "Ready in Xs" cuando está listo
    waitForPort(port, 60, 1000).then(resolve).catch(reject);
  });
}

app.whenReady().then(async () => {
  if (startupDone) return;
  startupDone = true;

  try {
    const nodeExe = findNodeExe();
    log('Node encontrado:', nodeExe);

    const basePath = getBasePath();
    log('Base path:', basePath);

    // Restaurar node_modules si fueron renombrados a _modules en el empaquetado
    if (app.isPackaged) restoreModules(basePath);

    const backendPort = await findFreePort([3001, 3002, 3003, 3004, 3006, 3007, 3008]);
    if (!backendPort) throw new Error('No hay puertos libres para el backend (3001-3008)');

    const frontendPort = await findFreePort([3005, 3011, 3012, 3013]);
    if (!frontendPort) throw new Error('No hay puertos libres para el frontend');

    log(`Puertos seleccionados — backend: ${backendPort}, frontend: ${frontendPort}`);

    await startBackend(backendPort, nodeExe);
    log(`✅ Backend listo en :${backendPort}`);

    // Confirmar con TCP que el backend acepta conexiones
    await waitForPort(backendPort, 15, 500);
    log(`✅ Backend TCP confirmado en :${backendPort}`);

    await startFrontend(frontendPort, backendPort, nodeExe);
    log(`✅ Frontend listo en :${frontendPort}`);

    createWindow(frontendPort);
    log('✅ Ventana creada');

  } catch (err) {
    console.error('Error al iniciar:', err);
    if (!mainWindow) {
      mainWindow = new BrowserWindow({
        width: 960, height: 500,
        title: 'IustitiaEtPax - Error de inicio',
        webPreferences: { nodeIntegration: true, contextIsolation: false },
        autoHideMenuBar: true,
      });
    }
    const msg = err.message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    mainWindow.loadURL(
      `data:text/html;charset=utf-8,<html><body style="font-family:sans-serif;padding:2rem;color:#333">` +
      `<h2 style="color:#c00">Error al iniciar IustitiaEtPax</h2>` +
      `<p style="background:#fee;padding:1rem;border-radius:4px">${msg}</p>` +
      `<p style="color:#888;font-size:0.85em">Asegúrate de que Node.js esté instalado correctamente.</p>` +
      `</body></html>`
    );
    mainWindow.webContents.openDevTools();
  }
});

app.on('window-all-closed', () => {
  if (backendProcess) { backendProcess.kill(); backendProcess = null; }
  if (frontendProcess) { frontendProcess.kill(); frontendProcess = null; }
  if (process.platform !== 'darwin') app.quit();
});
