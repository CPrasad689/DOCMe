import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
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

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dntwhvaorxpzwdjzemph.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_-7sPsKpJJUc2pGheFT0oSA_cXKMhSLp';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GDPR and Security Context Middleware - Must be first
app.use(securityContext);

// Production Security Configuration
configureProductionSecurity(app);

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

// GDPR Audit Logging Middleware (using the audit function)
app.use(async (req, res, next) => {
  try {
    await auditLog({
      user_id: (req as AuthenticatedRequest).user?.id,
      action: 'api_access',
      resource: req.path,
      ip_address: req.ip || req.connection.remoteAddress || 'unknown',
      user_agent: req.get('User-Agent'),
      request_id: res.locals.requestId || 'unknown',
      processing_purpose: 'api_request_processing'
    });
  } catch (error) {
    logger.error('GDPR audit logging failed:', error);
  }
  next();
});

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
      : 'http://localhost:5173/privacy'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    security_headers: true,
    gdpr_compliance: true,
    rate_limiting: true
  });
});

// API Routes with GDPR Context
app.use('/api/auth', authRoutes);
app.use('/api/conversion', conversionRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/webhook', webhookRoutes);

// 404 handler with GDPR logging
app.use('*', async (req, res) => {
  // Log 404 attempts for security monitoring
  try {
    await auditLog({
      user_id: (req as AuthenticatedRequest).user?.id,
      action: 'access_attempt',
      resource: req.originalUrl,
      ip_address: req.ip || req.connection.remoteAddress || 'unknown',
      user_agent: req.get('User-Agent'),
      request_id: res.locals.requestId || 'unknown',
      processing_purpose: '404_security_monitoring'
    });
  } catch (error) {
    logger.error('404 audit logging failed:', error);
  }

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
  auditLog({
    user_id: (req as AuthenticatedRequest).user?.id,
    action: 'system_error',
    resource: req.path,
    ip_address: req.ip || req.connection.remoteAddress || 'unknown',
    user_agent: req.get('User-Agent'),
    request_id: res.locals.requestId || 'unknown',
    processing_purpose: 'error_monitoring'
  }).catch(auditError => {
    logger.error('Error audit logging failed:', auditError);
  });

  // Use existing error handler
  errorHandler(err, req, res, next);
});

// Start server
app.listen(PORT, () => {
  logger.info(`DOCMe API Server running on port ${PORT}`);
  console.log(`🚀 DOCMe API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🛡️  Security: GDPR Compliant, Rate Limited, Headers Protected`);
});

// Start server
app.listen(PORT, () => {
  logger.info(`DOCMe API Server running on port ${PORT}`);
  console.log(`🚀 DOCMe API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🛡️  Security: GDPR Compliant, Rate Limited, Headers Protected`);
});

export default app;