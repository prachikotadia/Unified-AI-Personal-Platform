from fastapi import APIRouter, HTTPException, Query, Depends, Request
from typing import List, Dict, Any, Optional
import structlog
from app.services.security_service import security_service

logger = structlog.get_logger()
router = APIRouter(prefix="/security", tags=["Security"])

@router.post("/login-attempt")
async def record_login_attempt(
    user_id: str,
    ip_address: str,
    user_agent: str,
    success: bool,
    details: Optional[Dict[str, Any]] = None
):
    """Record a login attempt"""
    try:
        success_recorded = await security_service.record_login_attempt(
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            details=details
        )
        
        if success_recorded:
            return {"message": "Login attempt recorded successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to record login attempt")
            
    except Exception as e:
        logger.error(f"Error recording login attempt: {e}")
        raise HTTPException(status_code=500, detail="Failed to record login attempt")

@router.get("/account-locked")
async def check_account_locked(user_id: str, ip_address: str):
    """Check if account is locked"""
    try:
        is_locked = await security_service.is_account_locked(user_id, ip_address)
        return {"locked": is_locked}
        
    except Exception as e:
        logger.error(f"Error checking account lock: {e}")
        raise HTTPException(status_code=500, detail="Failed to check account lock")

@router.post("/security-event")
async def record_security_event(
    event_type: str,
    user_id: str,
    ip_address: str,
    user_agent: str = "",
    severity: str = "medium",
    details: Optional[Dict[str, Any]] = None,
    risk_score: float = 0.0,
    action_taken: str = ""
):
    """Record a security event"""
    try:
        event_id = await security_service.record_security_event(
            event_type=event_type,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            severity=severity,
            details=details,
            risk_score=risk_score,
            action_taken=action_taken
        )
        
        if event_id:
            return {"event_id": event_id, "message": "Security event recorded successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to record security event")
            
    except Exception as e:
        logger.error(f"Error recording security event: {e}")
        raise HTTPException(status_code=500, detail="Failed to record security event")

@router.post("/payment-security")
async def analyze_payment_security(
    user_id: str,
    transaction_data: Dict[str, Any],
    ip_address: str,
    user_agent: str
):
    """Analyze payment for security risks"""
    try:
        is_safe, risk_score, risk_factors = await security_service.analyze_payment_security(
            user_id=user_id,
            transaction_data=transaction_data,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return {
            "is_safe": is_safe,
            "risk_score": risk_score,
            "risk_factors": risk_factors,
            "recommendation": "proceed" if is_safe else "review"
        }
        
    except Exception as e:
        logger.error(f"Error analyzing payment security: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze payment security")

@router.post("/validate-webhook")
async def validate_payment_webhook(
    payload: str,
    signature: str,
    timestamp: str
):
    """Validate payment webhook signature"""
    try:
        is_valid = await security_service.validate_payment_webhook(
            payload=payload,
            signature=signature,
            timestamp=timestamp
        )
        
        return {"valid": is_valid}
        
    except Exception as e:
        logger.error(f"Error validating webhook: {e}")
        raise HTTPException(status_code=500, detail="Failed to validate webhook")

@router.post("/scan-input")
async def scan_input_for_threats(input_data: str):
    """Scan input data for security threats"""
    try:
        is_safe, threats = await security_service.scan_input_for_threats(input_data)
        
        return {
            "is_safe": is_safe,
            "threats": threats,
            "recommendation": "safe" if is_safe else "block"
        }
        
    except Exception as e:
        logger.error(f"Error scanning input: {e}")
        raise HTTPException(status_code=500, detail="Failed to scan input")

@router.get("/events")
async def get_security_events(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    limit: int = Query(50, ge=1, le=100, description="Number of events to return"),
    offset: int = Query(0, ge=0, description="Number of events to skip")
):
    """Get security events with filtering"""
    try:
        events = await security_service.get_security_events(
            user_id=user_id,
            event_type=event_type,
            severity=severity,
            limit=limit,
            offset=offset
        )
        
        return {"events": events}
        
    except Exception as e:
        logger.error(f"Error getting security events: {e}")
        raise HTTPException(status_code=500, detail="Failed to get security events")

@router.get("/fraud-alerts")
async def get_fraud_alerts(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100, description="Number of alerts to return"),
    offset: int = Query(0, ge=0, description="Number of alerts to skip")
):
    """Get fraud alerts"""
    try:
        alerts = await security_service.get_fraud_alerts(
            user_id=user_id,
            status=status,
            limit=limit,
            offset=offset
        )
        
        return {"alerts": alerts}
        
    except Exception as e:
        logger.error(f"Error getting fraud alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to get fraud alerts")

@router.get("/user-risk/{user_id}")
async def get_user_risk_profile(user_id: str):
    """Get user's risk profile"""
    try:
        risk_score = await security_service._get_user_risk_score(user_id)
        
        return {
            "user_id": user_id,
            "risk_score": risk_score,
            "risk_level": "low" if risk_score < 0.3 else "medium" if risk_score < 0.7 else "high"
        }
        
    except Exception as e:
        logger.error(f"Error getting user risk profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user risk profile")

# Middleware for automatic security checks
@router.middleware("http")
async def security_middleware(request: Request, call_next):
    """Security middleware for automatic threat detection"""
    try:
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Get user agent
        user_agent = request.headers.get("user-agent", "")
        
        # Scan request path and query parameters for threats
        path = request.url.path
        query = str(request.url.query)
        
        # Combine path and query for scanning
        input_to_scan = f"{path} {query}"
        
        is_safe, threats = await security_service.scan_input_for_threats(input_to_scan)
        
        if not is_safe:
            logger.warning(f"Security threat detected: {threats} from {client_ip}")
            
            # Record security event
            await security_service.record_security_event(
                event_type="input_threat",
                user_id="anonymous",
                ip_address=client_ip,
                user_agent=user_agent,
                severity="high",
                details={
                    "path": path,
                    "query": query,
                    "threats": threats
                },
                risk_score=0.9,
                action_taken="blocked"
            )
            
            return HTTPException(status_code=403, detail="Security threat detected")
        
        # Continue with request
        response = await call_next(request)
        return response
        
    except Exception as e:
        logger.error(f"Error in security middleware: {e}")
        # Continue with request even if security check fails
        return await call_next(request)
