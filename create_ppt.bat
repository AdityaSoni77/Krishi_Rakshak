@echo off
title KrishiRakshak PPT Generator
color 0A
cd /d "%~dp0"

echo.
echo  ====================================
echo   KrishiRakshak AI - PPT Generator
echo  ====================================
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Node.js is not installed or not in PATH.
    echo.
    echo  Please install Node.js from https://nodejs.org
    echo  Then try again.
    echo.
    pause
    exit /b 1
)

echo  Node.js found:
node --version
echo.

:: Install pptxgenjs if missing
if not exist "node_modules\pptxgenjs\package.json" (
    echo  Installing pptxgenjs (first time only, please wait)...
    echo.
    npm install pptxgenjs --save
    if %errorlevel% neq 0 (
        echo.
        echo  ERROR: npm install failed. Check your internet connection.
        pause
        exit /b 1
    )
)

echo  Generating presentation...
echo.

node generate_ppt.js

if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Script failed. See the message above.
    pause
    exit /b 1
)

if exist "KrishiRakshak_SIH26131.pptx" (
    echo.
    echo  SUCCESS! Opening KrishiRakshak_SIH26131.pptx ...
    start "" "KrishiRakshak_SIH26131.pptx"
) else (
    echo.
    echo  File was not created. Check errors above.
)

echo.
pause
