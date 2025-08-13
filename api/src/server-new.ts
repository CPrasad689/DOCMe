import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import conversionRoutes from './routes/conversion';
import paymentRoutes from './routes/payment';
import userRoutes from './routes/user';
import webhookRoutes from './routes/webhook';
import { errorHandler } from './middleware/errorHandler';
import { configureProductionSecurity } from './middleware/security';
import { logDataProcessing, logSecurityEvent } from './middleware/gdprCompliance';
import { logger } from './utils/logger';
import { prisma, checkDatabaseConnection, disconnectDatabase } from './lib/database';

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

// Database connection check
async function initializeDatabase() {
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    console.error('❌ Failed to connect to PostgreSQL database');
    process.exit(1);
  }
}

// GDPR and Security Context Middleware
app.use((req, res, next) => {
  // Add security context to request
  (req as any).securityContext = {
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    timestamp: new Date(),
    path: req.path,
    method: req.method
  };
  next();
});

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/health' || req.path.startsWith('/api/webhook');
  }
});

app.use(limiter);

// CORS Configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: process.env.CORS_CREDENTIALS === 'true',
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

// Security middleware setup
configureProductionSecurity(app);

// Body parsing with security limits
app.use(express.json({ 
  limit: process.env.MAX_FILE_SIZE || '50mb',
  verify: (req, res, buf) => {
    // GDPR audit log for data processing
    logDataProcessing(req as any, 'json_parsing', {
      contentLength: buf.length,
      contentType: req.get('content-type')
    });
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_FILE_SIZE || '50mb'
}));

// GDPR Audit Logging Middleware
app.use((req, res, next) => {
  // Log all requests for GDPR compliance
  const context = (req as any).securityContext;
  logDataProcessing(req as any, 'api_request', {
    endpoint: req.path,
    method: req.method,
    userAgent: context.userAgent,
    ipAddress: context.ipAddress
  });
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'DOCMe API Server is running',
    version: '2.0.0',
    status: 'OK',
    timestamp: new Date().toISOString(),
    gdpr_compliant: true,
    database: 'PostgreSQL',
    hosted_on: 'Hostinger',
    data_controller: 'DOCMe File Conversion Service',
    privacy_policy: process.env.NODE_ENV === 'production' 
      ? `${process.env.FRONTEND_URL}/privacy` 
      : 'http://localhost:5173/privacy'
  });
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({ 
      status: 'OK', 
      message: 'API Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'Connected',
      security_headers: true,
      gdpr_compliance: true,
      rate_limiting: true,
      version: '2.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' ? error : 'Service unavailable'
    });
  }
});

// Database stats route (for monitoring)
app.get('/api/stats', async (req, res) => {
  try {
    const [
      userCount,
      conversionCount,
      activeSubscriptions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.fileConversion.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } })
    ]);

    res.json({
      users: userCount,
      conversions: conversionCount,
      activeSubscriptions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// API Routes with GDPR Context
app.use('/api/auth', authRoutes);
app.use('/api/conversion', conversionRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/webhook', webhookRoutes);

// 404 handler with GDPR logging
app.use('*', (req, res) => {
  // Log 404 attempts for security monitoring
  logSecurityEvent(req as any, 'route_not_found', {
    path: req.originalUrl,
    method: req.method,
    severity: 'LOW',
    security_event: true
  });

  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Enhanced Error handler with GDPR compliance
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Log errors for GDPR compliance and security
  logSecurityEvent(req as any, 'system_error', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    severity: 'HIGH',
    security_event: true
  });

  // Use existing error handler
  errorHandler(err, req, res, next);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Starting graceful shutdown...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Starting graceful shutdown...');
  await disconnectDatabase();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      logger.info(`DOCMe API Server v2.0 running on port ${PORT}`);
      console.log(`🚀 DOCMe API Server v2.0 running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📈 Stats: http://localhost:${PORT}/api/stats`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗃️  Database: PostgreSQL (Hostinger)`);
      console.log(`🔒 GDPR Compliant: ✅`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
export { prisma };
