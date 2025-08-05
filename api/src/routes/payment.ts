import express from 'express';
import crypto from 'crypto';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { supabase } from '../server';
import { logger } from '../utils/logger';

const router = express.Router();

// Mock Razorpay for development
const mockRazorpay = {
  customers: {
    create: async (data: any) => ({ id: `cust_${Date.now()}` })
  },
  orders: {
    create: async (data: any) => ({
      id: `order_${Date.now()}`,
      amount: data.amount,
      currency: data.currency
    })
  },
  payments: {
    fetch: async (id: string) => ({
      id,
      status: 'captured',
      amount: 199000,
      currency: 'INR',
      method: 'card',
      created_at: Math.floor(Date.now() / 1000)
    })
  }
};

// Get user's current subscription
router.get('/subscription/current', authenticateUser, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        plan_type,
        subscription_status,
        razorpay_customer_id
      `)
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('Error fetching user subscription:', error);
      return res.status(500).json({ error: 'Failed to fetch subscription' });
    }

    return res.json({
      planType: user.plan_type,
      status: user.subscription_status,
      subscription: null
    });

  } catch (error) {
    logger.error('Error in current subscription:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Razorpay order for subscription
router.post('/subscription/create-order', authenticateUser, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { planType, billingCycle = 'monthly' } = req.body;
    const userId = req.user.id;

    if (!planType || !['pro', 'enterprise'].includes(planType)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    // Define plan amounts (in paise)
    const planAmounts: { [key: string]: { [key: string]: number } } = {
      pro: {
        monthly: 199000, // ₹1,990
        yearly: 1990000  // ₹19,900
      },
      enterprise: {
        monthly: 999000, // ₹9,990
        yearly: 9990000  // ₹99,900
      }
    };

    const amount = planAmounts[planType][billingCycle];

    // Create mock order
    const order = await mockRazorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `order_${userId}_${Date.now()}`
    });

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: 'rzp_test_demo_key'
    });

  } catch (error) {
    logger.error('Error creating Razorpay order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment and create subscription
router.post('/subscription/verify-payment', authenticateUser, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      planType,
      billingCycle = 'monthly'
    } = req.body;
    const userId = req.user.id;

    // Mock payment verification (in production, verify with actual Razorpay)
    const payment = await mockRazorpay.payments.fetch(razorpay_payment_id);

    // Update user plan
    await supabase
      .from('users')
      .update({
        plan_type: planType,
        subscription_status: 'active'
      })
      .eq('id', userId);

    return res.json({
      success: true,
      message: 'Payment verified and subscription activated'
    });

  } catch (error) {
    logger.error('Error verifying payment:', error);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Get payment history
router.get('/payments/history', authenticateUser, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user.id;

    return res.json({
      payments: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      }
    });

  } catch (error) {
    logger.error('Error in payment history:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get invoices
router.get('/invoices', authenticateUser, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    return res.json({ invoices: [] });
  } catch (error) {
    logger.error('Error in invoices endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;