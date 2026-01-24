import firebase_admin
from firebase_admin import credentials, firestore, storage
from datetime import datetime
import json

# Initialize Firebase Admin SDK
cred = credentials.Certificate(r"D:\Echelon\backend\service-account-key.json")
firebase_admin.initialize_app(cred, {
    'storageBucket': 'echelon-99796.firebasestorage.app'
})

db = firestore.client()
bucket = storage.bucket()

class FirebaseService:
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
        
        # Alerts
        alerts = [
            {
                'type': 'warning',
                'title': '🟡 Bias Detected in Keyword Filters',
                'description': '3 keyword(s) show rejection rate disparities exceeding 25% threshold.',
                'affected': 'Candidates over 45 years old',
                'recommendation': 'Review "KPI" and "OKR" filters to include semantic equivalents',
                'timestamp': datetime.now(),
                'active': True
            },
            {
                'type': 'info',
                'title': '🦸 Talent Rescue Opportunity',
                'description': '12 high-potential candidates auto-rejected but have >85% semantic match.',
                'affected': 'Primarily experienced professionals (45+) and female candidates',
                'timestamp': datetime.now(),
                'active': True
            }
        ]
        
        for alert in alerts:
            db.collection('alerts').add(alert)
        
        # Rescued candidates
        candidates = [
            {'id': 1023, 'ageGroup': '>45', 'gender': 'Female', 'keywords': 'CRM Strategy', 'score': 92, 'status': 'rescued'},
            {'id': 1847, 'ageGroup': '>45', 'gender': 'Male', 'keywords': 'KPI', 'score': 89, 'status': 'rescued'},
            {'id': 2156, 'ageGroup': '30-45', 'gender': 'Female', 'keywords': 'Client Engagement', 'score': 87, 'status': 'rescued'}
        ]
        
        for candidate in candidates:
            candidate['rescuedAt'] = datetime.now()
            db.collection('rescued_candidates').add(candidate)
        
        # Analytics
        db.collection('analytics').document('demographics').set({
            'ageStats': {'Under 30': 22, '30-45': 30, 'Over 45': 52},
            'genderStats': {'Male': 28, 'Female': 42, 'Non-binary': 38},
            'lastUpdated': datetime.now()
        })
        
        # Indian Companies
        companies = [
            {"name": "Tata Consultancy Services", "industry": "IT Services", "location": "Mumbai"},
            {"name": "Infosys", "industry": "IT Services", "location": "Bangalore"},
            {"name": "Wipro", "industry": "IT Services", "location": "Bangalore"},
            {"name": "HCL Technologies", "industry": "IT Services", "location": "Noida"},
            {"name": "Tech Mahindra", "industry": "IT Services", "location": "Pune"},
            {"name": "Reliance Industries", "industry": "Conglomerate", "location": "Mumbai"},
            {"name": "HDFC Bank", "industry": "Banking", "location": "Mumbai"},
            {"name": "Bharti Airtel", "industry": "Telecommunications", "location": "New Delhi"},
            {"name": "Mahindra Group", "industry": "Automotive", "location": "Mumbai"},
            {"name": "Bajaj Finserv", "industry": "Financial Services", "location": "Pune"}
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
            {"name": "Vikram Singh", "email": "vikram.singh@hcl.com", "company": "HCL Technologies", "experience": 10},
            {"name": "Meera Reddy", "email": "meera.reddy@techmahindra.com", "company": "Tech Mahindra", "experience": 7},
            {"name": "Arjun Gupta", "email": "arjun.gupta@ril.com", "company": "Reliance Industries", "experience": 15},
            {"name": "Kavya Nair", "email": "kavya.nair@hdfcbank.com", "company": "HDFC Bank", "experience": 9},
            {"name": "Rohit Agarwal", "email": "rohit.agarwal@airtel.com", "company": "Bharti Airtel", "experience": 11},
            {"name": "Deepika Joshi", "email": "deepika.joshi@mahindra.com", "company": "Mahindra Group", "experience": 5},
            {"name": "Sanjay Verma", "email": "sanjay.verma@bajajfinserv.in", "company": "Bajaj Finserv", "experience": 13}
        ]
        
        for manager in managers:
            manager['addedAt'] = datetime.now()
            manager['active'] = True
            manager['department'] = 'Human Resources'
            db.collection('recruiting_managers').add(manager)
        
        # Sample CVs
        cvs = [
            {
                "candidateId": "CV001", "name": "Amit Sharma", "email": "amit.sharma@email.com",
                "phone": "+91-9876543210", "age": 28, "gender": "Male", "experience": 5,
                "skills": ["Java", "Spring Boot", "MySQL", "AWS"], "education": "B.Tech Computer Science",
                "location": "Bangalore", "currentRole": "Senior Software Engineer", "expectedSalary": "15 LPA",
                "status": "under_review"
            },
            {
                "candidateId": "CV002", "name": "Sneha Patel", "email": "sneha.patel@email.com",
                "phone": "+91-9876543211", "age": 32, "gender": "Female", "experience": 8,
                "skills": ["Python", "Django", "PostgreSQL", "Docker"], "education": "M.Tech Software Engineering",
                "location": "Pune", "currentRole": "Tech Lead", "expectedSalary": "22 LPA",
                "status": "shortlisted"
            },
            {
                "candidateId": "CV003", "name": "Rajesh Kumar", "email": "rajesh.kumar@email.com",
                "phone": "+91-9876543212", "age": 45, "gender": "Male", "experience": 18,
                "skills": ["Project Management", "Agile", "Scrum", "Leadership"], "education": "MBA + B.E Electronics",
                "location": "Mumbai", "currentRole": "Project Manager", "expectedSalary": "35 LPA",
                "status": "rejected"
            },
            {
                "candidateId": "CV004", "name": "Priya Singh", "email": "priya.singh@email.com",
                "phone": "+91-9876543213", "age": 26, "gender": "Female", "experience": 3,
                "skills": ["React", "Node.js", "MongoDB", "JavaScript"], "education": "B.Tech Information Technology",
                "location": "Delhi", "currentRole": "Frontend Developer", "expectedSalary": "12 LPA",
                "status": "rescued"
            },
            {
                "candidateId": "CV005", "name": "Arjun Reddy", "email": "arjun.reddy@email.com",
                "phone": "+91-9876543214", "age": 48, "gender": "Male", "experience": 22,
                "skills": ["Data Science", "Machine Learning", "Python", "R"], "education": "PhD Computer Science",
                "location": "Hyderabad", "currentRole": "Senior Data Scientist", "expectedSalary": "40 LPA",
                "status": "rescued"
            }
        ]
        
        for cv in cvs:
            cv['uploadedAt'] = datetime.now()
            db.collection('cvs').add(cv)