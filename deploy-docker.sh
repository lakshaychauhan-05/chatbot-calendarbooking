#!/bin/bash

# Docker Deployment Script for Calendar Booking Platform
# Usage: ./deploy-docker.sh [development|production]

set -e

MODE="${1:-development}"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Calendar Booking Platform${NC}"
echo -e "${GREEN}Docker Deployment${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker installed${NC}"
echo -e "${GREEN}✓ Docker Compose installed${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}No .env file found. Creating from template...${NC}"

    if [ -f .env.docker ]; then
        cp .env.docker .env
        echo -e "${GREEN}✓ Created .env from .env.docker${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env and configure:${NC}"
        echo "   - OPENAI_API_KEY"
        echo "   - SERVICE_API_KEY"
        echo "   - DOCTOR_PORTAL_JWT_SECRET"
        echo "   - ADMIN_PORTAL_JWT_SECRET"
        echo ""
        read -p "Press Enter to continue after editing .env, or Ctrl+C to exit..."
    else
        echo -e "${RED}Error: .env.docker template not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Found .env file${NC}"
fi

echo ""

# Check which compose file to use
if [ "$MODE" = "production" ]; then
    echo -e "${YELLOW}Deploying in PRODUCTION mode${NC}"
    COMPOSE_FILE="docker-compose.prod.yml"

    if [ ! -f "$COMPOSE_FILE" ]; then
        echo -e "${RED}Error: $COMPOSE_FILE not found${NC}"
        exit 1
    fi

    echo -e "${YELLOW}⚠️  Production Checklist:${NC}"
    echo "   □ Changed all secrets in .env"
    echo "   □ Updated CORS_ALLOW_ORIGINS"
    echo "   □ Configured SSL/TLS certificates"
    echo "   □ Set DEBUG=false"
    echo "   □ Updated OAuth redirect URIs"
    echo ""
    read -p "Have you completed the checklist? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Deployment cancelled${NC}"
        exit 1
    fi

    COMPOSE_CMD="docker compose -f $COMPOSE_FILE"
else
    echo -e "${YELLOW}Deploying in DEVELOPMENT mode${NC}"
    COMPOSE_FILE="docker-compose.yml"
    COMPOSE_CMD="docker compose"
fi

echo ""

# Pull latest images
echo -e "${YELLOW}Pulling base images...${NC}"
$COMPOSE_CMD pull postgres 2>/dev/null || true

# Build services
echo ""
echo -e "${YELLOW}Building services...${NC}"
$COMPOSE_CMD build --no-cache

# Start services
echo ""
echo -e "${YELLOW}Starting services...${NC}"
$COMPOSE_CMD up -d

# Wait for services to be healthy
echo ""
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 5

# Check service health
echo ""
echo -e "${YELLOW}Checking service health...${NC}"

# Check postgres
if $COMPOSE_CMD ps postgres | grep -q "healthy"; then
    echo -e "${GREEN}✓ PostgreSQL is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL is starting...${NC}"
fi

# Check backend
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -sf http://localhost:8000/health >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is healthy${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "${RED}✗ Backend failed to start${NC}"
        echo -e "${YELLOW}Checking logs:${NC}"
        $COMPOSE_CMD logs backend | tail -20
        exit 1
    fi
    sleep 2
done

# Check frontend
if curl -sf http://localhost:5173/health >/dev/null 2>&1 || curl -sf http://localhost:80/health >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend is starting...${NC}"
fi

# Display deployment info
echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "${YELLOW}Access the application:${NC}"
echo ""

if [ "$MODE" = "production" ]; then
    echo "  Frontend: https://yourdomain.com"
    echo "  Backend API: https://api.yourdomain.com"
    echo "  API Docs: https://api.yourdomain.com/docs"
else
    echo "  Frontend: http://localhost:5173"
    echo "  - Chatbot: http://localhost:5173/"
    echo "  - Doctor Portal: http://localhost:5173/doctor/login"
    echo "  - Admin Portal: http://localhost:5173/admin/login"
    echo ""
    echo "  Backend API: http://localhost:8000"
    echo "  - API Docs: http://localhost:8000/docs"
    echo "  - Health Check: http://localhost:8000/health"
    echo ""
    echo "  Database: localhost:5432"
    echo "  - Database: calendar_booking"
    echo "  - User: postgres"
    echo "  - Password: postgres"
fi

echo ""
echo -e "${YELLOW}Default Admin Credentials:${NC}"
echo "  Email: admin@example.com"
echo "  Password: Admin@123"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "  View logs: $COMPOSE_CMD logs -f"
echo "  Stop: $COMPOSE_CMD down"
echo "  Restart: $COMPOSE_CMD restart"
echo "  Status: $COMPOSE_CMD ps"
echo ""
echo -e "${GREEN}For more information, see DOCKER_DEPLOYMENT.md${NC}"
echo ""
