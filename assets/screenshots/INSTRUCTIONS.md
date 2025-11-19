# How to Embed Images Directly in README

To embed images directly in the README (using base64 encoding), follow these steps:

## Option 1: Using the Python Script (Recommended)

1. Add your screenshot images to this folder:
   - `dashboard.png`
   - `finance-dashboard.png`
   - `fitness-dashboard.png`
   - `marketplace.png`
   - `social.png`

2. Run the embedding script:
   ```bash
   python3 scripts/embed_images.py
   ```

3. The script will automatically convert images to base64 and update the README.

## Option 2: Manual Base64 Encoding

If you prefer to do it manually:

1. Convert image to base64:
   ```bash
   base64 -i dashboard.png > dashboard_base64.txt
   ```

2. Use in README:
   ```html
   <img src="data:image/png;base64,PASTE_BASE64_HERE" alt="Dashboard" width="800"/>
   ```

## Benefits of Embedded Images

- Images are part of the README file itself
- No need to maintain separate image files
- Works everywhere the README is viewed
- Images are always available

