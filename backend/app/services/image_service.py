import os
import uuid
import hashlib
from typing import List, Optional, Tuple
from pathlib import Path
import aiofiles
import aiofiles.os
from PIL import Image, ImageOps
import structlog
from fastapi import UploadFile, HTTPException
import boto3
from botocore.exceptions import ClientError
import cloudinary
import cloudinary.uploader
import cloudinary.api
import io

logger = structlog.get_logger()

class ImageService:
    def __init__(self):
        self.storage_type = os.getenv("IMAGE_STORAGE", "local")  # local, s3, cloudinary
        self.upload_dir = os.getenv("UPLOAD_DIR", "uploads")
        self.max_file_size = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB
        self.allowed_extensions = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
        self.image_sizes = {
            "thumbnail": (150, 150),
            "small": (300, 300),
            "medium": (600, 600),
            "large": (1200, 1200),
            "original": None
        }
        
        # Ensure upload directory exists
        Path(self.upload_dir).mkdir(parents=True, exist_ok=True)
        
        # Initialize cloud storage clients
        self._init_cloud_storage()
    
    def _init_cloud_storage(self):
        """Initialize cloud storage clients based on configuration"""
        if self.storage_type == "s3":
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                region_name=os.getenv("AWS_REGION", "us-east-1")
            )
            self.s3_bucket = os.getenv("AWS_S3_BUCKET")
            
        elif self.storage_type == "cloudinary":
            cloudinary.config(
                cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
                api_key=os.getenv("CLOUDINARY_API_KEY"),
                api_secret=os.getenv("CLOUDINARY_API_SECRET")
            )
    
    async def validate_image(self, file: UploadFile) -> Tuple[bool, str]:
        """Validate uploaded image file"""
        # Check file size
        if file.size and file.size > self.max_file_size:
            return False, f"File size exceeds maximum allowed size of {self.max_file_size} bytes"
        
        # Check file extension
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in self.allowed_extensions:
            return False, f"File type {file_extension} is not allowed. Allowed types: {', '.join(self.allowed_extensions)}"
        
        # Check if it's actually an image
        try:
            content = await file.read()
            await file.seek(0)  # Reset file pointer
            
            image = Image.open(io.BytesIO(content))
            image.verify()
            return True, "Image is valid"
        except Exception as e:
            return False, f"Invalid image file: {str(e)}"
    
    async def process_image(self, image_path: str, size_name: str, size: Tuple[int, int]) -> str:
        """Process image to create different sizes"""
        try:
            with Image.open(image_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                if size:
                    # Resize image maintaining aspect ratio
                    img = ImageOps.fit(img, size, Image.Resampling.LANCZOS)
                
                # Generate output path
                output_path = f"{image_path}_{size_name}.jpg"
                img.save(output_path, "JPEG", quality=85, optimize=True)
                
                return output_path
        except Exception as e:
            logger.error(f"Error processing image {image_path}: {e}")
            return image_path
    
    async def upload_to_local(self, file: UploadFile, folder: str = "products") -> List[str]:
        """Upload image to local storage"""
        try:
            # Generate unique filename
            file_extension = Path(file.filename).suffix.lower()
            filename = f"{uuid.uuid4().hex}{file_extension}"
            
            # Create folder path
            folder_path = Path(self.upload_dir) / folder
            folder_path.mkdir(parents=True, exist_ok=True)
            
            # Save original file
            file_path = folder_path / filename
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # Process different sizes
            urls = []
            for size_name, size in self.image_sizes.items():
                if size_name == "original":
                    processed_path = str(file_path)
                else:
                    processed_path = await self.process_image(str(file_path), size_name, size)
                
                # Generate URL
                url = f"/uploads/{folder}/{Path(processed_path).name}"
                urls.append(url)
            
            return urls
            
        except Exception as e:
            logger.error(f"Error uploading to local storage: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload image")
    
    async def upload_to_s3(self, file: UploadFile, folder: str = "products") -> List[str]:
        """Upload image to AWS S3"""
        try:
            # Generate unique filename
            file_extension = Path(file.filename).suffix.lower()
            filename = f"{uuid.uuid4().hex}{file_extension}"
            
            # Save original file temporarily
            temp_path = Path(self.upload_dir) / "temp" / filename
            temp_path.parent.mkdir(parents=True, exist_ok=True)
            
            async with aiofiles.open(temp_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # Upload original and processed versions
            urls = []
            for size_name, size in self.image_sizes.items():
                if size_name == "original":
                    processed_path = temp_path
                else:
                    processed_path = await self.process_image(str(temp_path), size_name, size)
                
                # Upload to S3
                s3_key = f"{folder}/{size_name}/{filename}"
                with open(processed_path, 'rb') as f:
                    self.s3_client.upload_fileobj(f, self.s3_bucket, s3_key, ExtraArgs={
                        'ContentType': 'image/jpeg',
                        'ACL': 'public-read'
                    })
                
                # Generate URL
                url = f"https://{self.s3_bucket}.s3.amazonaws.com/{s3_key}"
                urls.append(url)
                
                # Clean up processed file
                if size_name != "original":
                    os.remove(processed_path)
            
            # Clean up temp file
            os.remove(temp_path)
            
            return urls
            
        except Exception as e:
            logger.error(f"Error uploading to S3: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload image to S3")
    
    async def upload_to_cloudinary(self, file: UploadFile, folder: str = "products") -> List[str]:
        """Upload image to Cloudinary"""
        try:
            # Generate unique filename
            file_extension = Path(file.filename).suffix.lower()
            filename = f"{uuid.uuid4().hex}{file_extension}"
            
            # Save file temporarily
            temp_path = Path(self.upload_dir) / "temp" / filename
            temp_path.parent.mkdir(parents=True, exist_ok=True)
            
            async with aiofiles.open(temp_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # Upload to Cloudinary with transformations
            urls = []
            for size_name, size in self.image_sizes.items():
                if size_name == "original":
                    transformation = []
                else:
                    transformation = [{"width": size[0], "height": size[1], "crop": "fill"}]
                
                result = cloudinary.uploader.upload(
                    str(temp_path),
                    public_id=f"{folder}/{filename}_{size_name}",
                    transformation=transformation,
                    folder=folder
                )
                
                urls.append(result["secure_url"])
            
            # Clean up temp file
            os.remove(temp_path)
            
            return urls
            
        except Exception as e:
            logger.error(f"Error uploading to Cloudinary: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload image to Cloudinary")
    
    async def upload_image(self, file: UploadFile, folder: str = "products") -> dict:
        """Upload image with validation and processing"""
        # Validate image
        is_valid, message = await self.validate_image(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=message)
        
        # Upload based on storage type
        if self.storage_type == "s3":
            urls = await self.upload_to_s3(file, folder)
        elif self.storage_type == "cloudinary":
            urls = await self.upload_to_cloudinary(file, folder)
        else:
            urls = await self.upload_to_local(file, folder)
        
        # Return image data
        return {
            "id": str(uuid.uuid4()),
            "original_url": urls[0],
            "thumbnail_url": urls[1] if len(urls) > 1 else urls[0],
            "small_url": urls[2] if len(urls) > 2 else urls[0],
            "medium_url": urls[3] if len(urls) > 3 else urls[0],
            "large_url": urls[4] if len(urls) > 4 else urls[0],
            "filename": file.filename,
            "size": file.size,
            "content_type": file.content_type
        }
    
    async def upload_multiple_images(self, files: List[UploadFile], folder: str = "products") -> List[dict]:
        """Upload multiple images"""
        uploaded_images = []
        
        for file in files:
            try:
                image_data = await self.upload_image(file, folder)
                uploaded_images.append(image_data)
            except Exception as e:
                logger.error(f"Error uploading {file.filename}: {e}")
                # Continue with other files
        
        return uploaded_images
    
    async def delete_image(self, image_url: str) -> bool:
        """Delete image from storage"""
        try:
            if self.storage_type == "s3":
                # Extract key from S3 URL
                key = image_url.replace(f"https://{self.s3_bucket}.s3.amazonaws.com/", "")
                self.s3_client.delete_object(Bucket=self.s3_bucket, Key=key)
                
            elif self.storage_type == "cloudinary":
                # Extract public_id from Cloudinary URL
                public_id = image_url.split("/")[-1].split(".")[0]
                cloudinary.uploader.destroy(public_id)
                
            else:
                # Local storage
                file_path = Path(self.upload_dir) / image_url.lstrip("/uploads/")
                if file_path.exists():
                    file_path.unlink()
            
            return True
            
        except Exception as e:
            logger.error(f"Error deleting image {image_url}: {e}")
            return False
    
    async def optimize_image(self, image_path: str, quality: int = 85) -> str:
        """Optimize image for web"""
        try:
            with Image.open(image_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Optimize and save
                optimized_path = f"{image_path}_optimized.jpg"
                img.save(optimized_path, "JPEG", quality=quality, optimize=True)
                
                return optimized_path
        except Exception as e:
            logger.error(f"Error optimizing image {image_path}: {e}")
            return image_path
    
    def generate_image_hash(self, image_data: bytes) -> str:
        """Generate hash for image to detect duplicates"""
        return hashlib.md5(image_data).hexdigest()
    
    async def get_image_info(self, image_path: str) -> dict:
        """Get image information"""
        try:
            with Image.open(image_path) as img:
                return {
                    "width": img.width,
                    "height": img.height,
                    "format": img.format,
                    "mode": img.mode,
                    "size_bytes": os.path.getsize(image_path)
                }
        except Exception as e:
            logger.error(f"Error getting image info for {image_path}: {e}")
            return {}

# Global image service instance
image_service = ImageService()
