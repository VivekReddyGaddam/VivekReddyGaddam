const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const storyRoutes = require('./routes/stories');
const aiRoutes = require('./routes/ai');
const userRoutes = require('./routes/users');
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { initializeAI } = require('./services/aiService');
const { initializeConsistency } = require('./services/consistencyService');
const { initializePersonalization } = require('./services/personalizationService');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-story', (storyId) => {
    socket.join(`story-${storyId}`);
    console.log(`User ${socket.id} joined story ${storyId}`);
  });
  
  socket.on('story-update', (data) => {
    socket.to(`story-${data.storyId}`).emit('story-updated', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Initialize services
const initializeApp = async () => {
  try {
    await connectDB();
    await connectRedis();
    await initializeAI();
    await initializeConsistency();
    await initializePersonalization();
    
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 StoryForge AI Server running on port ${PORT}`);
      console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
};

initializeApp();

module.exports = { app, io };