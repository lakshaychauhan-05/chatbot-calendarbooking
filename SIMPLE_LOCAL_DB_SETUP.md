# Simple Setup: Use Your Existing PostgreSQL Database

Your database:
- **Port:** 5432
- **Database:** calendar_booking_db
- **User:** postgres
- **Password:** admin123

## ✅ Recommended: Keep Using Docker PostgreSQL

**Honestly, the easiest approach is to continue using the Docker PostgreSQL** (port 5433) because:

1. ✅ **No configuration needed** - Works out of the box
2. ✅ **Isolated** - Won't interfere with your local database
3. ✅ **Consistent** - Same environment everywhere
4. ✅ **Easy to reset** - `docker compose down -v` clears everything

Your existing local database at port 5432 can stay untouched and you have a separate Docker database at port 5433.

## But if you really want to use your local database...

### Option 1: Run Backend/Frontend Locally (Not in Docker)

This is actually the SIMPLEST way to use your local database:

```bash
# 1. Stop Docker
docker compose down

# 2. Update .env to use your local database
DATABASE_URL=postgresql+psycopg://postgres:admin123@localhost:5432/calendar_booking_db

# 3. Run backend locally
python run_migrations.py
python run.py

# 4. In another terminal, run frontend
cd frontend
npm run dev
```

### Option 2: Update PostgreSQL to Accept Docker Connections

This requires changing your PostgreSQL configuration:

**1. Find your `postgresql.conf` and `pg_hba.conf`:**
```bash
# Common locations:
# macOS (Homebrew): /opt/homebrew/var/postgresql@15/
# macOS (Postgres.app): ~/Library/Application Support/Postgres/var-15/
# Linux: /etc/postgresql/15/main/
```

**2. Edit `postgresql.conf`:**
```
listen_addresses = '*'  # or '0.0.0.0'
```

**3. Edit `pg_hba.conf` - Add this line:**
```
# Allow Docker containers
host    all             all             172.16.0.0/12           scram-sha-256
```

**4. Restart PostgreSQL:**
```bash
# macOS (Homebrew)
brew services restart postgresql@15

# macOS (Postgres.app)
# Use the Postgres.app menu to restart

# Linux
sudo systemctl restart postgresql
```

**5. Use the provided docker-compose file:**
```bash
docker compose -f docker-compose.local-db.yml up -d
```

## Comparison

| Method | Complexity | Benefits |
|--------|------------|----------|
| **Docker PostgreSQL (port 5433)** | ⭐ Easy | Isolated, no config needed |
| **Run locally (no Docker)** | ⭐⭐ Medium | Direct database access |
| **Docker + Local PostgreSQL** | ⭐⭐⭐ Hard | Requires PostgreSQL config changes |

## My Recommendation

**Just use the Docker PostgreSQL on port 5433.** It's already working and doesn't interfere with your local database.

If you need to access both:
- **Your data:** `localhost:5432` (calendar_booking_db)
- **Docker data:** `localhost:5433` (calendar_booking)

You can query the Docker database from your local machine:
```bash
psql -h localhost -p 5433 -U postgres -d calendar_booking
```

Or use your favorite database tool with:
- Host: `localhost`
- Port: `5433`
- Database: `calendar_booking`
- User: `postgres`
- Password: `postgres`

## Need Help?

If you're still having issues, let me know what you're trying to achieve and I can help find the best solution for your use case!
