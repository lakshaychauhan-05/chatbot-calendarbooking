# Windows Deployment Guide

Complete guide for deploying the Calendar Booking Platform on Windows using Docker.

## Custom Configuration

- **Backend Port:** 8005
- **Frontend Port:** 5168
- **Database Port:** 5433

## Prerequisites

### 1. Install Docker Desktop for Windows

Download and install from: https://www.docker.com/products/docker-desktop/

**System Requirements:**
- Windows 10/11 Pro, Enterprise, or Education (64-bit)
- WSL 2 enabled
- Virtualization enabled in BIOS

**Installation Steps:**
1. Download Docker Desktop installer
2. Run installer and follow prompts
3. Enable WSL 2 when prompted
4. Restart computer
5. Start Docker Desktop

**Verify Installation:**
```powershell
docker --version
docker compose version
```

### 2. Install Git (if not already installed)

Download from: https://git-scm.com/download/win

## Deployment Steps

### Step 1: Clone/Copy Project to Windows

Transfer your project to your Windows machine. If using Git:

```powershell
cd C:\Projects
git clone <your-repo-url>
cd chatbot-calendarbooking
```

Or copy the entire project folder to your Windows machine.

### Step 2: Configure Environment

Create `.env` file from template:

```powershell
# In PowerShell
Copy-Item .env.docker .env

# Or manually create .env file
```

Edit `.env` and configure:

```env
# Required - Add your OpenAI API key
OPENAI_API_KEY=your-openai-api-key-here

# Optional - Update if needed
SERVICE_API_KEY=your-secure-api-key
DOCTOR_PORTAL_JWT_SECRET=your-jwt-secret
ADMIN_PORTAL_JWT_SECRET=your-admin-secret
```

### Step 3: Deploy with Docker

```powershell
# Navigate to project directory
cd C:\Path\To\chatbot-calendarbooking

# Start all services
docker compose -f docker-compose.windows.yml up -d

# View logs
docker compose -f docker-compose.windows.yml logs -f

# Check status
docker compose -f docker-compose.windows.yml ps
```

### Step 4: Verify Deployment

**Open in browser:**
- Frontend: http://localhost:5168
- Backend API: http://localhost:8005/docs
- Health Check: http://localhost:8005/health

**Or test with PowerShell:**
```powershell
# Test backend
Invoke-WebRequest -Uri http://localhost:8005/health

# Test frontend
Invoke-WebRequest -Uri http://localhost:5168/health
```

## PowerShell Deployment Script

Save this as `deploy-windows.ps1`:

```powershell
# Windows Deployment Script for Calendar Booking Platform
# Usage: .\deploy-windows.ps1

Write-Host "=====================================" -ForegroundColor Green
Write-Host "Calendar Booking Platform" -ForegroundColor Green
Write-Host "Windows Docker Deployment" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker is running" -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (-Not (Test-Path .env)) {
    Write-Host "No .env file found. Creating from template..." -ForegroundColor Yellow
    if (Test-Path .env.docker) {
        Copy-Item .env.docker .env
        Write-Host "✓ Created .env from .env.docker" -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANT: Please edit .env and configure:" -ForegroundColor Yellow
        Write-Host "  - OPENAI_API_KEY" -ForegroundColor Yellow
        Write-Host "  - SERVICE_API_KEY" -ForegroundColor Yellow
        Write-Host "  - JWT secrets" -ForegroundColor Yellow
        Write-Host ""
        $continue = Read-Host "Press Enter to continue after editing .env, or Ctrl+C to exit"
    } else {
        Write-Host "Error: .env.docker template not found!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ Found .env file" -ForegroundColor Green
}

Write-Host ""
Write-Host "Building and starting services..." -ForegroundColor Yellow
docker compose -f docker-compose.windows.yml up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "Deployment Complete!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access the application:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Frontend: http://localhost:5168" -ForegroundColor Cyan
    Write-Host "  - Chatbot: http://localhost:5168/" -ForegroundColor Cyan
    Write-Host "  - Doctor Portal: http://localhost:5168/doctor/login" -ForegroundColor Cyan
    Write-Host "  - Admin Portal: http://localhost:5168/admin/login" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Backend API: http://localhost:8005" -ForegroundColor Cyan
    Write-Host "  - API Docs: http://localhost:8005/docs" -ForegroundColor Cyan
    Write-Host "  - Health Check: http://localhost:8005/health" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Database: localhost:5433" -ForegroundColor Cyan
    Write-Host "  - Database: calendar_booking" -ForegroundColor Cyan
    Write-Host "  - User: postgres" -ForegroundColor Cyan
    Write-Host "  - Password: postgres" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Default Admin Credentials:" -ForegroundColor Yellow
    Write-Host "  Email: admin@example.com" -ForegroundColor Cyan
    Write-Host "  Password: Admin@123" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Useful Commands:" -ForegroundColor Yellow
    Write-Host "  View logs: docker compose -f docker-compose.windows.yml logs -f" -ForegroundColor Cyan
    Write-Host "  Stop: docker compose -f docker-compose.windows.yml down" -ForegroundColor Cyan
    Write-Host "  Restart: docker compose -f docker-compose.windows.yml restart" -ForegroundColor Cyan
    Write-Host "  Status: docker compose -f docker-compose.windows.yml ps" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Deployment failed! Check the logs above for errors." -ForegroundColor Red
    Write-Host "Run: docker compose -f docker-compose.windows.yml logs" -ForegroundColor Yellow
}
```

