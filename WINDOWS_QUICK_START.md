# Windows Quick Start Guide

## Your Custom Configuration ✅

- **Backend:** Port **8005**
- **Frontend:** Port **5168**
- **Database:** Port **5433**

## Prerequisites

1. **Install Docker Desktop for Windows**
   - Download: https://www.docker.com/products/docker-desktop/
   - Install and restart computer
   - Start Docker Desktop

2. **Verify Installation**
   ```powershell
   docker --version
   docker compose version
   ```

## Quick Deploy (3 Steps)

### 1. Transfer Files to Windows

Copy your entire project folder to Windows machine:
```
C:\Projects\chatbot-calendarbooking\
```

### 2. Configure Environment

```powershell
# Open PowerShell in project directory
cd C:\Projects\chatbot-calendarbooking

# Create .env file
Copy-Item .env.docker .env

# Edit .env and add your OPENAI_API_KEY
notepad .env
```

### 3. Deploy

**Option A: Automated (Recommended)**
```powershell
.\deploy-windows.ps1
```

**Option B: Manual**
```powershell
docker compose -f docker-compose.windows.yml up -d
```

## Access Your Application

After deployment (takes ~2 minutes):

- **Frontend:** http://localhost:5168
  - Chatbot: http://localhost:5168/
  - Doctor Portal: http://localhost:5168/doctor/login
  - Admin Portal: http://localhost:5168/admin/login

- **Backend API:** http://localhost:8005
  - API Docs: http://localhost:8005/docs
  - Health: http://localhost:8005/health

- **Database:** localhost:5433
  - Database: calendar_booking
  - User: postgres
  - Password: postgres

## Default Login

**Admin Portal:**
- Email: `admin@example.com`
- Password: `Admin@123`

## Common Commands

```powershell
# View logs
docker compose -f docker-compose.windows.yml logs -f

# Stop services
docker compose -f docker-compose.windows.yml down

# Restart
docker compose -f docker-compose.windows.yml restart

# Check status
docker compose -f docker-compose.windows.yml ps

# Rebuild after changes
docker compose -f docker-compose.windows.yml up -d --build
```

## Troubleshooting

### Docker Desktop not starting?

1. Enable virtualization in BIOS
2. Update WSL: `wsl --update`
3. Restart computer

### Port already in use?

```powershell
# Check what's using the port
netstat -ano | findstr :8005
netstat -ano | findstr :5168

# Kill the process (as Administrator)
taskkill /PID <PID> /F
```

### Services won't start?

```powershell
# Check logs
docker compose -f docker-compose.windows.yml logs

# Restart Docker Desktop
# Then try again
```

## Files for Windows Deployment

- ✅ **[docker-compose.windows.yml](docker-compose.windows.yml)** - Main config
- ✅ **[deploy-windows.ps1](deploy-windows.ps1)** - Deployment script
- ✅ **[WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md)** - Complete guide
- ✅ **[.env.docker](.env.docker)** - Environment template

## What's Different from Mac/Linux?

| Item | Mac/Linux | Windows |
|------|-----------|---------|
| Backend Port | 8000 | **8005** |
| Frontend Port | 5173 | **5168** |
| Deploy Command | `docker compose up -d` | `docker compose -f docker-compose.windows.yml up -d` |
| Script | `./deploy-docker.sh` | `.\deploy-windows.ps1` |

## Production Deployment

For production on Windows Server:

1. Use Windows Server 2019/2022
2. Install Docker EE
3. Configure IIS as reverse proxy
4. Set up SSL certificates
5. Configure Windows Firewall

See **[WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md)** for detailed production setup.

## Next Steps

1. ✅ Deploy using `.\deploy-windows.ps1`
2. ✅ Access http://localhost:5168
3. ✅ Login to admin panel
4. ✅ Configure OpenAI API key in .env
5. ✅ Test the chatbot

## Need Help?

- **Full Guide:** [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md)
- **Docker Docs:** [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
- **Check Logs:** `docker compose -f docker-compose.windows.yml logs`

Your Calendar Booking Platform is ready for Windows! 🎊
