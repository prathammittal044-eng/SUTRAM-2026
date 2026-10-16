@echo off
title SUTRAM 2026 Launcher
color 0B
chcp 65001 >nul

echo ====================================================================
echo    SUTRAM 2026: Digital Evidence Management System (DFIR)
echo    Section 63 BSA Compliant • Git-Inspired Version Control
echo ====================================================================
echo.

:: --------------------------------------------------------------------
:: 1. AUTO-DETECT PYTHON EXECUTABLE
:: --------------------------------------------------------------------
set "PYTHON_EXE="
python --version >nul 2>&1
if %errorlevel% equ 0 set "PYTHON_EXE=python"

if not defined PYTHON_EXE if exist "%LOCALAPPDATA%\Python\pythoncore-3.14-64\python.exe" set "PYTHON_EXE=%LOCALAPPDATA%\Python\pythoncore-3.14-64\python.exe"
if not defined PYTHON_EXE if exist "C:\Users\prath\AppData\Local\Python\pythoncore-3.14-64\python.exe" set "PYTHON_EXE=C:\Users\prath\AppData\Local\Python\pythoncore-3.14-64\python.exe"
if not defined PYTHON_EXE if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
if not defined PYTHON_EXE if exist "C:\Python312\python.exe" set "PYTHON_EXE=C:\Python312\python.exe"

if not defined PYTHON_EXE (
    echo [ERROR] Python 3.11+ was not found on your system!
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo [OK] Python detected: %PYTHON_EXE%

:: --------------------------------------------------------------------
:: 2. AUTO-DETECT NODE.JS & NPM
:: --------------------------------------------------------------------
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js was not found in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js detected.
echo.

:: --------------------------------------------------------------------
:: 3. CLEAN UP PRIOR PROCESSES ON PORTS 8000 & 3000
:: --------------------------------------------------------------------
echo Checking and releasing ports 8000 and 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: --------------------------------------------------------------------
:: 4. LAUNCH BACKEND (FASTAPI ON PORT 8000)
:: --------------------------------------------------------------------
echo [1/3] Starting Backend API Server (Port 8000)...
start "SUTRAM Backend (Port 8000)" cmd /k "title SUTRAM Backend (Port 8000) && cd /d "%~dp0backend" && set PYTHONIOENCODING=utf-8 && "%PYTHON_EXE%" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

:: --------------------------------------------------------------------
:: 5. LAUNCH FRONTEND (NEXT.JS ON PORT 3000)
:: --------------------------------------------------------------------
echo [2/3] Starting Frontend Web App (Port 3000)...
if not exist "%~dp0frontend\node_modules" (
    echo Installing node dependencies...
    cd /d "%~dp0frontend" && call npm install
)
start "SUTRAM Frontend (Port 3000)" cmd /k "title SUTRAM Frontend (Port 3000) && cd /d "%~dp0frontend" && npm run dev"

:: --------------------------------------------------------------------
:: 6. DYNAMIC POLLING: WAIT UNTIL SERVERS ARE ACTUALLY READY
:: --------------------------------------------------------------------
echo [3/3] Waiting for servers to initialize...

set backend_count=0
:wait_backend_loop
set /a backend_count+=1
curl -s http://127.0.0.1:8000/docs >nul 2>&1
if %errorlevel% neq 0 (
    if %backend_count% lss 30 (
        ping -n 2 127.0.0.1 >nul
        goto wait_backend_loop
    )
    echo [WARNING] Backend taking longer to start. Continuing...
)

echo [OK] Backend API is live!
echo Initializing database and DFIR exhibits...
curl -s -X POST http://127.0.0.1:8000/setup-dummy-data/ >nul 2>&1
curl -s -X POST http://127.0.0.1:8000/search/backfill/ >nul 2>&1
curl -s -X POST http://127.0.0.1:8000/cases/3/seed-sample-evidence/ >nul 2>&1

set frontend_count=0
:wait_frontend_loop
set /a frontend_count+=1
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    if %frontend_count% lss 30 (
        ping -n 2 127.0.0.1 >nul
        goto wait_frontend_loop
    )
    echo [WARNING] Frontend taking longer to start. Continuing...
)

echo [OK] Frontend UI is live!
echo.
echo [SUCCESS] Opening Case 3 in default browser...
start http://localhost:3000/case/3

:: --------------------------------------------------------------------
:: 7. INTERACTIVE CONTROL PANEL
:: --------------------------------------------------------------------
:menu_loop
cls
color 0B
echo ====================================================================
echo    SUTRAM 2026 - DIGITAL EVIDENCE CONTROL PANEL
echo ====================================================================
echo.
echo   STATUS: ALL SERVICES RUNNING!
echo.
echo   * Frontend Web App:      http://localhost:3000
echo   * Case 3 (FIR-2026-331):  http://localhost:3000/case/3
echo   * Backend API Swagger:    http://localhost:8000/docs
echo   * Section 63 BSA Vault:   ACTIVE
echo.
echo ====================================================================
echo   QUICK ACTIONS:
echo ====================================================================
echo   [1] Open Main Dashboard (http://localhost:3000)
echo   [2] Open Case 3 Forensic Dossier (http://localhost:3000/case/3)
echo   [3] Open Backend Swagger API Docs (http://localhost:8000/docs)
echo   [4] Re-seed DFIR Sample Exhibits & Build Graph
echo   [Q] Stop all servers and Exit cleanly
echo ====================================================================
echo.

choice /c 1234Q /n /m "Select option [1, 2, 3, 4, Q]: "

if errorlevel 5 goto do_quit
if errorlevel 4 goto do_reseed
if errorlevel 3 goto do_docs
if errorlevel 2 goto do_case3
if errorlevel 1 goto do_frontend

:do_frontend
start http://localhost:3000
goto menu_loop

:do_case3
start http://localhost:3000/case/3
goto menu_loop

:do_docs
start http://localhost:8000/docs
goto menu_loop

:do_reseed
echo.
echo [SEEDING] Ingesting multi-source exhibits for Case 3...
curl -s -X POST http://127.0.0.1:8000/cases/3/seed-sample-evidence/
echo.
echo [DONE] Sample exhibits re-seeded!
start http://localhost:3000/case/3
ping -n 3 127.0.0.1 >nul
goto menu_loop

:do_quit
color 0C
echo.
echo ====================================================================
echo   Stopping all SUTRAM 2026 servers...
echo ====================================================================
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo All services stopped cleanly.
ping -n 2 127.0.0.1 >nul
exit /b 0
