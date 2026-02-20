"""
CV Service - Business logic for CV operations
"""
from typing import List, Optional
from datetime import datetime
from app.models.cv import CVCreate, CVUpdate, CVResponse, CVStatus
from app.core.exceptions import NotFoundException, BadRequestException
from app.core.logging import logger
from firebase_service import FirebaseService


class CVService:
    """Service for CV operations"""
    
    def __init__(self):
        self.firebase = FirebaseService
    
    async def create_cv(self, cv_data: CVCreate) -> CVResponse:
        """Create a new CV"""
        try:
            # Generate candidate ID
            candidate_id = f"CV{datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            # Prepare CV data
            cv_dict = cv_data.model_dump()
            cv_dict.update({
                "candidateId": candidate_id,
                "status": CVStatus.PENDING,
                "uploadedAt": datetime.now(),
                "analyzed": False
            })
            
            # Save to Firebase
            self.firebase.add_cv(cv_dict)
            
            logger.info(f"Created CV for candidate: {candidate_id}")
            return CVResponse(**cv_dict)
            
        except Exception as e:
            logger.error(f"Error creating CV: {str(e)}")
            raise BadRequestException(f"Failed to create CV: {str(e)}")
    
    async def get_cv(self, candidate_id: str) -> CVResponse:
        """Get a CV by candidate ID"""
        try:
            cv = self.firebase.get_cv(candidate_id)
            if not cv:
                raise NotFoundException(f"CV not found: {candidate_id}")
            return CVResponse(**cv)
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Error fetching CV: {str(e)}")
            raise BadRequestException(f"Failed to fetch CV: {str(e)}")
    
    async def get_all_cvs(
        self, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[CVStatus] = None
    ) -> List[CVResponse]:
        """Get all CVs with optional filtering"""
        try:
            cvs = self.firebase.get_all_cvs()
            
            # Filter by status if provided
            if status:
                cvs = [cv for cv in cvs if cv.get('status') == status]
            
            # Pagination
            cvs = cvs[skip:skip + limit]
            
            return [CVResponse(**cv) for cv in cvs]
        except Exception as e:
            logger.error(f"Error fetching CVs: {str(e)}")
            raise BadRequestException(f"Failed to fetch CVs: {str(e)}")
    
    async def update_cv(
        self, 
        candidate_id: str, 
        cv_update: CVUpdate
    ) -> CVResponse:
        """Update a CV"""
        try:
            # Check if CV exists
            existing_cv = await self.get_cv(candidate_id)
            
            # Update fields
            update_data = cv_update.model_dump(exclude_unset=True)
            
            # Update in Firebase
            self.firebase.update_cv(candidate_id, update_data)
            
            logger.info(f"Updated CV: {candidate_id}")
            
            # Return updated CV
            return await self.get_cv(candidate_id)
            
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Error updating CV: {str(e)}")
            raise BadRequestException(f"Failed to update CV: {str(e)}")
    
    async def delete_cv(self, candidate_id: str) -> dict:
        """Delete a CV"""
        try:
            # Check if CV exists
            await self.get_cv(candidate_id)
            
            # Delete from Firebase
            self.firebase.delete_cv(candidate_id)
            
            logger.info(f"Deleted CV: {candidate_id}")
            return {"message": f"CV {candidate_id} deleted successfully"}
            
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Error deleting CV: {str(e)}")
            raise BadRequestException(f"Failed to delete CV: {str(e)}")
    
    async def get_cv_statistics(self) -> dict:
        """Get CV statistics"""
        try:
            cvs = await self.get_all_cvs(limit=10000)
            
            total = len(cvs)
            by_status = {}
            
            for cv in cvs:
                status = cv.status
                by_status[status] = by_status.get(status, 0) + 1
            
            return {
                "total": total,
                "by_status": by_status,
                "analyzed": sum(1 for cv in cvs if cv.analyzed),
                "pending_analysis": sum(1 for cv in cvs if not cv.analyzed)
            }
        except Exception as e:
            logger.error(f"Error fetching statistics: {str(e)}")
            raise BadRequestException(f"Failed to fetch statistics: {str(e)}")
    
    async def get_user_applications(self, user_id: str) -> List[CVResponse]:
        """Get all applications for a specific user"""
        try:
            cvs = self.firebase.get_all_cvs()
            user_cvs = [cv for cv in cvs if cv.get('userId') == user_id]
            return [CVResponse(**cv) for cv in user_cvs]
        except Exception as e:
            logger.error(f"Error fetching user applications: {str(e)}")
            raise BadRequestException(f"Failed to fetch user applications: {str(e)}")
