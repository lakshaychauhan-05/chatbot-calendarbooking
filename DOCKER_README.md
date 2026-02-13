# Docker Deployment - Summary

Your Calendar Booking Platform is ready for Docker deployment! 🚀

## What's Included

Your project now has complete Docker deployment setup:

### 📁 Configuration Files

1. **[docker-compose.yml](docker-compose.yml)** - Development deployment
2. **[docker-compose.prod.yml](docker-compose.prod.yml)** - Production deployment with Traefik
3. **[Dockerfile](Dockerfile)** - Backend container image
4. **[frontend/Dockerfile](frontend/Dockerfile)** - Frontend container image
5. **[.env.docker](.env.docker)** - Environment template for Docker
6. **[.dockerignore](.dockerignore)** - Optimize Docker builds
7. **[frontend/.dockerignore](frontend/.dockerignore)** - Optimize frontend builds

### 📚 Documentation

1. **[DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)** - Start here! 5-minute setup guide
2. **[DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)** - Complete deployment guide
3. **[deploy-docker.sh](deploy-docker.sh)** - Automated deployment script

## Quick Start (Choose One)

### Option 1: Automated Script (Recommended)
```bash
# 1. Configure environment
cp .env.docker .env
nano .env  # Add your OPENAI_API_KEY

# 2. Deploy
./deploy-docker.sh
```

### Option 2: Manual Deployment
```bash
# 1. Configure environment
cp .env.docker .env
nano .env  # Add your OPENAI_API_KEY

# 2. Start services
docker compose up -d

# 3. View logs
docker compose logs -f
```

### Option 3: Production with SSL/TLS
```bash
# 1. Configure environment for production
cp .env.docker .env
nano .env  # Configure all production settings

# 2. Update domains in docker-compose.prod.yml
# 3. Deploy
./deploy-docker.sh production
```

## Access Your Application

After deployment:
- **Frontend**: http://localhost:5173
  - Chatbot: http://localhost:5173/
  - Doctor Portal: http://localhost:5173/doctor/login
  - Admin Portal: http://localhost:5173/admin/login

- **Backend**: http://localhost:8000
  - API Docs: http://localhost:8000/docs
  - Health: http://localhost:8000/health

- **Admin Credentials**:
  - Email: `admin@example.com`
  - Password: `Admin@123`

## Architecture

```
┌──────────────────┐
│  Frontend:5173   │ ← React + TypeScript + Vite
│  (Nginx)         │
└────────┬─────────┘
         │
         │ HTTP/REST
         ▼
┌──────────────────┐
│  Backend:8000    │ ← FastAPI + Python
│  (Uvicorn)       │
└────────┬─────────┘
         │
         │ PostgreSQL
         ▼
┌──────────────────┐
│  Database:5432   │ ← PostgreSQL 15
│  (PostgreSQL)    │
└──────────────────┘
```

## Services

### 🖥️ Backend
- **Image**: Python 3.11 slim
- **Port**: 8000
- **Features**:
  - FastAPI REST API
  - OpenAPI documentation
  - JWT authentication
  - Database migrations
  - Health checks
  - Google Calendar integration
  - OpenAI chatbot

### 🎨 Frontend
- **Image**: Node 20 (build) → Nginx Alpine (runtime)
- **Port**: 5173 (dev) / 80 (production)
- **Features**:
  - React + TypeScript
  - Vite build system
  - Tailwind CSS
  - Multi-portal interface
  - SPA routing
  - Gzip compression

### 🗄️ Database
- **Image**: PostgreSQL 15 Alpine
- **Port**: 5432
- **Features**:
  - Persistent volumes
  - Health checks
  - Automatic backups support

## Environment Variables

### Required (Minimum)
```bash
OPENAI_API_KEY=your-openai-api-key
```

### Recommended for Production
```bash
# Secrets (generate with: openssl rand -base64 32)
SERVICE_API_KEY=your-secure-api-key
DOCTOR_PORTAL_JWT_SECRET=your-jwt-secret
ADMIN_PORTAL_JWT_SECRET=your-admin-secret

# Database
POSTGRES_PASSWORD=your-db-password

# CORS
CORS_ALLOW_ORIGINS=https://yourdomain.com

# OAuth (optional)
DOCTOR_PORTAL_OAUTH_CLIENT_ID=your-google-client-id
DOCTOR_PORTAL_OAUTH_CLIENT_SECRET=your-google-client-secret
```

