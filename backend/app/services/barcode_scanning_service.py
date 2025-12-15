import os
import json
import httpx
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.fitness_db import BarcodeScan
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class BarcodeScanningService:
    def __init__(self):
        self.upc_db_api_key = os.getenv("UPC_DB_API_KEY")
        self.open_food_facts_api = "https://world.openfoodfacts.org/api/v0/product"
        self.usda_api_key = os.getenv("USDA_API_KEY")

    async def scan_barcode(
        self,
        db: Session,
        user_id: int,
        barcode: str
    ) -> Dict[str, Any]:
        """Scan a barcode and retrieve product information"""
        try:
            # Check if already scanned
            existing = db.query(BarcodeScan).filter(
                and_(
                    BarcodeScan.user_id == user_id,
                    BarcodeScan.barcode == barcode
                )
            ).first()

            if existing:
                return {
                    "success": True,
                    "product": self._barcode_scan_to_dict(existing),
                    "cached": True
                }

            # Try multiple sources
            product_data = None
            source = None

            # Try Open Food Facts (free, no API key needed)
            product_data = await self._scan_open_food_facts(barcode)
            if product_data:
                source = "open_food_facts"
            else:
                # Try UPC Database
                product_data = await self._scan_upc_db(barcode)
                if product_data:
                    source = "upc_db"

            if not product_data:
                return {
                    "success": False,
                    "message": "Product not found in any database"
                }

            # Save scan
            barcode_scan = BarcodeScan(
                user_id=user_id,
                barcode=barcode,
                product_name=product_data.get("product_name"),
                brand=product_data.get("brand"),
                nutrition_data=product_data.get("nutrition_data", {}),
                image_url=product_data.get("image_url"),
                source=source
            )

            db.add(barcode_scan)
            db.commit()
            db.refresh(barcode_scan)

            return {
                "success": True,
                "product": self._barcode_scan_to_dict(barcode_scan),
                "cached": False
            }

        except Exception as e:
            logger.error(f"Error scanning barcode: {e}")
            db.rollback()
            return {"success": False, "message": f"Error scanning barcode: {str(e)}"}

    async def _scan_open_food_facts(self, barcode: str) -> Optional[Dict[str, Any]]:
        """Scan using Open Food Facts API"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.open_food_facts_api}/{barcode}.json", timeout=10.0)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == 1 and data.get("product"):
                        product = data["product"]
                        return {
                            "product_name": product.get("product_name") or product.get("product_name_en"),
                            "brand": product.get("brands", "").split(",")[0] if product.get("brands") else None,
                            "nutrition_data": {
                                "calories": product.get("nutriments", {}).get("energy-kcal_100g"),
                                "protein": product.get("nutriments", {}).get("proteins_100g"),
                                "carbs": product.get("nutriments", {}).get("carbohydrates_100g"),
                                "fat": product.get("nutriments", {}).get("fat_100g"),
                                "fiber": product.get("nutriments", {}).get("fiber_100g"),
                                "sugar": product.get("nutriments", {}).get("sugars_100g"),
                                "sodium": product.get("nutriments", {}).get("sodium_100g")
                            },
                            "image_url": product.get("image_url") or product.get("image_front_url")
                        }
        except Exception as e:
            logger.error(f"Error scanning Open Food Facts: {e}")
        return None

    async def _scan_upc_db(self, barcode: str) -> Optional[Dict[str, Any]]:
        """Scan using UPC Database API"""
        try:
            if not self.upc_db_api_key:
                return None

            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://api.upcitemdb.com/prod/trial/lookup",
                    params={"upc": barcode},
                    headers={"Authorization": f"Bearer {self.upc_db_api_key}"},
                    timeout=10.0
                )
                if response.status_code == 200:
                    data = response.json()
                    if data.get("code") == "OK" and data.get("items"):
                        item = data["items"][0]
                        return {
                            "product_name": item.get("title"),
                            "brand": item.get("brand"),
                            "image_url": item.get("images", [None])[0] if item.get("images") else None
                        }
        except Exception as e:
            logger.error(f"Error scanning UPC DB: {e}")
        return None

    async def get_scan_history(
        self,
        db: Session,
        user_id: int,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get user's barcode scan history"""
        try:
            scans = db.query(BarcodeScan).filter(
                BarcodeScan.user_id == user_id
            ).order_by(desc(BarcodeScan.created_at)).limit(limit).all()

            return [self._barcode_scan_to_dict(scan) for scan in scans]

        except Exception as e:
            logger.error(f"Error getting scan history: {e}")
            return []

    def _barcode_scan_to_dict(self, scan: BarcodeScan) -> Dict[str, Any]:
        """Convert barcode scan to dictionary"""
        return {
            "id": scan.id,
            "barcode": scan.barcode,
            "product_name": scan.product_name,
            "brand": scan.brand,
            "nutrition_data": scan.nutrition_data or {},
            "image_url": scan.image_url,
            "source": scan.source,
            "created_at": scan.created_at.isoformat() if scan.created_at else None
        }

# Global service instance
barcode_scanning_service = BarcodeScanningService()

