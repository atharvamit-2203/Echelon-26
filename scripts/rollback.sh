#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ENV=${1:-staging}
VERSION=${2}

echo -e "${RED}🔄 Fair-Hire Sentinel - Rollback Script${NC}"
echo -e "${BLUE}Environment: ${ENV}${NC}"
echo "========================================"

# Validate inputs
if [[ ! "$ENV" =~ ^(staging|production)$ ]]; then
    echo -e "${RED}❌ Invalid environment. Use 'staging' or 'production'${NC}"
    exit 1
fi

if [ -z "$VERSION" ]; then
    echo -e "${RED}❌ Version is required${NC}"
    echo -e "Usage: ./rollback.sh <environment> <version>"
    echo -e "Example: ./rollback.sh staging 20260129-061120"
    exit 1
fi

# Confirmation
echo -e "${YELLOW}⚠️  You are about to rollback $ENV to version $VERSION${NC}"
read -p "Are you sure? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${RED}Rollback cancelled${NC}"
    exit 0
fi

# Check if version exists
if [ -n "$DOCKER_REGISTRY" ]; then
    echo -e "\n${YELLOW}Checking if version exists...${NC}"
    docker pull $DOCKER_REGISTRY/fairhire-backend:$VERSION || {
        echo -e "${RED}❌ Version $VERSION not found in registry${NC}"
        exit 1
    }
    docker pull $DOCKER_REGISTRY/fairhire-frontend:$VERSION || {
        echo -e "${RED}❌ Version $VERSION not found in registry${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Version found${NC}"
fi

# Stop current containers
echo -e "\n${YELLOW}Stopping current containers...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.$ENV.yml down
echo -e "${GREEN}✅ Containers stopped${NC}"

# Deploy previous version
echo -e "\n${YELLOW}Deploying version $VERSION...${NC}"
export IMAGE_TAG=$VERSION
docker-compose -f docker-compose.yml -f docker-compose.$ENV.yml up -d
echo -e "${GREEN}✅ Rollback deployed${NC}"

# Health check
echo -e "\n${YELLOW}Running health checks...${NC}"
sleep 10

if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    exit 1
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    exit 1
fi

# Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Rollback completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nRollback details:"
echo -e "Environment: ${YELLOW}$ENV${NC}"
echo -e "Version: ${YELLOW}$VERSION${NC}"
echo -e "Rolled back at: ${YELLOW}$(date)${NC}"
