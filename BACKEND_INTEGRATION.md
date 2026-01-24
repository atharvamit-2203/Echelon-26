# Fair-Hire Sentinel - Backend Integration Guide

## Overview
This guide explains how to run the Fair-Hire Sentinel system with full backend integration for ATS analysis, bias detection, and candidate rescue.

## Prerequisites
- Python 3.8+ installed
- Node.js 18+ installed
- Firebase account and service account key

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment (if not exists)
```bash
python -m venv venv
```

### 3. Activate Virtual Environment
**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Set Up Environment Variables
Create a `.env` file in the backend directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_SERVICE_ACCOUNT=service-account-key.json
```

### 6. Start Backend Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## How to Use the Integrated System

### Step 1: Upload CVs
1. Navigate to **CV Management** page (`/cvs`)
2. Use the file upload component to upload PDF/DOCX CVs
3. Or use the form to manually enter candidate data
4. Click "Start ATS Analysis" button

### Step 2: Run Analysis
You can trigger analysis from multiple pages:
- **Dashboard** (`/dashboard`) - Click "Run Analysis" button
- **CVs Page** (`/cvs`) - Click "Start ATS Analysis" button
- **Analytics Page** (`/analytics`) - Click "Run Analysis" button

### Step 3: View Results
1. Navigate to **Analytics** page (`/analytics`)
2. View the analysis results including:
   - ATS match percentages
   - Keywords found/missing
   - Bias indicators
   - Rescued candidates
3. Click on individual resumes to see detailed analysis

### Step 4: Monitor Dashboard
1. Go to **Dashboard** (`/dashboard`)
2. View real-time statistics:
   - Total candidates processed
   - ATS rejections
   - Rescued candidates
   - Active bias alerts
3. See pending CVs and their status

## API Endpoints Used

### CV Management
- `GET /api/cvs` - Fetch all CVs
- `POST /api/cvs` - Add new CV via form
- `POST /api/upload-cv-file` - Upload CV file

### Analysis
- `POST /api/start-batch-analysis` - Start ML-powered analysis
- `GET /api/analysis-status` - Check analysis progress
- `GET /api/rescue-alerts` - Get rescued candidate alerts

### Data
- `GET /api/home` - Get dashboard metrics and alerts
- `POST /api/job-criteria` - Save job requirements
- `GET /api/company-criteria/{company}` - Get company ATS criteria

## Features

### 1. ATS Keyword Matching
- Compares CV content against required keywords
- Shows match percentage
- Highlights missing keywords

### 2. Bias Detection
- Detects age bias indicators
- Identifies gender bias
- Flags discriminatory keyword patterns

### 3. Semantic Analysis
- ML-powered similarity scoring
- Rescues qualified candidates rejected by ATS
- Finds semantic equivalents of required skills

### 4. Real-time Monitoring
- Live status updates during analysis
- Progress indicators
- Automatic data refresh

## Troubleshooting

### Backend Not Starting
- Check if port 8000 is available
- Ensure all dependencies are installed
- Verify `.env` file exists with correct keys

### Frontend Not Connecting
- Verify backend is running on port 8000
- Check browser console for CORS errors
- Ensure API_BASE_URL is correctly set

### No Analysis Results
- Ensure CVs are uploaded before running analysis
- Check backend logs for errors
- Verify Firebase credentials are valid

## Development Notes

### API Client
The frontend uses a centralized API client located at:
`frontend/lib/api.ts`

### Custom Hooks
- `useAnalysis` - Hook for managing analysis state and polling

### Components
- `BatchAnalysisPanel` - Triggers and monitors batch analysis
- `RecruiterUploadPanel` - Upload CVs and set job criteria
- `CVFileUpload` - Drag-and-drop file upload

## Next Steps

1. Configure your job criteria in the Dashboard
2. Upload sample CVs or use existing data
3. Run the analysis to see bias detection in action
4. View rescued candidates who were wrongly rejected
5. Check Analytics page for detailed insights

## Support

For issues or questions:
1. Check backend logs: `backend/` directory
2. Check browser console for frontend errors
3. Review API documentation at `http://localhost:8000/docs`
