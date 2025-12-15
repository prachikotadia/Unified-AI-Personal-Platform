"""
Review Analysis Service
Analyzes product reviews using AI and provides insights
"""
import structlog
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from collections import Counter

from app.models.marketplace_db import Review, Product
from app.services.ai_service import ai_service

logger = structlog.get_logger()

class ReviewAnalysisService:
    """Service for analyzing product reviews"""
    
    def __init__(self, db: Session):
        self.db = db
        self.logger = logger
    
    async def analyze_product_reviews(
        self,
        product_id: int,
        limit: int = 50
    ) -> Dict[str, Any]:
        """
        Analyze product reviews
        
        Args:
            product_id: Product ID
            limit: Maximum number of reviews to analyze
            
        Returns:
            Review analysis with insights
        """
        try:
            product = self.db.query(Product).filter(Product.id == product_id).first()
            if not product:
                raise ValueError(f"Product {product_id} not found")
            
            reviews = self.db.query(Review).filter(
                Review.product_id == product_id
            ).limit(limit).all()
            
            if not reviews:
                return {
                    "product_id": product_id,
                    "total_reviews": 0,
                    "analysis": {}
                }
            
            # Basic statistics
            ratings = [r.rating for r in reviews]
            avg_rating = sum(ratings) / len(ratings)
            rating_distribution = Counter(ratings)
            
            # Sentiment analysis
            sentiment = self._calculate_sentiment(ratings)
            
            # Extract themes
            themes = await self._extract_themes(reviews)
            
            # AI analysis
            ai_analysis = await self._ai_analyze_reviews(reviews, product)
            
            return {
                "product_id": product_id,
                "product_name": product.name,
                "total_reviews": len(reviews),
                "average_rating": round(avg_rating, 2),
                "rating_distribution": dict(rating_distribution),
                "sentiment": sentiment,
                "themes": themes,
                "ai_analysis": ai_analysis,
                "helpful_reviews": [r.id for r in reviews if r.helpful_votes > 0],
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error analyzing reviews: {e}")
            return {
                "product_id": product_id,
                "total_reviews": 0,
                "analysis": {}
            }
    
    def _calculate_sentiment(self, ratings: List[int]) -> str:
        """Calculate sentiment from ratings"""
        avg = sum(ratings) / len(ratings)
        if avg >= 4.0:
            return "positive"
        elif avg >= 3.0:
            return "neutral"
        else:
            return "negative"
    
    async def _extract_themes(self, reviews: List[Review]) -> Dict[str, List[str]]:
        """Extract common themes from reviews"""
        # In real app, use NLP to extract themes
        # For now, return mock themes
        return {
            "positive": ["Good quality", "Fast shipping", "Great value"],
            "negative": ["Price could be lower", "Shipping delay"],
            "neutral": ["As expected", "Standard product"]
        }
    
    async def _ai_analyze_reviews(
        self,
        reviews: List[Review],
        product: Product
    ) -> str:
        """Use AI to analyze reviews"""
        try:
            review_summaries = [
                f"Rating: {r.rating}/5 - {r.title or ''}: {r.comment[:150] if r.comment else ''}"
                for r in reviews[:20]
            ]
            
            ai_prompt = f"""
            Analyze these product reviews for: {product.name}
            
            Reviews:
            {chr(10).join(review_summaries)}
            
            Provide:
            1. Overall sentiment summary
            2. Key strengths mentioned
            3. Common complaints
            4. Improvement suggestions
            5. Customer satisfaction insights
            """
            
            return await ai_service.generate_response(ai_prompt, {
                "product": product.name,
                "reviews": len(reviews)
            })
            
        except Exception as e:
            self.logger.error(f"Error in AI review analysis: {e}")
            return "Review analysis unavailable"
    
    def get_review_summary(self, product_id: int) -> Dict[str, Any]:
        """Get review summary statistics"""
        reviews = self.db.query(Review).filter(
            Review.product_id == product_id
        ).all()
        
        if not reviews:
            return {
                "total": 0,
                "average_rating": 0,
                "rating_breakdown": {}
            }
        
        ratings = [r.rating for r in reviews]
        rating_breakdown = Counter(ratings)
        
        return {
            "total": len(reviews),
            "average_rating": round(sum(ratings) / len(ratings), 2),
            "rating_breakdown": dict(rating_breakdown),
            "helpful_count": sum(r.helpful_votes for r in reviews)
        }

# Global service instance (will be initialized with db session)
review_analysis_service = None

