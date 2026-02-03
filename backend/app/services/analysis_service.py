"""
Analysis Service - ML-powered CV analysis and bias detection
"""
from typing import List, Dict, Optional
from datetime import datetime
from app.core.logging import logger
from app.core.exceptions import BadRequestException, NotFoundException
from app.services.cv_service import CVService
from firebase_service import FirebaseService
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


class AnalysisService:
    """Service for CV analysis and bias detection"""
    
    def __init__(self):
        self.cv_service = CVService()
        self.firebase = FirebaseService
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load the sentence transformer model"""
        try:
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Loaded sentence transformer model")
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
    
    async def analyze_cv(self, candidate_id: str, job_description: str) -> Dict:
        """
        Analyze a single CV against a job description
        
        Args:
            candidate_id: The candidate ID
            job_description: Job description to match against
            
        Returns:
            Analysis results with scores and recommendations
        """
        try:
            # Get CV data
            cv = await self.cv_service.get_cv(candidate_id)
            
            # Extract text from CV
            cv_text = self._extract_cv_text(cv)
            
            # Calculate scores
            ats_score = self._calculate_ats_score(cv_text, job_description)
            semantic_score = self._calculate_semantic_score(cv_text, job_description)
            bias_score = self._detect_bias(cv.model_dump())
            
            # Determine recommendation
            recommendation = self._generate_recommendation(
                ats_score, semantic_score, bias_score
            )
            
            # Update CV with analysis results
            analysis_data = {
                "analyzed": True,
                "atsScore": ats_score,
                "semanticScore": semantic_score,
                "biasScore": bias_score,
                "recommendation": recommendation,
                "analyzedAt": datetime.now().isoformat()
            }
            
            await self.cv_service.update_cv(candidate_id, analysis_data)
            
            logger.info(f"Analyzed CV: {candidate_id}")
            
            return {
                "candidateId": candidate_id,
                "atsScore": ats_score,
                "semanticScore": semantic_score,
                "biasScore": bias_score,
                "recommendation": recommendation,
                "status": "completed"
            }
            
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Error analyzing CV {candidate_id}: {str(e)}")
            raise BadRequestException(f"Analysis failed: {str(e)}")
    
    async def batch_analyze(
        self, 
        job_description: str,
        candidate_ids: Optional[List[str]] = None
    ) -> Dict:
        """
        Analyze multiple CVs in batch
        
        Args:
            job_description: Job description to match against
            candidate_ids: Optional list of specific candidate IDs
            
        Returns:
            Batch analysis results
        """
        try:
            # Get CVs to analyze
            if candidate_ids:
                cvs = [await self.cv_service.get_cv(cid) for cid in candidate_ids]
            else:
                cvs = await self.cv_service.get_all_cvs(limit=1000)
            
            results = []
            rescued = []
            
            for cv in cvs:
                try:
                    result = await self.analyze_cv(cv.candidateId, job_description)
                    results.append(result)
                    
                    # Check if candidate should be rescued
                    if self._should_rescue(result):
                        rescued.append(result)
                        
                except Exception as e:
                    logger.error(f"Failed to analyze {cv.candidateId}: {str(e)}")
                    continue
            
            return {
                "total_analyzed": len(results),
                "rescued_count": len(rescued),
                "rescued_candidates": rescued,
                "results": results,
                "status": "completed"
            }
            
        except Exception as e:
            logger.error(f"Batch analysis failed: {str(e)}")
            raise BadRequestException(f"Batch analysis failed: {str(e)}")
    
    def _extract_cv_text(self, cv) -> str:
        """Extract text from CV for analysis"""
        parts = [
            cv.name,
            cv.currentRole,
            cv.education,
            " ".join(cv.skills),
            cv.location
        ]
        return " ".join(filter(None, parts))
    
    def _calculate_ats_score(self, cv_text: str, job_description: str) -> float:
        """Calculate ATS keyword matching score"""
        # Extract keywords from job description
        jd_keywords = set(job_description.lower().split())
        cv_keywords = set(cv_text.lower().split())
        
        # Calculate overlap
        matched = jd_keywords.intersection(cv_keywords)
        
        if not jd_keywords:
            return 0.0
        
        score = (len(matched) / len(jd_keywords)) * 100
        return round(min(score, 100), 2)
    
    def _calculate_semantic_score(self, cv_text: str, job_description: str) -> float:
        """Calculate semantic similarity using sentence transformers"""
        if not self.model:
            return 0.0
        
        try:
            # Generate embeddings
            cv_embedding = self.model.encode([cv_text])
            jd_embedding = self.model.encode([job_description])
            
            # Calculate cosine similarity
            similarity = cosine_similarity(cv_embedding, jd_embedding)[0][0]
            
            return round(float(similarity), 4)
            
        except Exception as e:
            logger.error(f"Semantic analysis failed: {str(e)}")
            return 0.0
    
    def _detect_bias(self, cv_data: Dict) -> float:
        """
        Detect potential bias in CV evaluation
        Returns a bias score (0-1, lower is better)
        """
        bias_score = 0.0
        
        # Check for age bias
        age = cv_data.get('age', 0)
        if age < 25 or age > 50:
            bias_score += 0.2
        
        # Check for gender bias (should not affect scoring)
        # This is a placeholder - real implementation would be more sophisticated
        
        # Check for location bias
        # Premium locations might get unfair advantage
        
        return round(min(bias_score, 1.0), 4)
    
    def _generate_recommendation(
        self, 
        ats_score: float, 
        semantic_score: float, 
        bias_score: float
    ) -> str:
        """Generate hiring recommendation based on scores"""
        
        # High ATS and semantic scores
        if ats_score >= 70 and semantic_score >= 0.7:
            return "immediate_interview"
        
        # Good semantic score but low ATS (potential rescue)
        if semantic_score >= 0.6 and ats_score < 50:
            return "rescued"
        
        # Moderate scores
        if ats_score >= 50 or semantic_score >= 0.5:
            return "shortlisted"
        
        # Low scores
        if ats_score < 30 and semantic_score < 0.3:
            return "rejected"
        
        return "under_review"
    
    def _should_rescue(self, analysis_result: Dict) -> bool:
        """Determine if a candidate should be rescued"""
        return (
            analysis_result.get("recommendation") == "rescued" or
            (analysis_result.get("semanticScore", 0) >= 0.6 and 
             analysis_result.get("atsScore", 0) < 50)
        )
    
    async def get_analysis_statistics(self) -> Dict:
        """Get overall analysis statistics"""
        try:
            cvs = await self.cv_service.get_all_cvs(limit=10000)
            
            analyzed = [cv for cv in cvs if cv.analyzed]
            
            if not analyzed:
                return {
                    "total_analyzed": 0,
                    "average_ats_score": 0,
                    "average_semantic_score": 0,
                    "rescued_count": 0
                }
            
            avg_ats = np.mean([cv.atsScore for cv in analyzed if cv.atsScore])
            avg_semantic = np.mean([cv.semanticScore for cv in analyzed if cv.semanticScore])
            
            rescued = sum(1 for cv in analyzed if cv.status == "rescued")
            
            return {
                "total_analyzed": len(analyzed),
                "average_ats_score": round(float(avg_ats), 2),
                "average_semantic_score": round(float(avg_semantic), 4),
                "rescued_count": rescued,
                "by_recommendation": self._count_by_recommendation(analyzed)
            }
            
        except Exception as e:
            logger.error(f"Failed to get statistics: {str(e)}")
            raise BadRequestException(f"Failed to get statistics: {str(e)}")
    
    def _count_by_recommendation(self, cvs: List) -> Dict:
        """Count CVs by recommendation"""
        counts = {}
        for cv in cvs:
            rec = getattr(cv, 'recommendation', 'unknown')
            counts[rec] = counts.get(rec, 0) + 1
        return counts
