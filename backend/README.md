# OmniLife Backend API

A FastAPI backend with full authentication, database connection, JWT session handling, and guest mode support.

## Features

- ✅ **User Authentication**: Signup, login, JWT tokens
- ✅ **Password Security**: bcrypt hashing
- ✅ **Session Handling**: JWT-based sessions with `/me` endpoint
- ✅ **Protected Routes**: User-specific data with authentication
- ✅ **Guest Mode**: Demo data for unauthenticated users
- ✅ **Database**: SQLite (dev) / PostgreSQL (prod) with SQLAlchemy ORM
- ✅ **CORS**: Configured for frontend integration

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Environment

```bash
cp env.example .env
# Edit .env with your settings
```

### 3. Run the Server

```bash
# Development mode
python start.py

# Or directly with uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Access API

- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Authentication

- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user profile
- `POST /auth/guest-login` - Create temporary guest user

### Data (Protected + Guest Mode)

- `GET /data/fitness/dashboard` - Fitness dashboard data
- `GET /data/finance/dashboard` - Finance dashboard data
- `GET /data/fitness/goals` - Fitness goals
- `GET /data/finance/accounts` - Finance accounts
- `POST /data/fitness/goals` - Create fitness goal (auth only)
- `POST /data/finance/accounts` - Create finance account (auth only)

## Authentication Flow

### 1. User Registration
```bash
curl -X POST "http://localhost:8000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "display_name": "John Doe"
  }'
```

### 2. User Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "display_name": "John Doe",
    "is_active": true,
    "is_verified": true,
    "is_guest": false
  }
}
```

### 3. Access Protected Data
```bash
curl -X GET "http://localhost:8000/data/fitness/dashboard" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

### 4. Guest Mode (No Token)
```bash
curl -X GET "http://localhost:8000/data/fitness/dashboard"
# Returns demo data without authentication
```

## Database Models

### User Model
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email
- `hashed_password`: bcrypt hashed password
- `is_active`: Account status
- `is_verified`: Email verification status
- `is_guest`: Guest user flag
- `display_name`: User's display name
- `avatar`: Profile picture URL
- `bio`: User bio
- `location`: User location
- `preferences`: JSON preferences
- `created_at`: Account creation time
- `last_login`: Last login time

### Fitness Models
- `FitnessGoal`: User fitness goals
- `FitnessWorkout`: Workout records
- `FitnessMeasurement`: Body measurements

### Finance Models
- `FinanceAccount`: Bank accounts
- `FinanceTransaction`: Financial transactions
- `FinanceBudget`: Budget tracking
- `FinanceGoal`: Financial goals

## Frontend Integration

### 1. Update Frontend API Configuration

Update your frontend's API configuration to point to the backend:

```typescript
// src/config/api.ts
export const API_BASE_URL = 'http://localhost:8000';
```

### 2. Authentication Flow

```typescript
// Login
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { access_token, user } = await response.json();

// Store token
localStorage.setItem('token', access_token);

// Use token for API calls
const data = await fetch(`${API_BASE_URL}/data/fitness/dashboard`, {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```

### 3. Guest Mode

For guest mode, simply don't include the Authorization header:

```typescript
// Guest mode - no token needed
const demoData = await fetch(`${API_BASE_URL}/data/fitness/dashboard`);
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `sqlite:///./omnilife.db` |
| `SECRET_KEY` | JWT secret key | `your-secret-key-change-in-production` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | `30` |
| `ENVIRONMENT` | Environment mode | `development` |
| `DEBUG` | Debug mode | `true` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3001,http://localhost:3000` |

## Production Deployment

### 1. PostgreSQL Database
```bash
# Update DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost/omnilife
```

### 2. Environment Variables
```bash
# Production settings
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=your-super-secure-production-secret-key
```

### 3. Run with Gunicorn
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Security Features

- ✅ **Password Hashing**: bcrypt with salt
- ✅ **JWT Tokens**: Secure session management
- ✅ **CORS Protection**: Configured origins
- ✅ **Input Validation**: Pydantic schemas
- ✅ **SQL Injection Protection**: SQLAlchemy ORM
- ✅ **Rate Limiting**: Built-in FastAPI protection

## Development

### Database Migrations
```bash
# Initialize Alembic (if needed)
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

### Testing
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check `DATABASE_URL` in `.env`
   - Ensure database file exists (SQLite) or server is running (PostgreSQL)

2. **CORS Errors**
   - Update `ALLOWED_ORIGINS` in `.env`
   - Check frontend URL matches allowed origins

3. **JWT Token Issues**
   - Verify `SECRET_KEY` is set
   - Check token expiration time
   - Ensure token format: `Bearer <token>`

4. **Import Errors**
   - Ensure all dependencies are installed: `pip install -r requirements.txt`
   - Check Python path and virtual environment

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These provide interactive API documentation with examples and testing capabilities.
