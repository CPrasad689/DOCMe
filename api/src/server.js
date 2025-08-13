import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import routes
import conversionRoutes from './routes/conversion.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import paymentRoutes from './routes/payment.js';

// Import services
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'docme-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// CORS Configuration
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

// Body parsing with security limits
app.use(express.json({ 
  limit: '50mb'
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb' 
}));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'DOCMe API Server is running',
    version: '1.0.0',
    status: 'OK',
    timestamp: new Date().toISOString(),
    features: {
      file_conversion: true,
      supported_formats: 25,
      batch_processing: true,
      real_time_conversion: true
    }
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
    memory: process.memoryUsage(),
    features: {
      security_headers: true,
      rate_limiting: true,
      file_conversion: true,
      supported_formats: 25
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversion', conversionRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);

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
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Starting graceful shutdown...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Starting graceful shutdown...');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`DOCMe API Server running on port ${PORT}`);
  console.log(`🚀 DOCMe API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🛡️ Security: Rate Limited, Headers Protected`);
  console.log(`📁 File Conversion: 25+ formats supported`);
});

export default app;