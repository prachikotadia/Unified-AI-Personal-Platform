import os
import json
import uuid
import mimetypes
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from PIL import Image
import io
from app.cache import redis_cache

logger = structlog.get_logger()

class FileStorageService:
    """Service for file upload, storage, and processing"""
    
    def __init__(self):
        self.storage_type = os.getenv("STORAGE_TYPE", "local")  # local or s3
        self.local_storage_path = os.getenv("LOCAL_STORAGE_PATH", "/tmp/uploads")
        self.s3_bucket = os.getenv("S3_BUCKET")
        self.max_file_size = 100 * 1024 * 1024  # 100MB
        self.allowed_image_types = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
        self.allowed_video_types = {".mp4", ".avi", ".mov", ".mkv", ".webm"}
        self.allowed_document_types = {".pdf", ".doc", ".docx", ".txt", ".xls", ".xlsx"}
        
        # Ensure local storage directory exists
        if self.storage_type == "local":
            os.makedirs(self.local_storage_path, exist_ok=True)
    
    async def upload_file(
        self,
        file_data: bytes,
        filename: str,
        file_type: Optional[str] = None,
        compress: bool = True
    ) -> Dict[str, Any]:
        """Upload and store a file"""
        try:
            # Validate file
            validation = self._validate_file(file_data, filename)
            if not validation["valid"]:
                return {"success": False, "message": validation["message"]}
            
            # Generate unique filename
            file_ext = os.path.splitext(filename)[1].lower()
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            
            # Compress if needed
            if compress and file_ext in self.allowed_image_types:
                file_data = await self._compress_image(file_data)
            
            # Store file
            if self.storage_type == "local":
                file_path = os.path.join(self.local_storage_path, unique_filename)
                with open(file_path, "wb") as f:
                    f.write(file_data)
                file_url = f"/uploads/{unique_filename}"
            else:
                # S3 upload (in production)
                file_url = await self._upload_to_s3(file_data, unique_filename)
            
            return {
                "success": True,
                "file_url": file_url,
                "filename": unique_filename,
                "file_size": len(file_data),
                "file_type": file_type or mimetypes.guess_type(filename)[0]
            }
            
        except Exception as e:
            logger.error(f"Error uploading file: {e}")
            return {"success": False, "message": f"Error uploading file: {str(e)}"}
    
    async def process_image(
        self,
        image_data: bytes,
        operations: List[str] = None
    ) -> bytes:
        """Process image (resize, crop, etc.)"""
        try:
            image = Image.open(io.BytesIO(image_data))
            
            operations = operations or []
            
            for op in operations:
                if op.startswith("resize:"):
                    size = tuple(map(int, op.split(":")[1].split("x")))
                    image = image.resize(size, Image.Resampling.LANCZOS)
                elif op == "thumbnail":
                    image.thumbnail((800, 800), Image.Resampling.LANCZOS)
            
            # Convert back to bytes
            output = io.BytesIO()
            image.save(output, format=image.format or "JPEG")
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"Error processing image: {e}")
            return image_data
    
    def _validate_file(self, file_data: bytes, filename: str) -> Dict[str, Any]:
        """Validate file"""
        if len(file_data) > self.max_file_size:
            return {
                "valid": False,
                "message": f"File size exceeds maximum allowed ({self.max_file_size / 1024 / 1024}MB)"
            }
        
        file_ext = os.path.splitext(filename)[1].lower()
        allowed = self.allowed_image_types | self.allowed_video_types | self.allowed_document_types
        
        if file_ext not in allowed:
            return {
                "valid": False,
                "message": f"File type {file_ext} not allowed"
            }
        
        return {"valid": True}
    
    async def _compress_image(self, image_data: bytes) -> bytes:
        """Compress image"""
        try:
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary
            if image.mode in ("RGBA", "P"):
                background = Image.new("RGB", image.size, (255, 255, 255))
                if image.mode == "P":
                    image = image.convert("RGBA")
                background.paste(image, mask=image.split()[-1] if image.mode == "RGBA" else None)
                image = background
            
            # Compress
            output = io.BytesIO()
            image.save(output, format="JPEG", quality=85, optimize=True)
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"Error compressing image: {e}")
            return image_data
    
    async def _upload_to_s3(self, file_data: bytes, filename: str) -> str:
        """Upload file to S3 (placeholder)"""
        # In production, use boto3
        return f"s3://{self.s3_bucket}/{filename}"
    
    async def delete_file(self, file_url: str) -> Dict[str, Any]:
        """Delete a file"""
        try:
            if self.storage_type == "local":
                filename = file_url.replace("/uploads/", "")
                file_path = os.path.join(self.local_storage_path, filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
                    return {"success": True, "message": "File deleted"}
            else:
                # S3 deletion (in production)
                pass
            
            return {"success": True, "message": "File deleted"}
            
        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            return {"success": False, "message": f"Error: {str(e)}"}

# Global service instance
file_storage_service = FileStorageService()

