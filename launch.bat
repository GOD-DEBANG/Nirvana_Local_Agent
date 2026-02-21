@echo off
title CFA Unified Console - Starting Web Services...
echo [CFA] Transitioning to Web-First Unified Perspective...

:: Start Java Agent in background
echo [CFA] Starting Cognitive Field Agent (Background)...
cd cfa-agent
start /B java -jar cfa-agent.jar > nul 2>&1
cd ..

:: Start Python AI Microservice in background
echo [CFA] Starting AI Prediction Engine (Background)...
cd cfa-ai
start /B python microservice.py > nul 2>&1
cd ..

:: Start Vite UI and open browser
echo [CFA] Launching Neural Dashboard...
cd cfa-ui
start /B npm run dev
timeout /t 5 > nul
start http://localhost:5173

echo.
echo [SUCCESS] CFA Web App is running in the background.
echo [HINT] Close this window to keep services running, or use Task Manager to terminate.
pause
