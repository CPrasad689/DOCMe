import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    // Mock user data (replace with database query)
    const user = {
      id: req.user.userId,
      email: req.user.email,
      name: 'John Doe',
      subscription: 'free',
      conversionsUsed: 5,
      conversionsLimit: 10,
      createdAt: new Date().toISOString()
    };

    res.json({
      user
    });
  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name } = req.body;

    // Mock update (replace with database update)
    const updatedUser = {
      id: req.user.userId,
      email: req.user.email,
      name: name || 'John Doe',
      subscription: 'free',
      updatedAt: new Date().toISOString()
    };

    logger.info(`Profile updated for user: ${req.user.email}`);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;