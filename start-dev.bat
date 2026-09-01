@echo off
REM ─────────────────────────────────────────────────────────────
REM  CUS360_DEMO_UI_v2 - one-click dev server launcher
REM  Opens Vite in this window. Press Ctrl+C to stop, then close.
REM  Then open http://localhost:5173/ in your browser.
REM ─────────────────────────────────────────────────────────────
cd /d "%~dp0"
echo Starting CUS360 dev server (Vite) ...
echo Local:  http://localhost:5173/
echo Press Ctrl+C in this window to stop the server.
echo.
call npm run dev
pause
