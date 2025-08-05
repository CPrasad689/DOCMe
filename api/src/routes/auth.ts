import express from 'express';
import { supabase } from '../server';
import { logger } from '../utils/logger';

const router = express.Router();

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (authError) {
      logger.error('Signup error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'Failed to create user' });
    }

    // Create user profile in database
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        full_name: fullName,
        plan_type: 'free',
        subscription_status: 'inactive'
      });

    if (profileError) {
      logger.error('Profile creation error:', profileError);
      // If user already exists, that's okay
      if (!profileError.message.includes('duplicate key')) {
        return res.status(500).json({ error: 'Failed to create user profile' });
      }
    }

    return res.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName: fullName
      },
      session: authData.session
    });

  } catch (error) {
    logger.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      logger.error('Signin error:', error);
      return res.status(400).json({ error: error.message });
    }

    if (!data.user) {
      return res.status(400).json({ error: 'Authentication failed' });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: profile?.full_name,
        planType: profile?.plan_type,
        subscriptionStatus: profile?.subscription_status
      },
      session: data.session
    });

  } catch (error) {
    logger.error('Signin error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign out
router.post('/signout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await supabase.auth.signOut();
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
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: profile.full_name,
        planType: profile.plan_type,
        subscriptionStatus: profile.subscription_status
      }
    });

  } catch (error) {
    logger.error('Get user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;