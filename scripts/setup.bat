@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Fair-Hire Sentinel - Setup Script (Windows)
echo ========================================
echo.

REM Check prerequisites
echo Checking prerequisites...

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is required but not installed.
    exit /b 1
)
echo [OK] Docker found

where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is required but not installed.
    exit /b 1
)
echo [OK] Docker Compose found

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is required but not installed.
    exit /b 1
)
echo [OK] Node.js found

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python 3 is required but not installed.
    exit /b 1
)
echo [OK] Python 3 found

echo.
echo Setting up environment...

REM Create environment file
if not exist .env (
    copy .env.example .env
    echo [OK] Created .env file from template
    echo [WARNING] Please update .env with your actual credentials
) else (
    echo [OK] .env file already exists
)

echo.
echo Setting up backend...
cd backend

if not exist venv (
    python -m venv venv
    echo [OK] Created Python virtual environment
)

call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
echo [OK] Installed backend dependencies

cd ..

echo.
echo Setting up frontend...
cd frontend

if not exist node_modules (
    npm install
    echo [OK] Installed frontend dependencies
) else (
    echo [OK] Frontend dependencies already installed
)

cd ..

echo.
echo Creating directories...
if not exist logs mkdir logs
if not exist data\postgres mkdir data\postgres
if not exist data\redis mkdir data\redis
echo [OK] Created necessary directories

echo.
echo Building Docker images...
docker-compose build
echo [OK] Docker images built successfully

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Update .env file with your credentials
echo 2. Run "docker-compose up" to start all services
echo 3. Visit http://localhost:3000 for the frontend
echo 4. Visit http://localhost:8000/docs for API documentation
echo.
echo For development:
echo - Backend: cd backend ^&^& venv\Scripts\activate ^&^& uvicorn main:app --reload
echo - Frontend: cd frontend ^&^& npm run dev
echo.

pause
