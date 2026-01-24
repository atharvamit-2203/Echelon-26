import firebase_admin
from firebase_admin import credentials, firestore, storage
from datetime import datetime
import json

try:
    from cv_file_processor import CVFileProcessor
    CV_PROCESSOR_AVAILABLE = True
except ImportError:
    CV_PROCESSOR_AVAILABLE = False
    print("CV file processor not available - install PyPDF2 and python-docx")

# Initialize Firebase Admin SDK
cred = credentials.Certificate(r"D:\Echelon\backend\service-account-key.json")
firebase_admin.initialize_app(cred, {
    'storageBucket': 'echelon-99796.firebasestorage.app'
})

db = firestore.client()
bucket = storage.bucket()

class FirebaseService:
    db = db  # Class attribute for external access
    bucket = bucket  # Class attribute for external access
    
    @staticmethod
    def get_metrics():
        doc_ref = db.collection('metrics').document('dashboard')
        doc = doc_ref.get()
        return doc.to_dict() if doc.exists else None
    
    @staticmethod
    def get_alerts():
        alerts_ref = db.collection('alerts').where('active', '==', True)
        return [alert.to_dict() for alert in alerts_ref.stream()]
    
    @staticmethod
    def get_rescued_candidates():
        candidates_ref = db.collection('rescued_candidates').where('status', '==', 'rescued')
        return [candidate.to_dict() for candidate in candidates_ref.stream()]
    
    @staticmethod
    def get_analytics():
        doc_ref = db.collection('analytics').document('demographics')
        doc = doc_ref.get()
        return doc.to_dict() if doc.exists else None
    
    @staticmethod
    def add_cv(cv_data):
        return db.collection('cvs').add(cv_data)
    
    @staticmethod
    def get_cvs():
        cvs_ref = db.collection('cvs')
        return [cv.to_dict() for cv in cvs_ref.stream()]
    
    @staticmethod
    def get_cvs_from_files():
        """Get CVs from the sample_cvs folder"""
        if not CV_PROCESSOR_AVAILABLE:
            return []
        processor = CVFileProcessor()
        return processor.process_cvs_for_analysis()
    
    @staticmethod
    def get_cv_file_stats():
        """Get statistics about CV files in the folder"""
        if not CV_PROCESSOR_AVAILABLE:
            return {'total_files': 0, 'format_breakdown': {}, 'last_scanned': datetime.now().isoformat()}
        processor = CVFileProcessor()
        format_count = processor.get_cv_count_by_format()
        total_files = sum(format_count.values())
        return {
            'total_files': total_files,
            'format_breakdown': format_count,
            'last_scanned': datetime.now().isoformat()
        }
    
    @staticmethod
    def get_recruiting_managers():
        managers_ref = db.collection('recruiting_managers').where('active', '==', True)
        return [manager.to_dict() for manager in managers_ref.stream()]
    
    @staticmethod
    def get_companies():
        companies_ref = db.collection('companies').where('active', '==', True)
        return [company.to_dict() for company in companies_ref.stream()]
    
    @staticmethod
    def populate_sample_data():
        # Metrics
        db.collection('metrics').document('dashboard').set({
            'totalCandidates': {'value': 250, 'delta': '+12'},
            'atsRejections': {'value': 88, 'delta': '35%', 'trend': 'down'},
            'rescuedCandidates': {'value': 12, 'delta': '+5'},
            'activeBiasAlerts': {'value': 3, 'delta': '⚠️'},
            'lastUpdated': datetime.now()
        })
        
        # Companies
        companies = [
            {"name": "Tata Consultancy Services", "industry": "IT Services", "location": "Mumbai"},
            {"name": "Infosys", "industry": "IT Services", "location": "Bangalore"},
            {"name": "Wipro", "industry": "IT Services", "location": "Bangalore"},
            {"name": "HDFC Bank", "industry": "Banking", "location": "Mumbai"},
            {"name": "Reliance Industries", "industry": "Conglomerate", "location": "Mumbai"}
        ]
        
        for company in companies:
            company['addedAt'] = datetime.now()
            company['active'] = True
            db.collection('companies').add(company)
        
        # Recruiting Managers
        managers = [
            {"name": "Priya Sharma", "email": "priya.sharma@tcs.com", "company": "Tata Consultancy Services", "experience": 8},
            {"name": "Rajesh Kumar", "email": "rajesh.kumar@infosys.com", "company": "Infosys", "experience": 12},
            {"name": "Anita Patel", "email": "anita.patel@wipro.com", "company": "Wipro", "experience": 6},
            {"name": "Kavya Nair", "email": "kavya.nair@hdfcbank.com", "company": "HDFC Bank", "experience": 9},
            {"name": "Arjun Gupta", "email": "arjun.gupta@ril.com", "company": "Reliance Industries", "experience": 15}
        ]
        
        for manager in managers:
            manager['addedAt'] = datetime.now()
            manager['active'] = True
            manager['department'] = 'Human Resources'
            db.collection('recruiting_managers').add(manager)
        
        # Job Postings
        job_postings = [
            {
                "jobId": "TCS001", "title": "Senior Java Developer", "company": "Tata Consultancy Services",
                "location": "Mumbai", "required_skills": ["Java", "Spring Boot", "Microservices"],
                "experience_required": "3-8 years", "salary_range": "12-20 LPA",
                "posted_by": "priya.sharma@tcs.com", "posted_date": datetime.now(), "status": "active"
            },
            {
                "jobId": "INF001", "title": "Data Scientist", "company": "Infosys",
                "location": "Bangalore", "required_skills": ["Python", "Machine Learning", "SQL"],
                "experience_required": "2-6 years", "salary_range": "10-18 LPA",
                "posted_by": "rajesh.kumar@infosys.com", "posted_date": datetime.now(), "status": "active"
            }
        ]
        
        for job in job_postings:
            db.collection('job_postings').add(job)
        
        # Sample CVs with bias demonstration
        cvs = [
            # Experienced candidates who get rejected due to keyword bias
            {
                "candidateId": "CV001", "name": "Sarah Mitchell", "email": "sarah.mitchell@email.com",
                "phone": "+91-9876543210", "age": 47, "gender": "Female", "experience": 15,
                "skills": ["Performance Targets", "Strategic Revenue Pipelines", "Team Leadership", "Client Engagement"],
                "education": "MBA Marketing", "location": "Mumbai", "currentRole": "Senior Sales Director",
                "expectedSalary": "25 LPA", "status": "rejected", "assigned_to": "priya.sharma@tcs.com",
                "job_applied": "TCS001", "rejection_reason": "Skills mismatch - missing KPI keyword"
            },
            {
                "candidateId": "CV002", "name": "Rajesh Gupta", "email": "rajesh.gupta@email.com",
                "phone": "+91-9876543211", "age": 52, "gender": "Male", "experience": 20,
                "skills": ["Customer Success Management", "Revenue Growth", "Market Analysis", "Business Strategy"],
                "education": "B.Tech + MBA", "location": "Delhi", "currentRole": "VP Sales",
                "expectedSalary": "30 LPA", "status": "rejected", "assigned_to": "rajesh.kumar@infosys.com",
                "job_applied": "INF001", "rejection_reason": "Age filter - over 45"
            },
            # Younger candidates who get accepted despite lower qualifications
            {
                "candidateId": "CV003", "name": "Amit Sharma", "email": "amit.sharma@email.com",
                "phone": "+91-9876543212", "age": 28, "gender": "Male", "experience": 5,
                "skills": ["Java", "Spring Boot", "KPI", "MySQL"], "education": "B.Tech Computer Science",
                "location": "Bangalore", "currentRole": "Senior Software Engineer", "expectedSalary": "15 LPA",
                "status": "shortlisted", "assigned_to": "priya.sharma@tcs.com", "job_applied": "TCS001"
            },
            {
                "candidateId": "CV004", "name": "Priya Singh", "email": "priya.singh@email.com",
                "phone": "+91-9876543213", "age": 26, "gender": "Female", "experience": 3,
                "skills": ["Python", "CRM Strategy", "Data Analysis"], "education": "MCA",
                "location": "Pune", "currentRole": "Data Analyst", "expectedSalary": "12 LPA",
                "status": "under_review", "assigned_to": "rajesh.kumar@infosys.com", "job_applied": "INF001"
            },
            # More experienced candidates with semantic skill matches
            {
                "candidateId": "CV005", "name": "Dr. Meera Krishnan", "email": "meera.krishnan@email.com",
                "phone": "+91-9876543214", "age": 49, "gender": "Female", "experience": 18,
                "skills": ["Organizational Excellence", "Performance Metrics", "Strategic Planning", "Team Development"],
                "education": "PhD Management", "location": "Chennai", "currentRole": "Director Operations",
                "expectedSalary": "35 LPA", "status": "rejected", "assigned_to": "kavya.nair@hdfcbank.com",
                "job_applied": "HDFC001", "rejection_reason": "Keyword filtering - missing exact matches"
            }
        ]
        
        for cv in cvs:
            cv['uploadedAt'] = datetime.now()
            db.collection('cvs').add(cv)