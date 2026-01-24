# 🛡️ Fair-Hire Sentinel

**Solving the "AI Rejected a Genius" Problem**

An AI-powered safety layer that acts as a watchdog over hiring software (ATS) to prevent qualified candidates from being unfairly rejected due to keyword bias.

## 🎯 What We Built

### The Problem
- Experienced professionals get rejected because they use "Performance Targets" instead of "KPI"
- ATS systems create unfair bias against workers who use different professional vocabulary
- 90% of experts are being rejected by broken keyword filters

### The Solution: Fair-Hire Sentinel
A three-component AI system:

1. **🔍 Bias Smoke Detector** - Watches ATS trash folder, uses Four-Fifths Rule to detect discrimination
2. **🧠 Semantic Rescuer** - Uses NLP to understand meaning, not spelling (finds "Strategic Revenue Pipelines" = "CRM Strategy")
3. **⚠️ Recruiter Dashboard** - Red alerts: "Warning! You just rejected a promising candidate with 98% skill match"

## 🚀 Quick Start

### Option 1: Automated Startup (Recommended)
```bash
# Windows: Double-click this file to start both frontend and backend
start_full_system.bat
```

This will start:
- Backend API at `http://localhost:8000`
- Frontend UI at `http://localhost:3000`
- API Documentation at `http://localhost:8000/docs`

### Option 2: Manual Startup

#### Backend (Terminal 1)
```bash
cd backend
# Create virtual environment (first time only)
python -m venv venv
# Activate it
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
# Install dependencies
pip install -r requirements.txt
# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

## 🎮 How to Use

### 1. Upload CVs
- Go to **CV Management** page (`http://localhost:3000/cvs`)
- Drag and drop CV files or use the upload form
- Add candidate information

### 2. Start Analysis
Click **"Start ATS Analysis"** button on:
- CV Management page
- Dashboard page
- Analytics page

### 3. View Results
- Navigate to **Analytics** page to see:
  - ATS match percentages
  - Missing keywords
  - Bias detection results
  - Rescued candidates
- Click on individual resumes for detailed analysis

### 4. Monitor Dashboard
- View real-time statistics
- See rescued candidates
- Check bias alerts

## 🧪 Testing the System

### Automated Test
```bash
# Run this after starting the servers
python test_system.py
```

### Manual Test
1. Open http://localhost:3000/dashboard
2. Click "Start Fair-Hire Sentinel" 
3. Watch the three components work:
   - ATS Screening Simulation
   - Bias Smoke Detector  
   - Semantic Rescuer
   - Recruiter Alert
4. See red rescue alerts appear
5. Click "Rescue Now" to save candidates

## 📊 What You'll See

### Dashboard Features
- **Real-time monitoring** of ATS screening
- **Live bias detection** using Four-Fifths Rule
- **Semantic analysis** progress tracking
- **Red rescue alerts** for qualified rejected candidates

### Sample Rescue Scenarios
- **Sarah Mitchell (47, Female)** - Used "Performance Targets" instead of "KPI" → 98% semantic match
- **Dr. Meera Krishnan (49, Female)** - Said "Performance Metrics" instead of "KPI" → Rescued from trash
- **Rajesh Gupta (52, Male)** - Age filter bias detected → Flagged for review

## 🔧 System Architecture

```
Fair-Hire Sentinel
├── Backend (FastAPI)
│   ├── fair_hire_sentinel.py    # Main AI components
│   ├── ats_analysis.py          # ATS simulation
│   ├── firebase_service.py      # Database
│   └── main.py                  # API endpoints
├── Frontend (Next.js)
│   ├── dashboard/page.tsx       # Main dashboard
│   └── BatchAnalysisPanel.tsx   # Analysis interface
└── Database (Firebase)
    ├── CVs collection
    ├── Alerts collection
    └── Metrics collection
```

## 🎮 Demo Flow

1. **Upload CVs** - System has sample biased data
2. **Run Analysis** - Click "Start Fair-Hire Sentinel"
3. **Watch Components**:
   - 🔍 Bias Smoke Detector finds discrimination patterns
   - 🧠 Semantic Rescuer analyzes rejected CVs
   - ⚠️ Dashboard generates rescue alerts
4. **See Results** - Red alerts show rescued candidates
5. **Take Action** - Click "Rescue Now" to save them

## 📈 Key Metrics Tracked

- **Total Candidates Processed**
- **ATS Rejection Rate** 
- **Candidates Rescued**
- **Active Bias Alerts**
- **Semantic Match Scores**

## 🔗 URLs

- **Frontend Dashboard**: http://localhost:3000/dashboard
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🛠️ Technologies Used

- **Backend**: FastAPI, Python, Firebase
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **AI/ML**: Sentence-BERT, Scikit-learn, Semantic Analysis
- **Database**: Firebase Firestore

## 📝 Sample Data

The system includes sample CVs that demonstrate the bias problem:
- Experienced professionals (45+) with semantic skill matches
- Different vocabulary usage (Performance Targets vs KPI)
- Gender and age bias patterns
- Real-world rejection scenarios

## 🎯 Success Criteria

✅ **Bias Detection**: System identifies discrimination patterns using Four-Fifths Rule  
✅ **Semantic Rescue**: Finds qualified candidates rejected for vocabulary differences  
✅ **Real-time Alerts**: Dashboard shows immediate rescue notifications  
✅ **Actionable Interface**: One-click candidate rescue functionality  

---

**Built to solve the "AI Rejected a Genius" problem and make hiring fair for everyone.**