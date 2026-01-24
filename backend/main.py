from fastapi import FastAPI, File, UploadFile, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from firebase_service import FirebaseService
from ats_analysis import ATSAnalysisService
import json
from datetime import datetime
import asyncio

app = FastAPI(title="Fair-Hire Sentinel API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MetricData(BaseModel):
    title: str
    value: str
    delta: str
    trend: str = "up"

class AlertData(BaseModel):
    type: str
    title: str
    description: str
    affected: str
    recommendation: str = ""

class CVData(BaseModel):
    name: str
    email: str
    phone: str
    age: int
    gender: str
    experience: int
    skills: List[str]
    education: str
    location: str
    currentRole: str
    expectedSalary: str

class CandidateData(BaseModel):
    id: int
    age_group: str
    gender: str
    keywords: str
    score: int

class HomePageData(BaseModel):
    metrics: List[MetricData]
    alerts: List[AlertData]
    rescued_candidates: List[CandidateData]
    age_stats: dict
    gender_stats: dict

@app.get("/")
def read_root():
    return {"message": "Fair-Hire Sentinel API"}

@app.get("/api/home", response_model=HomePageData)
def get_home_data():
    # Try to get data from Firebase, fallback to static data
    try:
        firebase_metrics = FirebaseService.get_metrics()
        firebase_alerts = FirebaseService.get_alerts()
        firebase_candidates = FirebaseService.get_rescued_candidates()
        firebase_analytics = FirebaseService.get_analytics()
        
        if firebase_metrics and firebase_alerts:
            return HomePageData(
                metrics=[
                    MetricData(title="Total Candidates", value=str(firebase_metrics['totalCandidates']['value']), delta=firebase_metrics['totalCandidates']['delta']),
                    MetricData(title="ATS Rejections", value=str(firebase_metrics['atsRejections']['value']), delta=firebase_metrics['atsRejections']['delta'], trend="down"),
                    MetricData(title="Rescued Candidates", value=str(firebase_metrics['rescuedCandidates']['value']), delta=firebase_metrics['rescuedCandidates']['delta']),
                    MetricData(title="Active Bias Alerts", value=str(firebase_metrics['activeBiasAlerts']['value']), delta=firebase_metrics['activeBiasAlerts']['delta'])
                ],
                alerts=[AlertData(**alert) for alert in firebase_alerts],
                rescued_candidates=[CandidateData(id=c['id'], age_group=c['ageGroup'], gender=c['gender'], keywords=c['keywords'], score=c['score']) for c in firebase_candidates],
                age_stats=firebase_analytics['ageStats'] if firebase_analytics else {},
                gender_stats=firebase_analytics['genderStats'] if firebase_analytics else {}
            )
    except Exception as e:
        print(f"Firebase error: {e}")
    
    # Fallback to static data
    return HomePageData(
        metrics=[
            MetricData(title="Total Candidates", value="250", delta="+12"),
            MetricData(title="ATS Rejections", value="88", delta="35%", trend="down"),
            MetricData(title="Rescued Candidates", value="12", delta="+5"),
            MetricData(title="Active Bias Alerts", value="3", delta="⚠️")
        ],
        alerts=[
            AlertData(
                type="warning",
                title="🟡 Bias Detected in Keyword Filters",
                description="3 keyword(s) show rejection rate disparities exceeding 25% threshold.",
                affected="Candidates over 45 years old",
                recommendation="Review \"KPI\" and \"OKR\" filters to include semantic equivalents"
            ),
            AlertData(
                type="info",
                title="🦸 Talent Rescue Opportunity",
                description="12 high-potential candidates auto-rejected but have >85% semantic match.",
                affected="Primarily experienced professionals (45+) and female candidates"
            )
        ],
        rescued_candidates=[
            CandidateData(id=1023, age_group=">45", gender="Female", keywords="CRM Strategy", score=92),
            CandidateData(id=1847, age_group=">45", gender="Male", keywords="KPI", score=89),
            CandidateData(id=2156, age_group="30-45", gender="Female", keywords="Client Engagement", score=87)
        ],
        age_stats={"Under 30": 22, "30-45": 30, "Over 45": 52},
        gender_stats={"Male": 28, "Female": 42, "Non-binary": 38}
    )

@app.post("/api/bulk-upload-cvs")
async def bulk_upload_cvs(cvs: List[dict]):
    try:
        results = []
        for cv_data in cvs:
            candidate_id = f"CV{datetime.now().strftime('%Y%m%d%H%M%S')}{len(results)}"
            cv_data['candidateId'] = candidate_id
            cv_data['uploadedAt'] = datetime.now()
            cv_data['status'] = 'under_review'
            
            FirebaseService.add_cv(cv_data)
            results.append(candidate_id)
        
        return {"message": f"Successfully uploaded {len(results)} CVs", "candidateIds": results}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/upload-cv-file")
async def upload_cv_file(file: UploadFile = File(...)):
    try:
        # Save file to Firebase Storage
        blob = bucket.blob(f"cvs/{file.filename}")
        contents = await file.read()
        blob.upload_from_string(contents, content_type=file.content_type)
        
        # Generate CV data from filename (simplified)
        candidate_id = f"CV{datetime.now().strftime('%Y%m%d%H%M%S')}"
        cv_data = {
            "candidateId": candidate_id,
            "fileName": file.filename,
            "fileUrl": blob.public_url,
            "uploadedAt": datetime.now(),
            "status": "pending_extraction"
        }
        
        FirebaseService.add_cv(cv_data)
        return {"message": "CV uploaded successfully", "candidateId": candidate_id}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/cvs")
async def add_cv(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    age: int = Form(...),
    gender: str = Form(...),
    experience: int = Form(...),
    skills: str = Form(...),
    education: str = Form(...),
    location: str = Form(...),
    currentRole: str = Form(...),
    expectedSalary: str = Form(...),
    cv_file: Optional[UploadFile] = File(None)
):
    try:
        # Generate candidate ID
        candidate_id = f"CV{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Parse skills from comma-separated string
        skills_list = [skill.strip() for skill in skills.split(',')]
        
        cv_data = {
            "candidateId": candidate_id,
            "name": name,
            "email": email,
            "phone": phone,
            "age": age,
            "gender": gender,
            "experience": experience,
            "skills": skills_list,
            "education": education,
            "location": location,
            "currentRole": currentRole,
            "expectedSalary": expectedSalary,
            "status": "under_review",
            "uploadedAt": datetime.now()
        }
        
        # Add CV to Firebase
        result = FirebaseService.add_cv(cv_data)
        return {"message": "CV added successfully", "candidateId": candidate_id}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/cvs")
def get_cvs():
    try:
        cvs = FirebaseService.get_cvs()
        return {"cvs": cvs}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/recruiting-managers")
def get_recruiting_managers():
    try:
        managers = FirebaseService.get_recruiting_managers()
        return {"managers": managers}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/companies")
def get_companies():
    try:
        companies = FirebaseService.get_companies()
        return {"companies": companies}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/job-postings")
def get_job_postings():
    try:
        jobs_ref = FirebaseService.db.collection('job_postings').where('status', '==', 'active')
        jobs = [job.to_dict() for job in jobs_ref.stream()]
        return {"jobs": jobs}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/company-criteria/{company_name}")
def get_company_criteria(company_name: str):
    try:
        from company_ats_criteria import CompanyATSCriteria
        criteria = CompanyATSCriteria.get_company_criteria(company_name)
        return {"company": company_name, "criteria": criteria}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/start-batch-analysis")
async def start_batch_analysis(background_tasks: BackgroundTasks):
    try:
        # Run analysis in background
        background_tasks.add_task(ATSAnalysisService.run_batch_analysis)
        return {
            "message": "Batch analysis started",
            "status": "processing",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/analysis-status")
def get_analysis_status():
    try:
        # Get latest metrics to show current status
        metrics = FirebaseService.get_metrics()
        alerts = FirebaseService.get_alerts()
        return {
            "status": "completed" if metrics else "idle",
            "metrics": metrics,
            "active_alerts": len(alerts) if alerts else 0,
            "last_updated": metrics.get('lastUpdated') if metrics else None
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/populate-data")
def populate_data():
    try:
        FirebaseService.populate_sample_data()
        return {"message": "Data populated successfully"}
    except Exception as e:
        return {"error": str(e)}