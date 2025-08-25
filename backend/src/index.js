const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Redis = require('ioredis');
const mongoose = require('mongoose');
require('dotenv').config();

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { authenticateToken } = require('./middleware/authMiddleware');
const { logger } = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const financeRoutes = require('./routes/finance');
const marketplaceRoutes = require('./routes/marketplace');
const fitnessRoutes = require('./routes/fitness');
const travelRoutes = require('./routes/travel');
const socialRoutes = require('./routes/social');
const chatRoutes = require('./routes/chat');
const aiRoutes = require('./routes/ai');
const notificationRoutes = require('./routes/notifications');

// Import services
const { initializeAIService } = require('./services/aiService');
const { initializeNotificationService } = require('./services/notificationService');
const { initializeChatService } = require('./services/chatService');
const { initializeMarketplaceService } = require('./services/marketplaceService');

const app = express();
const server = createServer(app);

// Initialize Socket.IO with Redis adapter
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3004",
    methods: ["GET", "POST"]
  }
});

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3004",
  credentials: true
}));
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/finance', authenticateToken, financeRoutes);
app.use('/api/marketplace', authenticateToken, marketplaceRoutes);
app.use('/api/fitness', authenticateToken, fitnessRoutes);
app.use('/api/travel', authenticateToken, travelRoutes);
app.use('/api/social', authenticateToken, socialRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);

// Swagger documentation
if (process.env.NODE_ENV !== 'production') {
  const swaggerJsdoc = require('swagger-jsdoc');
  const swaggerUi = require('swagger-ui-express');
  
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'OmniLife API',
        version: '1.0.0',
        description: 'OmniLife Unified AI Personal Platform API',
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 5000}`,
          description: 'Development server',
        },
      ],
    },
    apis: ['./src/routes/*.js'],
  };
  
  const specs = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);
  
  // Join user to their personal room
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined their room`);
  });
  
  // Handle chat messages
  socket.on('send_message', async (data) => {
    try {
      const { roomId, message, userId } = data;
      // Broadcast to room
      io.to(`room_${roomId}`).emit('new_message', {
        ...message,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error handling chat message:', error);
    }
  });
  
  // Handle typing indicators
  socket.on('typing', (data) => {
    const { roomId, userId, isTyping } = data;
    socket.to(`room_${roomId}`).emit('user_typing', { userId, isTyping });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Initialize services
async function initializeServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/omnilife', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('Connected to MongoDB');

    // Initialize AI Service
    await initializeAIService();
    logger.info('AI Service initialized');

    // Initialize Notification Service
    await initializeNotificationService(io);
    logger.info('Notification Service initialized');

    // Initialize Chat Service
    await initializeChatService(io);
    logger.info('Chat Service initialized');

    // Initialize Marketplace Service
    await initializeMarketplaceService();
    logger.info('Marketplace Service initialized');

  } catch (error) {
    logger.error('Error initializing services:', error);
    process.exit(1);
  }
}

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  await initializeServices();
  
  server.listen(PORT, () => {
    logger.info(`🚀 OmniLife Backend Server running on port ${PORT}`);
    logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    mongoose.connection.close();
    redis.disconnect();
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    mongoose.connection.close();
    redis.disconnect();
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', err);
  server.close(() => {
    process.exit(1);
  });
});

startServer();

module.exports = { app, server, io };
