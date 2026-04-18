@echo off
echo ========================================
echo   ONE PIECE ARENA - DEPLOY SCRIPT
echo ========================================
echo.

echo [1/4] Checking git status...
git status
echo.

echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo 1. Tao GitHub repo moi:
echo    - Vao: https://github.com/new
echo    - Ten repo: one-piece-arena
echo    - Public hoac Private
echo    - KHONG chon "Initialize with README"
echo.
echo 2. Sau khi tao repo, chay lenh nay:
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/one-piece-arena.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Deploy len Railway:
echo    - Vao: https://railway.app
echo    - Login bang GitHub
echo    - New Project ^> Deploy from GitHub repo
echo    - Chon repo: one-piece-arena
echo    - Generate Domain
echo.
echo 4. Hoac dung Railway CLI:
echo    railway login
echo    railway init
echo    railway up
echo    railway domain
echo.
echo ========================================
echo.

pause
