"""
Job Posting Service - Manage job postings with criteria
"""
from typing import List, Dict, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.core.logging import logger
from app.core.exceptions import NotFoundException, BadRequestException
from firebase_service import FirebaseService


class JobCriteria(BaseModel):
    """Job evaluation criteria"""
    keywords: List[str] = Field(default_factory=list)
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    min_experience: int = Field(default=0, ge=0)
    max_experience: Optional[int] = Field(default=None)
    education_requirements: List[str] = Field(default_factory=list)
    sample_cv_id: Optional[str] = None


class JobPosting(BaseModel):
    """Job posting model"""
    job_id: str
    title: str
    description: str
    department: str
    location: str
    job_type: str  # full-time, part-time, contract
    criteria: JobCriteria
    created_at: datetime
    created_by: str
    status: str = "active"  # active, closed, draft


class JobPostingService:
    """Service for managing job postings"""
    
    def __init__(self):
        self.firebase = FirebaseService
    
    async def create_job(
        self,
        title: str,
        description: str,
        department: str,
        location: str,
        job_type: str,
        criteria: JobCriteria,
        created_by: str
    ) -> JobPosting:
        """Create a new job posting"""
        try:
            job_id = f"JOB{datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            job_data = {
                "job_id": job_id,
                "title": title,
                "description": description,
                "department": department,
                "location": location,
                "job_type": job_type,
                "criteria": criteria.model_dump(),
                "created_at": datetime.now().isoformat(),
                "created_by": created_by,
                "status": "active"
            }
            
            # Save to Firebase
            self.firebase.add_job_posting(job_data)
            
            logger.info(f"Created job posting: {job_id}")
            return JobPosting(**job_data)
            
        except Exception as e:
            logger.error(f"Failed to create job: {str(e)}")
            raise BadRequestException(f"Failed to create job: {str(e)}")
    
    async def get_job(self, job_id: str) -> JobPosting:
        """Get a job posting by ID"""
        try:
            job = self.firebase.get_job_posting(job_id)
            if not job:
                raise NotFoundException(f"Job not found: {job_id}")
            return JobPosting(**job)
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Failed to get job: {str(e)}")
            raise BadRequestException(f"Failed to get job: {str(e)}")
    
    async def get_all_jobs(
        self,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[JobPosting]:
        """Get all job postings"""
        try:
            jobs = self.firebase.get_all_job_postings()
            
            # Filter by status
            if status:
                jobs = [j for j in jobs if j.get('status') == status]
            
            # Pagination
            jobs = jobs[skip:skip + limit]
            
            return [JobPosting(**job) for job in jobs]
        except Exception as e:
            logger.error(f"Failed to get jobs: {str(e)}")
            raise BadRequestException(f"Failed to get jobs: {str(e)}")
    
    async def update_job(
        self,
        job_id: str,
        updates: Dict
    ) -> JobPosting:
        """Update a job posting"""
        try:
            # Check if job exists
            await self.get_job(job_id)
            
            # Update in Firebase
            self.firebase.update_job_posting(job_id, updates)
            
            logger.info(f"Updated job: {job_id}")
            return await self.get_job(job_id)
            
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Failed to update job: {str(e)}")
            raise BadRequestException(f"Failed to update job: {str(e)}")
    
    async def add_keywords(self, job_id: str, keywords: List[str]) -> JobPosting:
        """Add keywords to job criteria"""
        try:
            job = await self.get_job(job_id)
            
            # Merge keywords
            existing_keywords = set(job.criteria.keywords)
            new_keywords = existing_keywords.union(set(keywords))
            
            updates = {
                "criteria.keywords": list(new_keywords)
            }
            
            return await self.update_job(job_id, updates)
            
        except Exception as e:
            logger.error(f"Failed to add keywords: {str(e)}")
            raise BadRequestException(f"Failed to add keywords: {str(e)}")
    
    async def set_sample_cv(self, job_id: str, sample_cv_id: str) -> JobPosting:
        """Set a sample CV for comparison"""
        try:
            updates = {
                "criteria.sample_cv_id": sample_cv_id
            }
            
            return await self.update_job(job_id, updates)
            
        except Exception as e:
            logger.error(f"Failed to set sample CV: {str(e)}")
            raise BadRequestException(f"Failed to set sample CV: {str(e)}")
    
    async def close_job(self, job_id: str) -> JobPosting:
        """Close a job posting"""
        return await self.update_job(job_id, {"status": "closed"})
