#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get environment from argument (default: staging)
ENV=${1:-staging}

echo -e "${GREEN}🚀 Fair-Hire Sentinel - Deployment Script${NC}"
echo -e "${BLUE}Environment: ${ENV}${NC}"
echo "========================================"

# Validate environment
if [[ ! "$ENV" =~ ^(staging|production)$ ]]; then
    echo -e "${RED}❌ Invalid environment. Use 'staging' or 'production'${NC}"
    exit 1
fi

# Confirmation for production
if [ "$ENV" == "production" ]; then
    echo -e "${YELLOW}⚠️  You are about to deploy to PRODUCTION${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo -e "${RED}Deployment cancelled${NC}"
        exit 0
    fi
fi

# Load environment variables
if [ -f ".env.$ENV" ]; then
    source ".env.$ENV"
    echo -e "${GREEN}✅ Loaded environment variables${NC}"
else
    echo -e "${RED}❌ Environment file .env.$ENV not found${NC}"
    exit 1
fi

# Run tests
echo -e "\n${YELLOW}Running tests...${NC}"
cd backend
source venv/bin/activate || source venv/Scripts/activate 2>/dev/null
pytest || { echo -e "${RED}❌ Backend tests failed${NC}"; exit 1; }
echo -e "${GREEN}✅ Backend tests passed${NC}"
cd ..

cd frontend
npm test -- --passWithNoTests || { echo -e "${RED}❌ Frontend tests failed${NC}"; exit 1; }
echo -e "${GREEN}✅ Frontend tests passed${NC}"
cd ..

# Build Docker images
echo -e "\n${YELLOW}Building Docker images...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.$ENV.yml build
echo -e "${GREEN}✅ Docker images built${NC}"

# Tag images
echo -e "\n${YELLOW}Tagging images...${NC}"
VERSION=$(date +%Y%m%d-%H%M%S)
docker tag fairhire-backend:latest fairhire-backend:$VERSION
docker tag fairhire-frontend:latest fairhire-frontend:$VERSION
echo -e "${GREEN}✅ Images tagged with version: $VERSION${NC}"

# Push to registry (if configured)
if [ -n "$DOCKER_REGISTRY" ]; then
    echo -e "\n${YELLOW}Pushing images to registry...${NC}"
    docker tag fairhire-backend:$VERSION $DOCKER_REGISTRY/fairhire-backend:$VERSION
    docker tag fairhire-frontend:$VERSION $DOCKER_REGISTRY/fairhire-frontend:$VERSION
    docker push $DOCKER_REGISTRY/fairhire-backend:$VERSION
    docker push $DOCKER_REGISTRY/fairhire-frontend:$VERSION
    echo -e "${GREEN}✅ Images pushed to registry${NC}"
fi

# Deploy based on environment
echo -e "\n${YELLOW}Deploying to $ENV...${NC}"

if [ "$ENV" == "staging" ]; then
    # Deploy to staging
    docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
    echo -e "${GREEN}✅ Deployed to staging${NC}"
    echo -e "${BLUE}Staging URL: https://staging.fairhire.example.com${NC}"
elif [ "$ENV" == "production" ]; then
    # Deploy to production with zero-downtime
    docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d --no-deps --build
    echo -e "${GREEN}✅ Deployed to production${NC}"
    echo -e "${BLUE}Production URL: https://fairhire.example.com${NC}"
fi

# Health check
echo -e "\n${YELLOW}Running health checks...${NC}"
sleep 10

# Check backend health
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    exit 1
fi

# Check frontend health
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    exit 1
fi

# Create deployment record
echo -e "\n${YELLOW}Creating deployment record...${NC}"
cat > "deployments/$ENV-$VERSION.log" << EOF
Deployment Information
======================
Environment: $ENV
Version: $VERSION
Date: $(date)
Deployed by: $(whoami)
Git commit: $(git rev-parse HEAD)
Git branch: $(git rev-parse --abbrev-ref HEAD)
EOF
echo -e "${GREEN}✅ Deployment record created${NC}"

# Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nDeployment details:"
echo -e "Environment: ${YELLOW}$ENV${NC}"
echo -e "Version: ${YELLOW}$VERSION${NC}"
echo -e "Backend: ${BLUE}http://localhost:8000${NC}"
echo -e "Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "API Docs: ${BLUE}http://localhost:8000/docs${NC}"

# Rollback instructions
echo -e "\n${YELLOW}To rollback, run:${NC}"
echo -e "${BLUE}./scripts/rollback.sh $ENV $VERSION${NC}"
