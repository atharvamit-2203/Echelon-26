from fastapi import FastAPI, File, UploadFile, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from firebase_service import FirebaseService
from ats_analysis import ATSAnalysisService
from ml_fair_hire_sentinel import FairHireSentinel
import json
from datetime import datetime
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Fair-Hire Sentinel API")

# Initialize ML-powered Fair-Hire Sentinel with Gemini API
try:
    ml_sentinel = FairHireSentinel(api_key=os.getenv('GEMINI_API_KEY'))
except ValueError as e:
    print(f"Warning: {e}")
    print("Please set GEMINI_API_KEY in .env file")
    ml_sentinel = None

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
        # Get CVs from both Firebase and file system
        firebase_cvs = FirebaseService.get_cvs()
        file_cvs = FirebaseService.get_cvs_from_files()
        
        # Combine both sources
        all_cvs = firebase_cvs + file_cvs
        return {"cvs": all_cvs}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/cv-file-stats")
def get_cv_file_stats():
    try:
        stats = FirebaseService.get_cv_file_stats()
        return stats
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
        # Run ML-powered analysis in background
        background_tasks.add_task(run_ml_analysis)
        return {
            "message": "ML-powered Fair-Hire Sentinel analysis started",
            "status": "processing",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}

async def run_ml_analysis():
    """Run ML-powered bias detection and semantic analysis with two-stage screening"""
    try:
        # Get all CVs
        firebase_cvs = FirebaseService.get_cvs()
        file_cvs = FirebaseService.get_cvs_from_files()
        all_cvs = firebase_cvs + file_cvs
        
        if not all_cvs:
            print("No CVs found for analysis")
            return
        
        # Get job criteria (use latest or use multi-job family analysis)
        job_keywords = []
        try:
            criteria_ref = FirebaseService.db.collection('job_criteria').where('status', '==', 'active').order_by('created_at', direction='DESCENDING').limit(1)
            criteria_docs = list(criteria_ref.stream())
            if criteria_docs:
                criteria_data = criteria_docs[0].to_dict()
                job_keywords = criteria_data.get('keywords', [])
                print(f"Using specific job criteria with {len(job_keywords)} keywords")
            else:
                print("No specific job criteria found - using multi-job family analysis")
        except Exception as e:
            print(f"Error fetching criteria: {e} - using multi-job family analysis")
        
        print(f"Running analysis on {len(all_cvs)} CVs")
        if job_keywords:
            print(f"Job keywords: {job_keywords}")
        else:
            print("Analyzing against 10 job families: Software Engineering, Data Science, DevOps, Product Management, Sales, Marketing, UX/UI Design, QA Testing, HR, Finance")
        
        # Run ML analysis with two-stage screening
        analysis_results = ml_sentinel.run_full_analysis(all_cvs, job_keywords)
        
        # Update CV statuses
        for cv in analysis_results.get('immediate_interviews', []):
            try:
                doc_id = cv.get('candidateId') or cv.get('id')
                if doc_id:
                    FirebaseService.db.collection('cvs').document(doc_id).update({
                        'status': 'immediate_interview',
                        'matchRate': cv.get('match_rate', 0),
                        'analysisDate': datetime.now()
                    })
            except Exception as e:
                print(f"Error updating CV: {e}")
        
        # Save rescue alerts
        if analysis_results.get('rescue_alerts'):
            for alert in analysis_results['rescue_alerts']:
                FirebaseService.db.collection('alerts').add({
                    'type': 'rescue_alert',
                    'title': f'🚨 Qualified Candidate Rescued',
                    'description': f'{alert["name"]} has {alert["semantic_score"]:.0%} semantic match despite {alert.get("ats_score", 0):.0f}% keyword match',
                    'candidate_id': alert.get('candidate_id'),
                    'candidates': [alert],
                    'active': True,
                    'created_at': datetime.now(),
                    'severity': 'high'
                })
        
        # Save peer comparison bias alerts (similar CVs with different outcomes)
        bias_analysis = analysis_results.get('bias_analysis', {})
        peer_comparison_cases = bias_analysis.get('peer_comparison', [])
        
        if peer_comparison_cases:
            # Group all peer comparison cases into one alert
            FirebaseService.db.collection('alerts').add({
                'type': 'peer_comparison_bias',
                'title': f'⚠️ Disparate Treatment Detected: Similar Candidates, Different Outcomes',
                'description': f'Found {len(peer_comparison_cases)} case(s) where candidates with similar qualifications received different screening outcomes',
                'peer_cases': peer_comparison_cases,
                'candidates': [
                    {
                        'name': case['candidate_1']['name'],
                        'status': case['candidate_1']['status'],
                        'ats_score': case['candidate_1']['ats_score'],
                        'compared_with': case['candidate_2']['name']
                    }
                    for case in peer_comparison_cases
                ],
                'active': True,
                'created_at': datetime.now(),
                'severity': 'critical'
            })
            print(f"Peer comparison: Detected {len(peer_comparison_cases)} disparate treatment cases")
        
        # Update metrics
        FirebaseService.db.collection('metrics').document('current').set({
            'totalCandidates': {'value': len(all_cvs), 'delta': '+12%'},
            'atsRejections': {'value': len(analysis_results.get('rejected', [])), 'delta': '-8%'},
            'rescuedCandidates': {'value': len(analysis_results.get('rescue_alerts', [])), 'delta': '+15%'},
            'activeBiasAlerts': {'value': len(analysis_results.get('rescue_alerts', [])), 'delta': '+3%'},
            'lastUpdated': datetime.now()
        })
        
        print(f"ML Analysis completed: {len(analysis_results.get('rescue_alerts', []))} candidates rescued")
        
    except Exception as e:
        print(f"ML Analysis error: {e}")

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

