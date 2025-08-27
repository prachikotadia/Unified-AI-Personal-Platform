# Deployment Guide

## Overview
This application consists of a React frontend (deployed on Netlify) and a FastAPI backend that needs to be deployed separately.

## Current Status
✅ **Frontend**: Deployed on Netlify  
❌ **Backend**: Needs to be deployed  

## Backend Deployment Options

### Option 1: Railway (Recommended)
1. Go to [Railway](https://railway.app/)
2. Connect your GitHub repository
3. Select the `backend` directory
4. Set environment variables (see `backend/env.example`)
5. Deploy

### Option 2: Render
1. Go to [Render](https://render.com/)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Set environment variables

### Option 3: Heroku
1. Install Heroku CLI
2. Create a new app
3. Add Python buildpack
4. Deploy using `git push heroku main`

## Environment Variables for Backend

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URL=your-mongodb-url
MONGODB_DATABASE=omnilife

# Redis
REDIS_URL=your-redis-url

# JWT
JWT_SECRET_KEY=your-secret-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# Frontend URL (update with your Netlify URL)
FRONTEND_URL=https://your-app.netlify.app

# CORS Origins
CORS_ORIGINS=https://your-app.netlify.app
```

## Frontend Configuration

After deploying the backend, update the production URLs in `src/config/api.ts`:

```typescript
const prodConfig: APIConfig = {
  baseURL: 'https://your-backend-domain.com/api', // Your deployed backend URL
  wsURL: 'wss://your-backend-domain.com/ws', // Your deployed WebSocket URL
  chatURL: 'https://your-chat-service.com',
  travelURL: 'https://your-travel-service.com',
  timeout: 15000,
};
```

## Database Setup

### MongoDB
- Use MongoDB Atlas (free tier available)
- Create a cluster
- Get connection string
- Add to environment variables

### Redis
- Use Redis Cloud (free tier available)
- Create database
- Get connection string
- Add to environment variables

## Testing the Deployment

1. Deploy the backend
2. Update frontend configuration with backend URLs
3. Redeploy frontend on Netlify
4. Test the application

## Troubleshooting

### WebSocket Connection Issues
- Ensure WebSocket URL uses `wss://` in production
- Check CORS configuration
- Verify backend is running

### API Connection Issues
- Check environment variables
- Verify backend URL is correct
- Check CORS origins

### Database Connection Issues
- Verify MongoDB connection string
- Check network access
- Ensure database exists

## Current Demo Mode

The application is currently running in demo mode with mock data. To enable full functionality:

1. Deploy the backend
2. Set up databases
3. Update configuration
4. Redeploy frontend

## Support

For deployment issues, check:
- Backend logs
- Netlify build logs
- Browser console errors
- Network tab for failed requests
