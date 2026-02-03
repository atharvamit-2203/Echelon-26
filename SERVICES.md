# Advanced Functionalities & Services

## 🎯 Overview

This document outlines all the advanced functionalities and services added to Fair-Hire Sentinel.

---

## 🧠 Analysis Service

### Features
- **Single CV Analysis**: Analyze individual CVs against job descriptions
- **Batch Analysis**: Process multiple CVs simultaneously
- **Semantic Matching**: Use sentence transformers for deep semantic analysis
- **ATS Scoring**: Traditional keyword-based ATS simulation
- **Bias Detection**: Identify potential biases in evaluation
- **Candidate Rescue**: Flag qualified candidates missed by ATS

### ML Models
- **Sentence-BERT**: `all-MiniLM-L6-v2` for semantic similarity
- **Cosine Similarity**: Measure semantic match between CV and JD
- **Keyword Matching**: Traditional ATS keyword extraction

### API Endpoints
```
POST /api/v1/analysis/analyze
POST /api/v1/analysis/batch
GET  /api/v1/analysis/statistics
GET  /api/v1/analysis/task/{task_id}
```

---

## 📧 Notification Service

### Email Notifications
- **CV Uploaded**: Confirmation to candidates
- **Analysis Complete**: Results notification with scores
- **Candidate Rescued**: Special notification for rescued candidates
- **Batch Complete**: Admin notification for batch processing

### Templates
- Plain text and HTML versions
- Professional formatting
- Personalized content
- Status-specific messages

### Configuration
```python
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@fairhire.com
```

---

## 💾 Cache Service

### Redis Integration
- **Get/Set Operations**: Basic caching
- **Pattern Deletion**: Bulk cache invalidation
- **Counters**: Increment operations
- **TTL Support**: Automatic expiration
- **Statistics**: Cache health monitoring

### Use Cases
- API response caching
- Session storage
- Rate limiting counters
- Temporary data storage

---

## ⚙️ Background Tasks (Celery)

### Task Types

#### 1. Analysis Tasks
- `analyze_cv_task`: Single CV analysis
- `batch_analyze_task`: Batch processing

#### 2. Notification Tasks
- `send_notification_task`: Async email sending

#### 3. Maintenance Tasks
- `cleanup_old_data_task`: Remove old rejected CVs
- `generate_report_task`: Periodic report generation

### Configuration
```python
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### Running Celery Worker
```bash
celery -A app.tasks.celery_tasks worker --loglevel=info
```

---

## 📊 Reports Service

### Dashboard Endpoint
```
GET /api/v1/reports/dashboard
```
Returns:
- Total CVs, analyzed, pending
- Analysis completion rate
- Average scores
- Status distribution
- Recommendation breakdown

### Bias Analysis
```
GET /api/v1/reports/bias-analysis
```
Returns:
- Gender distribution and performance
- Age group analysis
- Shortlist rates by demographics
- Bias detection metrics

### Rescued Candidates
```
GET /api/v1/reports/rescued-candidates
```
Returns:
- List of rescued candidates
- Rescue reasons
- Scores comparison

### Performance Metrics
```
GET /api/v1/reports/performance-metrics
```
Returns:
- Processing statistics
- Analysis completion rates
- Rescue rates
- Time-series data

---

## 🛡️ Security & Middleware

### Rate Limiting
- **Strict**: 10 requests/minute (sensitive endpoints)
- **Moderate**: 30 requests/minute (standard endpoints)
- **Relaxed**: 100 requests/minute (public endpoints)

### Request Logging
- Unique request IDs
- Processing time tracking
- Structured JSON logs
- Client information

### CORS
- Configurable origins
- Credentials support
- All methods allowed

### Compression
- GZip middleware
- Minimum size: 1000 bytes

---

## 🎨 Frontend Components

### DashboardStats
- Real-time metrics display
- Total CVs, analyzed, rescued
- Average scores
- Completion rates

### AnalysisPanel
- Job description input
- Batch analysis trigger
- Task status monitoring
- Real-time updates

### BiasAnalysis
- Gender distribution charts
- Age group analysis
- Shortlist rate visualization
- Interactive charts with Recharts

### RescuedCandidates
- List of rescued candidates
- Score comparison
- Skills display
- Status badges

---

## 🔧 Configuration

### Environment Variables
```bash
# Analysis
GEMINI_API_KEY=your-api-key

# Email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-password
FROM_EMAIL=noreply@fairhire.com
ADMIN_EMAIL=admin@fairhire.com

# Redis
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

---

## 📦 Dependencies

### Backend
```
celery==5.3.4
redis==5.0.1
sentence-transformers==2.3.1
scikit-learn==1.4.0
numpy==1.26.3
slowapi==0.1.9
```

### Frontend
```
@tanstack/react-query
axios
zustand
recharts
```

---

## 🚀 Usage Examples

### Analyze Single CV
```python
from app.services.analysis_service import AnalysisService

service = AnalysisService()
result = await service.analyze_cv(
    candidate_id="CV123",
    job_description="Looking for a Python developer..."
)
```

### Batch Analysis
```python
result = await service.batch_analyze(
    job_description="Senior React Developer...",
    candidate_ids=["CV001", "CV002", "CV003"]
)
```

### Send Notification
```python
from app.services.notification_service import NotificationService

service = NotificationService()
await service.notify_analysis_complete(
    candidate_name="John Doe",
    candidate_email="john@example.com",
    ats_score=75.5,
    recommendation="shortlisted"
)
```

### Cache Operations
```python
from app.services.cache_service import cache

# Set cache
await cache.set("key", {"data": "value"}, expire=3600)

# Get cache
data = await cache.get("key")

# Delete pattern
await cache.delete_pattern("cv:*")
```

---

## 📈 Performance

### Optimization
- Redis caching for frequent queries
- Background task processing
- Batch operations for efficiency
- Connection pooling
- Query optimization

### Scalability
- Horizontal scaling with Celery workers
- Redis cluster support
- Load balancing ready
- Stateless design

---

## 🧪 Testing

### Service Tests
```python
# Test analysis service
def test_analyze_cv():
    service = AnalysisService()
    result = await service.analyze_cv("CV123", "Job description")
    assert result['atsScore'] >= 0
    assert result['recommendation'] in VALID_RECOMMENDATIONS
```

### Integration Tests
```python
# Test full workflow
def test_batch_analysis_workflow():
    # Upload CVs
    # Trigger batch analysis
    # Verify notifications sent
    # Check results
```

---

## 🎯 Next Steps

1. **Add More ML Models**: BERT, GPT integration
2. **Real-time Updates**: WebSocket support
3. **Advanced Analytics**: Predictive models
4. **Export Features**: PDF/CSV reports
5. **Audit Logging**: Compliance tracking
6. **A/B Testing**: Algorithm comparison

---

**All services are production-ready and fully integrated!** 🚀
