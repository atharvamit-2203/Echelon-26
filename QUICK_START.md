# Quick Start Guide

## 🚀 Running the Application

### Backend

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
pip install PyPDF2 python-docx
```

3. **Set up environment variables:**
Create a `.env` file in the backend directory:
```env
GEMINI_API_KEY=your-api-key-here
DATABASE_URL=your-firebase-url
REDIS_URL=redis://localhost:6379/0
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

4. **Start the server:**
```bash
uvicorn main:app --reload
```

Backend will be available at: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

---

### Frontend

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

Frontend will be available at: `http://localhost:3000`

---

## 📱 Accessing the Application

### Main Dashboard
Navigate to: `http://localhost:3000/dashboard`

### Available Features

#### 1. **Analysis Tab**
- Enter job description
- Click "Start Analysis" to analyze all CVs
- Monitor task progress
- View results

#### 2. **Upload CV Tab**
- Select CV file (PDF, DOCX, or TXT)
- Fill in candidate information
- Upload and auto-parse CV
- Receive confirmation

#### 3. **Create Job Tab**
- Enter job details
- Add evaluation keywords
- Define required and preferred skills
- Set experience requirements
- Create job posting

#### 4. **Bias Analysis Tab**
- View gender distribution charts
- Analyze age group statistics
- Check shortlist rates
- Identify potential biases

#### 5. **Rescued Candidates Tab**
- View candidates rescued from ATS rejection
- Compare ATS vs Semantic scores
- Review candidate skills
- Access candidate details

---

## 🔧 Configuration Fixed

### Next.js Warnings Resolved ✅
- ✅ Removed deprecated `swcMinify` option (now default in Next.js 15)
- ✅ Removed deprecated `experimental.appDir` (App Router is now stable)
- ✅ Added `outputFileTracingRoot` to handle monorepo structure
- ✅ No more configuration warnings

### Current Configuration
```javascript
{
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingRoot: '../',
  compiler: {
    removeConsole: { exclude: ['error', 'warn'] }
  }
}
```

---

## 🧪 Testing the Application

### 1. Test CV Upload
```bash
curl -X POST http://localhost:8000/api/v1/upload/cv \
  -F "file=@sample-cv.pdf" \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "phone=+1234567890" \
  -F "age=30" \
  -F "gender=Male" \
  -F "experience=5" \
  -F "education=Bachelor in CS" \
  -F "location=New York" \
  -F "currentRole=Software Engineer" \
  -F "expectedSalary=$100k-$120k"
```

### 2. Test Job Creation
```bash
curl -X POST http://localhost:8000/api/v1/jobs/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior React Developer",
    "description": "Looking for an experienced React developer",
    "department": "Engineering",
    "location": "Remote",
    "job_type": "full-time",
    "criteria": {
      "keywords": ["react", "typescript", "next.js"],
      "required_skills": ["React", "JavaScript"],
      "preferred_skills": ["TypeScript", "Next.js"],
      "min_experience": 3
    }
  }'
```

### 3. Test Batch Analysis
```bash
curl -X POST http://localhost:8000/api/v1/analysis/batch \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Looking for a Python developer with 5+ years experience",
    "async_mode": true
  }'
```

---

## 📊 API Endpoints

### Jobs
- `POST /api/v1/jobs/` - Create job posting
- `GET /api/v1/jobs/` - List all jobs
- `GET /api/v1/jobs/{job_id}` - Get specific job
- `POST /api/v1/jobs/{job_id}/keywords` - Add keywords
- `POST /api/v1/jobs/{job_id}/sample-cv` - Set sample CV

### Upload
- `POST /api/v1/upload/cv` - Upload candidate CV
- `POST /api/v1/upload/sample-cv` - Upload sample CV
- `POST /api/v1/upload/parse` - Parse CV without saving

### Analysis
- `POST /api/v1/analysis/analyze` - Analyze single CV
- `POST /api/v1/analysis/batch` - Batch analyze CVs
- `GET /api/v1/analysis/statistics` - Get analysis stats
- `GET /api/v1/analysis/task/{task_id}` - Check task status

### Reports
- `GET /api/v1/reports/dashboard` - Dashboard summary
- `GET /api/v1/reports/bias-analysis` - Bias analysis
- `GET /api/v1/reports/rescued-candidates` - Rescued candidates
- `GET /api/v1/reports/performance-metrics` - Performance metrics

---

## ✅ Everything is Working!

The application is now fully functional with:
- ✅ No configuration warnings
- ✅ All UI components working
- ✅ All API endpoints active
- ✅ File upload functional
- ✅ Real-time updates
- ✅ Charts and visualizations
- ✅ Complete CRUD operations

**Ready for production deployment!** 🚀
