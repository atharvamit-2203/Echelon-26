# Dynamic CV Upload & Recruiter Criteria

## 🎯 Overview

This feature allows recruiters to dynamically upload CVs and define custom evaluation criteria including keywords and sample CVs for comparison.

---

## 📋 Features

### 1. Dynamic CV Upload

#### File Upload Support
- **Supported Formats**: PDF, DOCX, DOC, TXT
- **Max File Size**: 10MB
- **Auto-parsing**: Automatic text extraction and skill detection

#### Upload Endpoints
```
POST /api/v1/upload/cv
POST /api/v1/upload/sample-cv
POST /api/v1/upload/parse
```

#### Features
- ✅ File validation (type and size)
- ✅ Text extraction from PDF/DOCX
- ✅ Automatic skill detection
- ✅ Email and phone extraction
- ✅ Notification to candidates
- ✅ Job-specific application

---

### 2. Job Posting Management

#### Create Job with Criteria
```
POST /api/v1/jobs/
```

**Criteria Fields:**
- `keywords`: List of keywords for ATS scoring
- `required_skills`: Must-have skills
- `preferred_skills`: Nice-to-have skills
- `min_experience`: Minimum years of experience
- `max_experience`: Maximum years of experience
- `education_requirements`: Education criteria
- `sample_cv_id`: Reference CV for comparison

#### Manage Keywords
```
POST /api/v1/jobs/{job_id}/keywords
```

Add or update evaluation keywords dynamically.

#### Set Sample CV
```
POST /api/v1/jobs/{job_id}/sample-cv
```

Upload an ideal CV that other candidates will be compared against.

---

### 3. Enhanced Analysis

#### Job-Specific Analysis
The enhanced analysis service evaluates CVs against specific job criteria:

- **Criteria Scoring**: Match against required/preferred skills
- **Sample Comparison**: Semantic similarity with sample CV
- **Requirement Checking**: Verify minimum requirements
- **Combined Scoring**: Weighted score from multiple factors

#### Analysis Endpoint
```
POST /api/v1/analysis/analyze-for-job
{
  "candidate_id": "CV123",
  "job_id": "JOB456"
}
```

**Returns:**
```json
{
  "atsScore": 75.5,
  "semanticScore": 0.82,
  "criteria_score": {
    "required_skills_match": 0.9,
    "preferred_skills_match": 0.7,
    "experience_match": 1.0,
    "overall": 0.87
  },
  "sample_similarity": 0.78,
  "meets_requirements": {
    "experience": true,
    "required_skills": true,
    "meets_minimum": true
  },
  "recommendation": "immediate_interview"
}
```

---

## 🎨 Frontend Components

### CVUploadForm
**File**: `frontend/components/CVUploadForm.tsx`

Features:
- File upload with drag & drop
- Form fields for candidate info
- Real-time validation
- Upload progress indicator
- Success/error notifications

### JobCreationForm
**File**: `frontend/components/JobCreationForm.tsx`

Features:
- Job details input
- Dynamic keyword management
- Required/preferred skills tags
- Experience range selection
- Sample CV upload option

---

## 🔧 Usage Examples

### 1. Upload CV

**Frontend:**
```typescript
const formData = new FormData();
formData.append('file', cvFile);
formData.append('name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('phone', '+1234567890');
formData.append('age', '30');
formData.append('gender', 'Male');
formData.append('experience', '5');
formData.append('education', 'Bachelor in CS');
formData.append('location', 'New York');
formData.append('currentRole', 'Software Engineer');
formData.append('expectedSalary', '$100k-$120k');
formData.append('jobId', 'JOB123');

const response = await fetch('/api/v1/upload/cv', {
  method: 'POST',
  body: formData
});
```

**Backend Processing:**
1. Validate file type and size
2. Extract text from PDF/DOCX
3. Parse email, phone, skills
4. Create CV record
5. Send confirmation email
6. Return CV ID and extracted data

### 2. Create Job with Criteria

```typescript
const jobData = {
  title: "Senior React Developer",
  description: "Looking for an experienced React developer...",
  department: "Engineering",
  location: "Remote",
  job_type: "full-time",
  criteria: {
    keywords: ["react", "typescript", "redux", "next.js"],
    required_skills: ["React", "JavaScript", "TypeScript"],
    preferred_skills: ["Next.js", "Redux", "GraphQL"],
    min_experience: 3,
    max_experience: 8,
    education_requirements: ["Bachelor's in Computer Science"],
    sample_cv_id: null
  }
};

const response = await fetch('/api/v1/jobs/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(jobData)
});
```

