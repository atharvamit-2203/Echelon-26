"""
Comprehensive Bias Analysis API Endpoint
"""
from fastapi import APIRouter, Query
from app.services.comprehensive_bias_detector import ComprehensiveBiasDetector
from app.services.cv_service import CVService
from app.services.analysis_service import AnalysisService
from typing import List, Optional

router = APIRouter(prefix="/bias", tags=["Comprehensive Bias Analysis"])


@router.get(
    "/comprehensive",
    summary="Get comprehensive bias analysis across all parameters"
)
async def get_comprehensive_bias_analysis(
    job_description: Optional[str] = Query(None, description="Job description for analysis context"),
    candidate_ids: Optional[List[str]] = Query(None, description="Specific candidates to analyze")
):
    """
    Comprehensive bias analysis across ALL parameters:
    
    - Gender
    - Age Group
    - Location
    - Education Level
    - Experience Level
    - Current Role
    - Domain
    - Skill Count
    - ATS Scoring Patterns
    - Rescue Patterns
    
    Returns detailed bias alerts for any parameter showing discrimination.
    """
    cv_service = CVService()
    analysis_service = AnalysisService()
    bias_detector = ComprehensiveBiasDetector()
    
    # Get CVs
    if candidate_ids:
        cvs = [await cv_service.get_cv(cid) for cid in candidate_ids]
    else:
        cvs = await cv_service.get_all_cvs()
    
    # Analyze each CV and track bias
    for cv in cvs:
        if job_description:
            result = await analysis_service.analyze_cv(cv.candidateId, job_description)
        else:
            # Use existing analysis results if available
            result = {
                "atsScore": getattr(cv, 'atsScore', 0),
                "semanticScore": getattr(cv, 'semanticScore', 0),
                "recommendation": getattr(cv, 'recommendation', 'pending'),
                "rescued": getattr(cv, 'rescued', False)
            }
        
        bias_detector.add_candidate_result(cv, result)
    
    # Detect all biases
    all_biases = bias_detector.detect_all_biases()
    bias_summary = bias_detector.get_summary()
    
    return {
        "total_candidates_analyzed": len(cvs),
        "total_biases_detected": len(all_biases),
        "critical_biases": len([b for b in all_biases if b.get("severity") == "critical"]),
        "high_biases": len([b for b in all_biases if b.get("severity") == "high"]),
        "medium_biases": len([b for b in all_biases if b.get("severity") == "medium"]),
        "low_biases": len([b for b in all_biases if b.get("severity") == "low"]),
        "categories_with_bias": list(set(b.get("category") for b in all_biases)),
        "bias_alerts": all_biases,
        "detailed_statistics": bias_summary
    }


@router.get(
    "/by-category/{category}",
    summary="Get bias analysis for a specific category"
)
async def get_bias_by_category(
    category: str,
    job_description: Optional[str] = Query(None)
):
    """
    Get detailed bias analysis for a specific category:
    
    - gender
    - age
    - location
    - education
    - experience
    - role
    - domain
    - skills
    """
    cv_service = CVService()
    analysis_service = AnalysisService()
    bias_detector = ComprehensiveBiasDetector()
    
    # Get all CVs
    cvs = await cv_service.get_all_cvs()
    
    # Analyze and track
    for cv in cvs:
        if job_description:
            result = await analysis_service.analyze_cv(cv.candidateId, job_description)
        else:
            result = {
                "atsScore": getattr(cv, 'atsScore', 0),
                "semanticScore": getattr(cv, 'semanticScore', 0),
                "recommendation": getattr(cv, 'recommendation', 'pending'),
                "rescued": getattr(cv, 'rescued', False)
            }
        
        bias_detector.add_candidate_result(cv, result)
    
    # Get all biases
    all_biases = bias_detector.detect_all_biases()
    
    # Filter by category
    category_biases = [
        b for b in all_biases 
        if category.lower() in b.get("category", "").lower() or 
           category.lower() in b.get("type", "").lower()
    ]
    
    # Get detailed stats for this category
    bias_summary = bias_detector.get_summary()
    category_key = f"by_{category.lower()}"
    if category_key not in bias_summary["bias_data"]:
        # Try to find matching key
        for key in bias_summary["bias_data"].keys():
            if category.lower() in key:
                category_key = key
                break
    
    category_stats = bias_summary["bias_data"].get(category_key, {})
    
    return {
        "category": category,
        "biases_detected": len(category_biases),
        "bias_alerts": category_biases,
        "detailed_statistics": category_stats
    }


@router.get(
    "/summary",
    summary="Get bias analysis summary"
)
async def get_bias_summary():
    """
    Get a high-level summary of bias across all categories
    """
    cv_service = CVService()
    bias_detector = ComprehensiveBiasDetector()
    
    # Get all CVs
    cvs = await cv_service.get_all_cvs()
    
    # Track with existing data
    for cv in cvs:
        result = {
            "atsScore": getattr(cv, 'atsScore', 0),
            "semanticScore": getattr(cv, 'semanticScore', 0),
            "recommendation": getattr(cv, 'recommendation', 'pending'),
            "rescued": getattr(cv, 'rescued', False)
        }
        bias_detector.add_candidate_result(cv, result)
    
    # Detect biases
    all_biases = bias_detector.detect_all_biases()
    
    # Group by category
    biases_by_category = {}
    for bias in all_biases:
        category = bias.get("category", "Unknown")
        if category not in biases_by_category:
            biases_by_category[category] = []
        biases_by_category[category].append(bias)
    
    return {
        "total_candidates": len(cvs),
        "total_biases": len(all_biases),
        "biases_by_severity": {
            "critical": len([b for b in all_biases if b.get("severity") == "critical"]),
            "high": len([b for b in all_biases if b.get("severity") == "high"]),
            "medium": len([b for b in all_biases if b.get("severity") == "medium"]),
            "low": len([b for b in all_biases if b.get("severity") == "low"])
        },
        "biases_by_category": {
            category: len(biases) 
            for category, biases in biases_by_category.items()
        },
        "most_biased_categories": sorted(
            biases_by_category.items(),
            key=lambda x: len(x[1]),
            reverse=True
        )[:5],
        "top_biases": all_biases[:10]  # Top 10 most severe
    }
