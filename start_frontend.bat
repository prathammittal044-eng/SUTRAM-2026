@echo off
title SUTRAM Frontend (Next.js :3000)
color 0A
chcp 65001 >nul
cd /d "%~dp0frontend"

if not exist "%~dp0frontend\node_modules" (
    echo ====================================================================
    echo [INFO] First time run: Installing frontend dependencies...
    echo ====================================================================
    call npm install
)

echo ====================================================================
echo   SUTRAM Frontend (Next.js) starting on http://localhost:3000
echo ====================================================================
echo.

call npm run dev
if %errorlevel% neq 0 (
    echo.
    echo ====================================================================
    echo [ERROR] Frontend crashed or exited with code %errorlevel%.
    echo ====================================================================
    pause
)
