@echo off
echo ========================================
echo    Fair-Hire Sentinel Startup
echo ========================================
echo.
echo Starting the AI-powered safety layer for ATS systems...
echo.

echo [1/3] Installing Python dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error installing Python dependencies!
    pause
    exit /b 1
)

echo.
echo [2/3] Starting FastAPI backend server...
start "Fair-Hire Sentinel Backend" cmd /k "python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo [3/3] Starting Next.js frontend...
cd ..\frontend
start "Fair-Hire Sentinel Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo    Fair-Hire Sentinel is starting up!
echo ========================================
echo.
echo Backend API: http://localhost:8000
echo Frontend App: http://localhost:3000
echo Dashboard: http://localhost:3000/dashboard
echo.
echo Press any key to continue...
pause > nul