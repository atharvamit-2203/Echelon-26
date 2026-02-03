"""
CV Upload API endpoints
"""
from fastapi import APIRouter, UploadFile, File, Form, Depends, status
from typing import Optional
from app.services.file_service import FileUploadService
from app.services.cv_service import CVService
from app.services.notification_service import NotificationService
from app.models.cv import CVCreate

router = APIRouter(prefix="/upload", tags=["Upload"])


def get_file_service() -> FileUploadService:
    return FileUploadService()


def get_cv_service() -> CVService:
    return CVService()


def get_notification_service() -> NotificationService:
    return NotificationService()


@router.post(
    "/cv",
    status_code=status.HTTP_201_CREATED,
    summary="Upload a CV file"
)
async def upload_cv_file(
    file: UploadFile = File(..., description="CV file (PDF, DOCX, or TXT)"),
    job_id: Optional[str] = Form(None, description="Job ID to apply for"),
    name: str = Form(..., description="Candidate name"),
    email: str = Form(..., description="Candidate email"),
    phone: str = Form(..., description="Phone number"),
    age: int = Form(..., description="Age"),
    gender: str = Form(..., description="Gender"),
    experience: int = Form(..., description="Years of experience"),
    education: str = Form(..., description="Education"),
    location: str = Form(..., description="Location"),
    current_role: str = Form(..., description="Current role"),
    expected_salary: str = Form(..., description="Expected salary"),
    file_service: FileUploadService = Depends(get_file_service),
    cv_service: CVService = Depends(get_cv_service),
    notification_service: NotificationService = Depends(get_notification_service)
):
    """
    Upload a CV file and create a candidate profile
    
    Supports PDF, DOCX, and TXT files. The file will be parsed to extract
    text and skills automatically.
    """
    # Upload and parse file
    file_data = await file_service.upload_cv(file)
    
    # Parse CV data from text
    parsed_data = await file_service.parse_cv_data(file_data['extracted_text'])
    
    # Extract skills from parsed data or use empty list
    skills = parsed_data.get('skills', [])
    
    # Create CV record
    cv_data = CVCreate(
        name=name,
        email=email,
        phone=phone,
        age=age,
        gender=gender,
        experience=experience,
        skills=skills if skills else ["To be updated"],
        education=education,
        location=location,
        currentRole=current_role,
        expectedSalary=expected_salary
    )
    
    cv = await cv_service.create_cv(cv_data)
    
    # Send notification
    await notification_service.notify_cv_uploaded(name, email)
    
    return {
        "cv": cv,
        "file_info": {
            "filename": file_data['filename'],
            "extracted_skills": skills,
            "file_size": file_data['file_size']
        },
        "job_id": job_id,
        "message": "CV uploaded successfully"
    }


@router.post(
    "/sample-cv",
    summary="Upload a sample/ideal CV"
)
async def upload_sample_cv(
    file: UploadFile = File(..., description="Sample CV file"),
    job_id: str = Form(..., description="Job ID this sample is for"),
    file_service: FileUploadService = Depends(get_file_service)
):
    """
    Upload a sample/ideal CV for a job posting
    
    This CV will be used as a reference for comparing other candidates
    """
    # Upload and parse file
    file_data = await file_service.upload_cv(file)
    
    # Parse CV data
    parsed_data = await file_service.parse_cv_data(file_data['extracted_text'])
    
    return {
        "sample_cv_id": file_data['filename'],
        "job_id": job_id,
        "extracted_text": file_data['extracted_text'],
        "skills": parsed_data.get('skills', []),
        "message": "Sample CV uploaded successfully"
    }


@router.post(
    "/parse",
    summary="Parse CV file without saving"
)
async def parse_cv_file(
    file: UploadFile = File(..., description="CV file to parse"),
    file_service: FileUploadService = Depends(get_file_service)
):
    """
    Parse a CV file to extract information without creating a record
    
    Useful for previewing extracted data before submission
    """
    # Upload and parse file
    file_data = await file_service.upload_cv(file)
    
    # Parse CV data
    parsed_data = await file_service.parse_cv_data(file_data['extracted_text'])
    
    return {
        "filename": file_data['filename'],
        "extracted_text": file_data['extracted_text'],
        "parsed_data": parsed_data,
        "message": "CV parsed successfully"
    }
