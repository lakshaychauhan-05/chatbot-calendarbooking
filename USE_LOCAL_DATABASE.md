# Using Your Existing Local PostgreSQL Database

This guide shows how to use your existing local PostgreSQL database with Docker containers.

## Your Database Configuration

- **Host:** localhost
- **Port:** 5432
- **Database:** calendar_booking_db
- **User:** postgres
- **Password:** admin123

## Quick Start

### 1. Stop Current Docker Setup

```bash
docker compose down
```

### 2. Start with Local Database

```bash
docker compose -f docker-compose.local-db.yml up -d
```

That's it! Your Docker containers (backend + frontend) will now use your local PostgreSQL database.

## How It Works

The `docker-compose.local-db.yml` file:
- ✅ Removes the PostgreSQL container (no longer needed)
- ✅ Configures backend to connect to `host.docker.internal:5432`
- ✅ Uses your database: `calendar_booking_db`
- ✅ Uses your credentials: `postgres/admin123`

### Connection String

The backend uses this connection string:
```
postgresql+psycopg://postgres:admin123@host.docker.internal:5432/calendar_booking_db
```

**Note:** `host.docker.internal` is a special DNS name that Docker provides to access the host machine from inside a container.

## Verify Connection

After starting, check that the backend can connect:

```bash
# Check backend logs
docker compose -f docker-compose.local-db.yml logs backend | grep -i database

# Test backend health
curl http://localhost:8000/health
```

You should see `"database":"healthy"` in the health check response.

## Access Your Database

Since you're using your local database, you can access it as usual:

```bash
# From host machine
psql -h localhost -p 5432 -U postgres -d calendar_booking_db

# Or using your favorite GUI tool
# Host: localhost:5432
# Database: calendar_booking_db
# User: postgres
# Password: admin123
```

## Switching Between Local and Docker Database

### Use Local Database (your existing PostgreSQL)
```bash
docker compose -f docker-compose.local-db.yml up -d
```

### Use Docker Database (PostgreSQL in container)
```bash
docker compose up -d
```

## Common Commands

```bash
# Start with local database
docker compose -f docker-compose.local-db.yml up -d

# Stop services
docker compose -f docker-compose.local-db.yml down

# View logs
docker compose -f docker-compose.local-db.yml logs -f

# Rebuild after code changes
docker compose -f docker-compose.local-db.yml up -d --build

# Check status
docker compose -f docker-compose.local-db.yml ps
```

## Troubleshooting

### Backend can't connect to database?

**Check if PostgreSQL is listening on 0.0.0.0 or localhost:**

```bash
# Check PostgreSQL configuration
psql -h localhost -p 5432 -U postgres -c "SHOW listen_addresses;"
```

If it shows `localhost`, you need to update PostgreSQL to listen on all interfaces:

1. Edit `postgresql.conf`:
   ```
   listen_addresses = '*'  # or '0.0.0.0'
   ```

2. Edit `pg_hba.conf` to allow Docker connections:
   ```
   # Add this line
   host    all             all             172.16.0.0/12           md5
   ```

3. Restart PostgreSQL:
   ```bash
   # macOS (Homebrew)
   brew services restart postgresql

   # Linux
   sudo systemctl restart postgresql
   ```

### Permission denied errors?

Check `pg_hba.conf` allows password authentication:
```
host    calendar_booking_db    postgres    172.16.0.0/12    md5
```

### Connection timeout?

Make sure your firewall isn't blocking connections from Docker containers.

## Benefits of Using Local Database

✅ **Single Database** - No need to maintain two separate databases
✅ **Persistent Data** - Your data is safe on your local machine
✅ **Easy Access** - Use your existing database tools
✅ **Better Performance** - No Docker network overhead for database
✅ **Simplified Backups** - Use your existing backup strategy

## Need to Go Back?

If you want to go back to using the Docker PostgreSQL container:

```bash
# Stop local-db setup
docker compose -f docker-compose.local-db.yml down

# Start standard setup
docker compose up -d
```

Your local database remains untouched.

## Summary

**With Local Database (Recommended for You):**
- Frontend: Docker container (port 5173)
- Backend: Docker container (port 8000)
- Database: **Your local PostgreSQL** (port 5432)

**With Docker Database:**
- Frontend: Docker container (port 5173)
- Backend: Docker container (port 8000)
- Database: Docker container (port 5433)

Choose whichever works best for your workflow!
