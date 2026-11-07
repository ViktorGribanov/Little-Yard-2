@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 goto no_node

echo.
echo   Little Yard - local preview of the prototype.
echo   The browser opens by itself. Keep this window open: it is the
echo   local server. Closing the window stops the preview.
echo.

node "preview\serve.mjs" --open
if errorlevel 1 goto failed
exit /b 0

:no_node
echo.
echo   Node.js was not found - the preview cannot run without it.
echo   Install Node.js (LTS) from https://nodejs.org and run this file again.
echo.
pause
exit /b 1

:failed
echo.
echo   The server stopped with an error - details are above.
echo.
pause
exit /b 1
