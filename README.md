# Unified AI Personal Platform (OmniLife)

A comprehensive, AI-powered personal management platform that integrates finance, fitness, travel, marketplace, social networking, and intelligent chat capabilities into a single unified experience.

🌐 **Live Demo**: [https://lifeomni.netlify.app/](https://lifeomni.netlify.app/)

## 🚀 Features

### 💰 Finance Management
- **Transaction Tracking**: Monitor income, expenses, and account balances
- **Budget Planning**: Create and manage budgets with AI-powered recommendations
- **Financial Forecasting**: Predictive analytics for future financial planning
- **Investment Tracking**: Monitor portfolios and investment performance
- **Debt Management**: Track and manage debts with payoff strategies
- **Bank Integration**: Connect multiple bank accounts for real-time sync
- **Financial Reports**: Comprehensive reports and visualizations

### 💪 Fitness & Health
- **Workout Tracking**: Log workouts, exercises, and training sessions
- **Nutrition Planning**: Track meals, calories, and nutritional goals
- **Progress Monitoring**: Visualize fitness progress with charts and metrics
- **Exercise Library**: Access to comprehensive exercise database
- **Workout Plans**: AI-generated personalized workout routines
- **Sleep Tracking**: Monitor sleep patterns and quality
- **Achievements**: Gamified fitness achievements and milestones
- **Body Measurements**: Track weight, body fat, and other metrics

### ✈️ Travel Planning
- **Trip Planning**: Create and manage travel itineraries
- **Destination Search**: Discover and explore travel destinations
- **Price Alerts**: Get notified about flight and hotel price changes
- **Itinerary Management**: Organize travel plans with detailed schedules
- **AI Recommendations**: Personalized travel suggestions based on preferences

### 🛒 Marketplace
- **Product Discovery**: Browse products with AI-powered recommendations
- **Smart Shopping**: Personalized product suggestions
- **Cart & Checkout**: Seamless shopping experience
- **Order Management**: Track orders and purchase history
- **Wishlist**: Save favorite products for later
- **Price Tracking**: Monitor price changes and get alerts
- **Product Reviews**: Read and write product reviews
- **Recently Viewed**: Quick access to recently browsed items

### 👥 Social Networking
- **Social Feed**: Connect with friends and share updates
- **Achievement Sharing**: Share fitness and life achievements
- **Shared Items**: Discover items shared by connections
- **Social Interactions**: Like, comment, and engage with posts

### 🤖 AI-Powered Features
- **AI Assistant**: Natural language chat interface for platform interactions
- **Smart Insights**: AI-generated insights across all modules
- **Predictive Analytics**: Forecast trends and patterns
- **Personalized Recommendations**: Tailored suggestions for all features
- **Natural Language Commands**: Execute actions through conversational interface
- **Intelligent Reminders**: Smart reminders with contextual suggestions

### 💬 Chat System
- **Real-time Messaging**: WebSocket-based chat functionality
- **Chat Rooms**: Create and join chat rooms
- **Message History**: Persistent chat history
- **Sentiment Analysis**: AI-powered chat analysis

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Zustand** - State management
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Recharts** - Data visualization
- **Socket.io Client** - Real-time communication
- **Framer Motion** - Animations
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Primary database
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations
- **Redis** - Caching and session management
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Pydantic** - Data validation

### AI/ML
- **LangChain** - LLM application framework
- **OpenAI API** - GPT models integration
- **ChromaDB** - Vector database
- **FAISS** - Similarity search
- **Sentence Transformers** - Embeddings
- **TensorFlow** - Machine learning framework
- **scikit-learn** - ML algorithms
- **Pandas & NumPy** - Data processing

### Infrastructure
- **Docker** & **Docker Compose** - Containerization
- **Nginx** - Reverse proxy
- **Gunicorn** - WSGI server
- **Celery** - Background tasks
- **Prometheus** - Monitoring

## 📸 Screenshots

### Dashboard
![Dashboard Screenshot](./assets/screenshots/dashboard.png)

The main dashboard provides a unified view of all modules with key metrics and quick access to each feature.

### Finance Dashboard
![Finance Dashboard](./assets/screenshots/finance-dashboard.png)

Comprehensive financial overview with total balance, monthly income/expenses, credit score, recent transactions, and linked bank accounts.

### Fitness Dashboard
![Fitness Dashboard](./assets/screenshots/fitness-dashboard.png)

Track your health and fitness progress with step counting, calorie tracking, workout logging, and weekly progress visualization.

### Marketplace
![Marketplace](./assets/screenshots/marketplace.png)

AI-powered product recommendations with personalized shopping preferences and recently viewed items.

### Social
![Social App Screenshot](./assets/screenshots/social.png)

Connect with friends, share achievements, and view shared items from your connections.

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** 14+
- **Redis** 6+
- **Docker** and **Docker Compose** (optional)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/prachikotadia/Unified-AI-Personal-Platform.git
cd Unified-AI-Personal-Platform
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp env.example .env

# Edit .env with your configuration
# Set DATABASE_URL, REDIS_URL, OPENAI_API_KEY, etc.
```

### 3. Database Setup

```bash
# Run migrations
alembic upgrade head

# Or initialize database
python setup_database.py
```

### 4. Frontend Setup

```bash
cd ..

# Install dependencies
npm install

# Copy environment file (if needed)
cp .env.example .env
```

### 5. Start Development Servers

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

The application will be available at:
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

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/guest-login` - Guest mode access

#### Finance
- `GET /api/finance/dashboard` - Financial overview
- `GET /api/finance/transactions` - Transaction list
- `POST /api/finance/transactions` - Create transaction
- `GET /api/finance/budgets` - Budget list
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
│   │   ├── models/         # Database models
│   │   ├── routers/        # API routes
│   │   ├── services/       # Business logic
│   │   ├── schemas/        # Pydantic schemas
│   │   └── utils/          # Utility functions
│   ├── alembic/            # Database migrations
│   ├── main.py             # FastAPI application
│   └── requirements.txt     # Python dependencies
├── src/
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── store/              # Zustand state management
│   ├── services/           # API services
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Utility functions
├── assets/
│   └── screenshots/         # Project screenshots
├── docker-compose.yml       # Docker configuration
└── package.json            # Frontend dependencies
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CSRF tokens

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
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables in Netlify dashboard

### Backend
The backend can be deployed to:
- Railway
- Render
- AWS/GCP/Azure
- Docker containers

See deployment configuration files in the `deploy/` directory.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
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
- FastAPI for the excellent web framework
- React team for the amazing frontend library
- All open-source contributors

---

⭐ If you find this project helpful, please give it a star!

