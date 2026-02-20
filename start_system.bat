@echo off
echo Starting Fair-Hire Application System...
echo.

echo [1/2] Starting Backend Server...
cd backend
start "Fair-Hire Backend" cmd /k "python main.py"
timeout /t 5 /nobreak > nul

echo [2/2] Starting Frontend Server...
cd ..\frontend
start "Fair-Hire Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Fair-Hire System Started!
echo ========================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo ========================================
echo.
echo Press any key to exit (servers will continue running)...
pause > nul
