"""
Job Posting API endpoints
"""
from fastapi import APIRouter, Depends, status
from typing import List, Optional
from pydantic import BaseModel
from app.services.job_service import JobPostingService, JobCriteria

router = APIRouter(prefix="/jobs", tags=["Jobs"])


class JobCreateRequest(BaseModel):
    """Request model for creating a job"""
    title: str
    description: str
    department: str
    location: str
    job_type: str
    criteria: JobCriteria


class KeywordsRequest(BaseModel):
    """Request model for adding keywords"""
    keywords: List[str]


class SampleCVRequest(BaseModel):
    """Request model for setting sample CV"""
    sample_cv_id: str


def get_job_service() -> JobPostingService:
    """Dependency injection for job service"""
    return JobPostingService()


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new job posting"
)
async def create_job(
    request: JobCreateRequest,
    service: JobPostingService = Depends(get_job_service)
):
    """
    Create a new job posting with evaluation criteria
    
    - **title**: Job title
    - **description**: Full job description
    - **department**: Department name
    - **location**: Job location
    - **job_type**: full-time, part-time, or contract
    - **criteria**: Evaluation criteria including keywords and requirements
    """
    return await service.create_job(
        title=request.title,
        description=request.description,
        department=request.department,
        location=request.location,
        job_type=request.job_type,
        criteria=request.criteria,
        created_by="current_user"  # TODO: Get from auth
    )


@router.get(
    "/",
    summary="Get all job postings"
)
async def get_jobs(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    service: JobPostingService = Depends(get_job_service)
):
    """
    Get all job postings with optional filtering
    
    - **status**: Filter by status (active, closed, draft)
    - **skip**: Number of records to skip
    - **limit**: Maximum number of records to return
    """
    return await service.get_all_jobs(status=status, skip=skip, limit=limit)


@router.get(
    "/{job_id}",
    summary="Get a specific job posting"
)
async def get_job(
    job_id: str,
    service: JobPostingService = Depends(get_job_service)
):
    """Get a job posting by ID"""
    return await service.get_job(job_id)


@router.post(
    "/{job_id}/keywords",
    summary="Add keywords to job criteria"
)
async def add_keywords(
    job_id: str,
    request: KeywordsRequest,
    service: JobPostingService = Depends(get_job_service)
):
    """
    Add evaluation keywords to a job posting
    
    These keywords will be used for ATS scoring
    """
    return await service.add_keywords(job_id, request.keywords)


@router.post(
    "/{job_id}/sample-cv",
    summary="Set sample CV for comparison"
)
async def set_sample_cv(
    job_id: str,
    request: SampleCVRequest,
    service: JobPostingService = Depends(get_job_service)
):
    """
    Set a sample/ideal CV for this job
    
    Other CVs will be compared against this sample for semantic similarity
    """
    return await service.set_sample_cv(job_id, request.sample_cv_id)


@router.put(
    "/{job_id}/close",
    summary="Close a job posting"
)
async def close_job(
    job_id: str,
    service: JobPostingService = Depends(get_job_service)
):
    """Close a job posting (no longer accepting applications)"""
    return await service.close_job(job_id)


@router.get(
    "/{job_id}/criteria",
    summary="Get job evaluation criteria"
)
async def get_job_criteria(
    job_id: str,
    service: JobPostingService = Depends(get_job_service)
):
    """Get the evaluation criteria for a specific job"""
    job = await service.get_job(job_id)
    return job.criteria
