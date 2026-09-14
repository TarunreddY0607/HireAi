@echo off
title HireAI Launcher

echo ========================================
echo          HIREAI STARTING...
echo ========================================
echo.

echo Starting Backend...
start "HireAI Backend" cmd /k "cd /d C:\Users\Srikanth Reddy\Desktop\HireAi\backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "HireAI Frontend" cmd /k "cd /d C:\Users\Srikanth Reddy\Desktop\HireAi\frontend && npm run dev"

timeout /t 5 /nobreak >nul

echo Starting ngrok...
start "HireAI ngrok" cmd /k "ngrok http 5173"

echo.
echo ========================================
echo       HIREAI STARTUP COMPLETE
echo ========================================
echo.

pause