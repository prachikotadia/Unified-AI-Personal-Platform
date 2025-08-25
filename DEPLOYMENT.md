# 🚀 OmniLife Platform Deployment Guide

This guide covers deploying the OmniLife Unified AI Personal Platform to production environments.

## 📋 Prerequisites

### Required Services
- **Domain Name** (e.g., `omnilife.com`)
- **SSL Certificate** (Let's Encrypt or paid)
- **Cloud Provider Account** (AWS, Google Cloud, Azure, DigitalOcean)
- **Database Hosting** (PostgreSQL)
- **Redis Hosting** (Redis Cloud, AWS ElastiCache)
- **Email Service** (SendGrid, AWS SES)
- **SMS Service** (Twilio)
- **Payment Gateway** (Stripe, PayPal)
- **CDN** (Cloudflare, AWS CloudFront)
- **Monitoring** (Sentry, DataDog, New Relic)

### Required Accounts
- **GitHub** (for CI/CD)
- **Docker Hub** or **GitHub Container Registry**
- **Cloud Provider** (AWS/GCP/Azure)
- **Domain Registrar** (Namecheap, GoDaddy, etc.)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 8001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   Redis         │    │   Elasticsearch │
│   (Reverse      │    │   (Cache)       │    │   (Search)      │
│    Proxy)       │    │   Port: 6379    │    │   Port: 9200    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended for Small Scale)

#### 1.1 Local/Development Deployment
```bash
# Clone repository
git clone https://github.com/your-username/omnilife-platform.git
cd omnilife-platform

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8001
# API Docs: http://localhost:8001/api-docs
```

#### 1.2 Production Deployment
```bash
# Set production environment variables
export ENVIRONMENT=production
export DATABASE_URL=postgresql://user:pass@host:5432/db
export REDIS_HOST=your-redis-host
export JWT_SECRET_KEY=your-super-secret-key

# Build and start
docker-compose -f docker-compose.prod.yml up -d

# Monitor logs
docker-compose logs -f
```

### Option 2: Kubernetes (Recommended for Large Scale)

#### 2.1 Create Kubernetes Manifests
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: omnilife
```

```yaml
# k8s/postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: omnilife
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        env:
        - name: POSTGRES_DB
          value: omnilife_db
        - name: POSTGRES_USER
          value: omnilife_user
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

#### 2.2 Deploy to Kubernetes
```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets
kubectl create secret generic postgres-secret \
  --from-literal=password=your-secure-password \
  --namespace=omnilife

# Deploy database
kubectl apply -f k8s/postgres.yaml

# Deploy application
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml

# Deploy ingress
kubectl apply -f k8s/ingress.yaml
```

### Option 3: Cloud Platform Deployment

#### 3.1 AWS Deployment
```bash
# Deploy using AWS ECS
aws ecs create-cluster --cluster-name omnilife-cluster

# Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster omnilife-cluster \
  --service-name omnilife-service \
  --task-definition omnilife:1 \
  --desired-count 2
```

#### 3.2 Google Cloud Deployment
```bash
# Deploy using Google Cloud Run
gcloud run deploy omnilife-backend \
  --source ./backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy omnilife-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### 3.3 Azure Deployment
```bash
# Deploy using Azure Container Instances
az container create \
  --resource-group omnilife-rg \
  --name omnilife-backend \
  --image your-registry/omnilife-backend:latest \
  --ports 8000
```

## 🔧 Environment Configuration

### Production Environment Variables
```env
# Application
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=your-super-secret-key-change-this

# Database
DATABASE_URL=postgresql://user:pass@host:5432/omnilife_db
FORCE_SQLITE=false

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Elasticsearch
ELASTICSEARCH_HOST=your-elasticsearch-host
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_INDEX=omnilife

# JWT
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Push Notifications
FIREBASE_SERVER_KEY=your-firebase-server-key

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# AI Services
OPENAI_API_KEY=your-openai-api-key

# Security
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_DURATION=900
SUSPICIOUS_ACTIVITY_THRESHOLD=0.7
FRAUD_DETECTION_ENABLED=true

# Monitoring
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-api-key

# CDN
CDN_URL=https://cdn.yourdomain.com

# Frontend
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com/ws
```

## 🔐 Security Configuration

### SSL/TLS Setup
```bash
# Using Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Using Cloudflare
# Enable SSL/TLS encryption mode to "Full (strict)"
```

### Security Headers
```nginx
# nginx.conf
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### Database Security
```sql
-- Create dedicated user with limited permissions
CREATE USER omnilife_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE omnilife_db TO omnilife_user;
GRANT USAGE ON SCHEMA public TO omnilife_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO omnilife_user;
```

## 📊 Monitoring & Analytics

### Application Monitoring
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'omnilife-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
```

### Log Aggregation
```yaml
# fluentd-config.yaml
<source>
  @type tail
  path /var/log/omnilife/*.log
  pos_file /var/log/fluentd/omnilife.log.pos
  tag omnilife
  <parse>
    @type json
  </parse>
</source>

<match omnilife>
  @type elasticsearch
  host elasticsearch
  port 9200
  index_name omnilife-logs
</match>
```

### Health Checks
```bash
# Health check endpoints
curl https://api.yourdomain.com/health
curl https://api.yourdomain.com/api/health

# Database health
pg_isready -h your-db-host -p 5432 -U omnilife_user

# Redis health
redis-cli -h your-redis-host ping
```

## 🔄 CI/CD Pipeline

### GitHub Actions Setup
1. **Enable GitHub Actions** in your repository
2. **Set up secrets** in repository settings:
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`
   - `DEPLOY_SSH_KEY`
   - `PRODUCTION_ENV_VARS`

3. **Configure environments**:
   - `staging`
   - `production`

### Deployment Triggers
```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

## 📈 Performance Optimization

### Frontend Optimization
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    }
  }
})
```

### Backend Optimization
```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI()
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_transactions_date ON transactions(created_at);
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database connectivity
psql -h your-db-host -U omnilife_user -d omnilife_db -c "SELECT 1;"

# Check connection pool
SELECT * FROM pg_stat_activity WHERE datname = 'omnilife_db';
```

#### 2. Redis Connection Issues
```bash
# Test Redis connection
redis-cli -h your-redis-host -p 6379 ping

# Check Redis memory usage
redis-cli -h your-redis-host info memory
```

#### 3. SSL Certificate Issues
```bash
# Check SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Renew Let's Encrypt certificate
sudo certbot renew
```

#### 4. Performance Issues
```bash
# Check application logs
docker-compose logs backend

# Monitor resource usage
docker stats

# Check database performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- [ ] **Database backups** (daily)
- [ ] **Log rotation** (weekly)
- [ ] **Security updates** (monthly)
- [ ] **Performance monitoring** (continuous)
- [ ] **SSL certificate renewal** (before expiry)

### Emergency Procedures
1. **Service Outage**: Check health endpoints and logs
2. **Database Issues**: Restore from backup if necessary
3. **Security Breach**: Rotate all secrets and keys
4. **Performance Degradation**: Scale up resources

### Contact Information
- **Technical Support**: support@yourdomain.com
- **Security Issues**: security@yourdomain.com
- **Documentation**: docs.yourdomain.com

---

## 🎯 Next Steps

1. **Choose deployment option** based on your scale
2. **Set up monitoring** and alerting
3. **Configure backups** and disaster recovery
4. **Set up CI/CD** pipeline
5. **Configure domain** and SSL
6. **Test thoroughly** in staging environment
7. **Deploy to production**
8. **Monitor performance** and user feedback

**Remember**: Always test in a staging environment before deploying to production!