## Common Commands

### Service Management
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart specific service
docker compose restart backend

# View status
docker compose ps

# Rebuild after changes
docker compose up -d --build
```

### Logs and Debugging
```bash
# All logs
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Last 100 lines
docker compose logs --tail=100
```

### Database Operations
```bash
# Connect to database
docker compose exec postgres psql -U postgres -d calendar_booking

# Backup database
docker compose exec postgres pg_dump -U postgres calendar_booking > backup.sql

# Restore database
docker compose exec -T postgres psql -U postgres calendar_booking < backup.sql

# Run migrations manually
docker compose exec backend python run_migrations.py
```

### Cleanup
```bash
# Stop services (keeps data)
docker compose down

# Remove everything including data
docker compose down -v

# Remove images too
docker compose down -v --rmi all
```

## Troubleshooting

### Issue: Services won't start
```bash
# Check logs
docker compose logs

# Check if ports are in use
lsof -i :8000  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # Database
```

### Issue: Backend health check failing
```bash
# View backend logs
docker compose logs backend

# Common causes:
# - Missing OPENAI_API_KEY
# - Database not ready
# - Port conflict
```

### Issue: Frontend can't connect to backend
1. Check CORS in `.env`: `CORS_ALLOW_ORIGINS=http://localhost:5173`
2. Verify backend is running: `curl http://localhost:8000/health`
3. Check browser console for errors

### Issue: Database connection errors
```bash
# Wait for database (takes ~10 seconds)
docker compose logs postgres

# Verify health
docker compose ps postgres
```

## Production Deployment

### Security Checklist
- [ ] Change all JWT secrets
- [ ] Change database password
- [ ] Set secure API keys
- [ ] Update CORS origins
- [ ] Configure SSL/TLS
- [ ] Set DEBUG=false
- [ ] Review exposed ports
- [ ] Enable health checks
- [ ] Configure backups

### Production Files
- Use `docker-compose.prod.yml`
- Includes Traefik for SSL/TLS
- No exposed database port
- Restart policies
- Health checks

### Deploy to Production
```bash
./deploy-docker.sh production
```

## Performance Optimization

### Backend Scaling
```bash
# Scale to 3 instances
docker compose up -d --scale backend=3
```

### Database Tuning
Edit `docker-compose.yml`:
```yaml
postgres:
  environment:
    POSTGRES_MAX_CONNECTIONS: 100
    POSTGRES_SHARED_BUFFERS: 256MB
```

### Frontend Caching
Already configured in `nginx.conf`:
- Static assets: 1 year cache
- Gzip compression enabled
- Security headers

## Monitoring

### Health Checks
```bash
# Check all services
docker compose ps

# Test endpoints
curl http://localhost:8000/health
curl http://localhost:5173/health
```

### Resource Usage
```bash
# Monitor in real-time
docker stats

# Disk usage
docker system df
```

## Backups

### Automated Backup Script
Create `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker compose exec -T postgres pg_dump -U postgres calendar_booking | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### Restore from Backup
```bash
gunzip < backup.sql.gz | docker compose exec -T postgres psql -U postgres calendar_booking
```

## Next Steps

1. **Test Locally**:
   - Deploy with `./deploy-docker.sh`
   - Test all features
   - Verify health checks

2. **Configure Optional Features**:
   - Google Calendar integration
   - SMS notifications (Twilio)
   - Google OAuth login

3. **Production Deployment**:
   - Review security checklist
   - Update `docker-compose.prod.yml` with domains
   - Configure SSL/TLS
   - Deploy with `./deploy-docker.sh production`

## Documentation

- **Quick Start**: [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)
- **Full Guide**: [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
- **Main README**: [README.md](README.md)

## Support

For issues or questions:
1. Check logs: `docker compose logs`
2. Review health: `docker compose ps`
3. Validate config: `docker compose config`
4. See documentation above

---

**Ready to deploy? Start with [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)!**
