"""
Transaction Categorization Service
AI-powered transaction categorization and classification
"""
import structlog
from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio

logger = structlog.get_logger()

class TransactionCategorizationService:
    """Service for categorizing transactions using AI/ML"""
    
    def __init__(self):
        self.logger = logger
        # In real app, this would load ML models or connect to AI service
    
    async def categorize_transaction(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """
        Categorize a single transaction
        
        Args:
            transaction: Transaction data with description, amount, etc.
            
        Returns:
            Categorization result with category, subcategory, confidence
        """
        try:
            description = transaction.get("description", "").lower()
            amount = abs(transaction.get("amount", 0))
            merchant = transaction.get("merchant", "").lower()
            
            # In real app, this would use:
            # - Machine learning models (NLP)
            # - Rule-based classification
            # - Merchant database lookup
            # - Historical pattern matching
            
            # Mock categorization based on keywords
            category, subcategory, confidence = self._classify_by_keywords(description, merchant, amount)
            
            result = {
                "transaction_id": transaction.get("id"),
                "suggested_category": category,
                "suggested_subcategory": subcategory,
                "confidence": confidence,
                "reasoning": f"Based on description keywords and merchant information",
                "alternative_categories": self._get_alternatives(category, confidence)
            }
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error categorizing transaction: {e}")
            raise
    
    async def categorize_bulk(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Categorize multiple transactions
        
        Args:
            transactions: List of transaction data
            
        Returns:
            List of categorization results
        """
        try:
            results = []
            for transaction in transactions:
                result = await self.categorize_transaction(transaction)
                results.append(result)
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error in bulk categorization: {e}")
            raise
    
    def _classify_by_keywords(self, description: str, merchant: str, amount: float) -> tuple:
        """Classify transaction using keyword matching"""
        # Food & Dining
        food_keywords = ["restaurant", "cafe", "food", "grocery", "pizza", "burger", "starbucks", "mcdonald"]
        if any(keyword in description or keyword in merchant for keyword in food_keywords):
            return "food_dining", "restaurants", 0.85
        
        # Transportation
        transport_keywords = ["uber", "lyft", "gas", "fuel", "parking", "toll", "taxi", "metro"]
        if any(keyword in description or keyword in merchant for keyword in transport_keywords):
            return "transportation", "gas", 0.90
        
        # Housing
        housing_keywords = ["rent", "mortgage", "apartment", "housing", "utilities", "electric", "water"]
        if any(keyword in description or keyword in merchant for keyword in housing_keywords):
            return "housing", "rent", 0.95
        
        # Shopping
        shopping_keywords = ["amazon", "walmart", "target", "store", "shop", "purchase"]
        if any(keyword in description or keyword in merchant for keyword in shopping_keywords):
            return "shopping", "general", 0.75
        
        # Entertainment
        entertainment_keywords = ["netflix", "spotify", "movie", "cinema", "theater", "game"]
        if any(keyword in description or keyword in merchant for keyword in entertainment_keywords):
            return "entertainment", "subscriptions", 0.80
        
        # Healthcare
        healthcare_keywords = ["pharmacy", "hospital", "doctor", "medical", "cvs", "walgreens"]
        if any(keyword in description or keyword in merchant for keyword in healthcare_keywords):
            return "healthcare", "medical", 0.85
        
        # Default
        return "other", None, 0.50
    
    def _get_alternatives(self, category: str, confidence: float) -> List[Dict[str, Any]]:
        """Get alternative category suggestions"""
        if confidence > 0.8:
            return []
        
        alternatives = {
            "food_dining": [{"category": "shopping", "confidence": 0.3}],
            "shopping": [{"category": "food_dining", "confidence": 0.25}],
            "transportation": [{"category": "shopping", "confidence": 0.2}],
            "other": [
                {"category": "shopping", "confidence": 0.4},
                {"category": "food_dining", "confidence": 0.3}
            ]
        }
        
        return alternatives.get(category, [])
    
    async def learn_from_user_corrections(self, transaction_id: str, correct_category: str, user_id: str):
        """
        Learn from user corrections to improve categorization
        
        Args:
            transaction_id: Transaction that was corrected
            correct_category: Category user selected
            user_id: User ID for personalization
        """
        try:
            self.logger.info(f"Learning from correction: transaction {transaction_id} -> {correct_category}")
            
            # In real app, this would:
            # - Update user-specific ML model
            # - Store correction for training
            # - Update merchant mappings
            
            await asyncio.sleep(0.1)
            
        except Exception as e:
            self.logger.error(f"Error learning from correction: {e}")
            raise
    
    async def suggest_category_for_merchant(self, merchant: str, user_id: Optional[str] = None) -> Optional[str]:
        """
        Suggest category based on merchant name
        
        Args:
            merchant: Merchant name
            user_id: Optional user ID for personalization
            
        Returns:
            Suggested category or None
        """
        try:
            merchant_lower = merchant.lower()
            
            # In real app, use merchant database or ML model
            # For now, use keyword matching
            category, _, confidence = self._classify_by_keywords(merchant_lower, merchant_lower, 0)
            
            if confidence > 0.7:
                return category
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error suggesting category for merchant: {e}")
            return None

