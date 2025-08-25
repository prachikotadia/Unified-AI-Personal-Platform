from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime
import structlog
from app.services.notification_service import notification_service

logger = structlog.get_logger()
router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/create")
async def create_notification(
    user_id: str,
    template_name: str,
    variables: Dict[str, Any],
    priority: str = "normal",
    scheduled_at: Optional[datetime] = None,
    notification_type: Optional[str] = None
):
    """Create a new notification"""
    try:
        notification_id = await notification_service.create_notification(
            user_id=user_id,
            template_name=template_name,
            variables=variables,
            priority=priority,
            scheduled_at=scheduled_at,
            notification_type=notification_type
        )
        
        return {"notification_id": notification_id, "message": "Notification created successfully"}
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating notification: {e}")
        raise HTTPException(status_code=500, detail="Failed to create notification")

@router.get("/user/{user_id}")
async def get_user_notifications(
    user_id: str,
    limit: int = Query(50, ge=1, le=100, description="Number of notifications to return"),
    offset: int = Query(0, ge=0, description="Number of notifications to skip"),
    status: Optional[str] = Query(None, description="Filter by status: pending, sent, failed, read")
):
    """Get notifications for a user"""
    try:
        notifications = await notification_service.get_user_notifications(
            user_id=user_id,
            limit=limit,
            offset=offset,
            status=status
        )
        
        return {"notifications": notifications}
        
    except Exception as e:
        logger.error(f"Error getting notifications for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get notifications")

@router.post("/mark-read")
async def mark_notification_read(notification_id: str, user_id: str):
    """Mark a notification as read"""
    try:
        success = await notification_service.mark_notification_read(notification_id, user_id)
        if success:
            return {"message": "Notification marked as read"}
        else:
            raise HTTPException(status_code=404, detail="Notification not found")
            
    except Exception as e:
        logger.error(f"Error marking notification as read: {e}")
        raise HTTPException(status_code=500, detail="Failed to mark notification as read")

@router.post("/preferences/{user_id}")
async def update_user_preferences(
    user_id: str,
    preferences: Dict[str, Any]
):
    """Update user notification preferences"""
    try:
        success = await notification_service.update_user_preferences(user_id, preferences)
        if success:
            return {"message": "Preferences updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update preferences")
            
    except Exception as e:
        logger.error(f"Error updating preferences for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update preferences")

@router.post("/send/email")
async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
    from_email: Optional[str] = None,
    attachments: Optional[List[Dict[str, Any]]] = None
):
    """Send email notification directly"""
    try:
        success = await notification_service.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
            from_email=from_email,
            attachments=attachments
        )
        
        if success:
            return {"message": "Email sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send email")
            
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")

@router.post("/send/sms")
async def send_sms(
    to_phone: str,
    message: str,
    from_phone: Optional[str] = None
):
    """Send SMS notification directly"""
    try:
        success = await notification_service.send_sms(
            to_phone=to_phone,
            message=message,
            from_phone=from_phone
        )
        
        if success:
            return {"message": "SMS sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send SMS")
            
    except Exception as e:
        logger.error(f"Error sending SMS: {e}")
        raise HTTPException(status_code=500, detail="Failed to send SMS")

@router.post("/send/push")
async def send_push_notification(
    user_id: str,
    title: str,
    message: str,
    data: Optional[Dict[str, Any]] = None,
    tokens: Optional[List[str]] = None
):
    """Send push notification directly"""
    try:
        success = await notification_service.send_push_notification(
            user_id=user_id,
            title=title,
            message=message,
            data=data,
            tokens=tokens
        )
        
        if success:
            return {"message": "Push notification sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send push notification")
            
    except Exception as e:
        logger.error(f"Error sending push notification: {e}")
        raise HTTPException(status_code=500, detail="Failed to send push notification")

@router.post("/process-queue")
async def process_notification_queue():
    """Process notifications in the queue (admin endpoint)"""
    try:
        await notification_service.process_notification_queue()
        return {"message": "Notification queue processed"}
        
    except Exception as e:
        logger.error(f"Error processing notification queue: {e}")
        raise HTTPException(status_code=500, detail="Failed to process notification queue")

# Convenience endpoints for common notification types

@router.post("/welcome")
async def send_welcome_notification(user_id: str, user_name: str):
    """Send welcome notification to new user"""
    try:
        notification_id = await notification_service.create_notification(
            user_id=user_id,
            template_name="Welcome Email",
            variables={"user_name": user_name},
            priority="normal"
        )
        
        return {"notification_id": notification_id, "message": "Welcome notification sent"}
        
    except Exception as e:
        logger.error(f"Error sending welcome notification: {e}")
        raise HTTPException(status_code=500, detail="Failed to send welcome notification")

@router.post("/order-confirmation")
async def send_order_confirmation(
    user_id: str,
    user_name: str,
    order_id: str,
    total_amount: float,
    estimated_delivery: str,
    items: List[Dict[str, Any]],
    tracking_url: str
):
    """Send order confirmation notification"""
    try:
        notification_id = await notification_service.create_notification(
            user_id=user_id,
            template_name="Order Confirmation",
            variables={
                "user_name": user_name,
                "order_id": order_id,
                "total_amount": total_amount,
                "estimated_delivery": estimated_delivery,
                "items": items,
                "tracking_url": tracking_url
            },
            priority="high"
        )
        
        return {"notification_id": notification_id, "message": "Order confirmation sent"}
        
    except Exception as e:
        logger.error(f"Error sending order confirmation: {e}")
        raise HTTPException(status_code=500, detail="Failed to send order confirmation")

@router.post("/price-alert")
async def send_price_alert(
    user_id: str,
    user_name: str,
    product_name: str,
    old_price: float,
    new_price: float,
    savings: float,
    discount_percentage: float,
    product_url: str
):
    """Send price drop alert notification"""
    try:
        notification_id = await notification_service.create_notification(
            user_id=user_id,
            template_name="Price Alert",
            variables={
                "user_name": user_name,
                "product_name": product_name,
                "old_price": old_price,
                "new_price": new_price,
                "savings": savings,
                "discount_percentage": discount_percentage,
                "product_url": product_url
            },
            priority="medium"
        )
        
        return {"notification_id": notification_id, "message": "Price alert sent"}
        
    except Exception as e:
        logger.error(f"Error sending price alert: {e}")
        raise HTTPException(status_code=500, detail="Failed to send price alert")

@router.post("/security-alert")
async def send_security_alert(user_id: str, message: str):
    """Send security alert notification"""
    try:
        notification_id = await notification_service.create_notification(
            user_id=user_id,
            template_name="Security Alert",
            variables={"message": message},
            priority="high",
            notification_type="sms"
        )
        
        return {"notification_id": notification_id, "message": "Security alert sent"}
        
    except Exception as e:
        logger.error(f"Error sending security alert: {e}")
        raise HTTPException(status_code=500, detail="Failed to send security alert")
