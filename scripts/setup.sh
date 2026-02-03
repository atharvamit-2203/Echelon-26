#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Fair-Hire Sentinel - Setup Script${NC}"
echo "========================================"

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

command -v docker >/dev/null 2>&1 || { 
    echo -e "${RED}❌ Docker is required but not installed.${NC}" 
    exit 1
}
echo -e "${GREEN}✅ Docker found${NC}"

command -v docker-compose >/dev/null 2>&1 || { 
    echo -e "${RED}❌ Docker Compose is required but not installed.${NC}" 
    exit 1
}
echo -e "${GREEN}✅ Docker Compose found${NC}"

command -v node >/dev/null 2>&1 || { 
    echo -e "${RED}❌ Node.js is required but not installed.${NC}" 
    exit 1
}
echo -e "${GREEN}✅ Node.js found ($(node --version))${NC}"

command -v python3 >/dev/null 2>&1 || { 
    echo -e "${RED}❌ Python 3 is required but not installed.${NC}" 
    exit 1
}
echo -e "${GREEN}✅ Python 3 found ($(python3 --version))${NC}"

# Create environment file if it doesn't exist
echo -e "\n${YELLOW}Setting up environment...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file from template${NC}"
    echo -e "${YELLOW}⚠️  Please update .env with your actual credentials${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Backend setup
echo -e "\n${YELLOW}Setting up backend...${NC}"
cd backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✅ Created Python virtual environment${NC}"
fi

source venv/bin/activate || source venv/Scripts/activate 2>/dev/null
pip install --upgrade pip
pip install -r requirements.txt
echo -e "${GREEN}✅ Installed backend dependencies${NC}"

cd ..

# Frontend setup
echo -e "\n${YELLOW}Setting up frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Installed frontend dependencies${NC}"
else
    echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
fi

cd ..

# Create necessary directories
echo -e "\n${YELLOW}Creating directories...${NC}"
mkdir -p logs
mkdir -p data/postgres
mkdir -p data/redis
echo -e "${GREEN}✅ Created necessary directories${NC}"

# Build Docker images
echo -e "\n${YELLOW}Building Docker images...${NC}"
docker-compose build
echo -e "${GREEN}✅ Docker images built successfully${NC}"

# Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nNext steps:"
echo -e "1. Update ${YELLOW}.env${NC} file with your credentials"
echo -e "2. Run ${YELLOW}docker-compose up${NC} to start all services"
echo -e "3. Visit ${YELLOW}http://localhost:3000${NC} for the frontend"
echo -e "4. Visit ${YELLOW}http://localhost:8000/docs${NC} for API documentation"
echo -e "\nFor development:"
echo -e "- Backend: ${YELLOW}cd backend && source venv/bin/activate && uvicorn main:app --reload${NC}"
echo -e "- Frontend: ${YELLOW}cd frontend && npm run dev${NC}"
