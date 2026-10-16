@echo off
title SUTRAM Backend (FastAPI :8000)
color 0B
chcp 65001 >nul
cd /d "%~dp0backend"
set PYTHONIOENCODING=utf-8

set "PYTHON_EXE="
python --version >nul 2>&1
if %errorlevel% equ 0 set "PYTHON_EXE=python"
if not defined PYTHON_EXE if exist "%LOCALAPPDATA%\Python\pythoncore-3.14-64\python.exe" set "PYTHON_EXE=%LOCALAPPDATA%\Python\pythoncore-3.14-64\python.exe"
if not defined PYTHON_EXE if exist "C:\Users\prath\AppData\Local\Python\pythoncore-3.14-64\python.exe" set "PYTHON_EXE=C:\Users\prath\AppData\Local\Python\pythoncore-3.14-64\python.exe"
if not defined PYTHON_EXE if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
if not defined PYTHON_EXE if exist "C:\Python312\python.exe" set "PYTHON_EXE=C:\Python312\python.exe"

if not defined PYTHON_EXE (
    echo ====================================================================
    echo [ERROR] Python 3.11+ was not found on your system!
    echo ====================================================================
    pause
    exit /b 1
)

echo ====================================================================
echo   SUTRAM Backend (FastAPI) starting on http://127.0.0.1:8000
echo   Python: %PYTHON_EXE%
echo ====================================================================
echo.

"%PYTHON_EXE%" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
if %errorlevel% neq 0 (
    echo.
    echo ====================================================================
    echo [ERROR] Backend crashed or exited with code %errorlevel%.
    echo ====================================================================
    pause
)
