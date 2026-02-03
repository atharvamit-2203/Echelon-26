"""
CV API endpoints - Version 1
"""
from fastapi import APIRouter, Depends, Query, status
from typing import List, Optional
from app.models.cv import CVCreate, CVUpdate, CVResponse, CVStatus
from app.services.cv_service import CVService
from app.core.security import get_current_active_user

router = APIRouter(prefix="/cvs", tags=["CVs"])


def get_cv_service() -> CVService:
    """Dependency injection for CV service"""
    return CVService()


@router.post(
    "/",
    response_model=CVResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new CV"
)
async def create_cv(
    cv_data: CVCreate,
    service: CVService = Depends(get_cv_service)
):
    """
    Create a new CV with all required information:
    
    - **name**: Candidate's full name
    - **email**: Valid email address
    - **phone**: Phone number in international format
    - **age**: Age between 18 and 100
    - **gender**: Male, Female, Non-binary, or Other
    - **experience**: Years of experience
    - **skills**: List of skills
    - **education**: Educational background
    - **location**: Current location
    - **currentRole**: Current job role
    - **expectedSalary**: Expected salary range
    """
    return await service.create_cv(cv_data)


@router.get(
    "/",
    response_model=List[CVResponse],
    summary="Get all CVs"
)
async def get_cvs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[CVStatus] = None,
    service: CVService = Depends(get_cv_service)
):
    """
    Get all CVs with optional filtering and pagination:
    
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return
    - **status**: Filter by CV status
    """
    return await service.get_all_cvs(skip=skip, limit=limit, status=status)


@router.get(
    "/{candidate_id}",
    response_model=CVResponse,
    summary="Get a specific CV"
)
async def get_cv(
    candidate_id: str,
    service: CVService = Depends(get_cv_service)
):
    """Get a CV by candidate ID"""
    return await service.get_cv(candidate_id)


@router.put(
    "/{candidate_id}",
    response_model=CVResponse,
    summary="Update a CV"
)
async def update_cv(
    candidate_id: str,
    cv_update: CVUpdate,
    service: CVService = Depends(get_cv_service)
):
    """Update a CV with partial data"""
    return await service.update_cv(candidate_id, cv_update)


@router.delete(
    "/{candidate_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a CV"
)
async def delete_cv(
    candidate_id: str,
    service: CVService = Depends(get_cv_service)
):
    """Delete a CV by candidate ID"""
    await service.delete_cv(candidate_id)


@router.get(
    "/statistics/summary",
    summary="Get CV statistics"
)
async def get_statistics(
    service: CVService = Depends(get_cv_service)
):
    """Get overall CV statistics"""
    return await service.get_cv_statistics()
