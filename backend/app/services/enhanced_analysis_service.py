"""
Enhanced Analysis Service with comprehensive bias detection
"""
from app.services.analysis_service import AnalysisService
from app.services.websocket_service import notification_service
from app.services.comprehensive_bias_detector import ComprehensiveBiasDetector
from app.services.cv_service import CVService
from typing import Dict, List
import asyncio
from app.core.logging import logger


class EnhancedAnalysisWithNotifications(AnalysisService):
    """Analysis service with real-time notifications and comprehensive bias detection"""
    
    def __init__(self):
        super().__init__()
        self.cv_service = CVService()
    
    async def batch_analyze_with_notifications(
        self,
        job_description: str,
        candidate_ids: List[str] = None
    ) -> Dict:
        """Batch analyze with real-time progress notifications and comprehensive bias detection"""
        try:
            # Get CVs to analyze
            if candidate_ids:
                cvs = [await self.cv_service.get_cv(cid) for cid in candidate_ids]
            else:
                cvs = await self.cv_service.get_all_cvs()
            
            total_cvs = len(cvs)
            
            # Notify analysis started
            await notification_service.notify_analysis_started(job_description, total_cvs)
            
            # Initialize comprehensive bias detector
            bias_detector = ComprehensiveBiasDetector()
            
            results = []
            rescued_count = 0
            
            # Analyze each CV with progress updates
            for idx, cv in enumerate(cvs, 1):
                # Analyze CV
                result = await self.analyze_cv(cv.candidateId, job_description)
                results.append(result)
                
                # Add to bias detector
                bias_detector.add_candidate_result(cv, result)
                
                # Check if rescued
                if result.get("rescued", False):
                    rescued_count += 1
                    
                    # Notify individual rescue
                    await notification_service.notify_candidate_rescued({
                        "candidateId": cv.candidateId,
                        "name": cv.name,
                        "atsScore": result["atsScore"],
                        "semanticScore": result["semanticScore"]
                    })
                
                # Send progress update every 5 CVs or at the end
                if idx % 5 == 0 or idx == total_cvs:
                    await notification_service.notify_analysis_progress(
                        idx, total_cvs, rescued_count
                    )
                
                # Small delay to prevent overwhelming
                await asyncio.sleep(0.1)
            
            # Detect all biases comprehensively
            all_biases = bias_detector.detect_all_biases()
            
            # Send bias alerts for each detected bias
            for bias in all_biases:
                await notification_service.notify_bias_detected(bias)
                
                # Small delay between alerts
                await asyncio.sleep(0.2)
            
            # Get comprehensive bias summary
            bias_summary = bias_detector.get_summary()
            
            # Calculate summary
            summary = {
                "total_analyzed": total_cvs,
                "rescued_count": rescued_count,
                "average_ats_score": sum(r["atsScore"] for r in results) / total_cvs if total_cvs > 0 else 0,
                "bias_alerts": all_biases,
                "bias_summary": bias_summary,
                "total_biases_detected": len(all_biases),
                "critical_biases": len([b for b in all_biases if b.get("severity") == "critical"]),
                "high_biases": len([b for b in all_biases if b.get("severity") == "high"]),
                "categories_with_bias": list(set(b.get("category") for b in all_biases))
            }
            
            # Notify completion
            await notification_service.notify_analysis_complete(summary)
            
            return summary
            
        except Exception as e:
            logger.error(f"Batch analysis with notifications failed: {str(e)}")
            raise

