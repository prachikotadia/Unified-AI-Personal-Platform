from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
from datetime import datetime
import structlog
import stripe
import os
from dotenv import load_dotenv

from app.models.payment import (
    PaymentMethod, PaymentTransaction, PaymentRefund, PaymentWebhook,
    PaymentMethodType, PaymentStatus, PaymentProvider
)
from app.models.user import User
from app.models.marketplace_db import Order

load_dotenv()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_your_stripe_key")

logger = structlog.get_logger()

class PaymentService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_payment_method(self, user: User, payment_data: Dict[str, Any]) -> PaymentMethod:
        """Create a new payment method for user"""
        try:
            # Create Stripe payment method
            if payment_data.get("type") == PaymentMethodType.credit_card:
                stripe_payment_method = stripe.PaymentMethod.create(
                    type="card",
                    card={
                        "token": payment_data.get("token")
                    },
                    billing_details={
                        "name": payment_data.get("name"),
                        "email": user.email
                    }
                )
                
                # Get card details
                card = stripe_payment_method.card
                
                # Create payment method in database
                payment_method = PaymentMethod(
                    user_id=user.id,
                    type=PaymentMethodType.credit_card,
                    provider=PaymentProvider.stripe,
                    name=f"{card.brand.title()} ending in {card.last4}",
                    last4=card.last4,
                    brand=card.brand,
                    expiry_month=card.exp_month,
                    expiry_year=card.exp_year,
                    payment_data={
                        "stripe_payment_method_id": stripe_payment_method.id
                    }
                )
                
                self.db.add(payment_method)
                self.db.commit()
                self.db.refresh(payment_method)
                
                return payment_method
                
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            raise ValueError(f"Payment method creation failed: {str(e)}")
        except Exception as e:
            logger.error(f"Payment method creation error: {str(e)}")
            raise ValueError("Payment method creation failed")
    
    def process_payment(self, order: Order, payment_method: PaymentMethod, amount: float) -> PaymentTransaction:
        """Process payment for an order"""
        try:
            # Create payment intent with Stripe
            payment_intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to cents
                currency="usd",
                payment_method=payment_method.payment_data.get("stripe_payment_method_id"),
                confirm=True,
                return_url="http://localhost:3000/payment/success",
                metadata={
                    "order_id": str(order.id),
                    "user_id": str(order.user_id)
                }
            )
            
            # Create transaction record
            transaction = PaymentTransaction(
                order_id=order.id,
                user_id=order.user_id,
                payment_method_id=payment_method.id,
                amount=amount,
                currency="USD",
                status=PaymentStatus.completed if payment_intent.status == "succeeded" else PaymentStatus.failed,
                provider=PaymentProvider.stripe,
                provider_transaction_id=payment_intent.id,
                provider_response={
                    "status": payment_intent.status,
                    "client_secret": payment_intent.client_secret
                },
                description=f"Payment for order #{order.id}",
                processed_at=datetime.utcnow()
            )
            
            self.db.add(transaction)
            self.db.commit()
            self.db.refresh(transaction)
            
            # Update order status
            if payment_intent.status == "succeeded":
                order.payment_status = "paid"
                order.status = "confirmed"
                self.db.commit()
            
            return transaction
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe payment error: {str(e)}")
            raise ValueError(f"Payment processing failed: {str(e)}")
        except Exception as e:
            logger.error(f"Payment processing error: {str(e)}")
            raise ValueError("Payment processing failed")
    
    def create_payment_intent(self, amount: float, currency: str = "usd") -> Dict[str, Any]:
        """Create payment intent for client-side payment"""
        try:
            payment_intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),
                currency=currency,
                automatic_payment_methods={"enabled": True}
            )
            
            return {
                "client_secret": payment_intent.client_secret,
                "payment_intent_id": payment_intent.id
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe payment intent error: {str(e)}")
            raise ValueError(f"Payment intent creation failed: {str(e)}")
    
    def confirm_payment_intent(self, payment_intent_id: str) -> PaymentTransaction:
        """Confirm payment intent and create transaction"""
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if payment_intent.status != "succeeded":
                raise ValueError("Payment intent not succeeded")
            
            # Get order from metadata
            order_id = int(payment_intent.metadata.get("order_id"))
            order = self.db.query(Order).filter(Order.id == order_id).first()
            
            if not order:
                raise ValueError("Order not found")
            
            # Create transaction record
            transaction = PaymentTransaction(
                order_id=order.id,
                user_id=order.user_id,
                payment_method_id=None,  # Will be updated if payment method is attached
                amount=payment_intent.amount / 100,
                currency=payment_intent.currency.upper(),
                status=PaymentStatus.completed,
                provider=PaymentProvider.stripe,
                provider_transaction_id=payment_intent.id,
                provider_response={
                    "status": payment_intent.status,
                    "payment_method": payment_intent.payment_method
                },
                description=f"Payment for order #{order.id}",
                processed_at=datetime.utcnow()
            )
            
            self.db.add(transaction)
            self.db.commit()
            self.db.refresh(transaction)
            
            # Update order status
            order.payment_status = "paid"
            order.status = "confirmed"
            self.db.commit()
            
            return transaction
            
        except Exception as e:
            logger.error(f"Payment confirmation error: {str(e)}")
            raise ValueError(f"Payment confirmation failed: {str(e)}")
    
    def refund_payment(self, transaction: PaymentTransaction, amount: Optional[float] = None, reason: str = "") -> PaymentRefund:
        """Refund a payment"""
        try:
            if amount is None:
                amount = transaction.amount
            
            # Create refund with Stripe
            refund = stripe.Refund.create(
                payment_intent=transaction.provider_transaction_id,
                amount=int(amount * 100),
                reason="requested_by_customer" if reason else "duplicate"
            )
            
            # Create refund record
            refund_record = PaymentRefund(
                transaction_id=transaction.id,
                amount=amount,
                currency=transaction.currency,
                reason=reason,
                status=PaymentStatus.completed if refund.status == "succeeded" else PaymentStatus.failed,
                provider_refund_id=refund.id,
                provider_response={
                    "status": refund.status,
                    "reason": refund.reason
                },
                processed_at=datetime.utcnow()
            )
            
            self.db.add(refund_record)
            self.db.commit()
            self.db.refresh(refund_record)
            
            # Update transaction status
            if refund.status == "succeeded":
                if amount == transaction.amount:
                    transaction.status = PaymentStatus.refunded
                else:
                    transaction.status = PaymentStatus.partially_refunded
                self.db.commit()
            
            return refund_record
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe refund error: {str(e)}")
            raise ValueError(f"Refund failed: {str(e)}")
        except Exception as e:
            logger.error(f"Refund error: {str(e)}")
            raise ValueError("Refund failed")
    
    def get_user_payment_methods(self, user_id: int) -> List[PaymentMethod]:
        """Get user's payment methods"""
        return self.db.query(PaymentMethod).filter(
            PaymentMethod.user_id == user_id,
            PaymentMethod.is_active == True
        ).all()
    
    def get_payment_method(self, payment_method_id: int, user_id: int) -> Optional[PaymentMethod]:
        """Get specific payment method for user"""
        return self.db.query(PaymentMethod).filter(
            PaymentMethod.id == payment_method_id,
            PaymentMethod.user_id == user_id,
            PaymentMethod.is_active == True
        ).first()
    
    def delete_payment_method(self, payment_method_id: int, user_id: int) -> bool:
        """Delete payment method"""
        payment_method = self.get_payment_method(payment_method_id, user_id)
        
        if not payment_method:
            return False
        
        try:
            # Delete from Stripe if it's a Stripe payment method
            if payment_method.provider == PaymentProvider.stripe:
                stripe_payment_method_id = payment_method.payment_data.get("stripe_payment_method_id")
                if stripe_payment_method_id:
                    stripe.PaymentMethod.detach(stripe_payment_method_id)
            
            # Mark as inactive in database
            payment_method.is_active = False
            self.db.commit()
            
            return True
            
        except Exception as e:
            logger.error(f"Payment method deletion error: {str(e)}")
            return False
    
    def set_default_payment_method(self, payment_method_id: int, user_id: int) -> bool:
        """Set default payment method for user"""
        # Remove default from all user's payment methods
        self.db.query(PaymentMethod).filter(
            PaymentMethod.user_id == user_id,
            PaymentMethod.is_default == True
        ).update({"is_default": False})
        
        # Set new default
        payment_method = self.get_payment_method(payment_method_id, user_id)
        if payment_method:
            payment_method.is_default = True
            self.db.commit()
            return True
        
        return False
    
    def get_transaction(self, transaction_id: int) -> Optional[PaymentTransaction]:
        """Get payment transaction by ID"""
        return self.db.query(PaymentTransaction).filter(
            PaymentTransaction.id == transaction_id
        ).first()
    
    def get_order_transactions(self, order_id: int) -> List[PaymentTransaction]:
        """Get all transactions for an order"""
        return self.db.query(PaymentTransaction).filter(
            PaymentTransaction.order_id == order_id
        ).all()
    
    def process_webhook(self, payload: Dict[str, Any], signature: str) -> bool:
        """Process payment webhook"""
        try:
            # Verify webhook signature (in production)
            # event = stripe.Webhook.construct_event(payload, signature, os.getenv("STRIPE_WEBHOOK_SECRET"))
            
            # For now, just store the webhook
            webhook = PaymentWebhook(
                provider=PaymentProvider.stripe,
                event_type=payload.get("type"),
                event_id=payload.get("id"),
                payload=payload
            )
            
            self.db.add(webhook)
            self.db.commit()
            
            # Process webhook based on event type
            if payload.get("type") == "payment_intent.succeeded":
                self._handle_payment_succeeded(payload)
            elif payload.get("type") == "payment_intent.payment_failed":
                self._handle_payment_failed(payload)
            
            return True
            
        except Exception as e:
            logger.error(f"Webhook processing error: {str(e)}")
            return False
    
    def _handle_payment_succeeded(self, payload: Dict[str, Any]):
        """Handle payment succeeded webhook"""
        payment_intent = payload.get("data", {}).get("object", {})
        transaction = self.db.query(PaymentTransaction).filter(
            PaymentTransaction.provider_transaction_id == payment_intent.get("id")
        ).first()
        
        if transaction:
            transaction.status = PaymentStatus.completed
            transaction.processed_at = datetime.utcnow()
            self.db.commit()
    
    def _handle_payment_failed(self, payload: Dict[str, Any]):
        """Handle payment failed webhook"""
        payment_intent = payload.get("data", {}).get("object", {})
        transaction = self.db.query(PaymentTransaction).filter(
            PaymentTransaction.provider_transaction_id == payment_intent.get("id")
        ).first()
        
        if transaction:
            transaction.status = PaymentStatus.failed
            transaction.processed_at = datetime.utcnow()
            self.db.commit()
