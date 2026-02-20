"""
Pydantic models for CV operations
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


class CVStatus(str, Enum):
    """CV status enumeration"""
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    ANALYZING = "analyzing"
    REJECTED = "rejected"
    SHORTLISTED = "shortlisted"
    SELECTED = "selected"
    RESCUED = "rescued"
    IMMEDIATE_INTERVIEW = "immediate_interview"


class CVBase(BaseModel):
    """Base CV model"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^\+?[1-9]\d{1,14}$')
    age: int = Field(..., ge=18, le=100)
    gender: str = Field(..., pattern=r'^(Male|Female|Non-binary|Other)$')
    experience: int = Field(..., ge=0, le=50)
    skills: List[str] = Field(..., min_items=1)
    education: str = Field(..., min_length=2)
    location: str
    currentRole: str
    expectedSalary: str


class CVCreate(CVBase):
    """Model for creating a CV"""
    pass


class CVUpdate(BaseModel):
    """Model for updating a CV"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, pattern=r'^\+?[1-9]\d{1,14}$')
    age: Optional[int] = Field(None, ge=18, le=100)
    status: Optional[CVStatus] = None
    skills: Optional[List[str]] = None


class CVResponse(CVBase):
    """Model for CV response"""
    candidateId: str
    status: CVStatus
    uploadedAt: datetime
    analyzed: bool = False
    atsScore: Optional[float] = None
    matchRate: Optional[float] = None
    semanticScore: Optional[float] = None
    jobTitle: Optional[str] = None
    fileName: Optional[str] = None
    userId: Optional[str] = None
    rescueReason: Optional[str] = None
    
    class Config:
        from_attributes = True


class CVAnalysisResult(BaseModel):
    """Model for CV analysis results"""
    candidateId: str
    atsScore: float = Field(..., ge=0, le=100)
    matchRate: float = Field(..., ge=0, le=1)
    semanticScore: float = Field(..., ge=0, le=1)
    matchedKeywords: int
    totalKeywords: int
    bestJobFamily: Optional[str] = None
    rescueReason: Optional[str] = None
    
    class Config:
        from_attributes = True
