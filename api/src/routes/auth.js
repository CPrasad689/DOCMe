import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Mock user database (replace with real database in production)
const users = new Map();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password, and name are required'
      });
    }

    // Check if user already exists
    if (users.has(email)) {
      return res.status(409).json({
        error: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = {
      id: Date.now().toString(),
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      subscription: 'free'
    };

    users.set(email, user);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'docme-jwt-secret',
      { expiresIn: '24h' }
    );

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription
      },
      token
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'docme-jwt-secret',
      { expiresIn: '24h' }
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription
      },
      token
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({
    message: 'Logout successful'
  });
});

export default router;