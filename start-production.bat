@echo off
title GangCinta-Website Production Server
echo ========================================================
echo   Menjalankan GangCinta-Website (Mode Production)
echo ========================================================
echo Membangun aset produksi...
call npm run build
if %errorlevel% neq 0 (
    echo Gagal melakukan build!
    pause
    exit /b %errorlevel%
)
echo.
echo Menjalankan Server Produksi GangCinta-Website di Port 3000...
set NODE_ENV=production
set PORT=3000
node server/server.js
pause
