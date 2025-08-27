# OmniLife - Unified AI Personal Platform

A modern, cloud-native full-stack application that combines AI-powered personal finance, e-commerce marketplace, health & fitness tracking, travel planning, social features, and real-time chat into one unified platform.

## 🚀 Features

### Core Modules
- **💰 AI-Powered Finance**: Budgeting, expense tracking, forecasting, and smart insights
- **🛍️ E-commerce Marketplace**: Product catalog with AI recommendations and shopping cart
- **💪 Health & Fitness**: Activity tracking, workout logging, nutrition, and progress analytics
- **✈️ Travel Planning**: Trip suggestions, itinerary generation, and price alerts
- **👥 Social Features**: Share budgets, trips, workouts, and connect with friends
- **💬 Real-time Chat**: WebSocket-based messaging with presence indicators

### Technical Features
- **🎨 Modern UI/UX**: Glassmorphism design with Framer Motion animations
- **📱 Responsive Design**: Mobile-first approach with adaptive layouts
- **🌙 Dark/Light Theme**: Seamless theme switching with system preference detection
- **🔐 Authentication**: OAuth2 (Google/GitHub) + JWT with secure session management
- **⚡ Real-time Updates**: WebSocket connections for live data synchronization
- **🤖 AI Integration**: Personalized recommendations and intelligent insights
- **📊 Data Visualization**: Interactive charts and progress tracking

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling with custom design system
- **Framer Motion** for smooth animations and transitions
- **React Query** for server state management
- **Zustand** for client state management
- **React Router v6** for navigation
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend (Planned)
- **FastAPI** (Python) for microservices
- **Node.js/Express** for some services
- **PostgreSQL** for transactional data
- **Redis** for caching and sessions
- **MongoDB** for event logs and analytics
- **Neo4j** for social graph and recommendations
- **Elasticsearch** for product search
- **Kafka** for event streaming
- **Kubernetes** for orchestration

### AI/ML
- **TensorFlow/PyTorch** for machine learning models
- **Personalization models** for recommendations
- **Time-series forecasting** for finance predictions
- **Anomaly detection** for expense monitoring
- **Natural language processing** for chat and summaries

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Navbar, Sidebar, etc.)
│   ├── ui/             # Basic UI components
│   └── charts/         # Data visualization components
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── finance/        # Finance module pages
│   ├── marketplace/    # Marketplace module pages
│   ├── fitness/        # Fitness module pages
│   ├── travel/         # Travel module pages
│   ├── social/         # Social module pages
│   └── chat/           # Chat module pages
├── store/              # State management (Zustand stores)
├── lib/                # Utility functions and helpers
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── styles/             # Global styles and CSS
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/omnilife-frontend.git
   cd omnilife-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (`#4A90E2` to `#007AFF`)
- **Success**: Green gradient (`#43E97B` to `#38F9D7`)
- **Warning**: Orange gradient (`#FF6A00` to `#FF8E53`)
- **Info**: Purple gradient (`#8E2DE2` to `#4A00E0`)

### Glassmorphism Effect
- Background blur: `backdrop-filter: blur(12px)`
- Transparency: `rgba(255, 255, 255, 0.15)` (light) / `rgba(0, 0, 0, 0.25)` (dark)
- Border radius: `20px`
- Soft shadows for depth

### Typography
- **Headings**: Inter font family
- **Body**: System font stack
- **Monospace**: JetBrains Mono for code

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GITHUB_CLIENT_ID=your-github-client-id
```

### TailwindCSS Configuration
The project uses a custom TailwindCSS configuration with:
- Custom color palette
- Glassmorphism utilities
- Animation keyframes
- Responsive breakpoints

## 📱 Responsive Design

The application is built with a mobile-first approach:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 🔐 Authentication

The app supports multiple authentication methods:
- **Email/Password**: Traditional login with validation
- **Google OAuth**: One-click Google sign-in
- **GitHub OAuth**: Developer-friendly GitHub integration

### Security Features
- JWT token management
- Secure session storage
- Password hashing (bcrypt)
- CSRF protection
- Rate limiting

## 🎯 Key Features Implementation

### 1. Dashboard
- Unified overview of all modules
- Real-time data updates
- Quick action buttons
- AI-powered insights

### 2. Finance Module
- Transaction tracking
- Budget management
- Expense categorization
- AI forecasting
- Spending analytics

### 3. Marketplace
- Product catalog
- AI recommendations
- Shopping cart
- Order management
- Search and filtering

### 4. Fitness Tracking
- Workout logging
- Nutrition tracking
- Progress analytics
- Goal setting
- Achievement badges

### 5. Travel Planning
- Destination search
- AI itinerary generation
- Price tracking
- Trip sharing
- Travel recommendations

### 6. Social Features
- User profiles
- Content sharing
- Activity feed
- Friend connections
- Privacy controls

### 7. Real-time Chat
- WebSocket messaging
- User presence
- File sharing
- Group chats
- Message history

## 🧪 Testing

### Test Structure
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API integration and state management
- **E2E Tests**: User flow testing with Playwright

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Environment Setup
1. Set up environment variables
2. Configure API endpoints
3. Set up OAuth providers
4. Configure WebSocket connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write unit tests for new features
- Update documentation for API changes
- Follow the established design system

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-username/omnilife-frontend/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/omnilife-frontend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/omnilife-frontend/discussions)

## 🙏 Acknowledgments

- [Framer Motion](https://www.framer.com/motion/) for animations
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons
- [Recharts](https://recharts.org/) for charts
- [React Query](https://tanstack.com/query) for data fetching

---

**OmniLife** - Empowering your lifestyle with AI 🚀
