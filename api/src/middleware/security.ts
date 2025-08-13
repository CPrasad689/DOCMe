import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { securityContext, logSecurityIncident } from './gdprCompliance';
import { logger } from '../utils/logger';

// Production Security Configuration
export const configureProductionSecurity = (app: Application): void => {
  // Trust proxy headers (required for rate limiting behind load balancers)
  app.set('trust proxy', 1);
  
  // Helmet.js - Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', 'cdn.jsdelivr.net'],
        fontSrc: ["'self'", 'fonts.gstatic.com', 'cdn.jsdelivr.net'],
        scriptSrc: ["'self'", 'js.stripe.com', 'checkout.razorpay.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'api.stripe.com', '*.supabase.co'],
        frameSrc: ['js.stripe.com', 'checkout.razorpay.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // Required for payment processors
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));
  
  // CORS Configuration
  const allowedOrigins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'https://app.yourdomain.com',
    // Add your production domains
  ];
  
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
  }
  
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn('CORS violation', { origin, allowedOrigins });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
    maxAge: 86400 // 24 hours
  }));
  
  // Security context middleware (must be early in chain)
  app.use(securityContext);
  
  // Rate limiting configurations
  const createRateLimit = (
    windowMs: number, 
    max: number, 
    message: string,
    skipSuccessfulRequests = false
  ) => rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res) => {
      logSecurityIncident(
        req,
        'rate_limit_exceeded',
        'medium',
        `Rate limit exceeded: ${message}`
      );
      res.status(429).json({ error: message });
    },
    keyGenerator: (req) => {
      // Use IP + User ID for authenticated requests
      const userId = (req as any).user?.id;
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      return userId ? `${ip}:${userId}` : ip;
    }
  });
  
  // Global rate limit - very generous for general browsing
  app.use(createRateLimit(
    15 * 60 * 1000, // 15 minutes
    1000, // 1000 requests per window
    'Too many requests from this IP, please try again later.'
  ));
  
  // API routes rate limiting
  app.use('/api/auth', createRateLimit(
    15 * 60 * 1000, // 15 minutes
    20, // 20 auth attempts per window
    'Too many authentication attempts, please try again later.',
    true
  ));
  
  app.use('/api/conversion', createRateLimit(
    60 * 1000, // 1 minute
    10, // 10 conversions per minute
    'Conversion rate limit exceeded, please wait before converting more files.'
  ));
  
  app.use('/api/upload', createRateLimit(
    60 * 1000, // 1 minute
    20, // 20 uploads per minute
    'Upload rate limit exceeded, please wait before uploading more files.'
  ));
  
  app.use('/api/payment', createRateLimit(
    60 * 1000, // 1 minute
    5, // 5 payment attempts per minute
    'Payment rate limit exceeded, please wait before trying again.'
  ));
  
  app.use('/api/gdpr', createRateLimit(
    60 * 60 * 1000, // 1 hour
    5, // 5 GDPR requests per hour
    'GDPR request rate limit exceeded, please wait before submitting another request.'
  ));
  
  // Strict rate limiting for sensitive endpoints
  app.use('/api/admin', createRateLimit(
    5 * 60 * 1000, // 5 minutes
    10, // 10 admin requests per window
    'Admin API rate limit exceeded.'
  ));
  
  // Body parsing with size limits
  app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
      // Store raw body for webhook verification
      (req as any).rawBody = buf;
    }
  }));
  
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
  }));
};

// Request validation middleware
export const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const security = (req as any).security;
  
  // Block high-risk requests
  if (security && security.risk_score >= 8) {
    logSecurityIncident(
      req,
      'high_risk_request_blocked',
      'high',
      `Blocked high-risk request with score ${security.risk_score}`
    );
    
    return res.status(403).json({
      error: 'Request blocked for security reasons',
      code: 'HIGH_RISK_REQUEST'
    });
  }
  
  // Validate content type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    if (!contentType || (!contentType.includes('application/json') && !contentType.includes('multipart/form-data'))) {
      return res.status(400).json({
        error: 'Invalid content type',
        code: 'INVALID_CONTENT_TYPE'
      });
    }
  }
  
  next();
};

