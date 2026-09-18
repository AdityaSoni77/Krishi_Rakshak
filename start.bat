@echo off
title KrishiRakshak AI

echo Starting KrishiRakshak AI...
echo.

:: Start backend in a new window
start "KrishiRakshak Backend" cmd /k "cd /d "%~dp0backend" && .venv\Scripts\activate && uvicorn app:app --reload --port 8000"

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

:: Start frontend in a new window
start "KrishiRakshak Frontend" cmd /k "cd /d "%~dp0" && npm run dev"

echo Both servers are starting in separate windows.
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Close both windows to stop the app.
pause
