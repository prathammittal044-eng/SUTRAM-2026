@echo off
title SUTRAM 2026 - Stop Services
color 0C
echo ====================================================================
echo   Stopping SUTRAM 2026 Services...
echo ====================================================================
echo.

echo Stopping Backend on Port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING 2^>nul') do (
    echo Stopping process PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo Stopping Frontend on Port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    echo Stopping process PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo All SUTRAM 2026 servers have been stopped.
ping -n 3 127.0.0.1 >nul
exit /b 0
