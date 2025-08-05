import express from 'express';
import { authenticateUser } from '../middleware/auth';
import { supabase } from '../server';
import { logger } from '../utils/logger';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        avatar_url,
        plan_type,
        subscription_status,
        api_usage_count,
        created_at
      `)
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('Error fetching user profile:', error);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    res.json({ user });

  } catch (error) {
    logger.error('Error in user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, avatarUrl } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        avatar_url: avatarUrl
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating user profile:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json({ user });

  } catch (error) {
    logger.error('Error in update profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get conversion statistics
    const { data: conversions, error: conversionError } = await supabase
      .from('conversions')
      .select('status, file_size, created_at')
      .eq('user_id', userId);

    if (conversionError) {
      logger.error('Error fetching conversion stats:', conversionError);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }

    const totalConversions = conversions?.length || 0;
    const completedConversions = conversions?.filter(c => c.status === 'completed').length || 0;
    const totalDataProcessed = conversions?.reduce((sum, c) => sum + (c.file_size || 0), 0) || 0;

    // Get this month's conversions
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthConversions = conversions?.filter(c => 
      new Date(c.created_at) >= startOfMonth
    ).length || 0;

    res.json({
      totalConversions,
      completedConversions,
      totalDataProcessed,
      thisMonthConversions,
      successRate: totalConversions > 0 ? (completedConversions / totalConversions) * 100 : 0
    });

  } catch (error) {
    logger.error('Error in user stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;