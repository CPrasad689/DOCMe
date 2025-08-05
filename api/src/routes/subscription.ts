import express from 'express';
import Stripe from 'stripe';
import { authenticateUser } from '../middleware/auth';
import { supabase } from '../server';
import { logger } from '../utils/logger';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// Stripe price IDs (set these in your Stripe dashboard)
const PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
  enterprise_monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || 'price_enterprise_monthly',
  enterprise_yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || 'price_enterprise_yearly'
};

// Get user's current subscription
router.get('/current', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        plan_type,
        subscription_status,
        stripe_customer_id,
        subscriptions (
          stripe_subscription_id,
          plan_type,
          status,
          current_period_start,
          current_period_end,
          cancel_at_period_end
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('Error fetching user subscription:', error);
      return res.status(500).json({ error: 'Failed to fetch subscription' });
    }

    res.json({
      planType: user.plan_type,
      status: user.subscription_status,
      subscription: user.subscriptions?.[0] || null
    });

  } catch (error) {
    logger.error('Error in current subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create checkout session
router.post('/create-checkout-session', authenticateUser, async (req, res) => {
  try {
    const { priceId, planType } = req.body;
    const userId = req.user.id;

    if (!priceId || !planType) {
      return res.status(400).json({ error: 'Price ID and plan type are required' });
    }

    // Get or create Stripe customer
    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id, email, full_name')
      .eq('id', userId)
      .single();

    let customerId = user?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email,
        name: user?.full_name,
        metadata: {
          userId: userId
        }
      });

      customerId = customer.id;

      // Update user with Stripe customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.VITE_API_URL?.replace('/api', '')}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_API_URL?.replace('/api', '')}/pricing`,
      metadata: {
        userId: userId,
        planType: planType
      }
    });

    res.json({ sessionId: session.id, url: session.url });

  } catch (error) {
    logger.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create customer portal session
router.post('/create-portal-session', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (!user?.stripe_customer_id) {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.VITE_API_URL?.replace('/api', '')}/dashboard`,
    });

    res.json({ url: session.url });

  } catch (error) {
    logger.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Get usage statistics
router.get('/usage', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current month usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: conversions, error } = await supabase
      .from('conversions')
      .select('id, file_size, created_at')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    if (error) {
      logger.error('Error fetching usage:', error);
      return res.status(500).json({ error: 'Failed to fetch usage' });
    }

    const totalConversions = conversions?.length || 0;
    const totalDataProcessed = conversions?.reduce((sum, conv) => sum + (conv.file_size || 0), 0) || 0;

    // Get user's plan limits
    const { data: user } = await supabase
      .from('users')
      .select('plan_type, api_usage_count')
      .eq('id', userId)
      .single();

    const limits = {
      free: { conversions: 5, dataLimit: 100 * 1024 * 1024 }, // 100MB
      pro: { conversions: -1, dataLimit: 10 * 1024 * 1024 * 1024 }, // 10GB
      enterprise: { conversions: -1, dataLimit: -1 } // unlimited
    };

    const userLimits = limits[user?.plan_type as keyof typeof limits] || limits.free;

    res.json({
      currentPeriod: {
        conversions: totalConversions,
        dataProcessed: totalDataProcessed,
        startDate: startOfMonth.toISOString()
      },
      limits: {
        conversions: userLimits.conversions,
        dataLimit: userLimits.dataLimit
      },
      planType: user?.plan_type || 'free'
    });

  } catch (error) {
    logger.error('Error in usage endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;