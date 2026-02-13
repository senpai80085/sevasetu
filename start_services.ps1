$ProjectRoot = "C:\Users\PRIYANSHU\OneDrive\Desktop\SevaSetu"
$PythonPath = "$ProjectRoot\.venv\Scripts\python.exe"

Write-Host "Project Root: $ProjectRoot"
Write-Host "Python Path: $PythonPath"

# Stop existing python/node processes to ensure clean slate
Write-Host "Stopping existing Python and Node processes..."
Get-Process python, node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Function to start service in a new visible window
function Start-ServiceWindow {
    param($Name, $Path, $Command)
    Write-Host "Starting $Name..."
    # Use absolute python path to avoid activation issues
    $Args = "-NoExit -Command ""cd '$Path'; & '$PythonPath' $Command"""
    Start-Process powershell -ArgumentList $Args -WindowStyle Normal
}

# Start Backend Services
Start-ServiceWindow -Name "Auth Service (Port 8006)" -Path "$ProjectRoot\services\auth-service" -Command "main.py"
Start-ServiceWindow -Name "Caregiver API (Port 8001)" -Path "$ProjectRoot\services\caregiver-api" -Command "main.py"
Start-ServiceWindow -Name "Civilian API (Port 8002)" -Path "$ProjectRoot\services\civilian-api" -Command "main.py"

# Start Frontend Apps
Write-Host "Starting Caregiver App (Port 3001)..."
# Setting env var inside the command string for PowerShell
$CaregiverArgs = "-NoExit -Command ""cd '$ProjectRoot\frontend\caregiver-app'; `$env:PORT=3001; npm start"""
Start-Process powershell -ArgumentList $CaregiverArgs -WindowStyle Normal

Write-Host "Starting Civilian App (Port 3000)..."
$CivilianArgs = "-NoExit -Command ""cd '$ProjectRoot\frontend\civilian-app'; `$env:PORT=3000; npm start"""
Start-Process powershell -ArgumentList $CivilianArgs -WindowStyle Normal

Write-Host "All services launch commands issued."
Write-Host "Check the new PowerShell windows for status."
