"""
Background Tasks - Celery tasks for async processing
"""
from celery import Celery
from app.core.config import settings
from app.core.logging import logger

# Initialize Celery
celery_app = Celery(
    "fairhire",
    broker=getattr(settings, 'REDIS_URL', 'redis://localhost:6379/0'),
    backend=getattr(settings, 'REDIS_URL', 'redis://localhost:6379/0')
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
)


@celery_app.task(name="analyze_cv_task")
def analyze_cv_task(candidate_id: str, job_description: str):
    """
    Background task to analyze a CV
    
    Args:
        candidate_id: Candidate ID
        job_description: Job description to match against
    """
    try:
        from app.services.analysis_service import AnalysisService
        import asyncio
        
        service = AnalysisService()
        result = asyncio.run(service.analyze_cv(candidate_id, job_description))
        
        logger.info(f"Background analysis complete for {candidate_id}")
        return result
        
    except Exception as e:
        logger.error(f"Background analysis failed: {str(e)}")
        raise


@celery_app.task(name="batch_analyze_task")
def batch_analyze_task(job_description: str, candidate_ids: list = None):
    """
    Background task to analyze multiple CVs
    
    Args:
        job_description: Job description to match against
        candidate_ids: Optional list of candidate IDs
    """
    try:
        from app.services.analysis_service import AnalysisService
        from app.services.notification_service import NotificationService
        import asyncio
        
        analysis_service = AnalysisService()
        notification_service = NotificationService()
        
        # Run batch analysis
        result = asyncio.run(
            analysis_service.batch_analyze(job_description, candidate_ids)
        )
        
        # Send notification to admin
        admin_email = getattr(settings, 'ADMIN_EMAIL', None)
        if admin_email:
            asyncio.run(
                notification_service.notify_batch_analysis_complete(
                    admin_email,
                    result['total_analyzed'],
                    result['rescued_count']
                )
            )
        
        logger.info(f"Batch analysis complete: {result['total_analyzed']} CVs")
        return result
        
    except Exception as e:
        logger.error(f"Batch analysis task failed: {str(e)}")
        raise


@celery_app.task(name="send_notification_task")
def send_notification_task(
    notification_type: str,
    recipient_email: str,
    **kwargs
):
    """
    Background task to send notifications
    
    Args:
        notification_type: Type of notification
        recipient_email: Recipient email
        **kwargs: Additional parameters for the notification
    """
    try:
        from app.services.notification_service import NotificationService
        import asyncio
        
        service = NotificationService()
        
        if notification_type == "cv_uploaded":
            asyncio.run(
                service.notify_cv_uploaded(
                    kwargs.get('candidate_name'),
                    recipient_email
                )
            )
        elif notification_type == "analysis_complete":
            asyncio.run(
                service.notify_analysis_complete(
                    kwargs.get('candidate_name'),
                    recipient_email,
                    kwargs.get('ats_score'),
                    kwargs.get('recommendation')
                )
            )
        elif notification_type == "candidate_rescued":
            asyncio.run(
                service.notify_candidate_rescued(
                    kwargs.get('candidate_name'),
                    recipient_email,
                    kwargs.get('reason')
                )
            )
        
        logger.info(f"Notification sent: {notification_type} to {recipient_email}")
        return {"status": "sent"}
        
    except Exception as e:
        logger.error(f"Notification task failed: {str(e)}")
        raise


@celery_app.task(name="cleanup_old_data_task")
def cleanup_old_data_task(days: int = 90):
    """
    Background task to cleanup old data
    
    Args:
        days: Number of days to keep data
    """
    try:
        from datetime import datetime, timedelta
        from app.services.cv_service import CVService
        import asyncio
        
        service = CVService()
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # Get all CVs
        cvs = asyncio.run(service.get_all_cvs(limit=10000))
        
        deleted_count = 0
        for cv in cvs:
            if cv.uploadedAt < cutoff_date and cv.status == "rejected":
                asyncio.run(service.delete_cv(cv.candidateId))
                deleted_count += 1
        
        logger.info(f"Cleanup complete: {deleted_count} CVs deleted")
        return {"deleted_count": deleted_count}
        
    except Exception as e:
        logger.error(f"Cleanup task failed: {str(e)}")
        raise


@celery_app.task(name="generate_report_task")
def generate_report_task(report_type: str, start_date: str, end_date: str):
    """
    Background task to generate reports
    
    Args:
        report_type: Type of report to generate
        start_date: Start date for report
        end_date: End date for report
    """
    try:
        from app.services.analysis_service import AnalysisService
        import asyncio
        
        service = AnalysisService()
        
        # Generate report based on type
        if report_type == "statistics":
            result = asyncio.run(service.get_analysis_statistics())
        else:
            result = {"error": "Unknown report type"}
        
        logger.info(f"Report generated: {report_type}")
        return result
        
    except Exception as e:
        logger.error(f"Report generation failed: {str(e)}")
        raise
