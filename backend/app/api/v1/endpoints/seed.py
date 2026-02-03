"""
Seed database with varied CVs endpoint
"""
from fastapi import APIRouter, Query
from app.utils.cv_generator import CVGenerator
from app.services.cv_service import CVService
from typing import List

router = APIRouter(prefix="/seed", tags=["Seed Data"])


@router.post(
    "/generate-cvs",
    summary="Generate varied CVs for testing"
)
async def generate_cvs(
    count: int = Query(50, ge=1, le=200, description="Number of CVs to generate"),
    domains: List[str] = Query(None, description="Specific domains to focus on")
):
    """
    Generate varied, realistic CVs for testing
    
    This endpoint creates diverse CVs with:
    - Different skill sets
    - Varied experience levels
    - Multiple demographics
    - Realistic data
    
    Perfect for testing the bias detection system!
    """
    cv_service = CVService()
    generator = CVGenerator()
    
    # Generate CVs
    cv_data_list = generator.generate_batch(count, domains)
    
    # Save to database
    created_cvs = []
    for cv_data in cv_data_list:
        try:
            cv = await cv_service.create_cv(cv_data)
            created_cvs.append(cv)
        except Exception as e:
            print(f"Failed to create CV: {str(e)}")
            continue
    
    return {
        "message": f"Successfully generated {len(created_cvs)} CVs",
        "total_requested": count,
        "total_created": len(created_cvs),
        "domains_used": list(set(cv["domain"] for cv in cv_data_list)),
        "sample_cvs": created_cvs[:5]  # Return first 5 as sample
    }


@router.post(
    "/generate-for-job",
    summary="Generate CVs tailored to a job description"
)
async def generate_for_job(
    job_description: str,
    count: int = Query(30, ge=1, le=100)
):
    """
    Generate CVs that match (or don't match) a job description
    
    This creates a realistic applicant pool with:
    - 70% somewhat matching candidates
    - 30% non-matching candidates
    - Varied skill levels
    """
    cv_service = CVService()
    generator = CVGenerator()
    
    # Generate CVs
    cv_data_list = generator.generate_for_job(job_description, count)
    
    # Save to database
    created_cvs = []
    for cv_data in cv_data_list:
        try:
            cv = await cv_service.create_cv(cv_data)
            created_cvs.append(cv)
        except Exception as e:
            print(f"Failed to create CV: {str(e)}")
            continue
    
    return {
        "message": f"Successfully generated {len(created_cvs)} CVs for the job",
        "job_description_preview": job_description[:100] + "...",
        "total_created": len(created_cvs),
        "sample_cvs": created_cvs[:5]
    }


@router.delete(
    "/clear-all-cvs",
    summary="Clear all CVs from database"
)
async def clear_all_cvs():
    """
    ⚠️ WARNING: This will delete ALL CVs from the database!
    
    Use this to reset the database before generating new test data.
    """
    cv_service = CVService()
    
    # Get all CVs
    all_cvs = await cv_service.get_all_cvs()
    
    # Delete each one
    deleted_count = 0
    for cv in all_cvs:
        try:
            await cv_service.delete_cv(cv.candidateId)
            deleted_count += 1
        except:
            continue
    
    return {
        "message": f"Deleted {deleted_count} CVs",
        "total_deleted": deleted_count
    }
