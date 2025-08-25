#!/bin/bash

# ==================== STAGING DEPLOYMENT SCRIPT ====================
# Deploy to Render staging environment

set -e

echo "🚀 Starting staging deployment..."

# ==================== ENVIRONMENT VARIABLES ====================
export ENVIRONMENT="staging"
export RENDER_API_KEY="${RENDER_API_KEY}"
export RENDER_SERVICE_ID="${RENDER_STAGING_SERVICE_ID}"

# ==================== VALIDATION ====================
if [ -z "$RENDER_API_KEY" ]; then
    echo "❌ Error: RENDER_API_KEY is not set"
    exit 1
fi

if [ -z "$RENDER_SERVICE_ID" ]; then
    echo "❌ Error: RENDER_SERVICE_ID is not set"
    exit 1
fi

# ==================== PRE-DEPLOYMENT CHECKS ====================
echo "🔍 Running pre-deployment checks..."

# Check if we're on the dev branch
if [ "$(git branch --show-current)" != "dev" ]; then
    echo "❌ Error: Must be on dev branch for staging deployment"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Uncommitted changes detected"
    exit 1
fi

# ==================== BUILD AND TEST ====================
echo "🏗️ Building and testing..."

# Frontend build
echo "Building frontend..."
npm ci
npm run build
npm run test:coverage

# Backend build
echo "Building backend..."
cd backend
pip install -r requirements.txt
pytest --cov=app --cov-report=xml --cov-fail-under=80
cd ..

# ==================== SECURITY SCAN ====================
echo "🔒 Running security scans..."

# Run Trivy vulnerability scan
if command -v trivy &> /dev/null; then
    echo "Running Trivy scan..."
    trivy fs --severity HIGH,CRITICAL .
else
    echo "⚠️ Trivy not found, skipping vulnerability scan"
fi

# ==================== DEPLOYMENT ====================
echo "🚀 Deploying to Render staging..."

# Trigger Render deployment
curl -X POST \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    -H "Content-Type: application/json" \
    "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys"

echo "✅ Deployment triggered successfully!"

# ==================== WAIT FOR DEPLOYMENT ====================
echo "⏳ Waiting for deployment to complete..."

# Wait for deployment to be ready
sleep 60

# Check deployment status
DEPLOY_STATUS=$(curl -s \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    "https://api.render.com/v1/services/$RENDER_SERVICE_ID" | \
    jq -r '.service.spec.deploy.status')

if [ "$DEPLOY_STATUS" = "live" ]; then
    echo "✅ Deployment completed successfully!"
else
    echo "❌ Deployment failed with status: $DEPLOY_STATUS"
    exit 1
fi

# ==================== HEALTH CHECKS ====================
echo "🏥 Running health checks..."

STAGING_URL="${STAGING_URL:-https://staging.omnilife.com}"

# Wait for service to be ready
for i in {1..30}; do
    if curl -f "$STAGING_URL/health" > /dev/null 2>&1; then
        echo "✅ Health check passed!"
        break
    fi
    echo "⏳ Waiting for service to be ready... ($i/30)"
    sleep 10
done

if [ $i -eq 30 ]; then
    echo "❌ Health check failed after 5 minutes"
    exit 1
fi

# ==================== SMOKE TESTS ====================
echo "🧪 Running smoke tests..."

# Basic functionality tests
curl -f "$STAGING_URL/api/health" || exit 1
curl -f "$STAGING_URL/api/docs" || exit 1

echo "✅ Smoke tests passed!"

# ==================== NOTIFICATION ====================
echo "📢 Sending deployment notification..."

# Send Slack notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST \
        -H "Content-Type: application/json" \
        -d "{
            \"text\": \"✅ Staging deployment completed successfully!\",
            \"attachments\": [{
                \"fields\": [
                    {
                        \"title\": \"Environment\",
                        \"value\": \"Staging\",
                        \"short\": true
                    },
                    {
                        \"title\": \"Commit\",
                        \"value\": \"$(git rev-parse --short HEAD)\",
                        \"short\": true
                    },
                    {
                        \"title\": \"Branch\",
                        \"value\": \"$(git branch --show-current)\",
                        \"short\": true
                    },
                    {
                        \"title\": \"URL\",
                        \"value\": \"$STAGING_URL\",
                        \"short\": true
                    }
                ]
            }]
        }" \
        "$SLACK_WEBHOOK_URL"
fi

echo "🎉 Staging deployment completed successfully!"
echo "🌐 Staging URL: $STAGING_URL"