## Common Windows Commands

### Service Management

```powershell
# Start services
docker compose -f docker-compose.windows.yml up -d

# Stop services
docker compose -f docker-compose.windows.yml down

# Restart a service
docker compose -f docker-compose.windows.yml restart backend

# Rebuild and restart
docker compose -f docker-compose.windows.yml up -d --build

# View service status
docker compose -f docker-compose.windows.yml ps
```

### Logs and Debugging

```powershell
# View all logs
docker compose -f docker-compose.windows.yml logs -f

# View last 100 lines
docker compose -f docker-compose.windows.yml logs --tail=100

# View specific service
docker compose -f docker-compose.windows.yml logs -f backend
docker compose -f docker-compose.windows.yml logs -f frontend

# Check container health
docker compose -f docker-compose.windows.yml ps
```

### Database Operations

```powershell
# Access PostgreSQL shell
docker compose -f docker-compose.windows.yml exec postgres psql -U postgres -d calendar_booking

# Backup database
docker compose -f docker-compose.windows.yml exec postgres pg_dump -U postgres calendar_booking > backup.sql

# Restore database
Get-Content backup.sql | docker compose -f docker-compose.windows.yml exec -T postgres psql -U postgres calendar_booking

# View database logs
docker compose -f docker-compose.windows.yml logs postgres
```

### Clean Up

```powershell
# Stop and remove containers
docker compose -f docker-compose.windows.yml down

# Remove containers and volumes (WARNING: deletes data)
docker compose -f docker-compose.windows.yml down -v

# Remove images
docker compose -f docker-compose.windows.yml down --rmi all

# Complete cleanup
docker compose -f docker-compose.windows.yml down -v --rmi all
```

## Windows-Specific Considerations

### 1. Line Endings

If you're transferring files from Mac/Linux, convert line endings:

```powershell
# Install dos2unix (via Chocolatey)
choco install dos2unix

# Convert scripts
dos2unix docker-entrypoint.sh
dos2unix deploy-docker.sh
```

Or configure Git to handle line endings:
```powershell
git config --global core.autocrlf true
```

### 2. File Paths

Windows uses backslashes `\` but Docker uses forward slashes `/`. The Docker Compose file already uses the correct format.

### 3. Firewall

Windows Firewall may block Docker ports. Allow Docker through:
1. Open Windows Security → Firewall & network protection
2. Click "Allow an app through firewall"
3. Find "Docker Desktop" and ensure both Private and Public are checked

### 4. WSL 2 Integration

Ensure WSL 2 integration is enabled in Docker Desktop:
1. Open Docker Desktop
2. Settings → Resources → WSL Integration
3. Enable integration with default WSL distro
4. Apply & Restart

### 5. Hyper-V

If using Hyper-V backend (instead of WSL 2):
1. Open PowerShell as Administrator
2. Run: `Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All`
3. Restart computer

## Troubleshooting

### Docker Desktop won't start

**Error: "WSL 2 installation is incomplete"**
```powershell
# Update WSL
wsl --update