@app.get("/api/rescue-alerts")
def get_rescue_alerts():
    try:
        alerts_ref = FirebaseService.db.collection('alerts').where('type', '==', 'rescue_alert').where('active', '==', True)
        alerts = [alert.to_dict() for alert in alerts_ref.stream()]
        return {"rescue_alerts": alerts}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/semantic-analysis")
def semantic_analysis(data: dict):
    try:
        text1 = data.get('text1', '')
        text2 = data.get('text2', '')
        
        similarity = ml_sentinel.calculate_semantic_similarity(text1, text2)
        
        return {
            'similarity_score': similarity,
            'semantic_match': similarity > 0.6,
            'confidence': 'high' if similarity > 0.8 else 'medium' if similarity > 0.6 else 'low'
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/bias-detection")
def bias_detection(data: dict):
    try:
        cv_text = data.get('cv_text', '')
        keywords = data.get('keywords', [])
        
        bias_analysis = ml_sentinel.detect_keyword_bias(cv_text, keywords)
        
        return bias_analysis
    except Exception as e:
        return {"error": str(e)}
@app.post("/api/extract-skills")
def extract_skills(data: dict):
    try:
        job_title = data.get('jobTitle', '')
        
        if not job_title:
            return {"error": "Job title is required"}
        
        if not ml_sentinel:
            return {"error": "ML Sentinel not initialized. Please set GEMINI_API_KEY"}
        
        # Use AI to extract required skills
        skills = ml_sentinel.extract_required_skills(job_title)
        
        return {
            "jobTitle": job_title,
            "skills": skills,
            "message": f"Extracted {len(skills)} skills for {job_title}"
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/job-criteria")
def save_job_criteria(data: dict):
    try:
        job_title = data.get('jobTitle')
        keywords = data.get('keywords', [])
        
        # If no keywords provided, use AI to extract them
        if not keywords and job_title and ml_sentinel:
            keywords = ml_sentinel.extract_required_skills(job_title)
        
        # Save to Firebase
        criteria_data = {
            'job_title': job_title,
            'keywords': keywords,
            'created_at': datetime.now(),
            'created_by': 'recruiter',
            'status': 'active'
        }
        
        FirebaseService.db.collection('job_criteria').add(criteria_data)
        return {
            "message": f"Job criteria saved for {job_title}",
            "keywords": keywords
        }
    except Exception as e:
        return {"error": str(e)}