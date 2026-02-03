"""
Reports API endpoints
"""
from fastapi import APIRouter, Depends, Query
from typing import Optional
from datetime import datetime, timedelta
from app.services.cv_service import CVService
from app.services.analysis_service import AnalysisService
from pydantic import BaseModel

router = APIRouter(prefix="/reports", tags=["Reports"])


class DateRange(BaseModel):
    """Date range for reports"""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


def get_cv_service() -> CVService:
    return CVService()


def get_analysis_service() -> AnalysisService:
    return AnalysisService()


@router.get(
    "/dashboard",
    summary="Get dashboard summary"
)
async def get_dashboard_summary(
    cv_service: CVService = Depends(get_cv_service),
    analysis_service: AnalysisService = Depends(get_analysis_service)
):
    """
    Get comprehensive dashboard summary with key metrics
    """
    # Get CV statistics
    cv_stats = await cv_service.get_cv_statistics()
    
    # Get analysis statistics
    analysis_stats = await analysis_service.get_analysis_statistics()
    
    # Calculate additional metrics
    total_cvs = cv_stats['total']
    analyzed_cvs = cv_stats['analyzed']
    pending_cvs = cv_stats['pending_analysis']
    
    analysis_rate = (analyzed_cvs / total_cvs * 100) if total_cvs > 0 else 0
    
    return {
        "overview": {
            "total_cvs": total_cvs,
            "analyzed": analyzed_cvs,
            "pending": pending_cvs,
            "analysis_rate": round(analysis_rate, 2)
        },
        "cv_status": cv_stats['by_status'],
        "analysis_metrics": {
            "average_ats_score": analysis_stats['average_ats_score'],
            "average_semantic_score": analysis_stats['average_semantic_score'],
            "rescued_count": analysis_stats['rescued_count']
        },
        "recommendations": analysis_stats.get('by_recommendation', {})
    }


@router.get(
    "/bias-analysis",
    summary="Get bias analysis report"
)
async def get_bias_analysis(
    cv_service: CVService = Depends(get_cv_service)
):
    """
    Get bias analysis across different demographics
    """
    cvs = await cv_service.get_all_cvs(limit=10000)
    
    # Analyze by gender
    by_gender = {}
    for cv in cvs:
        gender = cv.gender
        if gender not in by_gender:
            by_gender[gender] = {
                "count": 0,
                "avg_ats_score": [],
                "shortlisted": 0
            }
        by_gender[gender]["count"] += 1
        if cv.atsScore:
            by_gender[gender]["avg_ats_score"].append(cv.atsScore)
        if cv.status in ["shortlisted", "immediate_interview"]:
            by_gender[gender]["shortlisted"] += 1
    
    # Calculate averages
    for gender in by_gender:
        scores = by_gender[gender]["avg_ats_score"]
        by_gender[gender]["avg_ats_score"] = (
            sum(scores) / len(scores) if scores else 0
        )
        by_gender[gender]["shortlist_rate"] = (
            by_gender[gender]["shortlisted"] / by_gender[gender]["count"] * 100
            if by_gender[gender]["count"] > 0 else 0
        )
    
    # Analyze by age groups
    by_age_group = {
        "18-25": {"count": 0, "shortlisted": 0},
        "26-35": {"count": 0, "shortlisted": 0},
        "36-45": {"count": 0, "shortlisted": 0},
        "46+": {"count": 0, "shortlisted": 0}
    }
    
    for cv in cvs:
        age = cv.age
        if age <= 25:
            group = "18-25"
        elif age <= 35:
            group = "26-35"
        elif age <= 45:
            group = "36-45"
        else:
            group = "46+"
        
        by_age_group[group]["count"] += 1
        if cv.status in ["shortlisted", "immediate_interview"]:
            by_age_group[group]["shortlisted"] += 1
    
    # Calculate shortlist rates
    for group in by_age_group:
        count = by_age_group[group]["count"]
        by_age_group[group]["shortlist_rate"] = (
            by_age_group[group]["shortlisted"] / count * 100
            if count > 0 else 0
        )
    
    return {
        "by_gender": by_gender,
        "by_age_group": by_age_group,
        "total_analyzed": len(cvs)
    }


@router.get(
    "/rescued-candidates",
    summary="Get rescued candidates report"
)
async def get_rescued_candidates(
    limit: int = Query(100, ge=1, le=1000),
    cv_service: CVService = Depends(get_cv_service)
):
    """
    Get list of candidates rescued by the bias detection system
    """
    cvs = await cv_service.get_all_cvs(limit=10000)
    
    rescued = [
        {
            "candidateId": cv.candidateId,
            "name": cv.name,
            "atsScore": cv.atsScore,
            "semanticScore": cv.semanticScore,
            "status": cv.status,
            "skills": cv.skills
        }
        for cv in cvs
        if cv.status == "rescued"
    ][:limit]
    
    return {
        "total_rescued": len(rescued),
        "candidates": rescued
    }


@router.get(
    "/performance-metrics",
    summary="Get system performance metrics"
)
async def get_performance_metrics(
    days: int = Query(7, ge=1, le=90),
    cv_service: CVService = Depends(get_cv_service),
    analysis_service: AnalysisService = Depends(get_analysis_service)
):
    """
    Get system performance metrics over time
    """
    # This is a simplified version
    # In production, you'd query time-series data
    
    cv_stats = await cv_service.get_cv_statistics()
    analysis_stats = await analysis_service.get_analysis_statistics()
    
    return {
        "period_days": days,
        "total_processed": cv_stats['total'],
        "analysis_completion_rate": (
            cv_stats['analyzed'] / cv_stats['total'] * 100
            if cv_stats['total'] > 0 else 0
        ),
        "average_ats_score": analysis_stats['average_ats_score'],
        "rescue_rate": (
            analysis_stats['rescued_count'] / cv_stats['analyzed'] * 100
            if cv_stats['analyzed'] > 0 else 0
        )
    }
