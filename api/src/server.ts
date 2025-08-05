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
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dntwhvaorxpzwdjzemph.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_-7sPsKpJJUc2pGheFT0oSA_cXKMhSLp';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://docme.org.in', 'https://www.docme.org.in']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'DOCMe API Server is running',
    version: '1.0.0',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversion', conversionRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/webhook', webhookRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`DOCMe API Server running on port ${PORT}`);
  console.log(`🚀 DOCMe API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;