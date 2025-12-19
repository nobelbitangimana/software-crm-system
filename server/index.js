const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const companyRoutes = require('./routes/companies');
const contactRoutes = require('./routes/contacts');
const dealRoutes = require('./routes/deals');
const campaignRoutes = require('./routes/campaigns');
const ticketRoutes = require('./routes/tickets');
const analyticsRoutes = require('./routes/analytics');
const workflowRoutes = require('./routes/workflows');

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

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

// CORS configuration for production and development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://warm-stroopwafel-01d9af.netlify.app',
      process.env.CLIENT_URL
    ].filter(Boolean); // Remove any undefined values
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (room) => {
    socket.join(room);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: isDemoMode ? 'demo' : 'mongodb'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/workflows', workflowRoutes);

// Error handling
app.use(errorHandler);

// Database connection
let isDemoMode = false;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm')
.then(() => {
  logger.info('MongoDB connected');
  console.log('✅ MongoDB connected successfully');
})
.catch(err => {
  logger.error('MongoDB connection error:', err);
  isDemoMode = true;
  console.log('\n⚠️  MongoDB Connection Failed!');
  console.log('🔄 Starting in DEMO MODE with in-memory database');
  console.log('📝 Demo credentials:');
  console.log('   Admin: admin@crm.com / admin123');
  console.log('   Sales: sales@crm.com / sales123');
  console.log('\n💡 To use full features, install MongoDB:');
  console.log('   https://www.mongodb.com/try/download/community');
  console.log('   Or use MongoDB Atlas: https://www.mongodb.com/atlas\n');
});

// Make demo mode available globally
app.set('isDemoMode', isDemoMode);

const { findAvailablePort } = require('./find-port');

const startServer = async () => {
  try {
    const PORT = await findAvailablePort(3001);
    
    server.listen(PORT, '127.0.0.1', () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(`\n🚀 CRM Server started successfully!`);
      console.log(`📡 Backend API: http://localhost:${PORT}/api`);
      console.log(`🌐 Frontend: http://localhost:3000`);
      
      if (isDemoMode) {
        console.log(`\n⚠️  Running in DEMO MODE`);
      }
      
      console.log(`\n💡 Demo Credentials:`);
      console.log(`   Admin: admin@crm.com / admin123`);
      console.log(`   Sales: sales@crm.com / sales123\n`);
      
      // Update client .env if port changed
      if (PORT !== 3001) {
        const fs = require('fs');
        const path = require('path');
        const clientEnvPath = path.join(__dirname, '../client/.env');
        const clientEnvContent = `REACT_APP_API_URL=http://localhost:${PORT}/api\n`;
        try {
          fs.writeFileSync(clientEnvPath, clientEnvContent);
          console.log(`📝 Updated client/.env with new API URL: http://localhost:${PORT}/api`);
        } catch (err) {
          console.log(`⚠️  Could not update client/.env automatically. Please update REACT_APP_API_URL to http://localhost:${PORT}/api`);
        }
      }
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;