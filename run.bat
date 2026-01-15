@echo off
REM Smart Restaurant Management System - Startup Script

cls
echo.
echo ================================================
echo   Smart Restaurant Management System (SRMS)
echo   Startup Script
echo ================================================
echo.

REM Check Node.js
echo [1/3] Checking Node.js environment...
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)
echo + Node.js installed
echo.

REM Check and install dependencies
echo [2/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo x Dependency installation failed
        pause
        exit /b 1
    )
    echo + Dependencies installed
) else (
    echo + Dependencies already exist
)
echo.

REM Check .env file
echo [3/3] Checking environment configuration...
if not exist ".env" (
    echo Creating .env configuration file...
    (
        echo # MongoDB connection
        echo MONGO_URI=mongodb://localhost:27017/srms
        echo.
        echo # JWT config
        echo JWT_SECRET=your-secret-key-change-this-in-production
        echo JWT_EXPIRES=7d
        echo.
        echo # Client URL
        echo CLIENT_URL=http://localhost:3000
        echo.
        echo # Server port
        echo PORT=5000
    ) > .env
    echo + .env configuration file created, please modify as needed
) else (
    echo + .env file already exists
)
echo.

REM Start services
echo ================================================
echo   Starting servers...
echo   Frontend: http://localhost:3000
echo   Backend: http://localhost:5000
echo ================================================
echo.

REM Start backend
start "Backend Server" cmd /k "npm run start-server"

REM Wait for backend startup
timeout /t 3 /nobreak

REM Start frontend
start "Frontend App" cmd /k "npm start"

echo.
echo + All services started successfully!
echo.
pause
