import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
import structlog

load_dotenv()

logger = structlog.get_logger()

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@omnilife.com")
        self.from_name = os.getenv("FROM_NAME", "OmniLife")
    
    def send_email(self, to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
        """Send email using SMTP"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Add text and HTML parts
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                msg.attach(text_part)
            
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                if self.smtp_username and self.smtp_password:
                    server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def send_verification_email(self, to_email: str, username: str, verification_url: str) -> bool:
        """Send email verification email"""
        subject = "Verify Your OmniLife Account"
        
        html_content = f"""
        <html>
        <body>
            <h2>Welcome to OmniLife!</h2>
            <p>Hi {username},</p>
            <p>Thank you for creating your OmniLife account. Please verify your email address by clicking the button below:</p>
            <p>
                <a href="{verification_url}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
                    Verify Email Address
                </a>
            </p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>{verification_url}</p>
            <p>This link will expire in 24 hours.</p>
            <p>Best regards,<br>The OmniLife Team</p>
        </body>
        </html>
        """
        
        text_content = f"""
        Welcome to OmniLife!
        
        Hi {username},
        
        Thank you for creating your OmniLife account. Please verify your email address by visiting this link:
        
        {verification_url}
        
        This link will expire in 24 hours.
        
        Best regards,
        The OmniLife Team
        """
        
        return self.send_email(to_email, subject, html_content, text_content)
    
    def send_password_reset_email(self, to_email: str, username: str, reset_url: str) -> bool:
        """Send password reset email"""
        subject = "Reset Your OmniLife Password"
        
        html_content = f"""
        <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>Hi {username},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p>
                <a href="{reset_url}" style="background-color: #2196F3; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
                    Reset Password
                </a>
            </p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>{reset_url}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
            <p>Best regards,<br>The OmniLife Team</p>
        </body>
        </html>
        """
        
        text_content = f"""
        Password Reset Request
        
        Hi {username},
        
        We received a request to reset your password. Visit this link to create a new password:
        
        {reset_url}
        
        This link will expire in 1 hour.
        
        If you didn't request this password reset, you can safely ignore this email.
        
        Best regards,
        The OmniLife Team
        """
        
        return self.send_email(to_email, subject, html_content, text_content)
    
    def send_order_confirmation_email(self, to_email: str, username: str, order_number: str, order_details: dict) -> bool:
        """Send order confirmation email"""
        subject = f"Order Confirmation - {order_number}"
        
        html_content = f"""
        <html>
        <body>
            <h2>Order Confirmed!</h2>
            <p>Hi {username},</p>
            <p>Thank you for your order. Your order has been confirmed and is being processed.</p>
            <h3>Order Details:</h3>
            <p><strong>Order Number:</strong> {order_number}</p>
            <p><strong>Total Amount:</strong> ${order_details.get('total', 0):.2f}</p>
            <p><strong>Estimated Delivery:</strong> {order_details.get('estimated_delivery', '3-5 business days')}</p>
            <p>You can track your order in your account dashboard.</p>
            <p>Best regards,<br>The OmniLife Team</p>
        </body>
        </html>
        """
        
        return self.send_email(to_email, subject, html_content)
    
    def send_shipping_notification_email(self, to_email: str, username: str, order_number: str, tracking_number: str, tracking_url: str) -> bool:
        """Send shipping notification email"""
        subject = f"Your Order Has Shipped - {order_number}"
        
        html_content = f"""
        <html>
        <body>
            <h2>Your Order Has Shipped!</h2>
            <p>Hi {username},</p>
            <p>Great news! Your order has been shipped and is on its way to you.</p>
            <h3>Shipping Details:</h3>
            <p><strong>Order Number:</strong> {order_number}</p>
            <p><strong>Tracking Number:</strong> {tracking_number}</p>
            <p>
                <a href="{tracking_url}" style="background-color: #FF9800; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
                    Track Your Package
                </a>
            </p>
            <p>Best regards,<br>The OmniLife Team</p>
        </body>
        </html>
        """
        
        return self.send_email(to_email, subject, html_content)
