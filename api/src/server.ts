import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { db } from './config/database';
import { kafkaService } from './config/kafka';
import { EventHandlers } from './services/eventHandlers';
import authRoutes from './routes/auth';
import conversionRoutes from './routes/conversion';
import paymentRoutes from './routes/payment';
import userRoutes from './routes/user';
import webhookRoutes from './routes/webhook';
import { errorHandler } from './middleware/errorHandler';
import { configureProductionSecurity } from './middleware/security';
import { securityContext, auditLog } from './middleware/gdprCompliance';
import { logger } from './utils/logger';

// Extend Express Request type to include user
interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    email?: string;
  };
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Production Security Configuration
configureProductionSecurity(app);

// Session configuration
const PgSession = connectPgSimple(session);
app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'user_sessions'
  }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// GDPR and Security Context Middleware
app.use(securityContext);

// CORS Configuration with GDPR Compliance
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://docme.org.in', 'https://www.docme.org.in']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token',
    'X-API-Key'
  ]
}));

// Security middleware setup - Production security already configured above

// Body parsing with security limits
app.use(express.json({ 
  limit: '50mb'
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb' 
}));

// Initialize services
async function initializeServices() {
  try {
    // Connect to database
    await db.connect();
    
    // Connect to Kafka
    await kafkaService.connect();
    
    // Set up Kafka consumers
    await kafkaService.createConsumer(
      'user-events-consumer',
      ['user-events'],
      EventHandlers.handleUserEvents
    );
    
    await kafkaService.createConsumer(
      'conversion-events-consumer',
      ['file-conversion-events'],
      EventHandlers.handleFileConversionEvents
    );
    
    await kafkaService.createConsumer(
      'payment-events-consumer',
      ['payment-events'],
      EventHandlers.handlePaymentEvents
    );
    
    await kafkaService.createConsumer(
      'audit-events-consumer',
      ['audit-events'],
      EventHandlers.handleAuditEvents
    );
    
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'DOCMe API Server is running',
    version: '1.0.0',
    status: 'OK',
    timestamp: new Date().toISOString(),
    gdpr_compliant: true,
    data_controller: 'DOCMe File Conversion Service',
    privacy_policy: process.env.NODE_ENV === 'production' 
      ? 'https://docme.org.in/privacy' 
      : 'http://localhost:5173/privacy',
    architecture: 'Event-driven with Kafka'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: 'Connected',
    kafka: 'Connected',
    message: 'API Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    security_headers: true,
    gdpr_compliance: true,
    rate_limiting: true,
    event_driven: true
  });
});

// API Routes with GDPR Context
app.use('/api/auth', authRoutes);
app.use('/api/conversion', conversionRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/webhook', webhookRoutes);

// 404 handler
app.use('*', (req, res) => {
  logger.warn('404 - Route not found:', req.originalUrl);

  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Starting graceful shutdown...');
  await kafkaService.disconnect();
  await db.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Starting graceful shutdown...');
  await kafkaService.disconnect();
  await db.disconnect();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    await initializeServices();
    
    app.listen(PORT, () => {
      logger.info(`DOCMe API Server running on port ${PORT}`);
      console.log(`🚀 DOCMe API Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️ Database: PostgreSQL`);
      console.log(`📡 Event System: Apache Kafka`);
      console.log(`🛡️ Security: GDPR Compliant, Rate Limited, Headers Protected`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
startServer();
}
export default app;