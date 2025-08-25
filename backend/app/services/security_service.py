import os
import json
import hashlib
import hmac
import time
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import structlog
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import redis
import uuid
import re
import ipaddress
from dataclasses import dataclass

logger = structlog.get_logger()

@dataclass
class SecurityEvent:
    """Security event data structure"""
    event_id: str
    event_type: str
    user_id: str
    ip_address: str
    user_agent: str
    timestamp: datetime
    severity: str  # low, medium, high, critical
    details: Dict[str, Any]
    risk_score: float
    action_taken: str
    resolved: bool = False

class SecurityService:
    def __init__(self):
        # Database configuration
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./omnilife_security.db")
        self.engine = create_engine(self.database_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
        # Redis for security monitoring
        self.redis_host = os.getenv("REDIS_HOST", "localhost")
        self.redis_port = int(os.getenv("REDIS_PORT", "6379"))
        self.redis_db = int(os.getenv("REDIS_DB", "3"))  # Use different DB for security
        
        # Security configuration
        self.max_login_attempts = int(os.getenv("MAX_LOGIN_ATTEMPTS", "5"))
        self.login_lockout_duration = int(os.getenv("LOGIN_LOCKOUT_DURATION", "900"))  # 15 minutes
        self.suspicious_activity_threshold = float(os.getenv("SUSPICIOUS_ACTIVITY_THRESHOLD", "0.7"))
        self.fraud_detection_enabled = os.getenv("FRAUD_DETECTION_ENABLED", "true").lower() == "true"
        
        # Payment security
        self.payment_gateway_key = os.getenv("PAYMENT_GATEWAY_KEY", "")
        self.payment_webhook_secret = os.getenv("PAYMENT_WEBHOOK_SECRET", "")
        
        # Initialize connections
        self._init_database()
        self._init_redis()
        
        # Security rules and patterns
        self._load_security_rules()
        
    def _init_database(self):
        """Initialize security database tables"""
        try:
            with self.engine.connect() as conn:
                # Create security tables
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS security_events (
                        id TEXT PRIMARY KEY,
                        event_type TEXT NOT NULL,
                        user_id TEXT,
                        ip_address TEXT,
                        user_agent TEXT,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        severity TEXT DEFAULT 'medium',
                        details JSON,
                        risk_score REAL DEFAULT 0.0,
                        action_taken TEXT,
                        resolved BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS login_attempts (
                        id TEXT PRIMARY KEY,
                        user_id TEXT,
                        ip_address TEXT,
                        user_agent TEXT,
                        success BOOLEAN,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        details JSON
                    )
                """))
                
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS fraud_alerts (
                        id TEXT PRIMARY KEY,
                        user_id TEXT,
                        alert_type TEXT NOT NULL,
                        severity TEXT DEFAULT 'medium',
                        description TEXT,
                        transaction_id TEXT,
                        amount REAL,
                        currency TEXT,
                        risk_score REAL DEFAULT 0.0,
                        status TEXT DEFAULT 'open',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        resolved_at TIMESTAMP,
                        resolution_notes TEXT
                    )
                """))
                
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS ip_blacklist (
                        id TEXT PRIMARY KEY,
                        ip_address TEXT UNIQUE NOT NULL,
                        reason TEXT,
                        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        expires_at TIMESTAMP,
                        is_active BOOLEAN DEFAULT TRUE
                    )
                """))
                
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS user_risk_profiles (
                        id TEXT PRIMARY KEY,
                        user_id TEXT UNIQUE NOT NULL,
                        risk_score REAL DEFAULT 0.0,
                        risk_factors JSON,
                        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                
                conn.commit()
                logger.info("Security database initialized successfully")
                
        except Exception as e:
            logger.error(f"Error initializing security database: {e}")
    
    def _init_redis(self):
        """Initialize Redis connection for security monitoring"""
        try:
            self.redis = redis.Redis(
                host=self.redis_host,
                port=self.redis_port,
                db=self.redis_db,
                decode_responses=True
            )
            
            # Test connection
            self.redis.ping()
            logger.info("Redis security connection successful")
            
        except Exception as e:
            logger.error(f"Error connecting to Redis for security: {e}")
            self.redis = None
    
    def _load_security_rules(self):
        """Load security rules and patterns"""
        self.suspicious_patterns = {
            "sql_injection": [
                r"(\b(union|select|insert|update|delete|drop|create|alter)\b)",
                r"(--|/\*|\*/)",
                r"(\b(exec|execute|script)\b)",
                r"(\b(xss|javascript|vbscript)\b)"
            ],
            "xss_attack": [
                r"(<script[^>]*>.*?</script>)",
                r"(javascript:)",
                r"(on\w+\s*=)",
                r"(<iframe[^>]*>)",
                r"(<object[^>]*>)"
            ],
            "path_traversal": [
                r"(\.\./|\.\.\\)",
                r"(/%2e%2e%2f|%2e%2e%5c)",
                r"(\.\.%2f|\.\.%5c)"
            ],
            "command_injection": [
                r"(\b(cmd|command|exec|system|eval)\b)",
                r"(\||&|;|`|\\$\\()",
                r"(\\$\\{.*\\})"
            ]
        }
        
        self.risk_factors = {
            "high_risk_countries": [
                "XX", "YY", "ZZ"  # Example country codes
            ],
            "suspicious_user_agents": [
                "bot", "crawler", "spider", "scraper",
                "curl", "wget", "python-requests"
            ],
            "suspicious_ips": [
                "10.0.0.0/8",  # Private networks
                "172.16.0.0/12",
                "192.168.0.0/16"
            ]
        }
    
    def _generate_id(self) -> str:
        """Generate unique ID for security events"""
        return str(uuid.uuid4())
    
    async def record_login_attempt(
        self,
        user_id: str,
        ip_address: str,
        user_agent: str,
        success: bool,
        details: Dict[str, Any] = None
    ) -> bool:
        """Record a login attempt"""
        try:
            with self.SessionLocal() as db:
                db.execute(text("""
                    INSERT INTO login_attempts 
                    (id, user_id, ip_address, user_agent, success, details)
                    VALUES (:id, :user_id, :ip_address, :user_agent, :success, :details)
                """), {
                    "id": self._generate_id(),
                    "user_id": user_id,
                    "ip_address": ip_address,
                    "user_agent": user_agent,
                    "success": success,
                    "details": json.dumps(details) if details else None
                })
                
                db.commit()
                
                # Check for suspicious activity
                if not success:
                    await self._check_login_security(user_id, ip_address)
                
                return True
                
        except Exception as e:
            logger.error(f"Error recording login attempt: {e}")
            return False
    
    async def _check_login_security(self, user_id: str, ip_address: str):
        """Check for suspicious login activity"""
        try:
            # Check recent failed attempts
            recent_attempts = await self._get_recent_login_attempts(user_id, ip_address, minutes=15)
            failed_attempts = [a for a in recent_attempts if not a["success"]]
            
            if len(failed_attempts) >= self.max_login_attempts:
                # Account lockout
                await self._lockout_account(user_id, ip_address)
                
                # Record security event
                await self.record_security_event(
                    event_type="account_lockout",
                    user_id=user_id,
                    ip_address=ip_address,
                    severity="high",
                    details={
                        "failed_attempts": len(failed_attempts),
                        "time_window": "15 minutes"
                    },
                    risk_score=0.8
                )
                
        except Exception as e:
            logger.error(f"Error checking login security: {e}")
    
    async def _get_recent_login_attempts(
        self,
        user_id: str,
        ip_address: str,
        minutes: int = 15
    ) -> List[Dict[str, Any]]:
        """Get recent login attempts"""
        try:
            with self.SessionLocal() as db:
                result = db.execute(text("""
                    SELECT * FROM login_attempts 
                    WHERE (user_id = :user_id OR ip_address = :ip_address)
                    AND timestamp >= :since
                    ORDER BY timestamp DESC
                """), {
                    "user_id": user_id,
                    "ip_address": ip_address,
                    "since": datetime.utcnow() - timedelta(minutes=minutes)
                })
                
                return [dict(row) for row in result.fetchall()]
                
        except Exception as e:
            logger.error(f"Error getting recent login attempts: {e}")
            return []
    
    async def _lockout_account(self, user_id: str, ip_address: str):
        """Lock out account temporarily"""
        if not self.redis:
            return
        
        try:
            lockout_key = f"lockout:{user_id}:{ip_address}"
            self.redis.setex(lockout_key, self.login_lockout_duration, "locked")
            logger.warning(f"Account locked: {user_id} from {ip_address}")
            
        except Exception as e:
            logger.error(f"Error locking account: {e}")
    
    async def is_account_locked(self, user_id: str, ip_address: str) -> bool:
        """Check if account is locked"""
        if not self.redis:
            return False
        
        try:
            lockout_key = f"lockout:{user_id}:{ip_address}"
            return bool(self.redis.exists(lockout_key))
            
        except Exception as e:
            logger.error(f"Error checking account lock: {e}")
            return False
    
    async def record_security_event(
        self,
        event_type: str,
        user_id: str,
        ip_address: str,
        user_agent: str = "",
        severity: str = "medium",
        details: Dict[str, Any] = None,
        risk_score: float = 0.0,
        action_taken: str = ""
    ) -> str:
        """Record a security event"""
        try:
            event_id = self._generate_id()
            
            with self.SessionLocal() as db:
                db.execute(text("""
                    INSERT INTO security_events 
                    (id, event_type, user_id, ip_address, user_agent, severity, details, risk_score, action_taken)
                    VALUES (:id, :event_type, :user_id, :ip_address, :user_agent, :severity, :details, :risk_score, :action_taken)
                """), {
                    "id": event_id,
                    "event_type": event_type,
                    "user_id": user_id,
                    "ip_address": ip_address,
                    "user_agent": user_agent,
                    "severity": severity,
                    "details": json.dumps(details) if details else None,
                    "risk_score": risk_score,
                    "action_taken": action_taken
                })
                
                db.commit()
                
                # Update user risk profile
                await self._update_user_risk_profile(user_id, risk_score, event_type)
                
                logger.info(f"Security event recorded: {event_type} for user {user_id}")
                return event_id
                
        except Exception as e:
            logger.error(f"Error recording security event: {e}")
            return None
    
    async def _update_user_risk_profile(self, user_id: str, risk_score: float, event_type: str):
        """Update user risk profile"""
        try:
            with self.SessionLocal() as db:
                # Get current risk profile
                result = db.execute(text("""
                    SELECT * FROM user_risk_profiles WHERE user_id = :user_id
                """), {"user_id": user_id})
                
                profile = result.fetchone()
                
                if profile:
                    # Update existing profile
                    current_score = profile.risk_score
                    current_factors = json.loads(profile.risk_factors) if profile.risk_factors else {}
                    
                    # Calculate new risk score (weighted average)
                    new_score = (current_score * 0.7) + (risk_score * 0.3)
                    
                    # Update risk factors
                    if event_type not in current_factors:
                        current_factors[event_type] = 0
                    current_factors[event_type] += 1
                    
                    db.execute(text("""
                        UPDATE user_risk_profiles 
                        SET risk_score = :risk_score, risk_factors = :risk_factors, last_updated = :last_updated
                        WHERE user_id = :user_id
                    """), {
                        "risk_score": new_score,
                        "risk_factors": json.dumps(current_factors),
                        "last_updated": datetime.utcnow(),
                        "user_id": user_id
                    })
                else:
                    # Create new profile
                    db.execute(text("""
                        INSERT INTO user_risk_profiles 
                        (id, user_id, risk_score, risk_factors)
                        VALUES (:id, :user_id, :risk_score, :risk_factors)
                    """), {
                        "id": self._generate_id(),
                        "user_id": user_id,
                        "risk_score": risk_score,
                        "risk_factors": json.dumps({event_type: 1})
                    })
                
                db.commit()
                
        except Exception as e:
            logger.error(f"Error updating user risk profile: {e}")
    
    async def analyze_payment_security(
        self,
        user_id: str,
        transaction_data: Dict[str, Any],
        ip_address: str,
        user_agent: str
    ) -> Tuple[bool, float, List[str]]:
        """Analyze payment for security risks"""
        if not self.fraud_detection_enabled:
            return True, 0.0, []
        
        try:
            risk_score = 0.0
            risk_factors = []
            
            # Check user risk profile
            user_risk = await self._get_user_risk_score(user_id)
            if user_risk > 0.7:
                risk_score += 0.3
                risk_factors.append("High user risk score")
            
            # Check for suspicious patterns in transaction data
            amount = transaction_data.get("amount", 0)
            currency = transaction_data.get("currency", "USD")
            
            # Check for unusual transaction amounts
            if amount > 1000:  # High value transaction
                risk_score += 0.2
                risk_factors.append("High value transaction")
            
            # Check for rapid transactions
            recent_transactions = await self._get_recent_transactions(user_id, hours=1)
            if len(recent_transactions) > 5:
                risk_score += 0.3
                risk_factors.append("Multiple rapid transactions")
            
            # Check IP address
            if await self._is_suspicious_ip(ip_address):
                risk_score += 0.4
                risk_factors.append("Suspicious IP address")
            
            # Check user agent
            if await self._is_suspicious_user_agent(user_agent):
                risk_score += 0.2
                risk_factors.append("Suspicious user agent")
            
            # Check for geographic anomalies
            if await self._check_geographic_anomaly(user_id, ip_address):
                risk_score += 0.3
                risk_factors.append("Geographic anomaly")
            
            # Determine if transaction should be blocked
            is_safe = risk_score < self.suspicious_activity_threshold
            
            # Record security event if high risk
            if risk_score > 0.5:
                await self.record_security_event(
                    event_type="suspicious_payment",
                    user_id=user_id,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    severity="high" if risk_score > 0.7 else "medium",
                    details={
                        "transaction_data": transaction_data,
                        "risk_factors": risk_factors,
                        "risk_score": risk_score
                    },
                    risk_score=risk_score,
                    action_taken="blocked" if not is_safe else "monitored"
                )
            
            return is_safe, risk_score, risk_factors
            
        except Exception as e:
            logger.error(f"Error analyzing payment security: {e}")
            return False, 1.0, ["Analysis error"]
    
    async def _get_user_risk_score(self, user_id: str) -> float:
        """Get user's current risk score"""
        try:
            with self.SessionLocal() as db:
                result = db.execute(text("""
                    SELECT risk_score FROM user_risk_profiles WHERE user_id = :user_id
                """), {"user_id": user_id})
                
                profile = result.fetchone()
                return profile.risk_score if profile else 0.0
                
        except Exception as e:
            logger.error(f"Error getting user risk score: {e}")
            return 0.0
    
    async def _get_recent_transactions(self, user_id: str, hours: int = 1) -> List[Dict[str, Any]]:
        """Get recent transactions for user"""
        # This would typically query a transactions table
        # For now, return empty list
        return []
    
    async def _is_suspicious_ip(self, ip_address: str) -> bool:
        """Check if IP address is suspicious"""
        try:
            # Check if IP is in blacklist
            with self.SessionLocal() as db:
                result = db.execute(text("""
                    SELECT id FROM ip_blacklist 
                    WHERE ip_address = :ip_address AND is_active = TRUE
                    AND (expires_at IS NULL OR expires_at > :now)
                """), {
                    "ip_address": ip_address,
                    "now": datetime.utcnow()
                })
                
                if result.fetchone():
                    return True
            
            # Check if IP is in suspicious ranges
            ip_obj = ipaddress.ip_address(ip_address)
            for suspicious_range in self.risk_factors["suspicious_ips"]:
                if ip_obj in ipaddress.ip_network(suspicious_range):
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking suspicious IP: {e}")
            return False
    
    async def _is_suspicious_user_agent(self, user_agent: str) -> bool:
        """Check if user agent is suspicious"""
        user_agent_lower = user_agent.lower()
        
        for suspicious in self.risk_factors["suspicious_user_agents"]:
            if suspicious in user_agent_lower:
                return True
        
        return False
    
    async def _check_geographic_anomaly(self, user_id: str, ip_address: str) -> bool:
        """Check for geographic anomalies"""
        # This would typically use a geolocation service
        # For now, return False
        return False
    
    async def validate_payment_webhook(
        self,
        payload: str,
        signature: str,
        timestamp: str
    ) -> bool:
        """Validate payment webhook signature"""
        try:
            if not self.payment_webhook_secret:
                logger.warning("Payment webhook secret not configured")
                return False
            
            # Check timestamp (prevent replay attacks)
            webhook_time = int(timestamp)
            current_time = int(time.time())
            
            if abs(current_time - webhook_time) > 300:  # 5 minutes tolerance
                logger.warning("Webhook timestamp too old")
                return False
            
            # Verify signature
            expected_signature = hmac.new(
                self.payment_webhook_secret.encode(),
                f"{timestamp}.{payload}".encode(),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(signature, expected_signature)
            
        except Exception as e:
            logger.error(f"Error validating payment webhook: {e}")
            return False
    
    async def scan_input_for_threats(self, input_data: str) -> Tuple[bool, List[str]]:
        """Scan input data for security threats"""
        threats = []
        
        try:
            input_lower = input_data.lower()
            
            # Check for SQL injection
            for pattern in self.suspicious_patterns["sql_injection"]:
                if re.search(pattern, input_lower, re.IGNORECASE):
                    threats.append("SQL injection attempt")
                    break
            
            # Check for XSS
            for pattern in self.suspicious_patterns["xss_attack"]:
                if re.search(pattern, input_lower, re.IGNORECASE):
                    threats.append("XSS attack attempt")
                    break
            
            # Check for path traversal
            for pattern in self.suspicious_patterns["path_traversal"]:
                if re.search(pattern, input_lower, re.IGNORECASE):
                    threats.append("Path traversal attempt")
                    break
            
            # Check for command injection
            for pattern in self.suspicious_patterns["command_injection"]:
                if re.search(pattern, input_lower, re.IGNORECASE):
                    threats.append("Command injection attempt")
                    break
            
            return len(threats) == 0, threats
            
        except Exception as e:
            logger.error(f"Error scanning input for threats: {e}")
            return False, ["Scan error"]
    
    async def get_security_events(
        self,
        user_id: str = None,
        event_type: str = None,
        severity: str = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get security events with filtering"""
        try:
            with self.SessionLocal() as db:
                query = "SELECT * FROM security_events WHERE 1=1"
                params = {}
                
                if user_id:
                    query += " AND user_id = :user_id"
                    params["user_id"] = user_id
                
                if event_type:
                    query += " AND event_type = :event_type"
                    params["event_type"] = event_type
                
                if severity:
                    query += " AND severity = :severity"
                    params["severity"] = severity
                
                query += " ORDER BY timestamp DESC LIMIT :limit OFFSET :offset"
                params.update({"limit": limit, "offset": offset})
                
                result = db.execute(text(query), params)
                events = [dict(row) for row in result.fetchall()]
                
                return events
                
        except Exception as e:
            logger.error(f"Error getting security events: {e}")
            return []
    
    async def get_fraud_alerts(
        self,
        user_id: str = None,
        status: str = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get fraud alerts"""
        try:
            with self.SessionLocal() as db:
                query = "SELECT * FROM fraud_alerts WHERE 1=1"
                params = {}
                
                if user_id:
                    query += " AND user_id = :user_id"
                    params["user_id"] = user_id
                
                if status:
                    query += " AND status = :status"
                    params["status"] = status
                
                query += " ORDER BY created_at DESC LIMIT :limit OFFSET :offset"
                params.update({"limit": limit, "offset": offset})
                
                result = db.execute(text(query), params)
                alerts = [dict(row) for row in result.fetchall()]
                
                return alerts
                
        except Exception as e:
            logger.error(f"Error getting fraud alerts: {e}")
            return []

# Global security service instance
security_service = SecurityService()
