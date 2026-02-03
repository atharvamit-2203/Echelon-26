# Production-Ready Fair-Hire Sentinel

A comprehensive AI-powered ATS bias detection system with enterprise-grade infrastructure.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.11+
- Git

### One-Command Setup
```bash
# Linux/Mac
./scripts/setup.sh && make up

# Windows
scripts\setup.bat
docker-compose up -d
```

Visit:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📁 Project Structure

```
Echelon/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/v1/         # Versioned API endpoints
│   │   ├── core/           # Config, security, logging
│   │   ├── models/         # Pydantic models
│   │   ├── services/       # Business logic
│   │   └── ml/             # ML models
│   ├── tests/              # Backend tests
│   └── Dockerfile
├── frontend/               # Next.js frontend
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── lib/                # Utilities & API client
│   ├── hooks/              # Custom hooks
│   ├── tests/              # Frontend tests
│   └── Dockerfile
├── infrastructure/         # Deployment configs
│   └── kubernetes/         # K8s manifests
├── scripts/                # Automation scripts
├── .github/workflows/      # CI/CD pipelines
└── docker-compose.yml      # Local development stack
```

## 🏗️ Architecture

### Backend (FastAPI)
- **Clean Architecture**: Separation of concerns with layers
- **API Versioning**: `/api/v1/` prefix
- **Dependency Injection**: Service layer pattern
- **Structured Logging**: JSON logs with context
- **Error Handling**: Custom exceptions with proper HTTP codes
- **Security**: JWT authentication, password hashing
- **Validation**: Pydantic models with strict validation

### Frontend (Next.js 15)
- **State Management**: Zustand for global state
- **Data Fetching**: React Query with caching
- **Type Safety**: TypeScript strict mode
- **Form Handling**: React Hook Form + Zod
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library

### Infrastructure
- **Containerization**: Docker multi-stage builds
- **Orchestration**: Kubernetes with auto-scaling
- **CI/CD**: GitHub Actions with automated testing
- **Monitoring**: Health checks, structured logging
- **Security**: Secrets management, vulnerability scanning

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest --cov=app --cov-report=html
```

### Frontend Tests
```bash
cd frontend
npm test -- --coverage
```

### E2E Tests
```bash
npm run test:e2e
```

## 🚢 Deployment

### Local Development
```bash
make up          # Start all services
make logs        # View logs
make test        # Run tests
make down        # Stop services
```

### Staging
```bash
./scripts/deploy.sh staging
```

### Production
```bash
./scripts/deploy.sh production
```

### Kubernetes
```bash
kubectl apply -f infrastructure/kubernetes/
kubectl get pods -n fairhire
```

## 📊 Features

### ✅ Implemented
- **CV Management**: Upload, analyze, and manage candidate CVs
- **Bias Detection**: ML-powered bias detection using semantic analysis
- **ATS Simulation**: Simulate ATS screening with keyword matching
- **Candidate Rescue**: Identify and rescue qualified candidates
- **Analytics Dashboard**: Real-time metrics and visualizations
- **RESTful API**: Versioned API with comprehensive documentation
- **Authentication**: JWT-based authentication
- **Docker Support**: Full containerization
- **CI/CD Pipeline**: Automated testing and deployment
- **Kubernetes**: Production-ready K8s manifests
- **Testing**: Unit, integration, and E2E tests
- **Monitoring**: Health checks and structured logging

### 🔜 Roadmap
- [ ] Real-time notifications (WebSockets)
- [ ] Advanced ML models (BERT, GPT integration)
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced analytics (Grafana dashboards)
- [ ] Audit logging
- [ ] Role-based access control (RBAC)
- [ ] Export functionality (PDF/CSV)

## 🔐 Security

- **Authentication**: JWT tokens with secure password hashing
- **Authorization**: Role-based access control
- **Input Validation**: Strict Pydantic validation
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **CSRF Protection**: Token-based protection
- **Secrets Management**: Environment variables, never committed
- **Vulnerability Scanning**: Automated Trivy scans in CI

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT.md)
- [API Documentation](http://localhost:8000/docs)
- [Implementation Plan](C:\Users\Amit\.gemini\antigravity\brain\80387aee-3a66-42fb-a912-d22acd29831b\implementation_plan.md)
- [Walkthrough](C:\Users\Amit\.gemini\antigravity\brain\80387aee-3a66-42fb-a912-d22acd29831b\walkthrough.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- FastAPI for the excellent web framework
- Next.js for the React framework
- Sentence-BERT for semantic analysis
- Firebase for backend services

---

**Built with ❤️ to make hiring fair for everyone**