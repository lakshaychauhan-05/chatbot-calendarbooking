# Dockerfile for Doctor Portal API
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from root
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy shared app models and dependencies
COPY app/ ./app/
COPY doctor_portal/ ./doctor_portal/

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-5000}/health || exit 1

# Start server
CMD uvicorn doctor_portal.main:app --host 0.0.0.0 --port ${PORT:-5000}
