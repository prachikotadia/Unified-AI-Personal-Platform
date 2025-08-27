from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import structlog

from app.database import get_db
from app.services.payment_service import PaymentService
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.models.payment import PaymentMethodType, PaymentProvider

logger = structlog.get_logger()
router = APIRouter()

# Pydantic models
class PaymentMethodCreate(BaseModel):
    type: PaymentMethodType
    token: str
    name: str

class PaymentIntentCreate(BaseModel):
    amount: float
    currency: str = "usd"
    order_id: Optional[int] = None

class PaymentConfirm(BaseModel):
    payment_intent_id: str

class RefundRequest(BaseModel):
    amount: Optional[float] = None
    reason: str = ""

# Payment method endpoints
@router.get("/methods", response_model=List[dict])
async def get_payment_methods(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's payment methods"""
    payment_service = PaymentService(db)
    methods = payment_service.get_user_payment_methods(current_user.id)
    
    return [
        {
            "id": method.id,
            "type": method.type,
            "name": method.name,
            "last4": method.last4,
            "brand": method.brand,
            "expiry_month": method.expiry_month,
            "expiry_year": method.expiry_year,
            "is_default": method.is_default,
            "created_at": method.created_at.isoformat()
        }
        for method in methods
    ]

@router.post("/methods", response_model=dict)
async def create_payment_method(
    payment_data: PaymentMethodCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new payment method"""
    try:
        payment_service = PaymentService(db)
        payment_method = payment_service.create_payment_method(
            current_user,
            {
                "type": payment_data.type,
                "token": payment_data.token,
                "name": payment_data.name
            }
        )
        
        return {
            "message": "Payment method created successfully",
            "payment_method": {
                "id": payment_method.id,
                "type": payment_method.type,
                "name": payment_method.name,
                "last4": payment_method.last4,
                "brand": payment_method.brand,
                "is_default": payment_method.is_default
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/methods/{payment_method_id}")
async def delete_payment_method(
    payment_method_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete payment method"""
    payment_service = PaymentService(db)
    success = payment_service.delete_payment_method(payment_method_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found"
        )
    
    return {"message": "Payment method deleted successfully"}

@router.post("/methods/{payment_method_id}/default")
async def set_default_payment_method(
    payment_method_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Set default payment method"""
    payment_service = PaymentService(db)
    success = payment_service.set_default_payment_method(payment_method_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found"
        )
    
    return {"message": "Default payment method updated successfully"}

# Payment processing endpoints
@router.post("/intent", response_model=dict)
async def create_payment_intent(
    intent_data: PaymentIntentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create payment intent"""
    try:
        payment_service = PaymentService(db)
        intent = payment_service.create_payment_intent(
            intent_data.amount,
            intent_data.currency
        )
        
        return {
            "client_secret": intent["client_secret"],
            "payment_intent_id": intent["payment_intent_id"]
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/confirm", response_model=dict)
async def confirm_payment(
    confirm_data: PaymentConfirm,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Confirm payment intent"""
    try:
        payment_service = PaymentService(db)
        transaction = payment_service.confirm_payment_intent(confirm_data.payment_intent_id)
        
        return {
            "message": "Payment confirmed successfully",
            "transaction": {
                "id": transaction.id,
                "amount": transaction.amount,
                "currency": transaction.currency,
                "status": transaction.status,
                "provider_transaction_id": transaction.provider_transaction_id
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# Transaction endpoints
@router.get("/transactions", response_model=List[dict])
async def get_transactions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's payment transactions"""
    payment_service = PaymentService(db)
    # This would need to be implemented in the service
    # For now, return empty list
    return []

@router.get("/transactions/{transaction_id}", response_model=dict)
async def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific transaction"""
    payment_service = PaymentService(db)
    transaction = payment_service.get_transaction(transaction_id)
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return {
        "id": transaction.id,
        "amount": transaction.amount,
        "currency": transaction.currency,
        "status": transaction.status,
        "description": transaction.description,
        "created_at": transaction.created_at.isoformat(),
        "processed_at": transaction.processed_at.isoformat() if transaction.processed_at else None
    }

# Refund endpoints
@router.post("/transactions/{transaction_id}/refund", response_model=dict)
async def refund_transaction(
    transaction_id: int,
    refund_data: RefundRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Refund a transaction"""
    payment_service = PaymentService(db)
    transaction = payment_service.get_transaction(transaction_id)
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    try:
        refund = payment_service.refund_payment(
            transaction,
            refund_data.amount,
            refund_data.reason
        )
        
        return {
            "message": "Refund processed successfully",
            "refund": {
                "id": refund.id,
                "amount": refund.amount,
                "currency": refund.currency,
                "status": refund.status,
                "reason": refund.reason
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# Webhook endpoint
@router.post("/webhook")
async def payment_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle payment webhooks"""
    try:
        payload = await request.json()
        signature = request.headers.get("stripe-signature", "")
        
        payment_service = PaymentService(db)
        success = payment_service.process_webhook(payload, signature)
        
        if success:
            return {"status": "success"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Webhook processing failed"
            )
            
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Webhook processing failed"
        )
