from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import structlog

from app.database import get_db
from app.services.inventory_service import InventoryService
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.models.inventory import InventoryOperationType, AlertType, AlertStatus

logger = structlog.get_logger()
router = APIRouter()

# Pydantic models
class StockOperation(BaseModel):
    product_id: int
    operation_type: InventoryOperationType
    quantity: int
    notes: Optional[str] = None
    reference_number: Optional[str] = None

class InventoryUpdate(BaseModel):
    low_stock_threshold: Optional[int] = None
    reorder_point: Optional[int] = None
    max_stock: Optional[int] = None

class AlertUpdate(BaseModel):
    status: AlertStatus
    resolution_notes: Optional[str] = None

# Inventory endpoints
@router.get("/", response_model=List[dict])
async def get_inventory(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get inventory list"""
    inventory_service = InventoryService(db)
    inventory_items = inventory_service.get_inventory_list(page, limit)
    
    return [
        {
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product.name if item.product else None,
            "current_stock": item.current_stock,
            "reserved_stock": item.reserved_stock,
            "available_stock": item.available_stock,
            "low_stock_threshold": item.low_stock_threshold,
            "reorder_point": item.reorder_point,
            "max_stock": item.max_stock,
            "last_updated": item.last_updated.isoformat() if item.last_updated else None
        }
        for item in inventory_items
    ]

@router.get("/{product_id}", response_model=dict)
async def get_inventory_item(
    product_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific inventory item"""
    inventory_service = InventoryService(db)
    inventory_item = inventory_service.get_inventory_by_product_id(product_id)
    
    if not inventory_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    return {
        "id": inventory_item.id,
        "product_id": inventory_item.product_id,
        "product_name": inventory_item.product.name if inventory_item.product else None,
        "current_stock": inventory_item.current_stock,
        "reserved_stock": inventory_item.reserved_stock,
        "available_stock": inventory_item.available_stock,
        "low_stock_threshold": inventory_item.low_stock_threshold,
        "reorder_point": inventory_item.reorder_point,
        "max_stock": inventory_item.max_stock,
        "last_updated": inventory_item.last_updated.isoformat() if inventory_item.last_updated else None,
        "last_stock_in": inventory_item.last_stock_in.isoformat() if inventory_item.last_stock_in else None,
        "last_stock_out": inventory_item.last_stock_out.isoformat() if inventory_item.last_stock_out else None
    }

@router.put("/{product_id}", response_model=dict)
async def update_inventory_settings(
    product_id: int,
    settings: InventoryUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update inventory settings"""
    inventory_service = InventoryService(db)
    updated_item = inventory_service.update_inventory_settings(
        product_id,
        settings.dict(exclude_unset=True)
    )
    
    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    return {
        "message": "Inventory settings updated successfully",
        "inventory": {
            "id": updated_item.id,
            "product_id": updated_item.product_id,
            "low_stock_threshold": updated_item.low_stock_threshold,
            "reorder_point": updated_item.reorder_point,
            "max_stock": updated_item.max_stock
        }
    }

# Stock operations
@router.post("/operations", response_model=dict)
async def perform_stock_operation(
    operation: StockOperation,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Perform stock operation"""
    try:
        inventory_service = InventoryService(db)
        result = inventory_service.perform_stock_operation(
            operation.product_id,
            operation.operation_type,
            operation.quantity,
            current_user.id,
            operation.notes,
            operation.reference_number
        )
        
        return {
            "message": "Stock operation performed successfully",
            "operation": {
                "id": result.id,
                "operation_type": result.operation_type,
                "quantity": result.quantity,
                "previous_stock": result.previous_stock,
                "new_stock": result.new_stock,
                "created_at": result.created_at.isoformat()
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/operations", response_model=List[dict])
async def get_stock_operations(
    product_id: Optional[int] = Query(None),
    operation_type: Optional[InventoryOperationType] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get stock operations history"""
    inventory_service = InventoryService(db)
    operations = inventory_service.get_stock_operations(
        product_id=product_id,
        operation_type=operation_type,
        page=page,
        limit=limit
    )
    
    return [
        {
            "id": op.id,
            "product_id": op.inventory.product_id,
            "product_name": op.inventory.product.name if op.inventory.product else None,
            "operation_type": op.operation_type,
            "quantity": op.quantity,
            "previous_stock": op.previous_stock,
            "new_stock": op.new_stock,
            "notes": op.notes,
            "reference_number": op.reference_number,
            "created_at": op.created_at.isoformat()
        }
        for op in operations
    ]

# Alerts
@router.get("/alerts", response_model=List[dict])
async def get_alerts(
    status: Optional[AlertStatus] = Query(None),
    alert_type: Optional[AlertType] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get inventory alerts"""
    inventory_service = InventoryService(db)
    alerts = inventory_service.get_alerts(
        status=status,
        alert_type=alert_type,
        page=page,
        limit=limit
    )
    
    return [
        {
            "id": alert.id,
            "product_id": alert.inventory.product_id,
            "product_name": alert.inventory.product.name if alert.inventory.product else None,
            "alert_type": alert.alert_type,
            "status": alert.status,
            "message": alert.message,
            "severity": alert.severity,
            "created_at": alert.created_at.isoformat(),
            "acknowledged_at": alert.acknowledged_at.isoformat() if alert.acknowledged_at else None,
            "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None
        }
        for alert in alerts
    ]

@router.put("/alerts/{alert_id}", response_model=dict)
async def update_alert(
    alert_id: int,
    alert_update: AlertUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update alert status"""
    inventory_service = InventoryService(db)
    updated_alert = inventory_service.update_alert(
        alert_id,
        alert_update.status,
        current_user.id,
        alert_update.resolution_notes
    )
    
    if not updated_alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    return {
        "message": "Alert updated successfully",
        "alert": {
            "id": updated_alert.id,
            "status": updated_alert.status,
            "acknowledged_at": updated_alert.acknowledged_at.isoformat() if updated_alert.acknowledged_at else None,
            "resolved_at": updated_alert.resolved_at.isoformat() if updated_alert.resolved_at else None
        }
    }

# Low stock report
@router.get("/reports/low-stock", response_model=List[dict])
async def get_low_stock_report(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get low stock report"""
    inventory_service = InventoryService(db)
    low_stock_items = inventory_service.get_low_stock_items()
    
    return [
        {
            "product_id": item.product_id,
            "product_name": item.product.name if item.product else None,
            "current_stock": item.current_stock,
            "low_stock_threshold": item.low_stock_threshold,
            "reorder_point": item.reorder_point,
            "stock_status": "critical" if item.current_stock <= item.reorder_point else "low"
        }
        for item in low_stock_items
    ]

# Stock summary
@router.get("/reports/summary", response_model=dict)
async def get_inventory_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get inventory summary"""
    inventory_service = InventoryService(db)
    summary = inventory_service.get_inventory_summary()
    
    return {
        "total_products": summary["total_products"],
        "total_stock_value": summary["total_stock_value"],
        "low_stock_items": summary["low_stock_items"],
        "out_of_stock_items": summary["out_of_stock_items"],
        "overstock_items": summary["overstock_items"],
        "active_alerts": summary["active_alerts"]
    }
