@echo off
echo ========================================
echo Diagnosticando Puertos 3001-3005
echo ========================================
echo.

echo Verificando puertos en uso:
netstat -ano | findstr ":300"
echo.

echo Listando procesos Node.js:
tasklist | findstr "node.exe"
echo.

echo Listando procesos Electron:
tasklist | findstr "electron"
echo.

echo ========================================
echo Presiona cualquier tecla para cerrar...
pause > nul
