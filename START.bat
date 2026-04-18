@echo off
echo ========================================
echo   ONE PIECE ARENA - KHOI DONG SERVER
echo ========================================
echo.
echo Dang khoi dong server...
echo.

cd /d "%~dp0"
start "One Piece Arena Server" cmd /k "npm start"

timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   SERVER DANG CHAY!
echo ========================================
echo.
echo Mo trinh duyet va vao: http://localhost:3000
echo.
echo De ban be choi qua internet:
echo 1. Tai ngrok: https://ngrok.com/download
echo 2. Chay lenh: ngrok http 3000
echo 3. Copy link va chia se!
echo.
echo Nhan phim bat ky de mo trinh duyet...
pause >nul

start http://localhost:3000
