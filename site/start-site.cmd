@echo off
setlocal
cd /d "%~dp0"

rem Node не использует системный прокси Windows (VPN-клиент поднимает его
rem на 127.0.0.1). Включаем поддержку переменных прокси и читаем HTTPS_PROXY
rem из .env, если он там указан.
set "NODE_USE_ENV_PROXY=1"
if exist ".env" for /f "usebackq tokens=1,2 delims==" %%A in (`findstr /b /i "HTTPS_PROXY=" ".env" 2^>nul`) do set "%%A=%%B"

where node >nul 2>&1
if errorlevel 1 goto no_node

echo.
echo   Little Yard - site + admin.
echo   Two windows will open: the site (4321) and the admin backend (8081).
echo   Keep both open; closing them stops everything.
echo.

start "Little Yard - site" cmd /k npm run dev
start "Little Yard - admin" cmd /k npm run cms
timeout /t 7 /nobreak >nul
start "" "http://localhost:4321/admin/"
exit /b 0

:no_node
echo.
echo   Node.js was not found - the site cannot run without it.
echo   Install Node.js (LTS) from https://nodejs.org and run this file again.
echo.
pause
exit /b 1
