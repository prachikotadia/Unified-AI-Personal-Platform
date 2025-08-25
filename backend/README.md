# OmniLife Backend

A comprehensive Python FastAPI backend for the OmniLife Unified AI Personal Platform, featuring microservices architecture, AI integration, real-time communication, and full-stack functionality.

## 🚀 Features

### Core Features
- **FastAPI Framework** - Modern, fast web framework for building APIs
- **MongoDB Integration** - NoSQL database with Motor for async operations
- **Redis Caching** - High-performance caching and session management
- **JWT Authentication** - Secure token-based authentication
- **OAuth2 Integration** - Google and GitHub authentication
- **Real-time Communication** - WebSocket support for live features
- **Rate Limiting** - API protection and abuse prevention
- **CORS Support** - Cross-origin resource sharing
- **Comprehensive Logging** - Structured logging with structlog

### AI-Powered Features
- **OpenAI Integration** - GPT-4 powered natural language processing
- **LangChain Framework** - Advanced AI workflows and chains
- **Natural Language Commands** - Process user commands in plain English
- **Financial Analysis** - AI-powered spending insights and budget recommendations
- **Workout Planning** - Personalized fitness plans and recommendations
- **Trip Planning** - Intelligent travel itinerary creation
- **Product Recommendations** - AI-driven shopping suggestions
- **Social Post Generation** - Automated content creation
- **Smart Reminders** - Intelligent task management
- **Chat Analysis** - Conversation sentiment and insights

### Microservices Architecture
- **User Management** - Complete user lifecycle management
- **Finance Module** - Transactions, budgets, goals, accounts
- **Marketplace** - Products, orders, cart, wishlist
- **Fitness Tracking** - Workouts, nutrition, goals, achievements
- **Travel Planning** - Trips, itineraries, price alerts
- **Social Features** - Posts, follows, likes, comments
- **Chat System** - Real-time messaging and conversations
- **Notification Service** - Multi-channel notifications
- **AI Service** - Centralized AI functionality

### Security & Performance
- **Helmet Security** - Security headers and protection
- **Input Validation** - Pydantic models for data validation
- **Error Handling** - Comprehensive error management
- **Database Indexing** - Optimized query performance
- **Background Tasks** - Celery for async processing
- **File Upload** - Secure file handling and storage
- **Monitoring** - Prometheus metrics and health checks

## 🛠️ Tech Stack

- **Framework**: FastAPI 0.104.1
- **Database**: MongoDB with Motor (async driver)
- **Cache**: Redis
- **AI**: OpenAI GPT-4, LangChain
- **Authentication**: JWT, OAuth2 (Google, GitHub)
- **Real-time**: WebSockets
- **Background Tasks**: Celery
- **Monitoring**: Prometheus, Sentry
- **Documentation**: Swagger/OpenAPI
- **Testing**: Pytest
- **Code Quality**: Black, isort, flake8, mypy

## 📋 Prerequisites

- Python 3.8+
- MongoDB 4.4+
- Redis 6.0+
- Node.js (for frontend integration)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configuration
# Required: MongoDB_URL, REDIS_URL, JWT_SECRET_KEY, OPENAI_API_KEY
```

### 3. Database Setup

```bash
# Start MongoDB (if not running)
mongod

# Start Redis (if not running)
redis-server
```

### 4. Run the Application

```bash
# Development mode
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 5. Access the API

- **API Documentation**: http://localhost:8000/api-docs
- **ReDoc Documentation**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 📚 API Documentation