// File upload security middleware
export const validateFileUpload = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const file = (req as any).file;
  
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // File size validation (handled by multer, but double-check)
  const maxSize = getUserMaxFileSize(req);
  if (file.size > maxSize) {
    logSecurityIncident(
      req,
      'file_size_violation',
      'medium',
      `File size ${file.size} exceeds limit ${maxSize}`
    );
    
    return res.status(413).json({
      error: 'File too large',
      maxSize: maxSize,
      actualSize: file.size
    });
  }
  
  // File type validation
  const allowedMimeTypes = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf',
    'application/vnd.oasis.opendocument.text',
    'text/html',
    
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff',
    'image/svg+xml',
    'image/x-icon',
    
    // Spreadsheets
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/vnd.oasis.opendocument.spreadsheet',
    
    // Presentations
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.oasis.opendocument.presentation'
  ];
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    logSecurityIncident(
      req,
      'invalid_file_type',
      'medium',
      `Invalid file type: ${file.mimetype}`
    );
    
    return res.status(400).json({
      error: 'File type not supported',
      allowedTypes: allowedMimeTypes,
      receivedType: file.mimetype
    });
  }
  
  // Basic file content validation (magic number check)
  if (!validateFileSignature(file)) {
    logSecurityIncident(
      req,
      'file_signature_mismatch',
      'high',
      `File signature doesn't match MIME type: ${file.mimetype}`
    );
    
    return res.status(400).json({
      error: 'File appears to be corrupted or has mismatched file type'
    });
  }
  
  next();
};

// Get user's maximum file size based on plan
const getUserMaxFileSize = (req: express.Request): number => {
  const user = (req as any).user;
  
  if (!user) return 10 * 1024 * 1024; // 10MB for free users
  
  switch (user.plan_type) {
    case 'basic': return 50 * 1024 * 1024; // 50MB
    case 'pro': return 100 * 1024 * 1024; // 100MB
    case 'enterprise': return 500 * 1024 * 1024; // 500MB
    default: return 10 * 1024 * 1024; // 10MB
  }
};

// Basic file signature validation
const validateFileSignature = (file: any): boolean => {
  if (!file.buffer || file.buffer.length < 4) return false;
  
  const signature = file.buffer.subarray(0, 4);
  const mimeType = file.mimetype;
  
  // PDF
  if (mimeType === 'application/pdf') {
    return signature.toString('ascii', 0, 4) === '%PDF';
  }
  
  // JPEG
  if (mimeType === 'image/jpeg') {
    return signature[0] === 0xFF && signature[1] === 0xD8;
  }
  
  // PNG
  if (mimeType === 'image/png') {
    return signature[0] === 0x89 && signature[1] === 0x50 && 
           signature[2] === 0x4E && signature[3] === 0x47;
  }
  
  // ZIP-based formats (DOCX, XLSX, PPTX)
  if (mimeType.includes('openxmlformats')) {
    return signature[0] === 0x50 && signature[1] === 0x4B;
  }
  
  // For other formats, we'll be lenient but this should be expanded
  return true;
};

// API key validation middleware
export const validateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.get('X-API-Key');
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API key required',
      code: 'MISSING_API_KEY'
    });
  }
  
  // Validate API key format (should be a valid UUID or similar)
  const apiKeyRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  if (!apiKeyRegex.test(apiKey)) {
    logSecurityIncident(
      req,
      'invalid_api_key_format',
      'medium',
      'Invalid API key format provided'
    );
    
    return res.status(401).json({ 
      error: 'Invalid API key format',
      code: 'INVALID_API_KEY_FORMAT'
    });
  }
  
  // TODO: Validate against database
  // This should query the api_keys table to verify the key
  // and set req.user and req.apiKey appropriately
  
  next();
};

// Error handling middleware with security consideration
export const securityErrorHandler = (
  error: any, 
  req: express.Request, 
  res: express.Response, 
  next: express.NextFunction
) => {
  // Log the error with security context
  logger.error('Security error handler', {
    error: error.message,
    stack: error.stack,
    request_id: (req as any).security?.request_id,
    ip_address: (req as any).security?.ip_address,
    user_id: (req as any).user?.id
  });
  
  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      request_id: (req as any).security?.request_id
    });
  } else {
    res.status(500).json({
      error: error.message,
      stack: error.stack,
      request_id: (req as any).security?.request_id
    });
  }
};

// Health check endpoint (should be accessible without rate limiting)
export const healthCheck = (req: express.Request, res: express.Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
};

export default {
  configureProductionSecurity,
  validateRequest,
  validateFileUpload,
  validateApiKey,
  securityErrorHandler,
  healthCheck
};
