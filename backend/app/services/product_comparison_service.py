"""
Product Comparison Service
Handles product comparison functionality
"""
import structlog
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_
import uuid

from app.models.marketplace_db import ProductComparison, Product

logger = structlog.get_logger()

class ProductComparisonService:
    """Service for product comparisons"""
    
    def __init__(self, db: Session):
        self.db = db
        self.logger = logger
    
    def create_comparison(
        self,
        user_id: int,
        name: str,
        product_ids: List[int]
    ) -> ProductComparison:
        """
        Create product comparison
        
        Args:
            user_id: User ID
            name: Comparison name
            product_ids: List of product IDs to compare
            
        Returns:
            Created comparison
        """
        try:
            if len(product_ids) < 2:
                raise ValueError("Need at least 2 products to compare")
            if len(product_ids) > 4:
                raise ValueError("Can compare maximum 4 products")
            
            # Verify products exist
            products = self.db.query(Product).filter(
                Product.id.in_(product_ids)
            ).all()
            
            if len(products) != len(product_ids):
                raise ValueError("One or more products not found")
            
            comparison = ProductComparison(
                user_id=user_id,
                name=name,
                product_ids=product_ids,
                share_token=str(uuid.uuid4()),
                comparison_data=self._generate_comparison_data(products)
            )
            
            self.db.add(comparison)
            self.db.commit()
            self.db.refresh(comparison)
            
            return comparison
            
        except Exception as e:
            self.db.rollback()
            self.logger.error(f"Error creating comparison: {e}")
            raise
    
    def get_comparison(self, comparison_id: int, user_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """Get comparison details"""
        try:
            query = self.db.query(ProductComparison).filter(
                ProductComparison.id == comparison_id
            )
            
            if user_id:
                query = query.filter(ProductComparison.user_id == user_id)
            else:
                query = query.filter(ProductComparison.is_public == True)
            
            comparison = query.first()
            if not comparison:
                return None
            
            # Increment view count
            comparison.view_count += 1
            comparison.last_viewed_at = datetime.utcnow()
            self.db.commit()
            
            # Get products
            products = self.db.query(Product).filter(
                Product.id.in_(comparison.product_ids)
            ).all()
            
            return {
                "id": comparison.id,
                "name": comparison.name,
                "product_ids": comparison.product_ids,
                "products": [self._product_to_dict(p) for p in products],
                "comparison_data": comparison.comparison_data,
                "share_token": comparison.share_token,
                "is_public": comparison.is_public,
                "view_count": comparison.view_count,
                "created_at": comparison.created_at.isoformat() if comparison.created_at else None
            }
            
        except Exception as e:
            self.logger.error(f"Error getting comparison: {e}")
            return None
    
    def get_comparison_by_token(self, share_token: str) -> Optional[Dict[str, Any]]:
        """Get comparison by share token"""
        comparison = self.db.query(ProductComparison).filter(
            ProductComparison.share_token == share_token
        ).first()
        
        if not comparison:
            return None
        
        return self.get_comparison(comparison.id)
    
    def _generate_comparison_data(self, products: List[Product]) -> Dict[str, Any]:
        """Generate comparison data from products"""
        return {
            "price_comparison": {
                "min": min(p.price for p in products),
                "max": max(p.price for p in products),
                "average": sum(p.price for p in products) / len(products)
            },
            "rating_comparison": {
                "min": min(p.rating for p in products),
                "max": max(p.rating for p in products),
                "average": sum(p.rating for p in products) / len(products)
            },
            "features": {
                p.id: p.features or [] for p in products
            },
            "specifications": {
                p.id: p.specifications or {} for p in products
            },
            "generated_at": datetime.utcnow().isoformat()
        }
    
    def _product_to_dict(self, product: Product) -> Dict[str, Any]:
        """Convert product to dictionary"""
        return {
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "original_price": product.original_price,
            "rating": product.rating,
            "review_count": product.review_count,
            "images": product.images or [],
            "features": product.features or [],
            "specifications": product.specifications or {}
        }
    
    def get_user_comparisons(self, user_id: int) -> List[Dict[str, Any]]:
        """Get user's comparisons"""
        comparisons = self.db.query(ProductComparison).filter(
            ProductComparison.user_id == user_id
        ).order_by(ProductComparison.created_at.desc()).all()
        
        return [
            {
                "id": c.id,
                "name": c.name,
                "product_ids": c.product_ids,
                "product_count": len(c.product_ids),
                "view_count": c.view_count,
                "created_at": c.created_at.isoformat() if c.created_at else None
            }
            for c in comparisons
        ]
    
    def delete_comparison(self, comparison_id: int, user_id: int) -> bool:
        """Delete comparison"""
        try:
            comparison = self.db.query(ProductComparison).filter(
                and_(
                    ProductComparison.id == comparison_id,
                    ProductComparison.user_id == user_id
                )
            ).first()
            
            if not comparison:
                return False
            
            self.db.delete(comparison)
            self.db.commit()
            return True
            
        except Exception as e:
            self.db.rollback()
            self.logger.error(f"Error deleting comparison: {e}")
            return False

# Global service instance (will be initialized with db session)
product_comparison_service = None

