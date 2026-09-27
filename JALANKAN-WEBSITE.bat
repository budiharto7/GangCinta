@echo off
title Portal Warga Gang Cinta
echo ========================================================
echo   MENJALANKAN PORTAL WARGA GANG CINTA
echo ========================================================
echo.
echo 1. Memeriksa file build produksi...
if not exist dist\index.html (
    echo Membangun aset website...
    call npm run build
)
echo.
echo 2. Membuka browser ke http://localhost:3000 ...
start http://localhost:3000
echo.
echo 3. Menjalankan Server di Port 3000...
set NODE_ENV=production
set PORT=3000
node server/server.js
pause
