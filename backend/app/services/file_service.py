"""
File Upload Service - Handle CV file uploads and parsing
"""
from typing import Dict, Optional
import os
from fastapi import UploadFile
from PyPDF2 import PdfReader
from docx import Document
import io
from app.core.logging import logger
from app.core.exceptions import BadRequestException


class FileUploadService:
    """Service for handling file uploads and parsing"""
    
    ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.doc', '.txt'}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    async def upload_cv(self, file: UploadFile) -> Dict:
        """
        Upload and parse a CV file
        
        Args:
            file: Uploaded file
            
        Returns:
            Dict with file info and extracted text
        """
        try:
            # Validate file
            self._validate_file(file)
            
            # Read file content
            content = await file.read()
            
            # Extract text based on file type
            text = await self._extract_text(file.filename, content)
            
            # Save file (optional - could save to cloud storage)
            file_path = await self._save_file(file.filename, content)
            
            logger.info(f"Uploaded CV: {file.filename}")
            
            return {
                "filename": file.filename,
                "file_path": file_path,
                "extracted_text": text,
                "file_size": len(content),
                "content_type": file.content_type
            }
            
        except Exception as e:
            logger.error(f"File upload failed: {str(e)}")
            raise BadRequestException(f"File upload failed: {str(e)}")
    
    def _validate_file(self, file: UploadFile):
        """Validate uploaded file"""
        # Check extension
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            raise BadRequestException(
                f"Invalid file type. Allowed: {', '.join(self.ALLOWED_EXTENSIONS)}"
            )
        
        # Check file size would be done during upload
        # FastAPI handles this with max_upload_size
    
    async def _extract_text(self, filename: str, content: bytes) -> str:
        """Extract text from file based on type"""
        ext = os.path.splitext(filename)[1].lower()
        
        try:
            if ext == '.pdf':
                return self._extract_from_pdf(content)
            elif ext in ['.docx', '.doc']:
                return self._extract_from_docx(content)
            elif ext == '.txt':
                return content.decode('utf-8')
            else:
                raise BadRequestException(f"Unsupported file type: {ext}")
        except Exception as e:
            logger.error(f"Text extraction failed: {str(e)}")
            raise BadRequestException(f"Failed to extract text: {str(e)}")
    
    def _extract_from_pdf(self, content: bytes) -> str:
        """Extract text from PDF"""
        try:
            pdf_file = io.BytesIO(content)
            reader = PdfReader(pdf_file)
            
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            
            return text.strip()
        except Exception as e:
            raise BadRequestException(f"Failed to parse PDF: {str(e)}")
    
    def _extract_from_docx(self, content: bytes) -> str:
        """Extract text from DOCX"""
        try:
            docx_file = io.BytesIO(content)
            doc = Document(docx_file)
            
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            
            return text.strip()
        except Exception as e:
            raise BadRequestException(f"Failed to parse DOCX: {str(e)}")
    
    async def _save_file(self, filename: str, content: bytes) -> str:
        """Save file to storage (local or cloud)"""
        try:
            # Create uploads directory
            upload_dir = "uploads/cvs"
            os.makedirs(upload_dir, exist_ok=True)
            
            # Generate unique filename
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            safe_filename = f"{timestamp}_{filename}"
            file_path = os.path.join(upload_dir, safe_filename)
            
            # Save file
            with open(file_path, 'wb') as f:
                f.write(content)
            
            return file_path
            
        except Exception as e:
            logger.error(f"Failed to save file: {str(e)}")
            # Non-critical error, return empty path
            return ""
    
    async def parse_cv_data(self, text: str) -> Dict:
        """
        Parse CV text to extract structured data
        This is a basic implementation - can be enhanced with NLP
        """
        try:
            # Basic parsing logic
            lines = text.split('\n')
            
            # Extract email
            import re
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            emails = re.findall(email_pattern, text)
            email = emails[0] if emails else ""
            
            # Extract phone
            phone_pattern = r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]'
            phones = re.findall(phone_pattern, text)
            phone = phones[0] if phones else ""
            
            # Extract skills (basic keyword matching)
            common_skills = [
                'python', 'java', 'javascript', 'react', 'node.js', 'sql',
                'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum'
            ]
            
            text_lower = text.lower()
            skills = [skill for skill in common_skills if skill in text_lower]
            
            return {
                "email": email,
                "phone": phone,
                "skills": skills,
                "raw_text": text
            }
            
        except Exception as e:
            logger.error(f"CV parsing failed: {str(e)}")
            return {"raw_text": text}


from datetime import datetime
