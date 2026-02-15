# ============================================================
#   SevaSetu Platform - Setup Script
#   Initializes the database, installs dependencies, and
#   starts all backend services + frontend apps.
# ============================================================

param(
    [switch]$SkipInstall,
    [switch]$ServicesOnly
)

$ErrorActionPreference = "Continue"
$ProjectRoot = $PSScriptRoot
if (-not $ProjectRoot) { $ProjectRoot = (Get-Location).Path }

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   SevaSetu Platform Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ------- Step 1: Check Prerequisites -------
Write-Host "[1/5] Checking prerequisites..." -ForegroundColor Yellow

# Python
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Python not found. Install Python 3.9+" -ForegroundColor Red
    exit 1
}
Write-Host "  Python: $pythonVersion" -ForegroundColor Green

# Node.js
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Node.js not found. Install Node.js 16+" -ForegroundColor Red
    exit 1
}
Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green

# ------- Step 2: Virtual Environment -------
Write-Host ""
Write-Host "[2/5] Setting up Python virtual environment..." -ForegroundColor Yellow

$VenvPath = Join-Path $ProjectRoot ".venv"
$PythonPath = Join-Path $VenvPath "Scripts\python.exe"
$PipPath = Join-Path $VenvPath "Scripts\pip.exe"

if (-not (Test-Path $VenvPath)) {
    Write-Host "  Creating virtual environment..."
    python -m venv $VenvPath
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR: Failed to create venv" -ForegroundColor Red
        exit 1
    }
}
Write-Host "  Venv ready: $VenvPath" -ForegroundColor Green

# ------- Step 3: Install Dependencies -------
if (-not $SkipInstall) {
    Write-Host ""
    Write-Host "[3/5] Installing dependencies..." -ForegroundColor Yellow

    # Python packages
    Write-Host "  Installing Python packages..."
    & $PipPath install fastapi uvicorn sqlalchemy pydantic python-jose httpx 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Python packages installed" -ForegroundColor Green
    }
    else {
        Write-Host "  WARNING: Some Python packages may have failed" -ForegroundColor Yellow
    }

    if (-not $ServicesOnly) {
        # Frontend: caregiver-app
        $cgAppPath = Join-Path $ProjectRoot "frontend\caregiver-app"
        if (Test-Path (Join-Path $cgAppPath "package.json")) {
            if (-not (Test-Path (Join-Path $cgAppPath "node_modules"))) {
                Write-Host "  Installing caregiver-app npm packages..."
                Push-Location $cgAppPath
                npm install 2>&1 | Out-Null
                Pop-Location
            }
            Write-Host "  caregiver-app packages ready" -ForegroundColor Green
        }

        # Frontend: civilian-app
        $civAppPath = Join-Path $ProjectRoot "frontend\civilian-app"
        if (Test-Path (Join-Path $civAppPath "package.json")) {
            if (-not (Test-Path (Join-Path $civAppPath "node_modules"))) {
                Write-Host "  Installing civilian-app npm packages..."
                Push-Location $civAppPath
                npm install 2>&1 | Out-Null
                Pop-Location
            }
            Write-Host "  civilian-app packages ready" -ForegroundColor Green
        }
    }
}
else {
    Write-Host ""
    Write-Host "[3/5] Skipping dependency install (-SkipInstall)" -ForegroundColor Yellow
}

# ------- Step 4: Initialize Database -------
Write-Host ""
Write-Host "[4/5] Initializing database..." -ForegroundColor Yellow

# Delete old database files to ensure clean schema
$dbFiles = @(
    (Join-Path $ProjectRoot "sevasetu.db"),
    (Join-Path $ProjectRoot "sevasetu.db-shm"),
    (Join-Path $ProjectRoot "sevasetu.db-wal"),
    (Join-Path $ProjectRoot "services\civilian-api\sevasetu.db"),
    (Join-Path $ProjectRoot "services\civilian-api\sevasetu.db-shm"),
    (Join-Path $ProjectRoot "services\civilian-api\sevasetu.db-wal"),
    (Join-Path $ProjectRoot "services\auth-service\sevasetu.db"),
    (Join-Path $ProjectRoot "services\auth-service\sevasetu.db-shm"),
    (Join-Path $ProjectRoot "services\auth-service\sevasetu.db-wal")
)
foreach ($f in $dbFiles) {
    if (Test-Path $f) { Remove-Item $f -Force -ErrorAction SilentlyContinue }
}

