"""
CV Generator - Generate varied, realistic CVs for testing
"""
import random
from typing import List, Dict
from datetime import datetime, timedelta


class CVGenerator:
    """Generate realistic, varied CVs for testing"""
    
    FIRST_NAMES = [
        "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
        "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
        "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
        "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
        "Raj", "Priya", "Wei", "Mei", "Ahmed", "Fatima", "Carlos", "Maria",
        "Yuki", "Sakura", "Ivan", "Olga", "Pierre", "Sophie", "Hans", "Emma"
    ]
    
    LAST_NAMES = [
        "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
        "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
        "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White",
        "Kumar", "Singh", "Patel", "Chen", "Wang", "Li", "Kim", "Park",
        "Mohammed", "Ali", "Hassan", "Gonzalez", "Fernandez", "Yamamoto", "Tanaka",
        "Petrov", "Ivanov", "Dubois", "Bernard", "Schmidt", "Müller", "O'Brien"
    ]
    
    SKILLS_BY_DOMAIN = {
        "software": [
            "Python", "JavaScript", "TypeScript", "React", "Node.js", "Java", "C++",
            "Go", "Rust", "SQL", "MongoDB", "PostgreSQL", "Docker", "Kubernetes",
            "AWS", "Azure", "GCP", "Git", "CI/CD", "Agile", "Scrum", "TDD",
            "REST API", "GraphQL", "Microservices", "Redis", "Elasticsearch"
        ],
        "data": [
            "Python", "R", "SQL", "Machine Learning", "Deep Learning", "TensorFlow",
            "PyTorch", "Pandas", "NumPy", "Scikit-learn", "Data Visualization",
            "Tableau", "Power BI", "Statistics", "A/B Testing", "Big Data", "Spark",
            "Hadoop", "ETL", "Data Warehousing", "Feature Engineering"
        ],
        "design": [
            "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator", "InDesign",
            "UI/UX Design", "Wireframing", "Prototyping", "User Research",
            "Design Systems", "Accessibility", "Responsive Design", "Animation",
            "Branding", "Typography", "Color Theory"
        ],
        "marketing": [
            "SEO", "SEM", "Google Analytics", "Content Marketing", "Social Media",
            "Email Marketing", "Marketing Automation", "CRM", "A/B Testing",
            "Copywriting", "Brand Strategy", "Market Research", "PPC", "Facebook Ads",
            "Google Ads", "Conversion Optimization", "Growth Hacking"
        ],
        "management": [
            "Project Management", "Agile", "Scrum", "Kanban", "Leadership",
            "Team Building", "Strategic Planning", "Budgeting", "Risk Management",
            "Stakeholder Management", "Communication", "Negotiation", "JIRA",
            "Confluence", "MS Project", "Resource Planning"
        ]
    }
    
    ROLES_BY_DOMAIN = {
        "software": [
            "Software Engineer", "Senior Software Engineer", "Full Stack Developer",
            "Frontend Developer", "Backend Developer", "DevOps Engineer",
            "Cloud Architect", "Tech Lead", "Engineering Manager"
        ],
        "data": [
            "Data Scientist", "Data Analyst", "Machine Learning Engineer",
            "Data Engineer", "Business Intelligence Analyst", "Research Scientist",
            "AI Engineer", "Analytics Manager"
        ],
        "design": [
            "UI/UX Designer", "Product Designer", "Graphic Designer",
            "Visual Designer", "Design Lead", "Creative Director",
            "Interaction Designer", "Design Manager"
        ],
        "marketing": [
            "Marketing Manager", "Digital Marketing Specialist", "Content Strategist",
            "SEO Specialist", "Growth Manager", "Brand Manager",
            "Marketing Director", "Social Media Manager"
        ],
        "management": [
            "Project Manager", "Program Manager", "Product Manager",
            "Scrum Master", "Delivery Manager", "Operations Manager",
            "Director of Engineering", "VP of Product"
        ]
    }
    
    EDUCATION_LEVELS = [
        "High School Diploma",
        "Associate Degree in Computer Science",
        "Bachelor's in Computer Science",
        "Bachelor's in Information Technology",
        "Bachelor's in Engineering",
        "Bachelor's in Business Administration",
        "Master's in Computer Science",
        "Master's in Data Science",
        "Master's in Business Administration (MBA)",
        "PhD in Computer Science",
        "PhD in Artificial Intelligence"
    ]
    
    LOCATIONS = [
        "New York, NY", "San Francisco, CA", "Seattle, WA", "Austin, TX",
        "Boston, MA", "Chicago, IL", "Los Angeles, CA", "Denver, CO",
        "Atlanta, GA", "Miami, FL", "Portland, OR", "Remote",
        "London, UK", "Berlin, Germany", "Paris, France", "Toronto, Canada",
        "Bangalore, India", "Singapore", "Tokyo, Japan", "Sydney, Australia"
    ]
    
    @classmethod
    def generate_cv(cls, domain: str = None) -> Dict:
        """Generate a single realistic CV"""
        if domain is None:
            domain = random.choice(list(cls.SKILLS_BY_DOMAIN.keys()))
        
        # Generate basic info
        first_name = random.choice(cls.FIRST_NAMES)
        last_name = random.choice(cls.LAST_NAMES)
        name = f"{first_name} {last_name}"
        
        # Generate email
        email_providers = ["gmail.com", "yahoo.com", "outlook.com", "protonmail.com"]
        email = f"{first_name.lower()}.{last_name.lower()}@{random.choice(email_providers)}"
        
        # Generate phone
        phone = f"+1-{random.randint(200, 999)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}"
        
        # Generate age and experience
        age = random.randint(22, 55)
        experience = min(age - 22, random.randint(0, 30))
        
        # Gender distribution
        gender = random.choice(["Male", "Female", "Non-binary", "Male", "Female"])  # Weighted
        
        # Skills - varied count and selection
        all_skills = cls.SKILLS_BY_DOMAIN[domain]
        num_skills = random.randint(5, min(15, len(all_skills)))
        skills = random.sample(all_skills, num_skills)
        
        # Add some cross-domain skills occasionally
        if random.random() > 0.7:
            other_domain = random.choice([d for d in cls.SKILLS_BY_DOMAIN.keys() if d != domain])
            cross_skills = random.sample(cls.SKILLS_BY_DOMAIN[other_domain], random.randint(1, 3))
            skills.extend(cross_skills)
        
        # Education
        education = random.choice(cls.EDUCATION_LEVELS)
        
        # Current role
        current_role = random.choice(cls.ROLES_BY_DOMAIN[domain])
        
        # Salary expectation
        base_salary = 50000 + (experience * 5000) + random.randint(-10000, 20000)
        salary_range = f"${base_salary:,} - ${base_salary + 20000:,}"
        
        # Location
        location = random.choice(cls.LOCATIONS)
        
        return {
            "name": name,
            "email": email,
            "phone": phone,
            "age": age,
            "gender": gender,
            "experience": experience,
            "skills": skills,
            "education": education,
            "location": location,
            "currentRole": current_role,
            "expectedSalary": salary_range,
            "domain": domain
        }
    
    @classmethod
    def generate_batch(cls, count: int = 50, domains: List[str] = None) -> List[Dict]:
        """Generate a batch of varied CVs"""
        if domains is None:
            domains = list(cls.SKILLS_BY_DOMAIN.keys())
        
        cvs = []
        for _ in range(count):
            domain = random.choice(domains)
            cv = cls.generate_cv(domain)
            cvs.append(cv)
        
        return cvs
    
    @classmethod
    def generate_for_job(cls, job_description: str, count: int = 30) -> List[Dict]:
        """Generate CVs tailored to a job description"""
        # Simple keyword matching to determine domain
        job_lower = job_description.lower()
        
        domain_scores = {}
        for domain, skills in cls.SKILLS_BY_DOMAIN.items():
            score = sum(1 for skill in skills if skill.lower() in job_lower)
            domain_scores[domain] = score
        
        # Get primary domain
        primary_domain = max(domain_scores, key=domain_scores.get)
        
        cvs = []
        for i in range(count):
            # 70% match primary domain, 30% other domains
            if i < count * 0.7:
                domain = primary_domain
            else:
                domain = random.choice([d for d in cls.SKILLS_BY_DOMAIN.keys() if d != primary_domain])
            
            cv = cls.generate_cv(domain)
            cvs.append(cv)
        
        return cvs
