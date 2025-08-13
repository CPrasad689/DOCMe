import express from 'express';
import { AuthService } from '../services/authService';
import { kafkaService, KAFKA_TOPICS, EVENT_TYPES } from '../config/kafka';
import { logger } from '../utils/logger';

const router = express.Router();

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Create user with AuthService
    const user = await AuthService.createUser({
      email,
      password,
      firstName: fullName?.split(' ')[0],
      lastName: fullName?.split(' ').slice(1).join(' ')
    });

    // Generate JWT token
    const loginResult = await AuthService.loginUser(
      { email, password },
      req.ip || 'unknown',
      req.get('User-Agent') || 'unknown'
    );

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: fullName,
        planType: user.subscriptionTier
      },
      token: loginResult.token
    });

  } catch (error) {
    logger.error('Signup error:', error);
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Registration failed' 
    });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const loginResult = await AuthService.loginUser(
      { email, password },
      req.ip || 'unknown',
      req.get('User-Agent') || 'unknown'
    );

    return res.json({
      user: loginResult.user,
      token: loginResult.token
    });

  } catch (error) {
    logger.error('Signin error:', error);
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    });
  }
});

// Sign out
router.post('/signout', async (req, res) => {
  try {
    const user = (req as any).user;
    
    if (user) {
      // Publish logout event
      await kafkaService.publishEvent(KAFKA_TOPICS.USER_EVENTS, {
        type: EVENT_TYPES.USER_LOGOUT,
        userId: user.id,
        email: user.email
      });
    }

    return res.json({ message: 'Signed out successfully' });

  } catch (error) {
    logger.error('Signout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const user = await AuthService.verifyToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        planType: user.subscriptionTier,
        subscriptionStatus: 'active' // This would come from subscription service
      }
    });

  } catch (error) {
    logger.error('Get user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;