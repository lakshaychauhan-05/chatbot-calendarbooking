# Docker Deployment Guide

This guide will help you deploy the Calendar Booking Platform using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

Check your versions:
```bash
docker --version
docker compose version
```

## Quick Start

### 1. Environment Configuration

Copy the Docker environment template:
```bash
cp .env.docker .env
```

Edit `.env` and configure:
- **Required**: Set `OPENAI_API_KEY` for the chatbot
- **Required**: Change `SERVICE_API_KEY` to a secure random string
- **Required**: Change `DOCTOR_PORTAL_JWT_SECRET` to a secure random string
- **Required**: Change `ADMIN_PORTAL_JWT_SECRET` to a secure random string
- **Optional**: Configure Twilio for SMS notifications
- **Optional**: Configure Google Calendar integration

### 2. Build and Start Services

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f backend
docker compose logs -f frontend
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
  - Chatbot: http://localhost:5173/
  - Doctor Portal: http://localhost:5173/doctor/login
  - Admin Portal: http://localhost:5173/admin/login

- **Backend API**: http://localhost:8000
  - API Docs: http://localhost:8000/docs
  - Health Check: http://localhost:8000/health

- **Database**: localhost:5432
  - Database: `calendar_booking`
  - User: `postgres`
  - Password: `postgres`

### 4. Default Credentials

**Admin Portal:**
- Email: `admin@example.com`
- Password: `Admin@123`

**Doctor Portal:**
- Create accounts via the registration page or Google OAuth

## Production Deployment

### Security Checklist

Before deploying to production:

1. **Change All Secrets**:
   ```bash
   # Generate secure random strings
   openssl rand -base64 32  # For JWT secrets
   openssl rand -base64 32  # For API keys
   ```

2. **Update Environment Variables**:
   - Set `DEBUG=false`
   - Update `CORS_ALLOW_ORIGINS` with your production domain
   - Change database password
   - Configure real OAuth credentials
   - Set secure admin password

3. **Database Security**:
   ```yaml
   # In docker-compose.yml, change postgres credentials
   environment:
     POSTGRES_PASSWORD: your-secure-password
   ```

4. **Use HTTPS**:
   - Deploy behind a reverse proxy (nginx, Traefik, Caddy)
   - Configure SSL/TLS certificates
   - Update CORS and OAuth URLs to use https://

### Production docker-compose.yml Example

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-calendar_booking}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}  # From .env
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - app-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    env_file: .env
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - app-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.yourdomain.com`)"
      - "traefik.http.routers.backend.tls=true"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: https://api.yourdomain.com
    restart: unless-stopped
    networks:
      - app-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.frontend.tls=true"

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

## Common Commands

### Service Management

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Restart a service
docker compose restart backend

# Rebuild and restart
docker compose up -d --build

# View service status
docker compose ps
```

### Logs and Debugging

```bash
# View all logs
docker compose logs -f

# View last 100 lines
docker compose logs --tail=100

# View specific service
docker compose logs -f backend

# Check container health
docker compose ps
```

### Database Operations

```bash
# Access PostgreSQL shell
docker compose exec postgres psql -U postgres -d calendar_booking

# Backup database
docker compose exec postgres pg_dump -U postgres calendar_booking > backup.sql

# Restore database
docker compose exec -T postgres psql -U postgres calendar_booking < backup.sql

# View database logs
docker compose logs postgres
```

### Migrations

Migrations run automatically when the backend starts. To run manually:

```bash
# Run migrations
docker compose exec backend python run_migrations.py

# Access backend shell for debugging
docker compose exec backend bash

# Check migration status
docker compose exec backend alembic current
```

### Clean Up

```bash
# Stop and remove containers
docker compose down

# Remove containers and volumes (WARNING: deletes data)
docker compose down -v

# Remove images
docker compose down --rmi all

# Complete cleanup
docker compose down -v --rmi all
```

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker compose logs backend

# Common issues:
# - Database not ready: Wait for postgres healthcheck
# - Migration errors: Check DATABASE_URL format
# - Missing env vars: Verify .env file
```

### Database connection errors

```bash
# Verify postgres is running
docker compose ps postgres

# Check database logs
docker compose logs postgres

# Test connection
docker compose exec postgres pg_isready -U postgres
```

### Frontend can't reach backend

1. Check CORS configuration in `.env`:
   ```
   CORS_ALLOW_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

2. Verify backend is running:
   ```bash
   curl http://localhost:8000/health
   ```

3. Check browser console for errors

### Port already in use

```bash
# Find process using port
lsof -i :8000
lsof -i :5173
lsof -i :5432

# Kill process or change port in docker-compose.yml
ports:
  - "8001:8000"  # Use different host port
```

## Development vs Production

### Development Mode

```bash
# Use local code with hot reload
docker compose -f docker-compose.dev.yml up
```

Create `docker-compose.dev.yml`:
```yaml
version: '3.8'

services:
  backend:
    volumes:
      - ./app:/app/app  # Mount code for hot reload
      - ./alembic:/app/alembic
    environment:
      DEBUG: true

  frontend:
    volumes:
      - ./frontend/src:/app/src  # Mount code for hot reload
```

### Production Mode

- Use the default `docker-compose.yml`
- Set `DEBUG=false`
- Use volumes only for persistent data
- Enable health checks
- Use restart policies

## Monitoring

### Health Checks

```bash
# Check all services
docker compose ps

# Test backend health
curl http://localhost:8000/health

# Test frontend health
curl http://localhost:5173/health
```

### Resource Usage

```bash
# Monitor resource usage
docker stats

# View disk usage
docker system df

# Cleanup unused resources
docker system prune
```

## Scaling

### Horizontal Scaling

```bash
# Scale backend to 3 instances
docker compose up -d --scale backend=3

# Requires a load balancer (nginx, traefik)
```

### Performance Tuning

1. **PostgreSQL**:
   ```yaml
   environment:
     POSTGRES_MAX_CONNECTIONS: 100
     POSTGRES_SHARED_BUFFERS: 256MB
   ```

2. **Backend Workers**:
   ```dockerfile
   CMD uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

## Backup Strategy

### Automated Backups

Create a backup script:
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

docker compose exec -T postgres pg_dump -U postgres calendar_booking | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### Backup Volumes

```bash
# Backup postgres data volume
docker run --rm -v chatbot-calendarbooking_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

## Support

For issues or questions:
- Check logs: `docker compose logs`
- Review health checks: `docker compose ps`
- Verify environment: `docker compose config`
- See main [README.md](README.md) for application details