& $PythonPath (Join-Path $ProjectRoot "scripts\init_database.py")
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Database initialized and seeded" -ForegroundColor Green
}
else {
    Write-Host "  WARNING: Database init had issues" -ForegroundColor Yellow
}

# ------- Step 5: Start Services -------
Write-Host ""
Write-Host "[5/5] Starting all services..." -ForegroundColor Yellow

# Stop any existing processes
Get-Process python, node -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -match "SevaSetu" -or $_.CommandLine -match "SevaSetu"
} | Stop-Process -Force -ErrorAction SilentlyContinue

# Function to start a backend service
function Start-BackendService {
    param($Name, $MainPy, $Port)
    Write-Host "  Starting $Name (port $Port)..."
    $cmd = "-NoExit -Command `"Set-Location '$ProjectRoot'; `$host.UI.RawUI.WindowTitle='SevaSetu: $Name'; & '$PythonPath' '$MainPy'`""
    Start-Process powershell -ArgumentList $cmd -WindowStyle Normal
}

# Start Backend Services
Start-BackendService -Name "Auth Service" `
    -MainPy (Join-Path $ProjectRoot "services\auth-service\main.py") `
    -Port 8006

Start-Sleep -Seconds 1

Start-BackendService -Name "Caregiver API" `
    -MainPy (Join-Path $ProjectRoot "services\caregiver-api\main.py") `
    -Port 8001

Start-Sleep -Seconds 1

Start-BackendService -Name "Civilian API" `
    -MainPy (Join-Path $ProjectRoot "services\civilian-api\main.py") `
    -Port 8002

# Start Frontend Apps (unless -ServicesOnly)
if (-not $ServicesOnly) {
    Start-Sleep -Seconds 2

    Write-Host "  Starting Caregiver App (port 3001)..."
    $cgArgs = "-NoExit -Command `"Set-Location '$(Join-Path $ProjectRoot 'frontend\caregiver-app')'; `$host.UI.RawUI.WindowTitle='SevaSetu: Caregiver App'; `$env:PORT=3001; npm start`""
    Start-Process powershell -ArgumentList $cgArgs -WindowStyle Normal

    Start-Sleep -Seconds 2

    Write-Host "  Starting Civilian App (port 3000)..."
    $civArgs = "-NoExit -Command `"Set-Location '$(Join-Path $ProjectRoot 'frontend\civilian-app')'; `$host.UI.RawUI.WindowTitle='SevaSetu: Civilian App'; `$env:PORT=3000; npm start`""
    Start-Process powershell -ArgumentList $civArgs -WindowStyle Normal
}

# ------- Done -------
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   All services started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  Auth Service:    http://localhost:8006/health" -ForegroundColor White
Write-Host "  Caregiver API:   http://localhost:8001/health" -ForegroundColor White
Write-Host "  Civilian API:    http://localhost:8002/health" -ForegroundColor White
if (-not $ServicesOnly) {
    Write-Host "  Civilian App:    http://localhost:3000" -ForegroundColor White
    Write-Host "  Caregiver App:   http://localhost:3001" -ForegroundColor White
}
Write-Host ""
Write-Host "Options:" -ForegroundColor Cyan
Write-Host "  .\setup.ps1 -SkipInstall       Skip dependency installation"
Write-Host "  .\setup.ps1 -ServicesOnly       Start backend only (no frontends)"
Write-Host ""
Write-Host "Press Ctrl+C in each service window to stop." -ForegroundColor Yellow
Write-Host ""
