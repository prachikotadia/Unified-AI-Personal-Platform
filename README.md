# 🚀 OmniLife - Unified AI Personal Platform

A comprehensive, AI-powered personal platform that integrates finance management, marketplace shopping, fitness tracking, travel planning, social networking, and intelligent chat capabilities.

## ✨ Features

### 🛒 **Advanced Marketplace**
- **Amazon-like shopping experience** with advanced search and filtering
- **Real-time inventory management** with stock tracking
- **Multiple payment methods** (PayPal, Apple Pay, credit cards)
- **AI-powered recommendations** and price alerts
- **Loyalty program** with points and rewards
- **Comprehensive return/refund system**
- **Product reviews and Q&A system**

### 💰 **Finance Management**
- **Expense tracking** with categorization
- **Budget planning** and goal setting
- **Credit score monitoring**
- **Financial offers** and recommendations
- **AI-powered financial insights**
- **Monthly spending analytics**

### 🏃‍♂️ **Fitness & Health**
- **Workout tracking** and planning
- **Goal setting** and achievement tracking
- **Progress analytics** and insights
- **AI-powered workout recommendations**
- **Nutrition planning** and tracking

### ✈️ **Travel Planning**
- **Trip planning** and itinerary management
- **Flight search** and booking
- **Hotel recommendations**
- **Travel analytics** and insights
- **AI-powered travel suggestions**

### 👥 **Social Networking**
- **Social feed** and content sharing
- **Friend connections** and messaging
- **Shared items** and recommendations
- **Community features**

### 💬 **Intelligent Chat**
- **Real-time messaging** with AI assistance
- **Voice and video calls**
- **File sharing** and media support
- **AI-powered smart replies**
- **Conversation summaries**

## 🏗️ Architecture

### **Frontend (React + TypeScript)**
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Framer Motion** for animations
- **Lucide React** for icons

### **Backend (Python + FastAPI)**
- **FastAPI** for high-performance API
- **SQLAlchemy** for database ORM
- **PostgreSQL/SQLite** for data storage
- **Redis** for caching and sessions
- **Elasticsearch** for advanced search
- **Pydantic** for data validation
- **Structlog** for structured logging

### **AI Integration**
- **OpenAI GPT-4** for intelligent responses
- **LangChain** for AI workflows
- **Natural Language Processing** for user interactions
- **AI-powered insights** across all modules

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL (optional, SQLite for development)
- Redis (optional for development)
- Elasticsearch (optional for development)

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env.example .env
# Edit .env with your configuration

# Initialize database
python init_db.py

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=sqlite:///./omnilife_marketplace.db
FORCE_SQLITE=true

# Search
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_INDEX=marketplace

# Caching
REDIS_HOST=localhost
REDIS_PORT=6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Push Notifications (Firebase)
FIREBASE_SERVER_KEY=your-firebase-server-key

# Security
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_DURATION=900
SUSPICIOUS_ACTIVITY_THRESHOLD=0.7
FRAUD_DETECTION_ENABLED=true

# Payment
PAYMENT_GATEWAY_KEY=your-payment-gateway-key
PAYMENT_WEBHOOK_SECRET=your-webhook-secret
```

## 📁 Project Structure

```
omnilife-platform/
├── src/                          # Frontend React application
│   ├── components/               # Reusable components
│   ├── pages/                    # Page components
│   ├── store/                    # Zustand state management
│   ├── services/                 # API services
│   ├── utils/                    # Utility functions
│   └── types/                    # TypeScript type definitions
├── backend/                      # Python FastAPI backend
│   ├── app/                      # Application code
│   │   ├── routers/              # API route handlers
│   │   ├── services/             # Business logic services
│   │   ├── models/               # Database models
│   │   └── middleware/           # Custom middleware
│   ├── tests/                    # Test suite
│   ├── requirements.txt          # Python dependencies
│   └── main.py                   # Application entry point
├── docs/                         # Documentation
├── README.md                     # Project documentation
└── .gitignore                    # Git ignore rules
```

## 🔧 API Endpoints

### Marketplace
- `GET /api/marketplace/products` - Get products with filters
- `POST /api/marketplace/cart/add` - Add to cart
- `POST /api/marketplace/orders/create` - Create order
- `GET /api/marketplace/loyalty` - Loyalty program info

### Search
- `GET /api/search/products` - Advanced product search
- `GET /api/search/suggestions` - Search suggestions
- `GET /api/search/analytics` - Search analytics

### Analytics
- `POST /api/analytics/session/start` - Start session
- `POST /api/analytics/page-view` - Track page view
- `GET /api/analytics/user/{user_id}` - User analytics

### Notifications
- `POST /api/notifications/create` - Create notification
- `GET /api/notifications/user/{user_id}` - User notifications
- `POST /api/notifications/send/email` - Send email

### Security
- `POST /api/security/login-attempt` - Record login
- `POST /api/security/payment-security` - Analyze payment
- `GET /api/security/events` - Security events

## 🧪 Testing

### Frontend Tests
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Backend Tests
```bash
cd backend

# Run all tests
pytest

# Run specific test category
pytest -m unit
pytest -m integration
pytest -m security

# Run with coverage
pytest --cov=app --cov-report=html
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment
```bash
# Frontend
npm run build
# Deploy dist/ folder to your web server

# Backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 📊 Features Overview

| Module | Features | Status |
|--------|----------|--------|
| 🛒 Marketplace | Advanced search, cart, orders, payments, loyalty | ✅ Complete |
| 💰 Finance | Expense tracking, budgeting, analytics | ✅ Complete |
| 🏃‍♂️ Fitness | Workout tracking, goals, analytics | ✅ Complete |
| ✈️ Travel | Trip planning, flight search, hotels | ✅ Complete |
| 👥 Social | Feed, friends, sharing | ✅ Complete |
| 💬 Chat | Messaging, calls, AI assistance | ✅ Complete |
| 🔍 Search | Elasticsearch, filters, suggestions | ✅ Complete |
| 📊 Analytics | User behavior, insights, tracking | ✅ Complete |
| 🔔 Notifications | Email, SMS, push notifications | ✅ Complete |
| 🔐 Security | Fraud detection, threat prevention | ✅ Complete |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Backend Enhancements](backend/BACKEND_ENHANCEMENTS.md)
- **API Docs**: `http://localhost:8001/api-docs`
- **Issues**: Create an issue on GitHub

## 🎯 Roadmap

- [ ] **Machine Learning Integration**
  - Product recommendation engine
  - Fraud detection AI
  - Customer segmentation
  - Predictive analytics

- [ ] **Microservices Architecture**
  - Service decomposition
  - API gateway implementation
  - Service mesh integration
  - Event-driven architecture

- [ ] **Advanced Analytics**
  - Real-time dashboards
  - Business intelligence
  - A/B testing framework
  - Customer journey mapping

- [ ] **Enhanced Security**
  - Multi-factor authentication
  - Biometric authentication
  - Advanced threat detection
  - Compliance automation

---

**Built with ❤️ using React, FastAPI, and AI technologies**

*OmniLife - Your Unified AI Personal Platform*
