"""
Script to convert text CVs to PDF format
Install required package: pip install reportlab
"""

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import os

# CV data dictionary
cvs_data = {
    "Robert_Chen_CTO": """Name: Robert Chen
Age: 52 | Gender: Male
Email: robert.chen@email.com | Phone: +1-555-0187
Location: San Francisco, CA

PROFESSIONAL SUMMARY
Visionary Chief Technology Officer with 25+ years of experience leading digital transformation initiatives at Fortune 500 companies. Expert in enterprise architecture, cloud migration, and building high-performing engineering teams of 200+ members.

WORK EXPERIENCE

Chief Technology Officer | TechCorp Global | 2018 - Present
• Led digital transformation saving $50M annually
• Architected cloud migration for 200+ applications
• Built and managed engineering teams across 5 global offices
• Implemented AI/ML solutions increasing efficiency by 40%

VP of Engineering | DataSystems Inc | 2012 - 2018
• Scaled engineering from 30 to 150 engineers
• Led architecture redesign improving system performance by 300%
• Championed DevOps culture reducing deployment time by 80%

Senior Engineering Manager | CloudTech Solutions | 2005 - 2012
• Managed 5 engineering teams (50 engineers total)
• Delivered enterprise SaaS platform serving 10M users
• Established CI/CD pipelines and automated testing

SKILLS
Cloud Architecture, AWS, Azure, Kubernetes, Microservices, System Design, Leadership, Strategy, Agile, DevOps, Python, Java, C++, Machine Learning, Data Architecture, Security, Scalability

EDUCATION
MS Computer Science - Stanford University
BS Computer Engineering - MIT

CERTIFICATIONS
AWS Solutions Architect Professional | CKA: Certified Kubernetes Administrator | PMP: Project Management Professional""",

    "Aisha_Williams_Career_Switcher": """Name: Aisha Williams
Age: 38 | Gender: Female
Email: aisha.williams@email.com | Phone: +1-555-0198
Location: Atlanta, GA

PROFESSIONAL SUMMARY
Career-switcher bringing 10 years of project management experience from healthcare into tech. Recently completed full-stack development bootcamp with top honors. Passionate about building accessible, user-centered applications.

WORK EXPERIENCE

Junior Full Stack Developer | HealthTech Startup | 2024 - Present (6 months)
• Developed patient portal using React and Node.js
• Implemented responsive designs with 98% accessibility score
• Collaborated with UX team on user research and testing
• Built RESTful APIs serving 5000+ healthcare providers

Project Manager | Metropolitan Hospital | 2014 - 2023
• Led $15M EHR system implementation across 8 departments
• Managed cross-functional teams of 25+ members
• Reduced patient wait times by 35% through process optimization
• Coordinated with IT vendors and healthcare staff

EDUCATION
Full Stack Web Development Certificate - General Assembly (2023)
MBA Healthcare Administration - Emory University
BS Nursing - Howard University

TECHNICAL SKILLS
JavaScript, React, Node.js, Express, MongoDB, PostgreSQL, HTML, CSS, Git, REST APIs, Agile Methodologies, User Research, Project Planning

SOFT SKILLS
Stakeholder Management, Process Improvement, Team Leadership, Communication, Problem Solving, Adaptability""",

    "Maya_Patel_New_Grad": """Name: Maya Patel
Age: 23 | Gender: Female
Email: maya.patel@email.com | Phone: +1-555-0209
Location: Austin, TX

PROFESSIONAL SUMMARY
Recent computer science graduate with 3 internships at top tech companies. Strong foundation in algorithms, system design, and modern web technologies. Passionate about building scalable applications and contributing to open source.

WORK EXPERIENCE

Software Engineering Intern | Meta | Summer 2024
• Built recommendation engine features used by 50M+ users
• Optimized GraphQL queries reducing latency by 45%
• Collaborated with senior engineers on React component library

Software Engineering Intern | Stripe | Summer 2023
• Developed payment processing microservices in Ruby
• Implemented fraud detection algorithms with 92% accuracy
• Wrote comprehensive unit and integration tests

Software Engineering Intern | Amazon | Summer 2022
• Built internal tools using React and AWS Lambda
• Automated deployment pipelines saving 20 hours weekly
• Participated in on-call rotation and incident response

EDUCATION
BS Computer Science - University of Texas at Austin (2024)
GPA: 3.9/4.0 | Dean's List all semesters

PROJECTS
• Open source contributor to React ecosystem (500+ GitHub stars)
• Built social media analytics dashboard (10K+ users)
• Hackathon winner - Best AI Application (2023)

TECHNICAL SKILLS
Python, Java, JavaScript, TypeScript, React, Node.js, GraphQL, SQL, NoSQL, AWS, Docker, Kubernetes, Git, Algorithms, Data Structures, System Design, Machine Learning

AWARDS
Grace Hopper Scholarship Recipient | Google CSSI Scholar | Hackathon Winner x3""",

    "Thomas_Rodriguez_Employment_Gap": """Name: Thomas Rodriguez
Age: 45 | Gender: Male
Email: thomas.rodriguez@email.com | Phone: +1-555-0221
Location: Denver, CO

PROFESSIONAL SUMMARY
Senior software architect with 15 years of experience building enterprise applications. Took career break to care for family (2020-2023). Recently upskilled in cloud technologies and modern frameworks. Ready to contribute expertise to innovative teams.

WORK EXPERIENCE

Freelance Software Consultant | Self-Employed | 2023 - Present
• Built e-commerce platforms for 5 small businesses
• Migrated legacy applications to cloud infrastructure
• Mentored junior developers through online bootcamp

Career Break - Family Caregiving | 2020 - 2023
• Maintained skills through online courses and certifications
• Completed AWS Solutions Architect certification
• Contributed to open source projects on GitHub

Senior Software Architect | Enterprise Solutions Corp | 2013 - 2020
• Designed microservices architecture serving 2M users
• Led team of 12 developers on core platform rebuild
• Reduced system downtime from 2% to 0.1%
• Implemented CI/CD pipelines and automated testing

Software Engineer | FinTech Innovations | 2008 - 2013
• Developed banking applications handling $500M daily transactions
• Built real-time fraud detection system
• Optimized database queries improving performance by 200%

EDUCATION
MS Software Engineering - University of Colorado
BS Computer Science - Arizona State University

RECENT CERTIFICATIONS (2021-2024)
AWS Solutions Architect Associate | Google Cloud Professional Architect | Kubernetes Application Developer

TECHNICAL SKILLS
Java, Python, JavaScript, React, Spring Boot, Microservices, AWS, Docker, Kubernetes, PostgreSQL, MongoDB, Redis, Kafka, System Design, Architecture Patterns, API Design""",

    "Yuki_Tanaka_International": """Name: Dr. Yuki Tanaka
Age: 32 | Gender: Female
Email: yuki.tanaka@email.com | Phone: +1-555-0234
Location: Seattle, WA | Visa Status: H1B (Valid through 2027)

PROFESSIONAL SUMMARY
Data scientist with 8 years of experience applying machine learning to business problems. Expertise in NLP, computer vision, and predictive modeling. Strong track record of deploying ML models that drive revenue growth and operational efficiency.

WORK EXPERIENCE

Senior Data Scientist | Microsoft | 2021 - Present
• Built NLP models for Azure Cognitive Services used by 10K+ customers
• Developed recommendation system increasing engagement by 28%
• Led team of 4 data scientists on ML platform initiative
• Published 3 papers at top ML conferences

Data Scientist | Amazon | 2018 - 2021
• Created demand forecasting models saving $20M in inventory costs
• Built computer vision system for automated quality inspection
• Deployed models on AWS SageMaker serving 1M+ predictions daily

Machine Learning Engineer | Rakuten (Tokyo, Japan) | 2016 - 2018
• Developed recommendation algorithms for e-commerce platform
• Improved click-through rate by 35% using deep learning
• Collaborated with engineers on ML infrastructure

EDUCATION
PhD Computer Science (Machine Learning) - Carnegie Mellon University (2016)
MS Computer Science - University of Tokyo
BS Applied Mathematics - Kyoto University

PUBLICATIONS
• "Transformer Models for E-commerce Recommendations" - NeurIPS 2023
• "Efficient Training of Large Language Models" - ICML 2022
• "Cross-lingual NLP for Global Platforms" - ACL 2021

TECHNICAL SKILLS
Python, R, TensorFlow, PyTorch, Scikit-learn, Pandas, NumPy, SQL, Spark, AWS, Azure, Machine Learning, Deep Learning, NLP, Computer Vision, MLOps, Statistics, A/B Testing"""
}

def create_pdf(filename, content):
    """Create a PDF from text content"""
    pdf_path = f"{filename}.pdf"
    doc = SimpleDocTemplate(pdf_path, pagesize=letter,
                            rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=18)
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Justify', alignment=4))
    
    # Add content
    for line in content.split('\n'):
        if line.strip():
            elements.append(Paragraph(line, styles['Normal']))
            elements.append(Spacer(1, 0.1*inch))
    
    # Build PDF
    doc.build(elements)
    print(f"Created: {pdf_path}")

if __name__ == "__main__":
    print("Generating PDF CVs...")
    for filename, content in cvs_data.items():
        create_pdf(filename, content)
    print(f"\nGenerated {len(cvs_data)} PDF CVs successfully!")
    print("\nTo generate these PDFs, run:")
    print("1. pip install reportlab")
    print("2. python generate_pdf_cvs.py")