### 3. Add Keywords to Existing Job

```typescript
const response = await fetch('/api/v1/jobs/JOB123/keywords', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    keywords: ["node.js", "mongodb", "aws"]
  })
});
```

### 4. Upload Sample CV

```typescript
const formData = new FormData();
formData.append('file', sampleCVFile);
formData.append('job_id', 'JOB123');

const response = await fetch('/api/v1/upload/sample-cv', {
  method: 'POST',
  body: formData
});
```

### 5. Analyze CV Against Job

```python
from app.services.enhanced_analysis_service import EnhancedAnalysisService

service = EnhancedAnalysisService()
result = await service.analyze_cv_for_job(
    candidate_id="CV123",
    job_id="JOB456"
)

print(f"ATS Score: {result['atsScore']}")
print(f"Criteria Match: {result['criteria_score']['overall']}")
print(f"Sample Similarity: {result['sample_similarity']}")
print(f"Meets Requirements: {result['meets_requirements']['meets_minimum']}")
```

---

## 📊 Scoring Logic

### 1. ATS Score (Keyword Matching)
- Extract keywords from job criteria
- Match against CV text
- Calculate percentage match
- **Weight**: 30%

### 2. Semantic Score (ML-based)
- Use Sentence-BERT embeddings
- Calculate cosine similarity
- Compare CV with job description
- **Weight**: 30%

### 3. Criteria Score
- Required skills match (must be 70%+)
- Preferred skills match
- Experience requirement
- **Weight**: 25%

### 4. Sample Similarity (if provided)
- Compare with ideal CV
- Semantic similarity score
- **Weight**: 15%

### Final Score Calculation
```python
final_score = (
    ats_score * 0.30 +
    semantic_score * 0.30 +
    criteria_score * 0.25 +
    sample_similarity * 0.15
)
```

---

## 🔐 Security

### File Upload Security
- File type validation
- Size limits (10MB)
- Virus scanning (TODO)
- Secure file storage
- Access control

### Data Privacy
- GDPR compliance
- Data encryption
- Secure deletion
- Audit logging

---

## 🚀 Deployment

### Environment Variables
```bash
# File Upload
MAX_UPLOAD_SIZE=10485760  # 10MB
UPLOAD_DIR=uploads/cvs
ALLOWED_EXTENSIONS=.pdf,.docx,.doc,.txt

# Storage (optional)
AWS_S3_BUCKET=fairhire-cvs
CLOUD_STORAGE_ENABLED=false
```

### Dependencies
```bash
# Backend
pip install PyPDF2 python-docx

# Frontend
npm install @tanstack/react-query axios
```

---

## 📈 Future Enhancements

1. **Advanced Parsing**
   - NER for better data extraction
   - Multi-language support
   - Resume format detection

2. **Sample CV Improvements**
   - Multiple sample CVs per job
   - Weighted sample comparison
   - Sample CV library

3. **Criteria Templates**
   - Pre-defined criteria sets
   - Industry-specific templates
   - Criteria sharing

4. **Bulk Operations**
   - Batch CV upload
   - Bulk analysis
   - CSV import/export

---

## ✅ Testing

### Upload Test
```bash
curl -X POST http://localhost:8000/api/v1/upload/cv \
  -F "file=@resume.pdf" \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "phone=+1234567890" \
  -F "age=30" \
  -F "gender=Male" \
  -F "experience=5" \
  -F "education=Bachelor" \
  -F "location=NYC" \
  -F "currentRole=Engineer" \
  -F "expectedSalary=100k"
```

### Job Creation Test
```bash
curl -X POST http://localhost:8000/api/v1/jobs/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Engineer",
    "description": "Looking for a developer",
    "department": "Engineering",
    "location": "Remote",
    "job_type": "full-time",
    "criteria": {
      "keywords": ["python", "react"],
      "required_skills": ["Python"],
      "preferred_skills": ["React"],
      "min_experience": 2
    }
  }'
```

---

**Dynamic CV upload and recruiter-defined criteria are now fully functional!** 🎉
