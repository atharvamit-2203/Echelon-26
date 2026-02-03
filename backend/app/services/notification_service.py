"""
Notification Service - Email and in-app notifications
"""
from typing import List, Dict, Optional
from datetime import datetime
from app.core.logging import logger
from app.core.config import settings
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


class NotificationService:
    """Service for sending notifications"""
    
    def __init__(self):
        self.smtp_server = getattr(settings, 'SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = getattr(settings, 'SMTP_PORT', 587)
        self.smtp_user = getattr(settings, 'SMTP_USER', None)
        self.smtp_password = getattr(settings, 'SMTP_PASSWORD', None)
        self.from_email = getattr(settings, 'FROM_EMAIL', 'noreply@fairhire.com')
    
    async def send_email(
        self, 
        to_email: str, 
        subject: str, 
        body: str,
        html: Optional[str] = None
    ) -> bool:
        """
        Send an email notification
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Plain text body
            html: Optional HTML body
            
        Returns:
            True if sent successfully
        """
        try:
            if not self.smtp_user or not self.smtp_password:
                logger.warning("SMTP not configured, skipping email")
                return False
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email
            
            # Attach parts
            msg.attach(MIMEText(body, 'plain'))
            if html:
                msg.attach(MIMEText(html, 'html'))
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False
    
    async def notify_cv_uploaded(self, candidate_name: str, candidate_email: str) -> bool:
        """Notify candidate that their CV was uploaded"""
        subject = "CV Received - Fair-Hire Sentinel"
        body = f"""
Dear {candidate_name},

Thank you for submitting your CV to our Fair-Hire Sentinel system.

Your application has been received and will be analyzed shortly. We use AI-powered 
bias detection to ensure fair evaluation of all candidates.

You will receive another notification once the analysis is complete.

Best regards,
Fair-Hire Sentinel Team
        """
        
        html = f"""
<html>
<body>
    <h2>CV Received</h2>
    <p>Dear {candidate_name},</p>
    <p>Thank you for submitting your CV to our <strong>Fair-Hire Sentinel</strong> system.</p>
    <p>Your application has been received and will be analyzed shortly. We use AI-powered 
    bias detection to ensure fair evaluation of all candidates.</p>
    <p>You will receive another notification once the analysis is complete.</p>
    <br>
    <p>Best regards,<br>Fair-Hire Sentinel Team</p>
</body>
</html>
        """
        
        return await self.send_email(candidate_email, subject, body, html)
    
    async def notify_analysis_complete(
        self, 
        candidate_name: str, 
        candidate_email: str,
        ats_score: float,
        recommendation: str
    ) -> bool:
        """Notify candidate that analysis is complete"""
        subject = "CV Analysis Complete - Fair-Hire Sentinel"
        
        status_message = {
            "immediate_interview": "Congratulations! Your profile is an excellent match.",
            "shortlisted": "Your profile has been shortlisted for further review.",
            "rescued": "Your profile shows strong potential and has been flagged for review.",
            "under_review": "Your profile is under review.",
            "rejected": "Unfortunately, your profile doesn't match our current requirements."
        }.get(recommendation, "Your profile has been analyzed.")
        
        body = f"""
Dear {candidate_name},

Your CV analysis is complete!

ATS Score: {ats_score}%
Status: {status_message}

Our AI-powered system has evaluated your profile to ensure fair and unbiased assessment.

Thank you for your interest!

Best regards,
Fair-Hire Sentinel Team
        """
        
        html = f"""
<html>
<body>
    <h2>CV Analysis Complete</h2>
    <p>Dear {candidate_name},</p>
    <p>Your CV analysis is complete!</p>
    <div style="background-color: #f0f0f0; padding: 15px; margin: 20px 0;">
        <p><strong>ATS Score:</strong> {ats_score}%</p>
        <p><strong>Status:</strong> {status_message}</p>
    </div>
    <p>Our AI-powered system has evaluated your profile to ensure fair and unbiased assessment.</p>
    <p>Thank you for your interest!</p>
    <br>
    <p>Best regards,<br>Fair-Hire Sentinel Team</p>
</body>
</html>
        """
        
        return await self.send_email(candidate_email, subject, body, html)
    
    async def notify_candidate_rescued(
        self, 
        candidate_name: str, 
        candidate_email: str,
        reason: str
    ) -> bool:
        """Notify that a candidate was rescued from ATS rejection"""
        subject = "Important Update - Fair-Hire Sentinel"
        body = f"""
Dear {candidate_name},

Great news! While your CV may have scored lower on traditional ATS metrics, 
our AI-powered bias detection system has identified strong potential in your profile.

Reason: {reason}

Your application has been flagged for human review to ensure you receive fair consideration.

This is part of our commitment to reducing bias in the hiring process.

Best regards,
Fair-Hire Sentinel Team
        """
        
        html = f"""
<html>
<body>
    <h2 style="color: #28a745;">Important Update</h2>
    <p>Dear {candidate_name},</p>
    <p><strong>Great news!</strong> While your CV may have scored lower on traditional ATS metrics, 
    our AI-powered bias detection system has identified strong potential in your profile.</p>
    <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
        <p><strong>Reason:</strong> {reason}</p>
    </div>
    <p>Your application has been flagged for human review to ensure you receive fair consideration.</p>
    <p>This is part of our commitment to reducing bias in the hiring process.</p>
    <br>
    <p>Best regards,<br>Fair-Hire Sentinel Team</p>
</body>
</html>
        """
        
        return await self.send_email(candidate_email, subject, body, html)
    
    async def notify_batch_analysis_complete(
        self, 
        admin_email: str,
        total_analyzed: int,
        rescued_count: int
    ) -> bool:
        """Notify admin that batch analysis is complete"""
        subject = "Batch Analysis Complete - Fair-Hire Sentinel"
        body = f"""
Batch CV Analysis Complete

Total CVs Analyzed: {total_analyzed}
Candidates Rescued: {rescued_count}

Please review the results in the dashboard.

Fair-Hire Sentinel System
        """
        
        html = f"""
<html>
<body>
    <h2>Batch Analysis Complete</h2>
    <div style="background-color: #f0f0f0; padding: 15px; margin: 20px 0;">
        <p><strong>Total CVs Analyzed:</strong> {total_analyzed}</p>
        <p><strong>Candidates Rescued:</strong> {rescued_count}</p>
    </div>
    <p>Please review the results in the dashboard.</p>
    <br>
    <p>Fair-Hire Sentinel System</p>
</body>
</html>
        """
        
        return await self.send_email(admin_email, subject, body, html)
