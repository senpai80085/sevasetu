# Install all Python and Node.js dependencies for SevaSetu platform

Write-Host "`n=== SevaSetu Dependency Installation ===" -ForegroundColor Cyan

# Check Python
Write-Host "`nChecking Python..." -ForegroundColor Yellow
python --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python not found. Please install Python 3.9+" -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host "`nChecking Node.js..." -ForegroundColor Yellow
node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js not found. Please install Node.js 16+" -ForegroundColor Red
    exit 1
}

# Install Python dependencies
Write-Host "`n=== Installing Python Dependencies ===" -ForegroundColor Cyan

$services = @(
    "services\shared",
    "services\caregiver-api",
    "services\civilian-api",
    "services\ai-service",
    "services\safety-service"
)

foreach ($service in $services) {
    Write-Host "`nInstalling dependencies for $service..." -ForegroundColor Yellow
    $reqFile = "$service\requirements.txt"
    
    if (Test-Path $reqFile) {
        pip install -r $reqFile
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ $service dependencies installed" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to install $service dependencies" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠ No requirements.txt found for $service" -ForegroundColor Yellow
    }
}

# Install Node dependencies
Write-Host "`n=== Installing Node.js Dependencies ===" -ForegroundColor Cyan

$frontendApps = @(
    "frontend\civilian-app",
    "frontend\caregiver-app"
)

foreach ($app in $frontendApps) {
    Write-Host "`nInstalling dependencies for $app..." -ForegroundColor Yellow
    
    if (Test-Path "$app\package.json") {
        Push-Location $app
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ $app dependencies installed" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to install $app dependencies" -ForegroundColor Red
        }
        Pop-Location
    } else {
        Write-Host "⚠ No package.json found for $app" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ All dependencies installed successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Setup database: python scripts\setup_database.py --seed"
Write-Host "2. Train AI model: python services\ai-service\model\train.py"
Write-Host "3. Start services: .\scripts\start_all.ps1"
