from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import structlog

from app.models.inventory import (
    Inventory, InventoryOperation, InventoryAlert, Supplier, PurchaseOrder,
    PurchaseOrderItem, StockTransfer, StockTransferItem,
    InventoryOperationType, AlertType, AlertStatus
)
from app.models.marketplace_db import Product

logger = structlog.get_logger()

class InventoryService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_inventory_list(self, page: int = 1, limit: int = 20) -> List[Inventory]:
        """Get inventory list with pagination"""
        offset = (page - 1) * limit
        return self.db.query(Inventory).offset(offset).limit(limit).all()
    
    def get_inventory_by_product_id(self, product_id: int) -> Optional[Inventory]:
        """Get inventory by product ID"""
        return self.db.query(Inventory).filter(Inventory.product_id == product_id).first()
    
    def update_inventory_settings(self, product_id: int, settings: Dict[str, Any]) -> Optional[Inventory]:
        """Update inventory settings"""
        inventory = self.get_inventory_by_product_id(product_id)
        if not inventory:
            return None
        
        for key, value in settings.items():
            if hasattr(inventory, key):
                setattr(inventory, key, value)
        
        inventory.last_updated = datetime.utcnow()
        self.db.commit()
        self.db.refresh(inventory)
        
        return inventory
    
    def perform_stock_operation(
        self,
        product_id: int,
        operation_type: InventoryOperationType,
        quantity: int,
        user_id: int,
        notes: Optional[str] = None,
        reference_number: Optional[str] = None
    ) -> InventoryOperation:
        """Perform stock operation"""
        inventory = self.get_inventory_by_product_id(product_id)
        if not inventory:
            # Create inventory record if it doesn't exist
            inventory = Inventory(
                product_id=product_id,
                current_stock=0,
                reserved_stock=0,
                available_stock=0
            )
            self.db.add(inventory)
            self.db.commit()
            self.db.refresh(inventory)
        
        previous_stock = inventory.current_stock
        
        # Update stock based on operation type
        if operation_type == InventoryOperationType.stock_in:
            inventory.current_stock += quantity
            inventory.last_stock_in = datetime.utcnow()
        elif operation_type == InventoryOperationType.stock_out:
            if inventory.current_stock < quantity:
                raise ValueError("Insufficient stock")
            inventory.current_stock -= quantity
            inventory.last_stock_out = datetime.utcnow()
        elif operation_type == InventoryOperationType.adjustment:
            inventory.current_stock = quantity
        elif operation_type == InventoryOperationType.return_stock:
            inventory.current_stock += quantity
        elif operation_type == InventoryOperationType.damage:
            if inventory.current_stock < quantity:
                raise ValueError("Insufficient stock")
            inventory.current_stock -= quantity
        
        # Update available stock
        inventory.available_stock = inventory.current_stock - inventory.reserved_stock
        inventory.last_updated = datetime.utcnow()
        
        # Create operation record
        operation = InventoryOperation(
            inventory_id=inventory.id,
            operation_type=operation_type,
            quantity=quantity,
            previous_stock=previous_stock,
            new_stock=inventory.current_stock,
            user_id=user_id,
            notes=notes,
            reference_number=reference_number
        )
        
        self.db.add(operation)
        self.db.commit()
        self.db.refresh(operation)
        
        # Check for alerts
        self._check_alerts(inventory)
        
        return operation
    
    def get_stock_operations(
        self,
        product_id: Optional[int] = None,
        operation_type: Optional[InventoryOperationType] = None,
        page: int = 1,
        limit: int = 20
    ) -> List[InventoryOperation]:
        """Get stock operations with filtering"""
        query = self.db.query(InventoryOperation)
        
        if product_id:
            query = query.join(Inventory).filter(Inventory.product_id == product_id)
        
        if operation_type:
            query = query.filter(InventoryOperation.operation_type == operation_type)
        
        offset = (page - 1) * limit
        return query.order_by(desc(InventoryOperation.created_at)).offset(offset).limit(limit).all()
    
    def _check_alerts(self, inventory: Inventory):
        """Check and create alerts for inventory"""
        # Check for low stock
        if inventory.current_stock <= inventory.low_stock_threshold:
            self._create_alert(
                inventory,
                AlertType.low_stock,
                f"Low stock alert: {inventory.current_stock} units remaining",
                "medium"
            )
        
        # Check for out of stock
        if inventory.current_stock == 0:
            self._create_alert(
                inventory,
                AlertType.out_of_stock,
                "Product is out of stock",
                "high"
            )
        
        # Check for overstock
        if inventory.current_stock > inventory.max_stock:
            self._create_alert(
                inventory,
                AlertType.overstock,
                f"Overstock alert: {inventory.current_stock} units (max: {inventory.max_stock})",
                "low"
            )
    
    def _create_alert(
        self,
        inventory: Inventory,
        alert_type: AlertType,
        message: str,
        severity: str = "medium"
    ):
        """Create inventory alert"""
        # Check if alert already exists
        existing_alert = self.db.query(InventoryAlert).filter(
            and_(
                InventoryAlert.inventory_id == inventory.id,
                InventoryAlert.alert_type == alert_type,
                InventoryAlert.status == AlertStatus.active
            )
        ).first()
        
        if not existing_alert:
            alert = InventoryAlert(
                inventory_id=inventory.id,
                alert_type=alert_type,
                message=message,
                severity=severity
            )
            self.db.add(alert)
            self.db.commit()
    
    def get_alerts(
        self,
        status: Optional[AlertStatus] = None,
        alert_type: Optional[AlertType] = None,
        page: int = 1,
        limit: int = 20
    ) -> List[InventoryAlert]:
        """Get inventory alerts with filtering"""
        query = self.db.query(InventoryAlert)
        
        if status:
            query = query.filter(InventoryAlert.status == status)
        
        if alert_type:
            query = query.filter(InventoryAlert.alert_type == alert_type)
        
        offset = (page - 1) * limit
        return query.order_by(desc(InventoryAlert.created_at)).offset(offset).limit(limit).all()
    
    def update_alert(
        self,
        alert_id: int,
        status: AlertStatus,
        user_id: int,
        resolution_notes: Optional[str] = None
    ) -> Optional[InventoryAlert]:
        """Update alert status"""
        alert = self.db.query(InventoryAlert).filter(InventoryAlert.id == alert_id).first()
        if not alert:
            return None
        
        alert.status = status
        alert.updated_at = datetime.utcnow()
        
        if status == AlertStatus.acknowledged:
            alert.acknowledged_by = user_id
            alert.acknowledged_at = datetime.utcnow()
        elif status == AlertStatus.resolved:
            alert.resolved_by = user_id
            alert.resolved_at = datetime.utcnow()
            alert.resolution_notes = resolution_notes
        
        self.db.commit()
        self.db.refresh(alert)
        
        return alert
    
    def get_low_stock_items(self) -> List[Inventory]:
        """Get items with low stock"""
        return self.db.query(Inventory).filter(
            Inventory.current_stock <= Inventory.low_stock_threshold
        ).all()
    
    def get_inventory_summary(self) -> Dict[str, Any]:
        """Get inventory summary"""
        total_products = self.db.query(Inventory).count()
        
        # Calculate total stock value (simplified)
        total_stock_value = 0
        low_stock_items = 0
        out_of_stock_items = 0
        overstock_items = 0
        
        inventory_items = self.db.query(Inventory).all()
        for item in inventory_items:
            # Get product price for value calculation
            product = self.db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                total_stock_value += item.current_stock * product.price
            
            if item.current_stock <= item.low_stock_threshold:
                low_stock_items += 1
            
            if item.current_stock == 0:
                out_of_stock_items += 1
            
            if item.current_stock > item.max_stock:
                overstock_items += 1
        
        active_alerts = self.db.query(InventoryAlert).filter(
            InventoryAlert.status == AlertStatus.active
        ).count()
        
        return {
            "total_products": total_products,
            "total_stock_value": total_stock_value,
            "low_stock_items": low_stock_items,
            "out_of_stock_items": out_of_stock_items,
            "overstock_items": overstock_items,
            "active_alerts": active_alerts
        }
    
    def reserve_stock(self, product_id: int, quantity: int) -> bool:
        """Reserve stock for order"""
        inventory = self.get_inventory_by_product_id(product_id)
        if not inventory or inventory.available_stock < quantity:
            return False
        
        inventory.reserved_stock += quantity
        inventory.available_stock = inventory.current_stock - inventory.reserved_stock
        inventory.last_updated = datetime.utcnow()
        
        self.db.commit()
        return True
    
    def release_stock(self, product_id: int, quantity: int) -> bool:
        """Release reserved stock"""
        inventory = self.get_inventory_by_product_id(product_id)
        if not inventory or inventory.reserved_stock < quantity:
            return False
        
        inventory.reserved_stock -= quantity
        inventory.available_stock = inventory.current_stock - inventory.reserved_stock
        inventory.last_updated = datetime.utcnow()
        
        self.db.commit()
        return True
