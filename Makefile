# Fair-Hire Sentinel - Makefile for common tasks

.PHONY: help setup build up down restart logs test clean deploy

# Default target
help:
	@echo "Fair-Hire Sentinel - Available Commands"
	@echo "========================================"
	@echo "setup       - Initial project setup"
	@echo "build       - Build Docker images"
	@echo "up          - Start all services"
	@echo "down        - Stop all services"
	@echo "restart     - Restart all services"
	@echo "logs        - View logs from all services"
	@echo "test        - Run all tests"
	@echo "test-backend - Run backend tests"
	@echo "test-frontend - Run frontend tests"
	@echo "lint        - Run linters"
	@echo "clean       - Clean up containers and volumes"
	@echo "deploy-staging - Deploy to staging"
	@echo "deploy-prod - Deploy to production"
	@echo "health      - Check service health"

# Setup
setup:
	@echo "Running setup..."
	@chmod +x scripts/*.sh
	@./scripts/setup.sh

# Build Docker images
build:
	@echo "Building Docker images..."
	@docker-compose build

# Start services
up:
	@echo "Starting services..."
	@docker-compose up -d
	@echo "Services started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"

# Stop services
down:
	@echo "Stopping services..."
	@docker-compose down

# Restart services
restart: down up

# View logs
logs:
	@docker-compose logs -f

# Run all tests
test: test-backend test-frontend

# Backend tests
test-backend:
	@echo "Running backend tests..."
	@cd backend && source venv/bin/activate && pytest --cov=. --cov-report=term-missing

# Frontend tests
test-frontend:
	@echo "Running frontend tests..."
	@cd frontend && npm test

# Linting
lint:
	@echo "Running linters..."
	@cd backend && source venv/bin/activate && ruff check .
	@cd frontend && npm run lint

# Clean up
clean:
	@echo "Cleaning up..."
	@docker-compose down -v
	@docker system prune -f
	@echo "Cleanup complete!"

# Deploy to staging
deploy-staging:
	@echo "Deploying to staging..."
	@./scripts/deploy.sh staging

# Deploy to production
deploy-prod:
	@echo "Deploying to production..."
	@./scripts/deploy.sh production

# Health check
health:
	@echo "Checking service health..."
	@curl -f http://localhost:8000/health || echo "Backend: DOWN"
	@curl -f http://localhost:3000 || echo "Frontend: DOWN"

# Development mode
dev:
	@echo "Starting development mode..."
	@docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Database migrations
migrate:
	@echo "Running database migrations..."
	@cd backend && source venv/bin/activate && alembic upgrade head

# Create new migration
migration:
	@echo "Creating new migration..."
	@read -p "Migration name: " name; \
	cd backend && source venv/bin/activate && alembic revision --autogenerate -m "$$name"

# Backup database
backup:
	@echo "Backing up database..."
	@docker-compose exec postgres pg_dump -U postgres fairhire > backups/db_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Backup complete!"

# Restore database
restore:
	@echo "Restoring database..."
	@read -p "Backup file: " file; \
	docker-compose exec -T postgres psql -U postgres fairhire < $$file
	@echo "Restore complete!"
