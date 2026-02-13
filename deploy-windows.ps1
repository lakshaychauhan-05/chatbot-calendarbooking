# Windows Deployment Script for Calendar Booking Platform
# Usage: .\deploy-windows.ps1

Write-Host "=====================================" -ForegroundColor Green
Write-Host "Calendar Booking Platform" -ForegroundColor Green
Write-Host "Windows Docker Deployment" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    $dockerInfo = docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
    Write-Host "✓ Docker is running" -ForegroundColor Green
}
catch {
    Write-Host "✗ Docker is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    Write-Host "Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# Check Docker Compose
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
try {
    docker compose version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose not found"
    }
    Write-Host "✓ Docker Compose is available" -ForegroundColor Green
}
catch {
    Write-Host "✗ Docker Compose is not available!" -ForegroundColor Red
    Write-Host "Please update Docker Desktop to the latest version." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if .env exists
if (-Not (Test-Path .env)) {
    Write-Host "No .env file found. Creating from template..." -ForegroundColor Yellow

    if (Test-Path .env.docker) {
        Copy-Item .env.docker .env
        Write-Host "✓ Created .env from .env.docker" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: Please edit .env and configure:" -ForegroundColor Yellow
        Write-Host "   - OPENAI_API_KEY (required for chatbot)" -ForegroundColor Yellow
        Write-Host "   - SERVICE_API_KEY" -ForegroundColor Yellow
        Write-Host "   - DOCTOR_PORTAL_JWT_SECRET" -ForegroundColor Yellow
        Write-Host "   - ADMIN_PORTAL_JWT_SECRET" -ForegroundColor Yellow
        Write-Host ""

        $continue = Read-Host "Press Enter to continue after editing .env, or Ctrl+C to exit"
    }
    else {
        Write-Host "✗ Error: .env.docker template not found!" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "✓ Found .env file" -ForegroundColor Green
}

Write-Host ""

# Pull base images
Write-Host "Pulling Docker images..." -ForegroundColor Yellow
docker compose -f docker-compose.windows.yml pull postgres 2>&1 | Out-Null

Write-Host ""

# Build services
Write-Host "Building services..." -ForegroundColor Yellow
Write-Host "(This may take a few minutes on first run)" -ForegroundColor Gray
docker compose -f docker-compose.windows.yml build --no-cache

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "✗ Build failed!" -ForegroundColor Red
    Write-Host "Check the errors above and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Start services
Write-Host "Starting services..." -ForegroundColor Yellow
docker compose -f docker-compose.windows.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "✗ Failed to start services!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check logs with:" -ForegroundColor Yellow
    Write-Host "  docker compose -f docker-compose.windows.yml logs" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# Wait for services to be ready
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Check service health
Write-Host ""
Write-Host "Checking service health..." -ForegroundColor Yellow

# Check backend
$backendHealthy = $false
for ($i = 1; $i -le 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8005/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Backend is healthy" -ForegroundColor Green
            $backendHealthy = $true
            break
        }
    }
    catch {
        Start-Sleep -Seconds 2
    }
}

if (-Not $backendHealthy) {
    Write-Host "⚠️  Backend health check failed" -ForegroundColor Yellow
    Write-Host "Checking logs..." -ForegroundColor Gray
    docker compose -f docker-compose.windows.yml logs backend | Select-Object -Last 20
}

# Check frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5168/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Frontend is healthy" -ForegroundColor Green
    }
}
catch {
    Write-Host "⚠️  Frontend is starting..." -ForegroundColor Yellow
}

# Display deployment info
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 Access the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Frontend: " -ForegroundColor White -NoNewline
Write-Host "http://localhost:5168" -ForegroundColor Cyan
Write-Host "  - Chatbot:       http://localhost:5168/" -ForegroundColor Gray
Write-Host "  - Doctor Portal: http://localhost:5168/doctor/login" -ForegroundColor Gray
Write-Host "  - Admin Portal:  http://localhost:5168/admin/login" -ForegroundColor Gray
Write-Host ""

Write-Host "  Backend API: " -ForegroundColor White -NoNewline
Write-Host "http://localhost:8005" -ForegroundColor Cyan
Write-Host "  - API Docs:      http://localhost:8005/docs" -ForegroundColor Gray
Write-Host "  - Health Check:  http://localhost:8005/health" -ForegroundColor Gray
Write-Host ""

Write-Host "  Database: " -ForegroundColor White -NoNewline
Write-Host "localhost:5433" -ForegroundColor Cyan
Write-Host "  - Database:      calendar_booking" -ForegroundColor Gray
Write-Host "  - User:          postgres" -ForegroundColor Gray
Write-Host "  - Password:      postgres" -ForegroundColor Gray
Write-Host ""

Write-Host "🔐 Default Admin Credentials:" -ForegroundColor Yellow
Write-Host "  Email:    " -ForegroundColor White -NoNewline
Write-Host "admin@example.com" -ForegroundColor Cyan
Write-Host "  Password: " -ForegroundColor White -NoNewline
Write-Host "Admin@123" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Useful Commands:" -ForegroundColor Yellow
Write-Host "  View logs:     " -ForegroundColor White -NoNewline
Write-Host "docker compose -f docker-compose.windows.yml logs -f" -ForegroundColor Cyan
Write-Host "  Stop services: " -ForegroundColor White -NoNewline
Write-Host "docker compose -f docker-compose.windows.yml down" -ForegroundColor Cyan
Write-Host "  Restart:       " -ForegroundColor White -NoNewline
Write-Host "docker compose -f docker-compose.windows.yml restart" -ForegroundColor Cyan
Write-Host "  Status:        " -ForegroundColor White -NoNewline
Write-Host "docker compose -f docker-compose.windows.yml ps" -ForegroundColor Cyan
Write-Host ""

Write-Host "📚 Documentation: " -ForegroundColor Yellow -NoNewline
Write-Host "See WINDOWS_DEPLOYMENT.md for details" -ForegroundColor White
Write-Host ""

# Offer to open browser
$openBrowser = Read-Host "Open application in browser? (Y/n)"
if ($openBrowser -eq "" -or $openBrowser -eq "Y" -or $openBrowser -eq "y") {
    Start-Process "http://localhost:5168"
}

Write-Host ""
Write-Host "✅ Setup complete! Your application is running." -ForegroundColor Green
Write-Host ""
