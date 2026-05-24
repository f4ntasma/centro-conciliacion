@echo off
echo ============================================
echo  Instalando IustitiaEtPax...
echo ============================================
echo.

set DESTINO=C:\IustitiaEtPax
set ORIGEN=%~dp0

echo Destino: %DESTINO%
echo.

REM --- Cerrar la app si estaba abierta ---
taskkill /F /IM "IustitiaEtPax.exe" >nul 2>&1
taskkill /F /IM "electron.exe" >nul 2>&1
timeout /t 2 /nobreak >nul

REM --- Crear carpeta destino ---
if exist "%DESTINO%" (
    echo Actualizando instalacion existente...
    rmdir /s /q "%DESTINO%"
)
mkdir "%DESTINO%"

REM --- Copiar archivos del proyecto ---
echo Copiando archivos (puede tardar unos minutos)...

robocopy "%ORIGEN%." "%DESTINO%" main.js package.json /NFL /NDL /NJH /NJS

echo Copiando backend...
robocopy "%ORIGEN%backend" "%DESTINO%\backend" /E /NFL /NDL /NJH /NJS /XD ".git"

echo Copiando frontend...
robocopy "%ORIGEN%frontend" "%DESTINO%\frontend" /E /NFL /NDL /NJH /NJS /XD ".git" ".next\cache"

echo Copiando node_modules raiz...
robocopy "%ORIGEN%node_modules" "%DESTINO%\node_modules" /E /NFL /NDL /NJH /NJS

REM --- Verificar archivos criticos ---
echo.
echo Verificando instalacion...
if not exist "%DESTINO%\main.js" (
    echo ERROR: main.js no se copio
    pause & exit /b 1
)
if not exist "%DESTINO%\backend\dist\main.js" (
    echo ERROR: backend\dist\main.js no se copio
    pause & exit /b 1
)
if not exist "%DESTINO%\frontend\.next\BUILD_ID" (
    echo ERROR: frontend\.next no se copio
    pause & exit /b 1
)
if not exist "%DESTINO%\frontend\node_modules\next\dist\bin\next" (
    echo ERROR: frontend\node_modules\next no se copio
    pause & exit /b 1
)
if not exist "%DESTINO%\backend\node_modules\@nestjs\core" (
    echo ERROR: backend\node_modules no se copio
    pause & exit /b 1
)
echo    OK - todos los archivos presentes

REM --- Crear lanzador VBS (abre la app sin ventana de terminal) ---
echo.
echo Creando lanzador...
(
echo Set WshShell = CreateObject^("WScript.Shell"^)
echo WshShell.CurrentDirectory = "C:\IustitiaEtPax"
echo WshShell.Run "cmd /c npx electron . > ""%TEMP%\iustitia-log.txt"" 2>&1", 0, False
) > "%DESTINO%\IustitiaEtPax.vbs"

REM --- Crear acceso directo en el escritorio ---
echo Creando acceso directo en el escritorio...
set ESCRITORIO=%USERPROFILE%\Desktop
(
echo Set oWS = WScript.CreateObject^("WScript.Shell"^)
echo sLinkFile = "%ESCRITORIO%\IustitiaEtPax.lnk"
echo Set oLink = oWS.CreateShortcut^(sLinkFile^)
echo oLink.TargetPath = "C:\IustitiaEtPax\IustitiaEtPax.vbs"
echo oLink.WorkingDirectory = "C:\IustitiaEtPax"
echo oLink.Description = "IustitiaEtPax - Sistema de Conciliacion"
if exist "%ORIGEN%frontend\public\logowithbackground.png" (
echo oLink.IconLocation = "C:\IustitiaEtPax\frontend\public\logowithbackground.png"
)
echo oLink.Save
) > "%TEMP%\crear_acceso.vbs"
cscript //nologo "%TEMP%\crear_acceso.vbs"
del "%TEMP%\crear_acceso.vbs"

REM --- Crear tambien acceso directo en el menu inicio ---
set INICIO=%APPDATA%\Microsoft\Windows\Start Menu\Programs
(
echo Set oWS = WScript.CreateObject^("WScript.Shell"^)
echo sLinkFile = "%INICIO%\IustitiaEtPax.lnk"
echo Set oLink = oWS.CreateShortcut^(sLinkFile^)
echo oLink.TargetPath = "C:\IustitiaEtPax\IustitiaEtPax.vbs"
echo oLink.WorkingDirectory = "C:\IustitiaEtPax"
echo oLink.Description = "IustitiaEtPax - Sistema de Conciliacion"
echo oLink.Save
) > "%TEMP%\crear_inicio.vbs"
cscript //nologo "%TEMP%\crear_inicio.vbs"
del "%TEMP%\crear_inicio.vbs"

echo.
echo ============================================
echo  Instalacion completada!
echo  Acceso directo creado en el escritorio.
echo  Abriendo la aplicacion...
echo ============================================
echo.

REM --- Abrir la app inmediatamente ---
cscript //nologo "%DESTINO%\IustitiaEtPax.vbs"

timeout /t 3 /nobreak >nul
echo Listo. Puedes cerrar esta ventana.
pause
