@echo off
REM launcher.bat — Windows entry point.
REM Edit ZCODE_EXE below if your ZCode install is elsewhere.
REM Default candidates are tried first by zcode-finder.mjs.

setlocal
cd /d "%~dp0\.."

where node >nul 2>nul
if errorlevel 1 (
  echo [error] Node.js was not found on PATH.
  echo Install Node.js 20+ from https://nodejs.org/ and re-run.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [info] Installing dependencies (first run)...
  call npm install
  if errorlevel 1 (
    echo [error] npm install failed.
    pause
    exit /b 1
  )
)

if not exist "dist\timeline.iife.js" (
  echo [info] Building timeline bundle...
  call npm run build
  if errorlevel 1 (
    echo [error] Build failed.
    pause
    exit /b 1
  )
)

node launcher\launcher.mjs %*
endlocal
