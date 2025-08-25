# 🚀 Production Deployment Guide

## 📋 Table of Contents
- [Overview](#overview)
- [Docker Setup](#docker-setup)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Environment Configuration](#environment-configuration)
- [SSL/TLS Setup](#ssltls-setup)
- [Monitoring Setup](#monitoring-setup)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This guide covers the complete production deployment of the OmniLife platform using Docker and Kubernetes.

### Architecture
- **Frontend**: React + Vite + Nginx
- **Backend**: FastAPI + Uvicorn
- **Database**: PostgreSQL
- **Cache**: Redis
- **Search**: Elasticsearch
- **Monitoring**: Prometheus + Grafana
- **Orchestration**: Kubernetes

## 🐳 Docker Setup

### 1. Production Docker Compose

```bash
# Start production environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Development Docker Compose

```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up -d

# Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:8001
# Database: localhost:5432
# Redis: localhost:6379
# Elasticsearch: http://localhost:9200
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001
# MailHog: http://localhost:8025
```

### 3. Building Images

```bash
# Build frontend image
docker build -t omnilife-frontend:latest .

# Build backend image
docker build -t omnilife-backend:latest ./backend

# Build all images
docker-compose build
```

### 4. Image Optimization

```bash
# Multi-stage build optimization
docker build --target production -t omnilife-frontend:prod .

# Layer caching
docker build --cache-from omnilife-frontend:latest -t omnilife-frontend:latest .
```

## ☸️ Kubernetes Deployment

### 1. Prerequisites

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Configure kubectl for your cluster
aws eks update-kubeconfig --region us-east-1 --name omnilife-cluster
```

### 2. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply ConfigMaps and Secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Create persistent volumes
kubectl apply -f k8s/storage.yaml

# Deploy applications
kubectl apply -f k8s/deployments.yaml
kubectl apply -f k8s/services.yaml

# Deploy ingress
kubectl apply -f k8s/ingress.yaml
```

### 3. Verify Deployment

```bash
# Check pod status
kubectl get pods -n omnilife

# Check services
kubectl get services -n omnilife

# Check ingress
kubectl get ingress -n omnilife

# View logs
kubectl logs -f deployment/omnilife-frontend -n omnilife
kubectl logs -f deployment/omnilife-backend -n omnilife
```

### 4. Scaling

```bash
# Scale frontend
kubectl scale deployment omnilife-frontend --replicas=5 -n omnilife

# Scale backend
kubectl scale deployment omnilife-backend --replicas=3 -n omnilife

# Auto-scaling
kubectl autoscale deployment omnilife-frontend --cpu-percent=70 --min=2 --max=10 -n omnilife
```

## 🔧 Environment Configuration

### 1. Environment Variables

Create `.env` file with the following variables:

```bash
# Application
NODE_ENV=production
ENVIRONMENT=production
SECRET_KEY=your-super-secret-key

# Database
DATABASE_URL=postgresql://user:password@host:5432/omnilife_prod
POSTGRES_PASSWORD=secure-password

# Redis
REDIS_URL=redis://host:6379

# Elasticsearch
ELASTICSEARCH_URL=http://elasticsearch-host:9200

# External Services
OPENAI_API_KEY=your-openai-key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Monitoring
GRAFANA_PASSWORD=secure-admin-password
```

### 2. Kubernetes Secrets

```bash
# Create secrets
kubectl create secret generic omnilife-secrets \
  --from-literal=POSTGRES_PASSWORD=secure-password \
  --from-literal=SECRET_KEY=your-secret-key \
  --from-literal=GRAFANA_ADMIN_PASSWORD=admin \
  -n omnilife
```

### 3. ConfigMaps

```bash
# Create configmaps
kubectl create configmap omnilife-config \
  --from-literal=VITE_API_URL=https://api.omnilife.com \
  --from-literal=ENVIRONMENT=production \
  --from-literal=POSTGRES_DB=omnilife_prod \
  -n omnilife
```

## 🔒 SSL/TLS Setup

### 1. Let's Encrypt with Cert-Manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml

# Create ClusterIssuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@domain.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### 2. Domain Configuration

```bash
# Update DNS records
# A record: omnilife.com -> Load Balancer IP
# A record: api.omnilife.com -> Load Balancer IP
# A record: monitoring.omnilife.com -> Load Balancer IP
```

### 3. SSL Certificate Verification

```bash
# Check certificate status
kubectl get certificates -n omnilife

# Check certificate details
kubectl describe certificate omnilife-tls -n omnilife
```

## 📊 Monitoring Setup

### 1. Prometheus Configuration

```bash
# Create Prometheus config
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: omnilife-prometheus-config
  namespace: omnilife
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'omnilife-backend'
      static_configs:
      - targets: ['omnilife-backend-service:8000']
    - job_name: 'omnilife-frontend'
      static_configs:
      - targets: ['omnilife-frontend-service:80']
EOF
```

### 2. Grafana Dashboards

```bash
# Create Grafana datasource config
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: omnilife-grafana-datasources
  namespace: omnilife
data:
  datasources.yml: |
    apiVersion: 1
    datasources:
    - name: Prometheus
      type: prometheus
      url: http://omnilife-prometheus:9090
      access: proxy
      isDefault: true
EOF
```

### 3. Alert Rules

```bash
# Create alert rules
cat <<EOF | kubectl apply -f -
apiVersion: monitoring.coreos.com/v1alpha1
kind: PrometheusRule
metadata:
  name: omnilife-alerts
  namespace: omnilife
spec:
  groups:
  - name: omnilife.rules
    rules:
    - alert: HighErrorRate
      expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
      for: 2m
      labels:
        severity: critical
      annotations:
        summary: "High error rate detected"
EOF
```

## 🛠️ Troubleshooting

### 1. Common Issues

#### Container Won't Start
```bash
# Check container logs
docker logs <container-id>

# Check container status
docker ps -a

# Check resource usage
docker stats
```

#### Pod Stuck in Pending
```bash
# Check pod events
kubectl describe pod <pod-name> -n omnilife

# Check node resources
kubectl describe nodes

# Check persistent volume claims
kubectl get pvc -n omnilife
```

#### Service Not Accessible
```bash
# Check service endpoints
kubectl get endpoints -n omnilife

# Check service configuration
kubectl describe service <service-name> -n omnilife

# Test service connectivity
kubectl run test-pod --image=busybox --rm -it --restart=Never -- nslookup <service-name>
```

### 2. Debug Commands

```bash
# Get all resources
kubectl get all -n omnilife

# Check ingress status
kubectl get ingress -n omnilife

# View pod logs
kubectl logs -f <pod-name> -n omnilife

# Execute commands in pod
kubectl exec -it <pod-name> -n omnilife -- /bin/bash

# Port forward for debugging
kubectl port-forward service/omnilife-backend-service 8000:8000 -n omnilife
```

### 3. Performance Monitoring

```bash
# Check resource usage
kubectl top pods -n omnilife
kubectl top nodes

# Monitor metrics
kubectl port-forward service/omnilife-prometheus 9090:9090 -n omnilife
kubectl port-forward service/omnilife-grafana 3000:3000 -n omnilife
```

## 🔄 Rolling Updates

### 1. Update Application

```bash
# Update image
kubectl set image deployment/omnilife-frontend frontend=ghcr.io/omnilife/frontend:v2.0.0 -n omnilife

# Check rollout status
kubectl rollout status deployment/omnilife-frontend -n omnilife

# Rollback if needed
kubectl rollout undo deployment/omnilife-frontend -n omnilife
```

### 2. Blue-Green Deployment

```bash
# Create new deployment
kubectl apply -f k8s/deployments-v2.yaml

# Switch traffic
kubectl patch service omnilife-frontend-service -p '{"spec":{"selector":{"version":"v2"}}}' -n omnilife

# Remove old deployment
kubectl delete deployment omnilife-frontend-v1 -n omnilife
```

## 📈 Scaling Strategies

### 1. Horizontal Pod Autoscaler

```bash
# Create HPA
kubectl autoscale deployment omnilife-backend \
  --cpu-percent=70 \
  --min=2 \
  --max=10 \
  -n omnilife

# Check HPA status
kubectl get hpa -n omnilife
```

### 2. Vertical Pod Autoscaler

```bash
# Install VPA
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/vertical-pod-autoscaler/hack/vpa-up.sh

# Create VPA
cat <<EOF | kubectl apply -f -
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: omnilife-backend-vpa
  namespace: omnilife
spec:
  targetRef:
    apiVersion: "apps/v1"
    kind: Deployment
    name: omnilife-backend
  updatePolicy:
    updateMode: "Auto"
EOF
```

## 🚨 Backup and Recovery

### 1. Database Backup

```bash
# Create backup job
kubectl create job backup-postgres --from=cronjob/backup-postgres -n omnilife

# Manual backup
kubectl exec -it deployment/omnilife-postgres -n omnilife -- pg_dump -U postgres omnilife_prod > backup.sql
```

### 2. Persistent Volume Backup

```bash
# Create volume snapshot
kubectl create volumesnapshot omnilife-postgres-snapshot \
  --source=persistentvolumeclaim/omnilife-postgres-pvc \
  -n omnilife

# Restore from snapshot
kubectl create pvc omnilife-postgres-restored \
  --from-snapshot=omnilife-postgres-snapshot \
  -n omnilife
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Helm Documentation](https://helm.sh/docs/)
- [Cert-Manager Documentation](https://cert-manager.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: DevOps Team
