@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required to start Texas County Map Studio.
  echo Install Node.js, then run this launcher again.
  pause
  exit /b 1
)
node scripts\serve-local.mjs
if errorlevel 1 (
  echo.
  echo Texas County Map Studio could not start. The message above explains why.
  pause
)
