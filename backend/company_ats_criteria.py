from datetime import datetime
from firebase_service import FirebaseService

class CompanyATSCriteria:
    
    COMPANY_CRITERIA = {
        "Tata Consultancy Services": {
            "required_keywords": ["Java", "Spring", "Microservices", "Agile", "REST API"],
            "preferred_keywords": ["AWS", "Docker", "Kubernetes", "CI/CD"],
            "min_experience": 3,
            "education_requirements": ["B.Tech", "B.E", "MCA", "M.Tech"],
            "location_preference": ["Mumbai", "Pune", "Bangalore", "Chennai"],
            "salary_range": {"min": 8, "max": 25},
            "bias_factors": {"age_preference": "under_40", "gender_bias": 0.1}
        },
        "Infosys": {
            "required_keywords": ["Python", "Machine Learning", "Data Science", "SQL", "Analytics"],
            "preferred_keywords": ["TensorFlow", "PyTorch", "Pandas", "Numpy"],
            "min_experience": 2,
            "education_requirements": ["B.Tech", "B.Sc", "M.Tech", "PhD"],
            "location_preference": ["Bangalore", "Mysore", "Hyderabad"],
            "salary_range": {"min": 6, "max": 22},
            "bias_factors": {"age_preference": "under_35", "gender_bias": 0.05}
        },
        "HDFC Bank": {
            "required_keywords": ["Banking", "Finance", "Risk Management", "Compliance", "KYC"],
            "preferred_keywords": ["Credit Analysis", "Investment", "Portfolio", "Regulatory"],
            "min_experience": 5,
            "education_requirements": ["MBA", "B.Com", "CA", "CFA"],
            "location_preference": ["Mumbai", "Delhi", "Bangalore"],
            "salary_range": {"min": 12, "max": 35},
            "bias_factors": {"age_preference": "25_to_45", "gender_bias": 0.15}
        },
        "Reliance Industries": {
            "required_keywords": ["Oil & Gas", "Petrochemicals", "Operations", "Safety", "Process"],
            "preferred_keywords": ["Refinery", "Chemical Engineering", "HSE", "Maintenance"],
            "min_experience": 4,
            "education_requirements": ["B.Tech", "B.E", "Chemical Engineering"],
            "location_preference": ["Mumbai", "Jamnagar", "Vadodara"],
            "salary_range": {"min": 10, "max": 30},
            "bias_factors": {"age_preference": "under_50", "gender_bias": 0.25}
        },
        "Wipro": {
            "required_keywords": ["Cloud Computing", "DevOps", "Azure", "Automation", "Testing"],
            "preferred_keywords": ["Selenium", "Jenkins", "Terraform", "Ansible"],
            "min_experience": 3,
            "education_requirements": ["B.Tech", "B.E", "MCA"],
            "location_preference": ["Bangalore", "Hyderabad", "Pune"],
            "salary_range": {"min": 7, "max": 20},
            "bias_factors": {"age_preference": "under_38", "gender_bias": 0.08}
        }
    }
    
    @staticmethod
    def get_company_criteria(company_name):
        return CompanyATSCriteria.COMPANY_CRITERIA.get(company_name, {})
    
    @staticmethod
    def evaluate_candidate_for_company(cv, company_name):
        criteria = CompanyATSCriteria.get_company_criteria(company_name)
        if not criteria:
            return {"score": 0.5, "reasons": ["Unknown company criteria"]}
        
        score = 0.0
        reasons = []
        
        # Check required keywords
        candidate_skills = [skill.lower() for skill in cv.get('skills', [])]
        required_matches = sum(1 for keyword in criteria['required_keywords'] 
                             if any(keyword.lower() in skill for skill in candidate_skills))
        
        if required_matches == 0:
            score -= 0.4
            reasons.append(f"Missing required keywords: {criteria['required_keywords']}")
        else:
            score += (required_matches / len(criteria['required_keywords'])) * 0.4
        
        # Check experience
        candidate_exp = cv.get('experience', 0)
        if candidate_exp < criteria['min_experience']:
            score -= 0.2
            reasons.append(f"Experience {candidate_exp} < required {criteria['min_experience']}")
        else:
            score += 0.2
        
        # Check education
        candidate_education = cv.get('education', '').upper()
        education_match = any(edu in candidate_education for edu in criteria['education_requirements'])
        if not education_match:
            score -= 0.1
            reasons.append(f"Education doesn't match: {criteria['education_requirements']}")
        else:
            score += 0.1
        
        # Apply bias factors
        age = cv.get('age', 30)
        gender = cv.get('gender', 'Male')
        
        # Age bias
        age_pref = criteria['bias_factors']['age_preference']
        if age_pref == "under_35" and age > 35:
            score -= 0.2
            reasons.append("Age bias: Preference for younger candidates")
        elif age_pref == "under_40" and age > 40:
            score -= 0.15
            reasons.append("Age bias: Preference for candidates under 40")
        elif age_pref == "25_to_45" and (age < 25 or age > 45):
            score -= 0.1
            reasons.append("Age bias: Preference for mid-career professionals")
        
        # Gender bias
        if gender == 'Female':
            score -= criteria['bias_factors']['gender_bias']
            if criteria['bias_factors']['gender_bias'] > 0.1:
                reasons.append("Gender bias detected in screening")
        
        # Preferred keywords bonus
        preferred_matches = sum(1 for keyword in criteria['preferred_keywords'] 
                              if any(keyword.lower() in skill for skill in candidate_skills))
        if preferred_matches > 0:
            score += (preferred_matches / len(criteria['preferred_keywords'])) * 0.2
        
        return {
            "score": max(0, min(1, score + 0.5)),  # Normalize to 0-1
            "reasons": reasons,
            "required_matches": required_matches,
            "preferred_matches": preferred_matches
        }
    
    @staticmethod
    def populate_job_postings():
        """Populate Firebase with realistic job postings"""
        job_postings = [
            {
                "jobId": "TCS001",
                "title": "Senior Java Developer",
                "company": "Tata Consultancy Services",
                "location": "Mumbai",
                "description": "Looking for experienced Java developer with Spring Boot expertise",
                "required_skills": ["Java", "Spring Boot", "Microservices", "REST API"],
                "preferred_skills": ["AWS", "Docker", "Kubernetes"],
                "experience_required": "3-8 years",
                "salary_range": "12-20 LPA",
                "posted_by": "priya.sharma@tcs.com",
                "posted_date": datetime.now(),
                "status": "active"
            },
            {
                "jobId": "INF001", 
                "title": "Data Scientist",
                "company": "Infosys",
                "location": "Bangalore",
                "description": "Seeking ML engineer for AI/ML projects",
                "required_skills": ["Python", "Machine Learning", "SQL", "Statistics"],
                "preferred_skills": ["TensorFlow", "PyTorch", "AWS"],
                "experience_required": "2-6 years",
                "salary_range": "10-18 LPA",
                "posted_by": "rajesh.kumar@infosys.com",
                "posted_date": datetime.now(),
                "status": "active"
            },
            {
                "jobId": "HDFC001",
                "title": "Risk Manager",
                "company": "HDFC Bank", 
                "location": "Mumbai",
                "description": "Risk management professional for banking operations",
                "required_skills": ["Risk Management", "Banking", "Compliance", "Finance"],
                "preferred_skills": ["Credit Analysis", "Regulatory Knowledge"],
                "experience_required": "5-12 years",
                "salary_range": "18-30 LPA",
                "posted_by": "kavya.nair@hdfcbank.com",
                "posted_date": datetime.now(),
                "status": "active"
            },
            {
                "jobId": "RIL001",
                "title": "Process Engineer",
                "company": "Reliance Industries",
                "location": "Jamnagar",
                "description": "Chemical process engineer for refinery operations",
                "required_skills": ["Chemical Engineering", "Process Design", "Safety", "Operations"],
                "preferred_skills": ["Refinery Experience", "HSE", "Maintenance"],
                "experience_required": "4-10 years", 
                "salary_range": "15-25 LPA",
                "posted_by": "arjun.gupta@ril.com",
                "posted_date": datetime.now(),
                "status": "active"
            },
            {
                "jobId": "WIP001",
                "title": "DevOps Engineer",
                "company": "Wipro",
                "location": "Bangalore",
                "description": "DevOps engineer for cloud automation projects",
                "required_skills": ["DevOps", "Cloud Computing", "Azure", "Automation"],
                "preferred_skills": ["Terraform", "Jenkins", "Docker"],
                "experience_required": "3-7 years",
                "salary_range": "12-22 LPA", 
                "posted_by": "anita.patel@wipro.com",
                "posted_date": datetime.now(),
                "status": "active"
            }
        ]
        
        for job in job_postings:
            FirebaseService.db.collection('job_postings').add(job)
        
        return len(job_postings)