### Authentication Endpoints

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/google
POST /api/auth/github
```

### AI Endpoints

```http
POST /api/ai/command                    # Process natural language commands
POST /api/ai/insights                   # Generate AI insights
POST /api/ai/finance/analyze            # Analyze financial data
POST /api/ai/finance/budget-plan        # Create budget plans
POST /api/ai/fitness/workout-plan       # Generate workout plans
POST /api/ai/travel/plan                # Plan trips
POST /api/ai/marketplace/recommendations # Product recommendations
POST /api/ai/social/generate-post       # Generate social posts
POST /api/ai/reminders/create           # Create smart reminders
POST /api/ai/chat/analyze               # Analyze chat sentiment
GET  /api/ai/capabilities               # List AI capabilities
```

### Finance Endpoints

```http
GET    /api/finance/transactions
POST   /api/finance/transactions
GET    /api/finance/budgets
POST   /api/finance/budgets
GET    /api/finance/goals
POST   /api/finance/goals
GET    /api/finance/accounts
POST   /api/finance/accounts
GET    /api/finance/analytics
```

### Marketplace Endpoints

```http
GET    /api/marketplace/products
POST   /api/marketplace/products
GET    /api/marketplace/orders
POST   /api/marketplace/orders
GET    /api/marketplace/cart
POST   /api/marketplace/cart
GET    /api/marketplace/wishlist
POST   /api/marketplace/wishlist
```

### Fitness Endpoints

```http
GET    /api/fitness/workouts
POST   /api/fitness/workouts
GET    /api/fitness/nutrition
POST   /api/fitness/nutrition
GET    /api/fitness/goals
POST   /api/fitness/goals
GET    /api/fitness/metrics
POST   /api/fitness/metrics
GET    /api/fitness/achievements
```

### Social Endpoints

```http
GET    /api/social/posts
POST   /api/social/posts
GET    /api/social/follows
POST   /api/social/follows
GET    /api/social/likes
POST   /api/social/likes
GET    /api/social/comments
POST   /api/social/comments
```

### Chat Endpoints

```http
GET    /api/chat/rooms
POST   /api/chat/rooms
GET    /api/chat/messages
POST   /api/chat/messages
GET    /api/chat/unread
```

## 🤖 AI Features Usage

### Natural Language Commands

The AI can process commands like:

```python
# Send a message
"Send message to John about the meeting tomorrow"

# Find products
"Find electronics products under $100"

# Create budget
"Create a budget for next month with $5000 income"

# Plan workout
"Plan a 30-minute workout for today"

# Plan trip
"Plan a 5-day trip to Paris with $2000 budget"

# Generate social post
"Create a social post about fitness motivation"

# Set reminder
"Remind me to call the doctor tomorrow at 2 PM"
```

### AI Insights

Get intelligent insights for different modules:

```python
# Financial insights
POST /api/ai/insights
{
    "module": "finance",
    "data": {
        "transactions": [...],
        "budgets": [...],
        "income": 5000
    }
}

# Fitness insights
POST /api/ai/insights
{
    "module": "fitness",
    "data": {
        "workouts": [...],
        "goals": [...],
        "metrics": {...}
    }
}
```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# Database
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=omnilife

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenAI
OPENAI_API_KEY=your-openai-key

# Frontend
FRONTEND_URL=http://localhost:3004
```

### Database Collections

The application uses these MongoDB collections:

- `users` - User accounts and profiles
- `transactions` - Financial transactions
- `budgets` - Budget plans
- `goals` - Financial and fitness goals
- `products` - Marketplace products
- `orders` - Purchase orders
- `workouts` - Fitness workouts
- `posts` - Social media posts
- `chat_rooms` - Chat conversations
- `ai_conversations` - AI chat history
- `notifications` - User notifications

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_ai.py

# Run with verbose output
pytest -v
```

## 📊 Monitoring

### Health Checks

```http
GET /health
```

### Metrics

Prometheus metrics available at `/metrics` (when enabled)

### Logging

Structured JSON logging with configurable levels:

```python
import structlog
logger = structlog.get_logger()
logger.info("User action", user_id=123, action="login")
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build image
docker build -t omnilife-backend .

# Run container
docker run -p 8000:8000 omnilife-backend
```

### Production Considerations

1. **Environment Variables**: Set all production environment variables
2. **Database**: Use production MongoDB cluster
3. **Redis**: Use production Redis instance
4. **Security**: Enable HTTPS, secure cookies, proper CORS
5. **Monitoring**: Configure Sentry, Prometheus
6. **Rate Limiting**: Adjust limits for production traffic
7. **Backup**: Set up database backups
8. **SSL**: Configure SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting: `black . && isort . && flake8`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the API documentation at `/api-docs`
- Review the logs for debugging information

## 🔗 Related Projects

- **Frontend**: React TypeScript application
- **Mobile App**: React Native application (planned)
- **Admin Dashboard**: Vue.js admin interface (planned)
