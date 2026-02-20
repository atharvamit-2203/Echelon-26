"""
User API endpoints for applicants
"""
from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from typing import List
from app.services.cv_service import CVService
from app.models.cv import CVResponse

router = APIRouter(prefix="/user", tags=["User"])


def get_cv_service() -> CVService:
    """Dependency injection for CV service"""
    return CVService()


@router.get(
    "/applications/{user_id}",
    response_model=List[CVResponse],
    summary="Get user applications"
)
async def get_user_applications(
    user_id: str,
    service: CVService = Depends(get_cv_service)
):
    """Get all applications for a specific user"""
    return await service.get_user_applications(user_id)


@router.post(
    "/apply",
    response_model=CVResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit job application"
)
async def submit_application(
    user_id: str = Form(...),
    job_title: str = Form(...),
    file_name: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    age: int = Form(...),
    gender: str = Form(...),
    experience: int = Form(...),
    skills: str = Form(...),
    education: str = Form(...),
    location: str = Form(...),
    current_role: str = Form(...),
    expected_salary: str = Form(...),
    service: CVService = Depends(get_cv_service)
):
    """Submit a new job application"""
    from app.models.cv import CVCreate
    from datetime import datetime
    
    # Parse skills from comma-separated string
    skills_list = [s.strip() for s in skills.split(',')]
    
    cv_data = CVCreate(
        name=name,
        email=email,
        phone=phone,
        age=age,
        gender=gender,
        experience=experience,
        skills=skills_list,
        education=education,
        location=location,
        currentRole=current_role,
        expectedSalary=expected_salary
    )
    
    # Create CV with additional metadata
    cv_dict = cv_data.model_dump()
    candidate_id = f"CV{datetime.now().strftime('%Y%m%d%H%M%S%f')}"
    cv_dict.update({
        "candidateId": candidate_id,
        "status": "under_review",
        "uploadedAt": datetime.now(),
        "analyzed": False,
        "jobTitle": job_title,
        "fileName": file_name,
        "userId": user_id
    })
    
    # Save to Firebase with specific document ID
    from firebase_service import FirebaseService
    FirebaseService.db.collection('cvs').document(candidate_id).set(cv_dict)
    
    return CVResponse(**cv_dict)
