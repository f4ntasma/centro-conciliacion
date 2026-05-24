@echo off
echo ========================================
echo Generando .exe de IustitiaEtPax...
echo ========================================

echo.
echo 1. Limpiando builds anteriores...
if exist dist rmdir /s /q dist
if exist app-resources rmdir /s /q app-resources
if exist frontend\.next rmdir /s /q frontend\.next
if exist backend\dist rmdir /s /q backend\dist
if exist frontend\.env.local del /f /q frontend\.env.local

echo.
echo 2. Construyendo frontend...
cd frontend
call npm run build
if errorlevel 1 ( echo ERROR: Fallo el build del frontend & pause & exit /b 1 )
cd ..

echo.
echo 3. Construyendo backend...
cd backend
call npm run build
if errorlevel 1 ( echo ERROR: Fallo el build del backend & pause & exit /b 1 )
cd ..

echo.
echo 4. Copiando archivos a app-resources...
mkdir app-resources

echo    Copiando backend\dist...
robocopy backend\dist app-resources\backend\dist /E /NFL /NDL /NJH /NJS /nc /ns /np

echo    Copiando backend\node_modules como _modules (electron-builder ignora node_modules)...
robocopy backend\node_modules app-resources\backend\_modules /E /NFL /NDL /NJH /NJS /nc /ns /np

copy backend\package.json app-resources\backend\package.json >nul
copy backend\base-datos-conciliacion.json app-resources\backend\base-datos-conciliacion.json >nul

echo    Copiando frontend\.next...
robocopy frontend\.next app-resources\frontend\.next /E /NFL /NDL /NJH /NJS /nc /ns /np

echo    Copiando frontend\public...
robocopy frontend\public app-resources\frontend\public /E /NFL /NDL /NJH /NJS /nc /ns /np

echo    Copiando frontend\node_modules como _modules...
robocopy frontend\node_modules app-resources\frontend\_modules /E /NFL /NDL /NJH /NJS /nc /ns /np

copy frontend\package.json app-resources\frontend\package.json >nul

echo.
echo 5. Verificando archivos criticos...
if not exist app-resources\backend\dist\main.js (
    echo ERROR: backend\dist\main.js no se copio & pause & exit /b 1
)
if not exist app-resources\frontend\.next\BUILD_ID (
    echo ERROR: frontend\.next\BUILD_ID no se copio & pause & exit /b 1
)
if not exist app-resources\frontend\_modules\next\dist\bin\next (
    echo ERROR: frontend\_modules\next no se copio & pause & exit /b 1
)
if not exist app-resources\backend\_modules\@nestjs\core (
    echo ERROR: backend\_modules\@nestjs\core no se copio & pause & exit /b 1
)
echo    OK - todos los archivos criticos presentes

echo.
echo 6. Generando instalador .exe...
call npx electron-builder --win
if errorlevel 1 ( echo ERROR: Fallo electron-builder & pause & exit /b 1 )

echo.
echo 7. Limpiando app-resources temporal...
rmdir /s /q app-resources

echo.
echo ========================================
echo EXE GENERADO - busca en la carpeta dist\
echo ========================================
pause
