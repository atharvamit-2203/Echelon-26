# Build & Deployment Automation

This directory contains all the automation scripts and configurations for building and deploying Fair-Hire Sentinel.

## 🚀 Quick Start

### Local Development
```bash
# Linux/Mac
chmod +x scripts/*.sh
./scripts/setup.sh

# Windows
scripts\setup.bat

# Or use Make
make setup
make up
```

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📦 What's Included

### Docker Configuration
- **`backend/Dockerfile`** - Multi-stage build for Python backend
- **`frontend/Dockerfile`** - Optimized Next.js standalone build
- **`docker-compose.yml`** - Complete stack with PostgreSQL, Redis, backend, frontend

### CI/CD Pipeline
- **`.github/workflows/ci-cd.yml`** - Automated testing, building, and deployment
  - Backend tests with pytest
  - Frontend tests with Jest
  - Security scanning with Trivy
  - Docker image builds
  - Automated deployment to staging/production

### Deployment Scripts
- **`scripts/setup.sh`** - Initial project setup (Linux/Mac)
- **`scripts/setup.bat`** - Initial project setup (Windows)
- **`scripts/deploy.sh`** - Deployment automation with health checks
- **`scripts/rollback.sh`** - Quick rollback to previous version
- **`Makefile`** - Common tasks (build, test, deploy)

### Kubernetes Manifests
- **`infrastructure/kubernetes/backend-deployment.yaml`** - Backend deployment with HPA
- **`infrastructure/kubernetes/frontend-deployment.yaml`** - Frontend deployment with HPA
- **`infrastructure/kubernetes/ingress.yaml`** - Ingress with SSL/TLS
- **`infrastructure/kubernetes/namespace.yaml`** - Namespace, secrets, config maps

## 🔧 Usage

### Build Docker Images
```bash
# Using Docker Compose
docker-compose build

# Using Make
make build

# Manual build
docker build -t fairhire-backend ./backend
docker build -t fairhire-frontend ./frontend
```

### Run Tests
```bash
# All tests
make test

# Backend only
make test-backend

# Frontend only
make test-frontend
```

### Deploy

#### To Staging
```bash
./scripts/deploy.sh staging
# or
make deploy-staging
```

#### To Production
```bash
./scripts/deploy.sh production
# or
make deploy-prod
```

### Rollback
```bash
./scripts/rollback.sh production 20260129-061120
```

### Kubernetes Deployment
```bash
# Create namespace and secrets
kubectl apply -f infrastructure/kubernetes/namespace.yaml

# Deploy backend
kubectl apply -f infrastructure/kubernetes/backend-deployment.yaml

# Deploy frontend
kubectl apply -f infrastructure/kubernetes/frontend-deployment.yaml

# Set up ingress
kubectl apply -f infrastructure/kubernetes/ingress.yaml

# Check status
kubectl get pods -n fairhire
kubectl get svc -n fairhire
kubectl get ingress -n fairhire
```

## 📊 CI/CD Pipeline

The GitHub Actions pipeline automatically:

1. **On Pull Request:**
   - Runs backend tests (pytest)
   - Runs frontend tests (Jest)
   - Performs security scanning
   - Checks code quality

2. **On Push to `develop`:**
   - Builds Docker images
   - Pushes to container registry
   - Deploys to staging environment

3. **On Push to `main`:**
   - Builds Docker images
   - Pushes to container registry
   - Deploys to production environment
   - Creates GitHub release

## 🔐 Security

### Secrets Management
- Never commit `.env` files
- Use `.env.example` templates
- In production, use:
  - AWS Secrets Manager
  - HashiCorp Vault
  - Google Secret Manager
  - Kubernetes Secrets

### Environment Files
- `.env.example` - Template for local development
- `.env.staging.example` - Template for staging
- `.env.production.example` - Template for production

## 🏗️ Architecture

```
┌─────────────────┐
│   Ingress/LB    │
│   (nginx)       │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Frontend│ │Backend│
│(Next.js)│ │(FastAPI)│
└───┬───┘ └──┬────┘
    │        │
    │   ┌────┴────┐
    │   │         │
    │ ┌─▼──┐  ┌──▼───┐
    │ │Redis│ │Postgres│
    │ └────┘  └──────┘
    │
┌───▼────┐
│Firebase│
└────────┘
```

## 📈 Monitoring

### Health Checks
- Backend: `http://localhost:8000/health`
- Frontend: `http://localhost:3000/api/health`

### Logs
```bash
# Docker Compose
docker-compose logs -f

# Kubernetes
kubectl logs -f -n fairhire -l app=fairhire
```

## 🛠️ Troubleshooting

### Build Fails
```bash
# Clean and rebuild
make clean
make build
```

### Container Won't Start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check health
make health
```

### Deployment Fails
```bash
# Check deployment logs
kubectl describe pod -n fairhire <pod-name>
kubectl logs -n fairhire <pod-name>

# Rollback
./scripts/rollback.sh production <previous-version>
```

## 📝 Makefile Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make setup` | Initial project setup |
| `make build` | Build Docker images |
| `make up` | Start all services |
| `make down` | Stop all services |
| `make restart` | Restart all services |
| `make logs` | View logs |
| `make test` | Run all tests |
| `make lint` | Run linters |
| `make clean` | Clean up containers |
| `make deploy-staging` | Deploy to staging |
| `make deploy-prod` | Deploy to production |
| `make health` | Check service health |

## 🎯 Next Steps

1. **Configure Secrets:**
   - Copy `.env.example` to `.env`
   - Fill in all required credentials
   - Set up secrets in your CI/CD platform

2. **Set Up CI/CD:**
   - Configure GitHub repository secrets
   - Update Docker registry in workflows
   - Configure deployment targets

3. **Deploy:**
   - Test locally with Docker Compose
   - Deploy to staging
   - Test staging environment
   - Deploy to production

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
