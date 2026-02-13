Stop-Process -Name "python" -ErrorAction SilentlyContinue
Stop-Process -Name "node" -ErrorAction SilentlyContinue

Write-Host "Starting Auth Service..."
Start-Process -FilePath "python" -ArgumentList "services/auth-service/main.py" -WindowStyle Minimized

Write-Host "Starting Civilian API..."
Start-Process -FilePath "python" -ArgumentList "services/civilian-api/main.py" -WindowStyle Minimized

Write-Host "Starting Caregiver API..."
Start-Process -FilePath "python" -ArgumentList "services/caregiver-api/main.py" -WindowStyle Minimized

Write-Host "Starting Caregiver App..."
Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "frontend/caregiver-app" -WindowStyle Minimized

Write-Host "Starting Civilian App..."
Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "frontend/civilian-app" -WindowStyle Minimized

Write-Host "Demo Environment Started!"
