# OmniLife - Unified AI Personal Platform

A comprehensive full-stack application that integrates AI-powered insights with personal finance management, e-commerce marketplace, health & fitness tracking, travel planning, and real-time communication features.

🌐 **Live Demo**: [https://lifeomni.netlify.app/](https://lifeomni.netlify.app/)

## Overview

OmniLife is a modern, cloud-native platform that combines multiple personal management modules into a unified experience. The platform leverages GPT-4 for intelligent analysis, recommendations, and automated insights across all modules.

## Screenshots

### Dashboard
<img src="assets/screenshots/dashboard.png" alt="Dashboard" width="800"/>

The main dashboard provides a unified view of all modules with key metrics and quick access to each feature.

### Finance Dashboard
<img src="assets/screenshots/finance-dashboard.png" alt="Finance Dashboard" width="800"/>

Comprehensive financial overview with total balance, monthly income/expenses, credit score, recent transactions, and linked bank accounts.

### Fitness Dashboard
<img src="assets/screenshots/fitness-dashboard.png" alt="Fitness Dashboard" width="800"/>

Track your health and fitness progress with step counting, calorie tracking, workout logging, and weekly progress visualization.

### Marketplace
<img src="assets/screenshots/marketplace.png" alt="Marketplace" width="800"/>

AI-powered product recommendations with personalized shopping preferences and recently viewed items.

### Social
<img src="assets/screenshots/social.png" alt="Social" width="800"/>

Connect with friends, share achievements, and view shared items from your connections.

## Architecture

The application follows a microservices architecture with the following components:

- **Frontend**: React 18 with TypeScript, Vite, and TailwindCSS
- **Backend API** (Port 8000): Core FastAPI service with PostgreSQL and Redis
- **Chat Service** (Port 8001): Real-time WebSocket messaging service
- **AI Service** (Port 8002): Dedicated GPT-4 integration service
- **Nginx**: Reverse proxy and load balancer (Port 80/443)

## Features

### Core Modules

- **Finance Management**: Budget tracking, expense analysis, account management, and AI-powered financial insights
- **E-commerce Marketplace**: Product catalog, shopping cart, order management, and personalized recommendations
- **Health & Fitness**: Activity tracking, workout logging, goal setting, and progress analytics
- **Travel Planning**: Trip planning, itinerary generation, expense tracking, and destination recommendations
- **Real-time Chat**: WebSocket-based messaging with sentiment analysis
- **Social Features**: Share achievements, connect with friends, and collaborative planning

### Technical Features

- Modern UI with glassmorphism design and smooth animations
- Responsive design optimized for all devices
- Dark/light theme with system preference detection
- OAuth2 authentication (Google/GitHub) with JWT
- Real-time data synchronization via WebSocket
- GPT-4 integration for intelligent analysis and recommendations
- Interactive data visualization with charts and graphs

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Framer Motion for animations
- Zustand for state management
- React Query for server state
- Recharts for data visualization

### Backend
- FastAPI (Python)
- PostgreSQL with SQLAlchemy ORM
- Redis for caching and sessions
- WebSocket for real-time communication
- OpenAI GPT-4 API
- LangChain for AI workflows
- Alembic for database migrations

### Infrastructure
- Docker and Docker Compose
- Nginx reverse proxy
- Prometheus and Grafana for monitoring

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- Docker and Docker Compose (optional)
- PostgreSQL (for production)
- Redis (for production)
- OpenAI API key

### Installation

#### Option 1: Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd omnilife
```

2. Copy environment file:
```bash
cp backend/env.example .env
```

3. Edit `.env` with your configuration:
```env
OPENAI_API_KEY=your_openai_api_key
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/omnilife
REDIS_URL=redis://localhost:6379/0
```

4. Start all services:
```bash
docker-compose up -d
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

#### Option 2: Local Development

**Frontend Setup:**
```bash
npm install
npm run dev
```

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env
# Edit .env with your settings
python start.py
```

**Database Setup:**
```bash
cd backend
python setup_database.py
```

## Project Structure

```
.
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── store/             # State management
│   ├── services/          # API services
│   └── hooks/             # Custom React hooks
├── backend/               # Backend source code
│   ├── app/               # Application code
│   │   ├── models/        # Database models
│   │   ├── routers/       # API routes
│   │   ├── services/      # Business logic
│   │   └── schemas/       # Pydantic schemas
│   ├── main.py            # Main FastAPI application
│   ├── chat_server.py     # Chat microservice
│   ├── ai_service.py      # AI microservice
│   └── requirements.txt   # Python dependencies
├── docker-compose.yml      # Development environment
├── docker-compose.prod.yml # Production environment
└── nginx/                 # Nginx configuration
```

## Configuration

### Environment Variables

Key environment variables for the backend:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Redis
REDIS_URL=redis://host:port/database

# Security
SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-api-key

# Environment
ENVIRONMENT=development
DEBUG=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## API Documentation

Once the backend is running, interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd backend
pytest
```

### Code Quality

```bash
# Frontend linting
npm run lint

# Backend formatting
black backend/
isort backend/
```

## Deployment

### Production Deployment

1. Update environment variables for production
2. Build Docker images:
```bash
docker-compose -f docker-compose.prod.yml build
```

3. Deploy:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Platforms

The project includes configuration files for:
- Railway (`deploy/railway.json`)
- Render (`deploy/render.yaml`)

## Security

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- CORS protection
- Rate limiting via Nginx
- Input validation with Pydantic
- SQL injection protection via SQLAlchemy ORM

## Monitoring

Health check endpoints:
- Main API: `GET /health`
- Chat Service: `GET /health`
- AI Service: `GET /health`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## Support

For issues and questions, please open an issue on the repository.
