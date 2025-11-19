from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import structlog
import secrets
import string
import os
from dotenv import load_dotenv

from app.models.user import User, VerificationCode
from app.utils.email_service import EmailService
from app.utils.phone_service import PhoneService

load_dotenv()
logger = structlog.get_logger()

class VerificationService:
    """Service for handling email and SMS verification"""
    
    def __init__(self, db: Session):
        self.db = db
        self.email_service = EmailService()
        self.phone_service = PhoneService()
    
    def generate_verification_code(self, length: int = 6) -> str:
        """Generate a random verification code"""
        return ''.join(secrets.choice(string.digits) for _ in range(length))
    
    def create_verification_code(self, user_id: int, code_type: str, contact: str, expires_in_minutes: int = 10) -> VerificationCode:
        """Create a new verification code"""
        # Delete any existing codes for this user and type
        self.db.query(VerificationCode).filter(
            VerificationCode.user_id == user_id,
            VerificationCode.code_type == code_type
        ).delete()
        
        # Create new verification code
        code = self.generate_verification_code()
        expires_at = datetime.utcnow() + timedelta(minutes=expires_in_minutes)
        
        verification_code = VerificationCode(
            user_id=user_id,
            code_type=code_type,  # 'email' or 'phone'
            contact=contact,
            code=code,
            expires_at=expires_at,
            is_used=False
        )
        
        self.db.add(verification_code)
        self.db.commit()
        self.db.refresh(verification_code)
        
        logger.info(f"Created {code_type} verification code for user {user_id}")
        return verification_code
    
    async def send_email_verification(self, user: User) -> bool:
        """Send email verification code"""
        try:
            # Create verification code
            verification_code = self.create_verification_code(
                user_id=user.id,
                code_type="email",
                contact=user.email
            )
            
            # Send email
            subject = "Verify your OmniLife account"
            template_data = {
                "user_name": user.first_name or user.username,
                "verification_code": verification_code.code,
                "expires_in": "10 minutes"
            }
            
            success = await self.email_service.send_verification_email(
                to_email=user.email,
                subject=subject,
                template_data=template_data
            )
            
            if success:
                logger.info(f"Email verification sent to {user.email}")
                return True
            else:
                # Delete the code if email failed
                self.db.delete(verification_code)
                self.db.commit()
                return False
                
        except Exception as e:
            logger.error(f"Failed to send email verification: {str(e)}")
            return False
    
    async def send_sms_verification(self, user: User, phone_number: str) -> bool:
        """Send SMS verification code"""
        try:
            # Create verification code
            verification_code = self.create_verification_code(
                user_id=user.id,
                code_type="phone",
                contact=phone_number
            )
            
            # Send SMS
            message = f"Your OmniLife verification code is: {verification_code.code}. Valid for 10 minutes."
            
            success = await self.phone_service.send_verification_sms(
                phone_number=phone_number,
                message=message
            )
            
            if success:
                logger.info(f"SMS verification sent to {phone_number}")
                return True
            else:
                # Delete the code if SMS failed
                self.db.delete(verification_code)
                self.db.commit()
                return False
                
        except Exception as e:
            logger.error(f"Failed to send SMS verification: {str(e)}")
            return False
    
    def verify_code(self, user_id: int, code_type: str, code: str) -> bool:
        """Verify a verification code"""
        try:
            # Find the verification code
            verification_code = self.db.query(VerificationCode).filter(
                VerificationCode.user_id == user_id,
                VerificationCode.code_type == code_type,
                VerificationCode.code == code,
                VerificationCode.is_used == False,
                VerificationCode.expires_at > datetime.utcnow()
            ).first()
            
            if not verification_code:
                return False
            
            # Mark code as used
            verification_code.is_used = True
            verification_code.used_at = datetime.utcnow()
            
            # Update user verification status
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                if code_type == "email":
                    user.is_verified = True
                    user.email_verified_at = datetime.utcnow()
                elif code_type == "phone":
                    user.phone_verified_at = datetime.utcnow()
            
            self.db.commit()
            
            logger.info(f"Verified {code_type} code for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to verify code: {str(e)}")
            return False
    
    def resend_verification_code(self, user_id: int, code_type: str) -> bool:
        """Resend verification code"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return False
            
            if code_type == "email":
                return await self.send_email_verification(user)
            elif code_type == "phone":
                return await self.send_sms_verification(user, user.phone)
            else:
                return False
                
        except Exception as e:
            logger.error(f"Failed to resend verification code: {str(e)}")
            return False
    
    def is_contact_verified(self, user_id: int, contact_type: str) -> bool:
        """Check if user's contact is verified"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        if contact_type == "email":
            return user.is_verified and user.email_verified_at is not None
        elif contact_type == "phone":
            return user.phone_verified_at is not None
        else:
            return False
