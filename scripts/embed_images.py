#!/usr/bin/env python3
"""
Script to convert images to base64 and update README with embedded images
Usage: python scripts/embed_images.py
"""

import base64
import os
import re

def image_to_base64(image_path):
    """Convert image file to base64 string"""
    if not os.path.exists(image_path):
        return None
    with open(image_path, 'rb') as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def get_image_type(image_path):
    """Get image MIME type from file extension"""
    ext = os.path.splitext(image_path)[1].lower()
    types = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    }
    return types.get(ext, 'image/png')

def update_readme():
    """Update README with base64 embedded images"""
    readme_path = 'README.md'
    
    if not os.path.exists(readme_path):
        print(f"README.md not found!")
        return
    
    with open(readme_path, 'r', encoding='utf-8') as f:
        readme_content = f.read()
    
    # Image mappings
    images = {
        'dashboard.png': 'assets/screenshots/dashboard.png',
        'finance-dashboard.png': 'assets/screenshots/finance-dashboard.png',
        'fitness-dashboard.png': 'assets/screenshots/fitness-dashboard.png',
        'marketplace.png': 'assets/screenshots/marketplace.png',
        'social.png': 'assets/screenshots/social.png'
    }
    
    # Replace each image
    for img_name, img_path in images.items():
        if os.path.exists(img_path):
            print(f"Processing {img_name}...")
            base64_str = image_to_base64(img_path)
            mime_type = get_image_type(img_path)
            data_uri = f"data:{mime_type};base64,{base64_str}"
            
            # Replace the img tag
            pattern = rf'<img src="assets/screenshots/{img_name}"[^>]*>'
            replacement = f'<img src="{data_uri}" alt="{img_name.replace(".png", "").replace("-", " ").title()}" width="800"/>'
            readme_content = re.sub(pattern, replacement, readme_content)
            print(f"  ✓ Embedded {img_name}")
        else:
            print(f"  ✗ Image not found: {img_path}")
    
    # Write updated README
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(readme_content)
    
    print("\nREADME updated with embedded images!")

if __name__ == '__main__':
    update_readme()

