#!/bin/bash

# ==================== PRODUCTION DEPLOYMENT SCRIPT ====================
# Deploy to AWS ECS production environment with zero-downtime

set -e

echo "🚀 Starting production deployment..."

# ==================== ENVIRONMENT VARIABLES ====================
export ENVIRONMENT="production"
export AWS_REGION="${AWS_REGION:-us-east-1}"
export ECS_CLUSTER="${ECS_CLUSTER:-omnilife-cluster}"
export ECS_SERVICE="${ECS_SERVICE:-omnilife-service}"
export ECS_TASK_DEFINITION="${ECS_TASK_DEFINITION:-omnilife-task-definition}"
export PRODUCTION_URL="${PRODUCTION_URL:-https://omnilife.com}"

# ==================== VALIDATION ====================
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ Error: AWS credentials not set"
    exit 1
fi

# ==================== PRE-DEPLOYMENT CHECKS ====================
echo "🔍 Running pre-deployment checks..."

# Check if we're on the main branch
if [ "$(git branch --show-current)" != "main" ]; then
    echo "❌ Error: Must be on main branch for production deployment"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Uncommitted changes detected"
    exit 1
fi

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI not found"
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

# ==================== DOCKER BUILD AND PUSH ====================
echo "🐳 Building and pushing Docker images..."

# Build and push frontend image
echo "Building frontend Docker image..."
docker build -t ghcr.io/$GITHUB_REPOSITORY-frontend:latest .
docker push ghcr.io/$GITHUB_REPOSITORY-frontend:latest

# Build and push backend image
echo "Building backend Docker image..."
cd backend
docker build -t ghcr.io/$GITHUB_REPOSITORY-backend:latest .
docker push ghcr.io/$GITHUB_REPOSITORY-backend:latest
cd ..

# ==================== ECS DEPLOYMENT ====================
echo "🚀 Deploying to AWS ECS..."

# Get current task definition
CURRENT_TASK_DEF=$(aws ecs describe-task-definition \
    --task-definition "$ECS_TASK_DEFINITION" \
    --query 'taskDefinition' \
    --output json)

# Create new task definition with updated images
NEW_TASK_DEF=$(echo "$CURRENT_TASK_DEF" | \
    jq --arg frontend_image "ghcr.io/$GITHUB_REPOSITORY-frontend:latest" \
       --arg backend_image "ghcr.io/$GITHUB_REPOSITORY-backend:latest" \
       '.containerDefinitions[0].image = $frontend_image | .containerDefinitions[1].image = $backend_image')

# Register new task definition
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
    --cli-input-json "$NEW_TASK_DEF" \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text)

echo "✅ New task definition registered: $NEW_TASK_DEF_ARN"

# Update ECS service with new task definition
aws ecs update-service \
    --cluster "$ECS_CLUSTER" \
    --service "$ECS_SERVICE" \
    --task-definition "$NEW_TASK_DEF_ARN" \
    --force-new-deployment

echo "✅ Service updated with new task definition"

# ==================== WAIT FOR DEPLOYMENT ====================
echo "⏳ Waiting for deployment to complete..."

# Wait for service to be stable
aws ecs wait services-stable \
    --cluster "$ECS_CLUSTER" \
    --services "$ECS_SERVICE"

echo "✅ Deployment completed successfully!"

# ==================== HEALTH CHECKS ====================
echo "🏥 Running health checks..."

# Wait for service to be ready
for i in {1..30}; do
    if curl -f "$PRODUCTION_URL/health" > /dev/null 2>&1; then
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
curl -f "$PRODUCTION_URL/api/health" || exit 1
curl -f "$PRODUCTION_URL/api/docs" || exit 1

echo "✅ Smoke tests passed!"

# ==================== LOAD TESTS ====================
echo "📊 Running load tests..."

# Run k6 load tests if available
if command -v k6 &> /dev/null; then
    echo "Running k6 load tests..."
    k6 run load-tests/smoke-test.js
else
    echo "⚠️ k6 not found, skipping load tests"
fi

# ==================== CACHE INVALIDATION ====================
echo "🔄 Invalidating CDN cache..."

# Invalidate CloudFront distribution
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --paths "/*"
    echo "✅ CloudFront cache invalidated"
else
    echo "⚠️ CLOUDFRONT_DISTRIBUTION_ID not set, skipping cache invalidation"
fi

# ==================== MONITORING ====================
echo "📊 Setting up monitoring..."

# Check application metrics
RESPONSE_TIME=$(curl -w "%{time_total}" -o /dev/null -s "$PRODUCTION_URL/health")
echo "Response time: ${RESPONSE_TIME}s"

# Check ECS service metrics
SERVICE_METRICS=$(aws cloudwatch get-metric-statistics \
    --namespace AWS/ECS \
    --metric-name CPUUtilization \
    --dimensions Name=ServiceName,Value="$ECS_SERVICE" Name=ClusterName,Value="$ECS_CLUSTER" \
    --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S) \
    --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
    --period 300 \
    --statistics Average)

echo "Service metrics: $SERVICE_METRICS"

# ==================== NOTIFICATION ====================
echo "📢 Sending deployment notification..."

# Send Slack notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST \
        -H "Content-Type: application/json" \
        -d "{
            \"text\": \"✅ Production deployment completed successfully!\",
            \"attachments\": [{
                \"fields\": [
                    {
                        \"title\": \"Environment\",
                        \"value\": \"Production\",
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
                        \"value\": \"$PRODUCTION_URL\",
                        \"short\": true
                    },
                    {
                        \"title\": \"Response Time\",
                        \"value\": \"${RESPONSE_TIME}s\",
                        \"short\": true
                    }
                ]
            }]
        }" \
        "$SLACK_WEBHOOK_URL"
fi

# ==================== CLEANUP ====================
echo "🧹 Cleaning up old task definitions..."

# Keep only the last 5 task definitions
TASK_DEFS=$(aws ecs list-task-definitions \
    --family-prefix "$ECS_TASK_DEFINITION" \
    --status ACTIVE \
    --sort DESC \
    --query 'taskDefinitionArns[5:]' \
    --output text)

for task_def in $TASK_DEFS; do
    echo "Deregistering old task definition: $task_def"
    aws ecs deregister-task-definition --task-definition "$task_def"
done

echo "🎉 Production deployment completed successfully!"
echo "🌐 Production URL: $PRODUCTION_URL"
echo "📊 Monitor deployment at: https://console.aws.amazon.com/ecs/home?region=$AWS_REGION#/clusters/$ECS_CLUSTER/services/$ECS_SERVICE"
