# Docker Quick Start Guide

Get your Calendar Booking Platform up and running with Docker in 5 minutes!

## Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)

## Quick Start (3 Steps)

### 1. Configure Environment

```bash
# Copy the Docker environment template
cp .env.docker .env

# Edit .env and set your OpenAI API key (required for chatbot)
# Minimum required: OPENAI_API_KEY
nano .env  # or use your preferred editor
```

**Required configuration:**
- `OPENAI_API_KEY`: Your OpenAI API key

**Recommended for production:**
- Change all JWT secrets
- Change database password
- Update CORS origins

### 2. Deploy with One Command

```bash
# Option A: Use the deployment script (recommended)
./deploy-docker.sh

# Option B: Manual deployment
docker compose up -d
```

### 3. Access Your Application

Open your browser:
- **Frontend**: http://localhost:5173
- **API Documentation**: http://localhost:8000/docs

**Default Admin Login:**
- Email: `admin@example.com`
- Password: `Admin@123`

## That's It! 🎉

Your Calendar Booking Platform is now running with:
- ✅ Backend API (FastAPI)
- ✅ Frontend (React + TypeScript)
- ✅ PostgreSQL Database
- ✅ Automatic database migrations

## What's Running?

```bash
# Check status
docker compose ps

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend
```

## Common Operations

### Stop Services
```bash
docker compose down
```

### Restart Services
```bash
docker compose restart
```

### Rebuild After Code Changes
```bash
docker compose up -d --build
```

### View Database
```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U postgres -d calendar_booking
```

### Backup Database
```bash
docker compose exec postgres pg_dump -U postgres calendar_booking > backup.sql
```

## Troubleshooting

### Services won't start?
```bash
# Check logs for errors
docker compose logs

# Check if ports are already in use
lsof -i :8000  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # Database
```

### Backend health check failing?
```bash
# View backend logs
docker compose logs backend

# Common issues:
# - Missing OPENAI_API_KEY in .env
# - Database connection issues
# - Port 8000 already in use
```

### Frontend can't connect to backend?
1. Check CORS settings in `.env`:
   ```
   CORS_ALLOW_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

2. Verify backend is running:
   ```bash
   curl http://localhost:8000/health
   ```

### Database connection errors?
```bash
# Wait for database to be ready (takes ~10 seconds)
docker compose logs postgres

# Verify it's healthy
docker compose ps postgres
```

## Next Steps

### Configure Optional Features

1. **Google Calendar Integration**:
   - Set `DISABLE_CALENDAR_WORKERS=false`
   - Add credentials file to `./credentials/`
   - Configure `GOOGLE_CALENDAR_CREDENTIALS_PATH`

2. **SMS Notifications (Twilio)**:
   - Set `SMS_NOTIFICATIONS_ENABLED=true`
   - Add Twilio credentials to `.env`

3. **Google OAuth for Doctor Login**:
   - Configure OAuth credentials in Google Cloud Console
   - Update `DOCTOR_PORTAL_OAUTH_CLIENT_ID` and `DOCTOR_PORTAL_OAUTH_CLIENT_SECRET`

### Production Deployment

For production deployment with SSL/TLS:

```bash
# Use production compose file
docker compose -f docker-compose.prod.yml up -d

# Or use the deployment script
./deploy-docker.sh production
```

See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for complete production setup guide.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Frontend (React + TypeScript)              │
│  - Chatbot Interface                        │
│  - Doctor Portal                            │
│  - Admin Portal                             │
│  Port: 5173                                 │
└────────────────┬────────────────────────────┘
                 │
                 │ HTTP/REST API
                 ▼
┌─────────────────────────────────────────────┐
│  Backend (FastAPI + Python)                 │
│  - REST API                                 │
│  - Business Logic                           │
│  - LLM Integration                          │
│  Port: 8000                                 │
└────────────────┬────────────────────────────┘
                 │
                 │ PostgreSQL
                 ▼
┌─────────────────────────────────────────────┐
│  Database (PostgreSQL)                      │
│  - Appointments                             │
│  - Doctors                                  │
│  - Patients                                 │
│  Port: 5432                                 │
└─────────────────────────────────────────────┘
```

## Service Details

### Backend (Port 8000)
- **Technology**: FastAPI + Python 3.11
- **Features**:
  - RESTful API
  - OpenAPI documentation
  - JWT authentication
  - Database migrations
  - Health checks

### Frontend (Port 5173)
- **Technology**: React + TypeScript + Vite
- **Features**:
  - Chatbot interface
  - Doctor portal
  - Admin portal
  - Responsive design
  - Built with Tailwind CSS

### Database (Port 5432)
- **Technology**: PostgreSQL 15
- **Features**:
  - Automatic migrations
  - Health checks
  - Persistent volumes
  - Backup support

## Development Mode

For development with hot reload:

```bash
# Mount source code as volumes
docker compose -f docker-compose.yml up

# Or edit docker-compose.yml to add volumes:
volumes:
  - ./app:/app/app  # Backend code
  - ./frontend/src:/app/src  # Frontend code
```

## Cleanup

### Remove containers (keeps data)
```bash
docker compose down
```

### Remove everything including data
```bash
docker compose down -v
```

### Complete cleanup (removes images too)
```bash
docker compose down -v --rmi all
```

## Support

- **Documentation**: [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
- **Main README**: [README.md](README.md)
- **Issues**: Check logs with `docker compose logs`

## Useful Links

- Frontend: http://localhost:5173
- Backend API Docs: http://localhost:8000/docs
- Backend Health: http://localhost:8000/health
- Alternative API Docs: http://localhost:8000/redoc
