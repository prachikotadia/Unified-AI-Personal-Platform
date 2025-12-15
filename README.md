# Unified AI Personal Platform (OmniLife)

> A comprehensive, AI-powered personal management platform integrating finance, fitness, travel, marketplace, social networking, and intelligent chat capabilities into a unified experience.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-brightgreen)](https://lifeomni.netlify.app/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100-green)](https://fastapi.tiangolo.com/)

## 🌟 Overview

OmniLife is a full-stack personal management platform that leverages AI to provide intelligent insights and automation across multiple life domains. Built with modern technologies and best practices, it offers a seamless experience for managing finances, tracking fitness goals, planning travel, shopping, and social interactions.

### Key Highlights

- **AI-Powered Insights**: OpenAI integration for intelligent recommendations and natural language interactions
- **Real-time Synchronization**: WebSocket-based chat and live data updates
- **Offline-First Architecture**: Comprehensive localStorage persistence with automatic sync
- **Responsive Design**: Mobile-first approach with glassmorphism UI
- **Type-Safe**: Full TypeScript implementation with strict type checking
- **Production-Ready**: Error boundaries, performance optimization, and security best practices

## 🚀 Features

### 💰 Finance Management
- Transaction tracking with categorization and filtering
- Budget planning with AI-powered recommendations
- Financial forecasting and predictive analytics
- Investment portfolio tracking
- Debt management with payoff strategies
- Bank account integration (multi-account support)
- Comprehensive financial reports (PDF/Excel export)
- Credit score monitoring and personalized offers

### 💪 Fitness & Health
- Workout logging with exercise library
- Nutrition tracking with macro analysis
- Progress visualization with interactive charts
- AI-generated personalized workout plans
- Meal planning with nutritional goals
- Sleep pattern tracking
- Body measurements and photo progress tracking
- Gamified achievements and milestones

### ✈️ Travel Planning
- Trip planning with detailed itineraries
- Destination search and recommendations
- Flight and hotel price alerts
- AI-powered travel suggestions
- Activity scheduling and management
- Expense tracking per trip
- Shareable trip summaries

### 🛒 Marketplace
- AI-powered product recommendations
- Personalized shopping dashboard
- Cart and wishlist management
- Order tracking and history
- Price tracking with alerts
- Product reviews and Q&A
- Recently viewed items
- Product comparison tool

### 👥 Social Networking
- Social feed with post interactions
- Achievement sharing
- Friend connections and requests
- Shared items discovery
- Profile customization
- Activity timeline

### 🤖 AI-Powered Features
- Natural language command interface
- Cross-module intelligent insights
- Predictive analytics and forecasting
- Personalized recommendations
- Context-aware assistance
- Automated reminders and suggestions

### 💬 Chat System
- Real-time WebSocket messaging
- Direct and group chat rooms
- Message history persistence
- File and image sharing
- Typing indicators
- Read receipts
- Fitness data sharing

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Next-generation build tool
- **TailwindCSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **React Router v6** - Client-side routing
- **Recharts** - Data visualization
- **Framer Motion** - Animation library
- **Socket.io Client** - Real-time communication

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Primary relational database
- **SQLAlchemy** - ORM and database toolkit
- **Alembic** - Database migration management
- **Redis** - Caching and session storage
- **JWT** - Stateless authentication
- **Pydantic** - Data validation and settings

### AI/ML
- **OpenAI API** - GPT-4 integration
- **LangChain** - LLM application framework
- **Vector Databases** - Semantic search capabilities

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Reverse proxy and load balancing
- **Netlify** - Frontend hosting
- **Railway/Render** - Backend deployment options

## 📸 Screenshots

### Dashboard
![Dashboard](./assets/screenshots/dashboard.png)
Unified overview of all modules with key metrics and quick access.

### Finance Dashboard
![Finance](./assets/screenshots/finance-dashboard.png)
Comprehensive financial overview with transactions, budgets, and analytics.

### Fitness Dashboard
![Fitness](./assets/screenshots/fitness-dashboard.png)
Health and fitness tracking with progress visualization.

### Marketplace
![Marketplace](./assets/screenshots/marketplace.png)
AI-powered product discovery and personalized shopping.

### Social
![Social](./assets/screenshots/social.png)
Social networking with feed, connections, and shared content.

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** 14+
- **Redis** 6+
- **Docker** and **Docker Compose** (optional)

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/prachikotadia/Unified-AI-Personal-Platform.git
cd Unified-AI-Personal-Platform
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp env.example .env
# Edit .env with your configuration (DATABASE_URL, REDIS_URL, OPENAI_API_KEY, etc.)

# Initialize database
alembic upgrade head
# Or: python setup_database.py
```

### 3. Frontend Setup

```bash
cd ..

# Install dependencies
npm install

# Configure environment (if needed)
cp .env.example .env
```

### 4. Start Development Servers

**Backend:**
```bash
cd backend
python start.py
# Or: uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
npm run dev
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🐳 Docker Setup

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ⚙️ Configuration

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/omnilife
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
ALLOWED_ORIGINS=http://localhost:3000,https://lifeomni.netlify.app
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## 📚 API Documentation

Interactive API documentation available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User authentication
- `GET /auth/me` - Current user profile
- `POST /auth/guest-login` - Guest mode access

#### Finance
- `GET /api/finance/dashboard` - Financial overview
- `GET /api/finance/transactions` - Transaction list
- `POST /api/finance/transactions` - Create transaction
- `GET /api/finance/budgets` - Budget management
- `GET /api/finance/forecast` - Financial forecasts

#### Fitness
- `GET /api/fitness/dashboard` - Fitness overview
- `GET /api/fitness/workouts` - Workout history
- `POST /api/fitness/workouts` - Log workout
- `GET /api/fitness/goals` - Fitness goals

#### AI
- `POST /api/ai/command` - Execute natural language command
- `GET /api/ai/insights` - Get AI insights
- `POST /api/ai/chat` - Chat with AI assistant

## 🏗️ Project Structure

```
Unified-AI-Personal-Platform/
├── backend/
│   ├── app/
│   │   ├── auth/          # Authentication modules
│   │   ├── models/        # Database models
│   │   ├── routers/       # API route handlers
│   │   ├── services/      # Business logic layer
│   │   ├── schemas/       # Pydantic validation schemas
│   │   └── utils/         # Utility functions
│   ├── alembic/           # Database migrations
│   ├── main.py            # FastAPI application entry
│   └── requirements.txt   # Python dependencies
├── src/
│   ├── components/        # Reusable React components
│   ├── pages/             # Page-level components
│   ├── store/             # Zustand state management
│   ├── services/          # API service layer
│   ├── hooks/             # Custom React hooks
│   ├── utils/            # Utility functions
│   └── config/            # Configuration files
├── assets/                # Static assets
└── docker-compose.yml     # Docker configuration
```

## 🔒 Security Features

- JWT-based stateless authentication
- Password hashing with bcrypt
- CORS configuration
- Rate limiting
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF token validation
- Secure session management

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
npm test
```

## 📦 Deployment

### Frontend (Netlify)
1. Build: `npm run build`
2. Deploy `dist` folder to Netlify
3. Configure environment variables in Netlify dashboard

### Backend
Deployment options:
- Railway
- Render
- AWS/GCP/Azure
- Docker containers

See `deploy/` directory for configuration files.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Prachi Kotadia**

- GitHub: [@prachikotadia](https://github.com/prachikotadia)
- Live Demo: [https://lifeomni.netlify.app/](https://lifeomni.netlify.app/)

## 🙏 Acknowledgments

- OpenAI for GPT models
- LangChain for AI framework
- FastAPI team for the excellent web framework
- React team for the amazing frontend library
- All open-source contributors

---

⭐ If you find this project helpful, please give it a star!
