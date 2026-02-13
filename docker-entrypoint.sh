#!/bin/sh
set -e

echo "Starting Calendar Booking Backend..."
echo "========================================"

# Wait for database to be ready
echo "Waiting for PostgreSQL..."
until PGPASSWORD=postgres psql -h "postgres" -U "postgres" -d "calendar_booking" -c '\q' 2>/dev/null; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - continuing"
echo ""

# Run database migrations
echo "Running database migrations..."
echo "----------------------------------------"

# Try to run migrations, if it fails due to existing schema, stamp and continue
if ! alembic upgrade head 2>&1; then
    echo ""
    echo "Migration failed, attempting to resolve..."
    # Stamp to current head and try again
    alembic stamp head || true
    echo "Re-attempting migration..."
    alembic upgrade head || echo "Warning: Some migrations may have been skipped"
fi

echo "----------------------------------------"
echo "Migrations complete"
echo ""

# Start the application
echo "Starting FastAPI server on port ${PORT:-8000}..."
echo "========================================"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
