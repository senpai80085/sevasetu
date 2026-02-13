# Start all SevaSetu services in separate terminal windows

Write-Host "`n=== Starting SevaSetu Platform ===" -ForegroundColor Cyan

# Backend services
$backendServices = @(
    @{Name="Caregiver API"; Path="services\caregiver-api"; Port=8001},
    @{Name="Civilian API"; Path="services\civilian-api"; Port=8002},
    @{Name="AI Service"; Path="services\ai-service"; Port=8003},
    @{Name="Safety Service"; Path="services\safety-service"; Port=8005}
)

# Frontend apps
$frontendApps = @(
    @{Name="Civilian App"; Path="frontend\civilian-app"; Port=3000},
    @{Name="Caregiver App"; Path="frontend\caregiver-app"; Port=3001}
)

Write-Host "`nStarting backend services..." -ForegroundColor Yellow

foreach ($service in $backendServices) {
    $name = $service.Name
    $path = $service.Path
    $port = $service.Port
    
    Write-Host "Starting $name on port $port..." -ForegroundColor Green
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$path'; Write-Host '$name (Port: $port)' -ForegroundColor Cyan; python main.py"
    
    Start-Sleep -Seconds 1
}

Write-Host "`nWaiting for backend services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`nStarting frontend applications..." -ForegroundColor Yellow

foreach ($app in $frontendApps) {
    $name = $app.Name
    $path = $app.Path
    $port = $app.Port
    
    Write-Host "Starting $name on port $port..." -ForegroundColor Green
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$path'; Write-Host '$name (Port: $port)' -ForegroundColor Cyan; npm start"
    
    Start-Sleep -Seconds 2
}

Write-Host "`n✅ All services started!" -ForegroundColor Green
Write-Host "`nAccess URLs:" -ForegroundColor Cyan
Write-Host "  Civilian App:    http://localhost:3000" -ForegroundColor White
Write-Host "  Caregiver App:   http://localhost:3001" -ForegroundColor White
Write-Host "  Caregiver API:   http://localhost:8001" -ForegroundColor White
Write-Host "  Civilian API:    http://localhost:8002" -ForegroundColor White
Write-Host "  AI Service:      http://localhost:8003" -ForegroundColor White
Write-Host "  Safety Service:  http://localhost:8005" -ForegroundColor White

Write-Host "`nPress Ctrl+C in each terminal window to stop services.`n" -ForegroundColor Yellow
