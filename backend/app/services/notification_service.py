import os
import json
import smtplib
import ssl
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import structlog
import requests
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import redis
import uuid
import asyncio
from jinja2 import Template

logger = structlog.get_logger()

class NotificationService:
    def __init__(self):
        # Database configuration
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./omnilife_notifications.db")
        self.engine = create_engine(self.database_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
        # Redis for notification queuing
        self.redis_host = os.getenv("REDIS_HOST", "localhost")
        self.redis_port = int(os.getenv("REDIS_PORT", "6379"))
        self.redis_db = int(os.getenv("REDIS_DB", "2"))  # Use different DB for notifications
        
        # Email configuration
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.smtp_use_tls = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
        
        # SMS configuration (Twilio)
        self.twilio_account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        self.twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        self.twilio_phone_number = os.getenv("TWILIO_PHONE_NUMBER", "")
        
        # Push notification configuration (Firebase)
        self.firebase_server_key = os.getenv("FIREBASE_SERVER_KEY", "")
        
        # Notification settings
        self.max_retries = 3
        self.retry_delay = 300  # 5 minutes
        self.batch_size = 50
        
        # Initialize connections
        self._init_database()
        self._init_redis()
        self._load_templates()
        
    def _init_database(self):
        """Initialize notification database tables"""
        try:
            with self.engine.connect() as conn:
                # Create notification tables
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS notification_templates (
                        id TEXT PRIMARY KEY,
                        name TEXT UNIQUE NOT NULL,
                        type TEXT NOT NULL,
                        subject TEXT,
                        content TEXT NOT NULL,
                        variables JSON,
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS notifications (
                        id TEXT PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        type TEXT NOT NULL,
                        title TEXT NOT NULL,
                        message TEXT NOT NULL,
                        data JSON,
                        status TEXT DEFAULT 'pending',
                        priority TEXT DEFAULT 'normal',
                        scheduled_at TIMESTAMP,
                        sent_at TIMESTAMP,
                        retry_count INTEGER DEFAULT 0,
                        error_message TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS user_notification_preferences (
                        id TEXT PRIMARY KEY,
                        user_id TEXT UNIQUE NOT NULL,
                        email_enabled BOOLEAN DEFAULT TRUE,
                        sms_enabled BOOLEAN DEFAULT TRUE,
                        push_enabled BOOLEAN DEFAULT TRUE,
                        email_frequency TEXT DEFAULT 'immediate',
                        sms_frequency TEXT DEFAULT 'immediate',
                        push_frequency TEXT DEFAULT 'immediate',
                        quiet_hours_start TIME DEFAULT '22:00',
                        quiet_hours_end TIME DEFAULT '08:00',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS notification_logs (
                        id TEXT PRIMARY KEY,
                        notification_id TEXT NOT NULL,
                        provider TEXT NOT NULL,
                        status TEXT NOT NULL,
                        response_data JSON,
                        error_message TEXT,
                        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (notification_id) REFERENCES notifications (id)
                    )
                """))
                
                conn.commit()
                logger.info("Notification database initialized successfully")
                
        except Exception as e:
            logger.error(f"Error initializing notification database: {e}")
    
    def _init_redis(self):
        """Initialize Redis connection for notification queuing"""
        try:
            self.redis = redis.Redis(
                host=self.redis_host,
                port=self.redis_port,
                db=self.redis_db,
                decode_responses=True
            )
            
            # Test connection
            self.redis.ping()
            logger.info("Redis notification connection successful")
            
        except Exception as e:
            logger.error(f"Error connecting to Redis for notifications: {e}")
            self.redis = None
    
    def _load_templates(self):
        """Load default notification templates"""
        self.default_templates = {
            "welcome_email": {
                "name": "Welcome Email",
                "type": "email",
                "subject": "Welcome to OmniLife!",
                "content": """
                <h2>Welcome to OmniLife, {{user_name}}!</h2>
                <p>Thank you for joining our unified AI personal platform. We're excited to help you manage your life more efficiently.</p>
                <p>Here's what you can do with OmniLife:</p>
                <ul>
                    <li>📊 Track your finances and expenses</li>
                    <li>🛒 Shop in our AI-powered marketplace</li>
                    <li>💬 Chat with AI assistants</li>
                    <li>🏃‍♂️ Monitor your fitness goals</li>
                    <li>✈️ Plan your travel adventures</li>
                    <li>👥 Connect with friends and family</li>
                </ul>
                <p>Get started by exploring our features!</p>
                <p>Best regards,<br>The OmniLife Team</p>
                """,
                "variables": ["user_name"]
            },
            "order_confirmation": {
                "name": "Order Confirmation",
                "type": "email",
                "subject": "Order Confirmation - {{order_id}}",
                "content": """
                <h2>Order Confirmed!</h2>
                <p>Hi {{user_name}},</p>
                <p>Your order has been successfully placed.</p>
                <h3>Order Details:</h3>
                <p><strong>Order ID:</strong> {{order_id}}</p>
                <p><strong>Total Amount:</strong> ${{total_amount}}</p>
                <p><strong>Estimated Delivery:</strong> {{estimated_delivery}}</p>
                <h3>Items Ordered:</h3>
                <ul>
                {% for item in items %}
                    <li>{{item.name}} - ${{item.price}} x {{item.quantity}}</li>
                {% endfor %}
                </ul>
                <p>Track your order: <a href="{{tracking_url}}">View Order Status</a></p>
                <p>Thank you for shopping with us!</p>
                """,
                "variables": ["user_name", "order_id", "total_amount", "estimated_delivery", "items", "tracking_url"]
            },
            "price_alert": {
                "name": "Price Alert",
                "type": "email",
                "subject": "Price Drop Alert: {{product_name}}",
                "content": """
                <h2>Price Drop Alert! 🎉</h2>
                <p>Hi {{user_name}},</p>
                <p>The price of <strong>{{product_name}}</strong> has dropped!</p>
                <p><strong>Old Price:</strong> ${{old_price}}</p>
                <p><strong>New Price:</strong> ${{new_price}}</p>
                <p><strong>Savings:</strong> ${{savings}} ({{discount_percentage}}% off)</p>
                <p><a href="{{product_url}}">View Product</a></p>
                <p>Don't miss out on this great deal!</p>
                """,
                "variables": ["user_name", "product_name", "old_price", "new_price", "savings", "discount_percentage", "product_url"]
            },
            "security_alert": {
                "name": "Security Alert",
                "type": "sms",
                "content": "OmniLife Security Alert: {{message}}. If this wasn't you, please contact support immediately.",
                "variables": ["message"]
            },
            "reminder": {
                "name": "Reminder",
                "type": "push",
                "title": "{{title}}",
                "content": "{{message}}",
                "variables": ["title", "message"]
            }
        }
        
        # Insert default templates
        self._insert_default_templates()
    
    def _insert_default_templates(self):
        """Insert default templates into database"""
        try:
            with self.SessionLocal() as db:
                for template_id, template_data in self.default_templates.items():
                    # Check if template already exists
                    result = db.execute(text("""
                        SELECT id FROM notification_templates WHERE name = :name
                    """), {"name": template_data["name"]})
                    
                    if not result.fetchone():
                        db.execute(text("""
                            INSERT INTO notification_templates 
                            (id, name, type, subject, content, variables)
                            VALUES (:id, :name, :type, :subject, :content, :variables)
                        """), {
                            "id": template_id,
                            "name": template_data["name"],
                            "type": template_data["type"],
                            "subject": template_data.get("subject", ""),
                            "content": template_data["content"],
                            "variables": json.dumps(template_data.get("variables", []))
                        })
                
                db.commit()
                logger.info("Default notification templates inserted")
                
        except Exception as e:
            logger.error(f"Error inserting default templates: {e}")
    
    def _generate_id(self) -> str:
        """Generate unique ID for notifications"""
        return str(uuid.uuid4())
    
    async def create_notification(
        self,
        user_id: str,
        template_name: str,
        variables: Dict[str, Any],
        priority: str = "normal",
        scheduled_at: datetime = None,
        notification_type: str = None
    ) -> str:
        """Create a new notification"""
        try:
            with self.SessionLocal() as db:
                # Get template
                result = db.execute(text("""
                    SELECT * FROM notification_templates WHERE name = :name AND is_active = TRUE
                """), {"name": template_name})
                
                template = result.fetchone()
                if not template:
                    raise ValueError(f"Template '{template_name}' not found or inactive")
                
                # Render template
                template_obj = Template(template.content)
                rendered_content = template_obj.render(**variables)
                
                # Determine notification type
                if notification_type:
                    final_type = notification_type
                else:
                    final_type = template.type
                
                # Create notification
                notification_id = self._generate_id()
                db.execute(text("""
                    INSERT INTO notifications 
                    (id, user_id, type, title, message, data, priority, scheduled_at)
                    VALUES (:id, :user_id, :type, :title, :message, :data, :priority, :scheduled_at)
                """), {
                    "id": notification_id,
                    "user_id": user_id,
                    "type": final_type,
                    "title": template.subject or "Notification",
                    "message": rendered_content,
                    "data": json.dumps(variables),
                    "priority": priority,
                    "scheduled_at": scheduled_at
                })
                
                db.commit()
                
                # Add to queue if immediate
                if not scheduled_at or scheduled_at <= datetime.utcnow():
                    await self._queue_notification(notification_id)
                
                logger.info(f"Created notification {notification_id} for user {user_id}")
                return notification_id
                
        except Exception as e:
            logger.error(f"Error creating notification: {e}")
            raise
    
    async def _queue_notification(self, notification_id: str):
        """Add notification to processing queue"""
        if not self.redis:
            return
        
        try:
            # Add to appropriate queue based on priority
            queue_name = f"notifications:queue"
            self.redis.lpush(queue_name, notification_id)
            logger.info(f"Queued notification {notification_id}")
            
        except Exception as e:
            logger.error(f"Error queuing notification {notification_id}: {e}")
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str = None,
        from_email: str = None,
        attachments: List[Dict[str, Any]] = None
    ) -> bool:
        """Send email notification"""
        if not self.smtp_username or not self.smtp_password:
            logger.warning("SMTP credentials not configured")
            return False
        
        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = from_email or self.smtp_username
            msg["To"] = to_email
            
            # Add text content
            if text_content:
                text_part = MIMEText(text_content, "plain")
                msg.attach(text_part)
            
            # Add HTML content
            html_part = MIMEText(html_content, "html")
            msg.attach(html_part)
            
            # Add attachments
            if attachments:
                for attachment in attachments:
                    part = MIMEBase("application", "octet-stream")
                    part.set_payload(attachment["data"])
                    encoders.encode_base64(part)
                    part.add_header(
                        "Content-Disposition",
                        f"attachment; filename= {attachment['filename']}"
                    )
                    msg.attach(part)
            
            # Send email
            context = ssl.create_default_context()
            
            if self.smtp_use_tls:
                with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                    server.starttls(context=context)
                    server.login(self.smtp_username, self.smtp_password)
                    server.send_message(msg)
            else:
                with smtplib.SMTP_SSL(self.smtp_host, self.smtp_port, context=context) as server:
                    server.login(self.smtp_username, self.smtp_password)
                    server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {e}")
            return False
    
    async def send_sms(
        self,
        to_phone: str,
        message: str,
        from_phone: str = None
    ) -> bool:
        """Send SMS notification using Twilio"""
        if not self.twilio_account_sid or not self.twilio_auth_token:
            logger.warning("Twilio credentials not configured")
            return False
        
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{self.twilio_account_sid}/Messages.json"
            
            data = {
                "To": to_phone,
                "From": from_phone or self.twilio_phone_number,
                "Body": message
            }
            
            response = requests.post(
                url,
                data=data,
                auth=(self.twilio_account_sid, self.twilio_auth_token)
            )
            
            if response.status_code == 201:
                logger.info(f"SMS sent successfully to {to_phone}")
                return True
            else:
                logger.error(f"Twilio API error: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending SMS to {to_phone}: {e}")
            return False
    
    async def send_push_notification(
        self,
        user_id: str,
        title: str,
        message: str,
        data: Dict[str, Any] = None,
        tokens: List[str] = None
    ) -> bool:
        """Send push notification using Firebase"""
        if not self.firebase_server_key:
            logger.warning("Firebase server key not configured")
            return False
        
        try:
            # Get user's push tokens
            if not tokens:
                tokens = await self._get_user_push_tokens(user_id)
            
            if not tokens:
                logger.warning(f"No push tokens found for user {user_id}")
                return False
            
            # Prepare notification payload
            payload = {
                "notification": {
                    "title": title,
                    "body": message,
                    "sound": "default"
                },
                "data": data or {},
                "priority": "high"
            }
            
            headers = {
                "Authorization": f"key={self.firebase_server_key}",
                "Content-Type": "application/json"
            }
            
            # Send to each token
            success_count = 0
            for token in tokens:
                payload["to"] = token
                
                response = requests.post(
                    "https://fcm.googleapis.com/fcm/send",
                    headers=headers,
                    json=payload
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("success") == 1:
                        success_count += 1
                    else:
                        logger.warning(f"Firebase error for token {token}: {result}")
                else:
                    logger.error(f"Firebase API error: {response.status_code}")
            
            logger.info(f"Push notification sent to {success_count}/{len(tokens)} tokens for user {user_id}")
            return success_count > 0
            
        except Exception as e:
            logger.error(f"Error sending push notification to user {user_id}: {e}")
            return False
    
    async def _get_user_push_tokens(self, user_id: str) -> List[str]:
        """Get user's push notification tokens"""
        # This would typically be stored in a user_devices table
        # For now, return empty list
        return []
    
    async def process_notification_queue(self):
        """Process notifications in the queue"""
        if not self.redis:
            return
        
        try:
            while True:
                # Get notification from queue
                notification_data = self.redis.brpop("notifications:queue", timeout=1)
                if not notification_data:
                    break
                
                notification_id = notification_data[1]
                await self._process_single_notification(notification_id)
                
        except Exception as e:
            logger.error(f"Error processing notification queue: {e}")
    
    async def _process_single_notification(self, notification_id: str):
        """Process a single notification"""
        try:
            with self.SessionLocal() as db:
                # Get notification
                result = db.execute(text("""
                    SELECT * FROM notifications WHERE id = :id AND status = 'pending'
                """), {"id": notification_id})
                
                notification = result.fetchone()
                if not notification:
                    return
                
                # Get user preferences
                prefs_result = db.execute(text("""
                    SELECT * FROM user_notification_preferences WHERE user_id = :user_id
                """), {"user_id": notification.user_id})
                
                user_prefs = prefs_result.fetchone()
                
                # Check if notification should be sent
                if not await self._should_send_notification(notification, user_prefs):
                    return
                
                # Send notification based on type
                success = False
                provider = ""
                
                if notification.type == "email" and (not user_prefs or user_prefs.email_enabled):
                    # Get user email (this would come from user service)
                    user_email = await self._get_user_email(notification.user_id)
                    if user_email:
                        success = await self.send_email(
                            user_email,
                            notification.title,
                            notification.message
                        )
                        provider = "email"
                
                elif notification.type == "sms" and (not user_prefs or user_prefs.sms_enabled):
                    # Get user phone (this would come from user service)
                    user_phone = await self._get_user_phone(notification.user_id)
                    if user_phone:
                        success = await self.send_sms(user_phone, notification.message)
                        provider = "sms"
                
                elif notification.type == "push" and (not user_prefs or user_prefs.push_enabled):
                    success = await self.send_push_notification(
                        notification.user_id,
                        notification.title,
                        notification.message,
                        json.loads(notification.data) if notification.data else None
                    )
                    provider = "push"
                
                # Update notification status
                status = "sent" if success else "failed"
                error_message = None if success else "Failed to send notification"
                
                db.execute(text("""
                    UPDATE notifications 
                    SET status = :status, sent_at = :sent_at, error_message = :error_message
                    WHERE id = :id
                """), {
                    "status": status,
                    "sent_at": datetime.utcnow() if success else None,
                    "error_message": error_message,
                    "id": notification_id
                })
                
                # Log the attempt
                db.execute(text("""
                    INSERT INTO notification_logs 
                    (id, notification_id, provider, status, error_message)
                    VALUES (:id, :notification_id, :provider, :status, :error_message)
                """), {
                    "id": self._generate_id(),
                    "notification_id": notification_id,
                    "provider": provider,
                    "status": status,
                    "error_message": error_message
                })
                
                db.commit()
                
                logger.info(f"Processed notification {notification_id}: {status}")
                
        except Exception as e:
            logger.error(f"Error processing notification {notification_id}: {e}")
    
    async def _should_send_notification(self, notification, user_prefs) -> bool:
        """Check if notification should be sent based on user preferences"""
        if not user_prefs:
            return True
        
        # Check quiet hours
        now = datetime.utcnow().time()
        if user_prefs.quiet_hours_start and user_prefs.quiet_hours_end:
            if user_prefs.quiet_hours_start <= user_prefs.quiet_hours_end:
                # Same day quiet hours
                if user_prefs.quiet_hours_start <= now <= user_prefs.quiet_hours_end:
                    return False
            else:
                # Overnight quiet hours
                if now >= user_prefs.quiet_hours_start or now <= user_prefs.quiet_hours_end:
                    return False
        
        # Check frequency preferences
        if notification.priority == "low":
            if user_prefs.email_frequency == "daily" or user_prefs.sms_frequency == "daily":
                # Check if we've already sent today
                # This would require additional logic to track daily notifications
                pass
        
        return True
    
    async def _get_user_email(self, user_id: str) -> str:
        """Get user's email address"""
        # This would typically come from a user service
        # For now, return a mock email
        return f"user_{user_id}@example.com"
    
    async def _get_user_phone(self, user_id: str) -> str:
        """Get user's phone number"""
        # This would typically come from a user service
        # For now, return a mock phone
        return "+1234567890"
    
    async def get_user_notifications(
        self,
        user_id: str,
        limit: int = 50,
        offset: int = 0,
        status: str = None
    ) -> List[Dict[str, Any]]:
        """Get notifications for a user"""
        try:
            with self.SessionLocal() as db:
                query = """
                    SELECT * FROM notifications 
                    WHERE user_id = :user_id
                """
                params = {"user_id": user_id}
                
                if status:
                    query += " AND status = :status"
                    params["status"] = status
                
                query += " ORDER BY created_at DESC LIMIT :limit OFFSET :offset"
                params.update({"limit": limit, "offset": offset})
                
                result = db.execute(text(query), params)
                notifications = [dict(row) for row in result.fetchall()]
                
                return notifications
                
        except Exception as e:
            logger.error(f"Error getting notifications for user {user_id}: {e}")
            return []
    
    async def mark_notification_read(self, notification_id: str, user_id: str) -> bool:
        """Mark a notification as read"""
        try:
            with self.SessionLocal() as db:
                db.execute(text("""
                    UPDATE notifications 
                    SET status = 'read' 
                    WHERE id = :id AND user_id = :user_id
                """), {
                    "id": notification_id,
                    "user_id": user_id
                })
                
                db.commit()
                return True
                
        except Exception as e:
            logger.error(f"Error marking notification {notification_id} as read: {e}")
            return False
    
    async def update_user_preferences(
        self,
        user_id: str,
        preferences: Dict[str, Any]
    ) -> bool:
        """Update user notification preferences"""
        try:
            with self.SessionLocal() as db:
                # Check if preferences exist
                result = db.execute(text("""
                    SELECT id FROM user_notification_preferences WHERE user_id = :user_id
                """), {"user_id": user_id})
                
                if result.fetchone():
                    # Update existing preferences
                    db.execute(text("""
                        UPDATE user_notification_preferences 
                        SET email_enabled = :email_enabled,
                            sms_enabled = :sms_enabled,
                            push_enabled = :push_enabled,
                            email_frequency = :email_frequency,
                            sms_frequency = :sms_frequency,
                            push_frequency = :push_frequency,
                            quiet_hours_start = :quiet_hours_start,
                            quiet_hours_end = :quiet_hours_end,
                            updated_at = :updated_at
                        WHERE user_id = :user_id
                    """), {
                        "user_id": user_id,
                        "email_enabled": preferences.get("email_enabled", True),
                        "sms_enabled": preferences.get("sms_enabled", True),
                        "push_enabled": preferences.get("push_enabled", True),
                        "email_frequency": preferences.get("email_frequency", "immediate"),
                        "sms_frequency": preferences.get("sms_frequency", "immediate"),
                        "push_frequency": preferences.get("push_frequency", "immediate"),
                        "quiet_hours_start": preferences.get("quiet_hours_start", "22:00"),
                        "quiet_hours_end": preferences.get("quiet_hours_end", "08:00"),
                        "updated_at": datetime.utcnow()
                    })
                else:
                    # Create new preferences
                    db.execute(text("""
                        INSERT INTO user_notification_preferences 
                        (id, user_id, email_enabled, sms_enabled, push_enabled, 
                         email_frequency, sms_frequency, push_frequency,
                         quiet_hours_start, quiet_hours_end)
                        VALUES (:id, :user_id, :email_enabled, :sms_enabled, :push_enabled,
                                :email_frequency, :sms_frequency, :push_frequency,
                                :quiet_hours_start, :quiet_hours_end)
                    """), {
                        "id": self._generate_id(),
                        "user_id": user_id,
                        "email_enabled": preferences.get("email_enabled", True),
                        "sms_enabled": preferences.get("sms_enabled", True),
                        "push_enabled": preferences.get("push_enabled", True),
                        "email_frequency": preferences.get("email_frequency", "immediate"),
                        "sms_frequency": preferences.get("sms_frequency", "immediate"),
                        "push_frequency": preferences.get("push_frequency", "immediate"),
                        "quiet_hours_start": preferences.get("quiet_hours_start", "22:00"),
                        "quiet_hours_end": preferences.get("quiet_hours_end", "08:00")
                    })
                
                db.commit()
                return True
                
        except Exception as e:
            logger.error(f"Error updating preferences for user {user_id}: {e}")
            return False

# Global notification service instance
notification_service = NotificationService()
