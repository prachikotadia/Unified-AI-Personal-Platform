import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.fitness_db import DeviceConnection, DeviceSync, SyncStatus, DeviceType
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class DeviceSyncService:
    def __init__(self):
        self.sync_providers = {
            "fitbit": os.getenv("FITBIT_CLIENT_ID"),
            "garmin": os.getenv("GARMIN_API_KEY"),
            "apple_health": None,  # Uses HealthKit
            "google_fit": os.getenv("GOOGLE_FIT_API_KEY")
        }

    async def connect_device(
        self,
        db: Session,
        user_id: int,
        device_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Connect a new device"""
        try:
            # Check if device already connected
            existing = db.query(DeviceConnection).filter(
                and_(
                    DeviceConnection.user_id == user_id,
                    DeviceConnection.device_id == device_data.get("device_id")
                )
            ).first()

            if existing:
                return {
                    "success": False,
                    "message": "Device already connected",
                    "device_id": existing.id
                }

            device = DeviceConnection(
                user_id=user_id,
                device_name=device_data.get("device_name"),
                device_type=DeviceType(device_data.get("device_type", "fitness_tracker")),
                manufacturer=device_data.get("manufacturer"),
                model=device_data.get("model"),
                device_id=device_data.get("device_id"),
                connection_status="connected",
                sync_enabled=device_data.get("sync_enabled", True),
                sync_frequency=device_data.get("sync_frequency", "realtime"),
                connection_data=device_data.get("connection_data", {})
            )

            db.add(device)
            db.commit()
            db.refresh(device)

            # Perform initial sync
            if device.sync_enabled:
                await self.sync_device(db, user_id, device.id)

            return {
                "success": True,
                "device": self._device_to_dict(device)
            }

        except Exception as e:
            logger.error(f"Error connecting device: {e}")
            db.rollback()
            return {"success": False, "message": f"Error connecting device: {str(e)}"}

    async def sync_device(
        self,
        db: Session,
        user_id: int,
        device_id: int
    ) -> Dict[str, Any]:
        """Sync data from a device"""
        try:
            device = db.query(DeviceConnection).filter(
                and_(
                    DeviceConnection.id == device_id,
                    DeviceConnection.user_id == user_id
                )
            ).first()

            if not device:
                return {"success": False, "message": "Device not found"}

            # Create sync record
            sync = DeviceSync(
                device_id=device_id,
                sync_type="workout",
                status=SyncStatus.syncing
            )
            db.add(sync)
            db.commit()

            # Perform sync based on device type
            sync_data = await self._perform_sync(device)

            sync.data = sync_data
            sync.status = SyncStatus.completed
            sync.records_synced = len(sync_data.get("records", []))
            sync.completed_at = datetime.utcnow()
            device.last_sync_at = datetime.utcnow()
            db.commit()

            return {
                "success": True,
                "sync_id": sync.id,
                "records_synced": sync.records_synced,
                "data": sync_data
            }

        except Exception as e:
            logger.error(f"Error syncing device: {e}")
            db.rollback()
            return {"success": False, "message": f"Error syncing device: {str(e)}"}

    async def get_user_devices(
        self,
        db: Session,
        user_id: int
    ) -> List[Dict[str, Any]]:
        """Get user's connected devices"""
        try:
            devices = db.query(DeviceConnection).filter(
                DeviceConnection.user_id == user_id
            ).order_by(desc(DeviceConnection.created_at)).all()

            return [self._device_to_dict(device) for device in devices]

        except Exception as e:
            logger.error(f"Error getting devices: {e}")
            return []

    async def disconnect_device(
        self,
        db: Session,
        user_id: int,
        device_id: int
    ) -> Dict[str, Any]:
        """Disconnect a device"""
        try:
            device = db.query(DeviceConnection).filter(
                and_(
                    DeviceConnection.id == device_id,
                    DeviceConnection.user_id == user_id
                )
            ).first()

            if not device:
                return {"success": False, "message": "Device not found"}

            device.connection_status = "disconnected"
            device.sync_enabled = False
            db.commit()

            return {"success": True, "message": "Device disconnected"}

        except Exception as e:
            logger.error(f"Error disconnecting device: {e}")
            db.rollback()
            return {"success": False, "message": f"Error disconnecting device: {str(e)}"}

    async def _perform_sync(self, device: DeviceConnection) -> Dict[str, Any]:
        """Perform actual sync with device"""
        # In production, integrate with device APIs
        # For now, return mock data
        await asyncio.sleep(1)  # Simulate API call

        return {
            "records": [
                {
                    "type": "workout",
                    "date": datetime.utcnow().isoformat(),
                    "data": {
                        "steps": 5000,
                        "calories": 300,
                        "duration": 30
                    }
                }
            ],
            "sync_timestamp": datetime.utcnow().isoformat()
        }

    def _device_to_dict(self, device: DeviceConnection) -> Dict[str, Any]:
        """Convert device to dictionary"""
        return {
            "id": device.id,
            "device_name": device.device_name,
            "device_type": device.device_type.value if hasattr(device.device_type, 'value') else str(device.device_type),
            "manufacturer": device.manufacturer,
            "model": device.model,
            "connection_status": device.connection_status,
            "sync_enabled": device.sync_enabled,
            "last_sync_at": device.last_sync_at.isoformat() if device.last_sync_at else None,
            "battery_level": device.battery_level
        }

# Global service instance
device_sync_service = DeviceSyncService()

