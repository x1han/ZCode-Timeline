@echo off
REM start-zcode-clean.bat
REM One-click: kill all ZCode, start fresh (loaded with patched asar),
REM wait for CDP port 9229, then attach Timeline via launcher.mjs.
REM WARNING: this terminates ALL running ZCode.exe processes including
REM          helper processes. Save any unsaved chats first.

setlocal
cd /d "%~dp0\.."

where node >nul 2>nul
if errorlevel 1 (
  echo [error] Node.js not found on PATH. Install from https://nodejs.org/.
  pause
  exit /b 1
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

REM Set the confirmation env var so the script refuses to run without it.
set "START_ZCODE_CLEAN_CONFIRM=yes-do-it"

node launcher\start-zcode-clean.mjs
endlocal
