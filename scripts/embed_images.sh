#!/bin/bash

# Script to convert images to base64 and embed in README
# Usage: ./scripts/embed_images.sh

echo "Converting images to base64..."

# Function to convert image to base64
convert_to_base64() {
    local image_path=$1
    if [ -f "$image_path" ]; then
        base64 -i "$image_path" | tr -d '\n'
    else
        echo "Image not found: $image_path"
        return 1
    fi
}

# Check if images exist and convert them
if [ -f "assets/screenshots/dashboard.png" ]; then
    echo "Converting dashboard.png..."
    DASHBOARD_B64=$(convert_to_base64 "assets/screenshots/dashboard.png")
fi

if [ -f "assets/screenshots/finance-dashboard.png" ]; then
    echo "Converting finance-dashboard.png..."
    FINANCE_B64=$(convert_to_base64 "assets/screenshots/finance-dashboard.png")
fi

if [ -f "assets/screenshots/fitness-dashboard.png" ]; then
    echo "Converting fitness-dashboard.png..."
    FITNESS_B64=$(convert_to_base64 "assets/screenshots/fitness-dashboard.png")
fi

if [ -f "assets/screenshots/marketplace.png" ]; then
    echo "Converting marketplace.png..."
    MARKETPLACE_B64=$(convert_to_base64 "assets/screenshots/marketplace.png")
fi

if [ -f "assets/screenshots/social.png" ]; then
    echo "Converting social.png..."
    SOCIAL_B64=$(convert_to_base64 "assets/screenshots/social.png")
fi

echo "Done! Base64 strings are ready to embed in README."