# Set default version
wsl --set-default-version 2

# Restart Docker Desktop
```

### Port already in use

```powershell
# Check what's using the port
netstat -ano | findstr :8005
netstat -ano | findstr :5168

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change ports in docker-compose.windows.yml
```

### Permission denied errors

Run PowerShell as Administrator:
1. Right-click PowerShell
2. Select "Run as administrator"
3. Navigate to project directory
4. Run docker commands

### Container can't access internet

Configure Docker DNS:
1. Docker Desktop → Settings → Docker Engine
2. Add to JSON:
```json
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}
```

### Slow performance

**Enable WSL 2 backend:**
1. Docker Desktop → Settings → General
2. Enable "Use the WSL 2 based engine"
3. Apply & Restart

**Allocate more resources:**
1. Docker Desktop → Settings → Resources
2. Increase CPU and Memory limits
3. Apply & Restart

## Production Deployment on Windows Server

For production Windows Server deployment:

### 1. Use Windows Server 2019/2022

```powershell
# Install Docker EE
Install-Module -Name DockerMsftProvider -Force
Install-Package -Name docker -ProviderName DockerMsftProvider -Force
Restart-Computer
```

### 2. Use Production Compose File

Use `docker-compose.prod.yml` with appropriate modifications for Windows paths.

### 3. Set up SSL/TLS

Use IIS as reverse proxy:
- Frontend: https://yourdomain.com → http://localhost:5168
- Backend: https://api.yourdomain.com → http://localhost:8005

### 4. Configure Windows Service

Install as Windows Service using NSSM:
```powershell
# Install NSSM
choco install nssm

# Create service
nssm install CalendarBooking "C:\Program Files\Docker\Docker\resources\bin\docker.exe" "compose -f C:\path\to\docker-compose.windows.yml up"
nssm set CalendarBooking Start SERVICE_AUTO_START
```

## Monitoring on Windows

### View Resource Usage

```powershell
# Monitor containers
docker stats

# View disk usage
docker system df

# Cleanup unused resources
docker system prune
```

### Event Viewer

Docker logs are available in Windows Event Viewer:
1. Open Event Viewer
2. Navigate to: Applications and Services Logs → Docker

## Backup Strategy

### Automated Backup Script

Save as `backup.ps1`:

```powershell
$BackupDir = "C:\Backups\CalendarBooking"
$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = "$BackupDir\backup_$Date.sql"

# Create backup directory if it doesn't exist
New-Item -ItemType Directory -Force -Path $BackupDir

# Backup database
docker compose -f docker-compose.windows.yml exec -T postgres pg_dump -U postgres calendar_booking | Out-File -FilePath $BackupFile -Encoding utf8

# Compress backup
Compress-Archive -Path $BackupFile -DestinationPath "$BackupFile.zip"
Remove-Item $BackupFile

# Keep only last 30 days
Get-ChildItem $BackupDir -Filter "backup_*.zip" |
    Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-30)} |
    Remove-Item

Write-Host "Backup completed: $BackupFile.zip"
```

Schedule with Task Scheduler:
```powershell
# Create scheduled task
$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\path\to\backup.ps1"
$Trigger = New-ScheduledTaskTrigger -Daily -At 2AM
Register-ScheduledTask -TaskName "CalendarBookingBackup" -Action $Action -Trigger $Trigger
```

## Summary

**Your Windows Deployment:**
- Frontend: http://localhost:5168
- Backend: http://localhost:8005
- Database: localhost:5433

**Quick Start:**
```powershell
cd C:\Path\To\chatbot-calendarbooking
.\deploy-windows.ps1
```

**Need Help?**
- Check logs: `docker compose -f docker-compose.windows.yml logs`
- View status: `docker compose -f docker-compose.windows.yml ps`
- See documentation: DOCKER_DEPLOYMENT.md

Your application is ready for Windows deployment! 🎊
