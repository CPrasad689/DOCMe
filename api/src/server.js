import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session middleware (simplified for WebContainer)
app.use(session({
  secret: process.env.SESSION_SECRET || 'docme-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'DOCMe API',
    architecture: 'Event-Driven with Kafka'
  });
});

// Mock authentication routes (simplified for WebContainer)
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  
  // Mock user creation
  const user = {
    id: Date.now().toString(),
    email,
    created_at: new Date().toISOString()
  };
  
  // Mock JWT token
  const token = `mock-jwt-token-${user.id}`;
  
  res.json({
    success: true,
    user,
    token,
    message: 'User registered successfully'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock user authentication
  const user = {
    id: Date.now().toString(),
    email,
    created_at: new Date().toISOString()
  };
  
  // Mock JWT token
  const token = `mock-jwt-token-${user.id}`;
  
  res.json({
    success: true,
    user,
    token,
    message: 'Login successful'
  });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Mock conversion routes
app.get('/api/conversion/formats', (req, res) => {
  res.json({
    success: true,
    formats: {
      input: ['pdf', 'docx', 'txt', 'md', 'html'],
      output: ['pdf', 'docx', 'txt', 'md', 'html', 'json']
    }
  });
});

app.post('/api/convert', (req, res) => {
  const { file, targetFormat } = req.body;
  
  // Mock conversion process
  setTimeout(() => {
    res.json({
      success: true,
      message: 'File converted successfully',
      result: {
        id: Date.now().toString(),
        originalName: file?.name || 'document.pdf',
        convertedFormat: targetFormat || 'docx',
        downloadUrl: '/api/download/mock-file-id',
        createdAt: new Date().toISOString()
      }
    });
  }, 2000); // Simulate processing time
});

// Mock payment routes
app.post('/api/payment/create-intent', (req, res) => {
  const { amount, currency } = req.body;
  
  res.json({
    success: true,
    clientSecret: `mock-client-secret-${Date.now()}`,
    amount,
    currency: currency || 'usd'
  });
});

// Mock user routes
app.get('/api/user/profile', (req, res) => {
  res.json({
    success: true,
    user: {
      id: '1',
      email: 'user@example.com',
      subscription: 'free',
      conversionsUsed: 5,
      conversionsLimit: 10,
      created_at: new Date().toISOString()
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DOCMe API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Event-driven architecture ready (Kafka simulation mode)`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});