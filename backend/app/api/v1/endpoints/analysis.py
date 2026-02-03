"""
Analysis API endpoints
"""
from fastapi import APIRouter, Depends, BackgroundTasks, status
from typing import Optional, List
from app.services.analysis_service import AnalysisService
from app.services.notification_service import NotificationService
from app.tasks.celery_tasks import analyze_cv_task, batch_analyze_task
from pydantic import BaseModel

router = APIRouter(prefix="/analysis", tags=["Analysis"])


class AnalysisRequest(BaseModel):
    """Request model for CV analysis"""
    candidate_id: str
    job_description: str
    notify: bool = True


class BatchAnalysisRequest(BaseModel):
    """Request model for batch analysis"""
    job_description: str
    candidate_ids: Optional[List[str]] = None
    async_mode: bool = True


def get_analysis_service() -> AnalysisService:
    """Dependency injection for analysis service"""
    return AnalysisService()


def get_notification_service() -> NotificationService:
    """Dependency injection for notification service"""
    return NotificationService()


@router.post(
    "/analyze",
    summary="Analyze a single CV"
)
async def analyze_cv(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    service: AnalysisService = Depends(get_analysis_service),
    notification_service: NotificationService = Depends(get_notification_service)
):
    """
    Analyze a single CV against a job description
    
    - **candidate_id**: The candidate ID to analyze
    - **job_description**: Job description to match against
    - **notify**: Whether to send notification to candidate
    """
    # Start analysis
    result = await service.analyze_cv(
        request.candidate_id,
        request.job_description
    )
    
    # Send notification in background if requested
    if request.notify:
        background_tasks.add_task(
            notification_service.notify_analysis_complete,
            "Candidate Name",  # TODO: Get from CV
            "candidate@example.com",  # TODO: Get from CV
            result['atsScore'],
            result['recommendation']
        )
    
    return result


@router.post(
    "/batch",
    summary="Analyze multiple CVs"
)
async def batch_analyze(
    request: BatchAnalysisRequest,
    service: AnalysisService = Depends(get_analysis_service)
):
    """
    Analyze multiple CVs in batch
    
    - **job_description**: Job description to match against
    - **candidate_ids**: Optional list of specific candidate IDs
    - **async_mode**: If True, run in background (recommended for large batches)
    """
    if request.async_mode:
        # Run in background using Celery
        task = batch_analyze_task.delay(
            request.job_description,
            request.candidate_ids
        )
        return {
            "status": "started",
            "task_id": task.id,
            "message": "Batch analysis started in background"
        }
    else:
        # Run synchronously (not recommended for large batches)
        result = await service.batch_analyze(
            request.job_description,
            request.candidate_ids
        )
        return result


@router.get(
    "/statistics",
    summary="Get analysis statistics"
)
async def get_statistics(
    service: AnalysisService = Depends(get_analysis_service)
):
    """Get overall analysis statistics"""
    return await service.get_analysis_statistics()


@router.get(
    "/task/{task_id}",
    summary="Get task status"
)
async def get_task_status(task_id: str):
    """
    Get the status of a background task
    
    - **task_id**: The task ID returned from batch analysis
    """
    from celery.result import AsyncResult
    
    task = AsyncResult(task_id)
    
    return {
        "task_id": task_id,
        "status": task.state,
        "result": task.result if task.ready() else None,
        "info": task.info
    }
