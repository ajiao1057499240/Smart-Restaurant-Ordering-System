# Smart Restaurant Management System - Startup Script

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Smart Restaurant Management System (SRMS) Startup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[1/4] Checking Node.js environment..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: Node.js not found. Please install Node.js." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Dependencies
Write-Host "[2/4] Checking dependencies..." -ForegroundColor Yellow
if (-Not (Test-Path "node_modules")) {
    Write-Host "node_modules not found. Installing dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Dependency installation failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Dependencies already present" -ForegroundColor Green
}

Write-Host ""

# Check .env file
Write-Host "[3/4] Checking environment configuration (.env)..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    Write-Host "Warning: .env not found. Creating a template..." -ForegroundColor Yellow
    @"
# MongoDB connection
MONGO_URI=mongodb://localhost:27017/srms

# JWT config
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES=7d

# Frontend origin
CLIENT_URL=http://localhost:3000

# Backend port
PORT=5000
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✓ .env template created. Please adjust values as needed." -ForegroundColor Yellow
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}

Write-Host ""

# Start services
Write-Host "[4/4] Starting services..." -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Launching servers..." -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ========= Start MongoDB service if available =========
Write-Host "[0/4] Starting and checking MongoDB service..." -ForegroundColor Yellow
$svc = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
if ($svc) {
    if ($svc.Status -ne 'Running') {
        Write-Host "MongoDB service detected but not running. Starting..." -ForegroundColor Cyan
        try {
            Start-Service -Name MongoDB -ErrorAction Stop
            Start-Sleep -Seconds 2
            $svc = Get-Service -Name MongoDB
            if ($svc.Status -eq 'Running') {
                Write-Host "✓ MongoDB service started" -ForegroundColor Green
            } else {
                Write-Host "✗ Failed to start MongoDB service. Check services.msc" -ForegroundColor Red
            }
        } catch {
            Write-Host "✗ Error starting MongoDB service: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "✓ MongoDB service is running" -ForegroundColor Green
    }
} else {
    Write-Host "MongoDB service not found. Trying to launch mongod executable (if installed)." -ForegroundColor Yellow
    # Try mongod from PATH first
    $mongodCmd = Get-Command mongod -ErrorAction SilentlyContinue
    $dbpath = "D:\\MongoDB\\data"
    if (-Not (Test-Path $dbpath)) {
        New-Item -ItemType Directory -Path $dbpath -Force | Out-Null
        Write-Host "Created data directory: $dbpath" -ForegroundColor Cyan
    }

    if ($mongodCmd) {
        Write-Host "Launching mongod in a new window (dbpath: $dbpath)..." -ForegroundColor Cyan
        Start-Process -FilePath $mongodCmd.Source -ArgumentList "--dbpath `"$dbpath`"" -WindowStyle Normal
        Start-Sleep -Seconds 2
        Write-Host "Attempted to start mongod (check logs in the new window)." -ForegroundColor Yellow
    } else {
        # Check common install paths
        $possible = "C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe","C:\\Program Files\\MongoDB\\Server\\5.0\\bin\\mongod.exe"
        $found = $null
        foreach ($p in $possible) { if (Test-Path $p) { $found = $p; break } }
        if ($found) {
            Write-Host "Found mongod at $found. Launching in a new window (dbpath: $dbpath)..." -ForegroundColor Cyan
            Start-Process -FilePath $found -ArgumentList "--dbpath `"$dbpath`"" -WindowStyle Normal
            Start-Sleep -Seconds 2
            Write-Host "Attempted to start mongod (check logs in the new window)." -ForegroundColor Yellow
        } else {
            Write-Host "mongod executable not found. Consider installing MongoDB as a Windows service or start mongod manually." -ForegroundColor Red
        }
    }
}

# ========== Start backend and frontend ==========
Write-Host "[4/4] Starting services..." -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Launching servers..." -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Start backend server (background)
Write-Host "Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run start-server" -WindowStyle Normal

# Wait a few seconds for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Cyan
npm start

Write-Host ""
Write-Host "✓ All services launched." -ForegroundColor Green
