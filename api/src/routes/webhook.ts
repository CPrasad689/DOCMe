import express from 'express';
import Stripe from 'stripe';
import { supabase } from '../server';
import { logger } from '../utils/logger';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Stripe webhook handler
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planType = session.metadata?.planType;

  if (!userId || !planType) {
    logger.error('Missing metadata in checkout session');
    return;
  }

  // Update user's plan
  await supabase
    .from('users')
    .update({
      plan_type: planType,
      subscription_status: 'active'
    })
    .eq('id', userId);

  logger.info(`Checkout completed for user ${userId}, plan: ${planType}`);
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Get user by Stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!user) {
    logger.error(`User not found for customer ${customerId}`);
    return;
  }

  // Determine plan type from price ID
  const priceId = subscription.items.data[0]?.price.id;
  const planType = getPlanTypeFromPriceId(priceId);

  // Create subscription record
  await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      plan_type: planType,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end
    });

  // Update user
  await supabase
    .from('users')
    .update({
      plan_type: planType,
      subscription_status: subscription.status
    })
    .eq('id', user.id);

  logger.info(`Subscription created for user ${user.id}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!existingSubscription) {
    logger.error(`Subscription not found: ${subscription.id}`);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const planType = getPlanTypeFromPriceId(priceId);

  // Update subscription
  await supabase
    .from('subscriptions')
    .update({
      stripe_price_id: priceId,
      plan_type: planType,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end
    })
    .eq('stripe_subscription_id', subscription.id);

  // Update user
  await supabase
    .from('users')
    .update({
      plan_type: planType,
      subscription_status: subscription.status
    })
    .eq('id', existingSubscription.user_id);

  logger.info(`Subscription updated: ${subscription.id}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!existingSubscription) {
    logger.error(`Subscription not found: ${subscription.id}`);
    return;
  }

  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('stripe_subscription_id', subscription.id);

  // Downgrade user to free plan
  await supabase
    .from('users')
    .update({
      plan_type: 'free',
      subscription_status: 'cancelled'
    })
    .eq('id', existingSubscription.user_id);

  logger.info(`Subscription cancelled: ${subscription.id}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  
  if (subscriptionId) {
    await supabase
      .from('subscriptions')
      .update({ status: 'active' })
      .eq('stripe_subscription_id', subscriptionId);

    // Update user status
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (subscription) {
      await supabase
        .from('users')
        .update({ subscription_status: 'active' })
        .eq('id', subscription.user_id);
    }
  }

  logger.info(`Payment succeeded for invoice: ${invoice.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  
  if (subscriptionId) {
    await supabase
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', subscriptionId);

    // Update user status
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (subscription) {
      await supabase
        .from('users')
        .update({ subscription_status: 'past_due' })
        .eq('id', subscription.user_id);
    }
  }

  logger.error(`Payment failed for invoice: ${invoice.id}`);
}

function getPlanTypeFromPriceId(priceId: string): string {
  if (priceId.includes('pro')) return 'pro';
  if (priceId.includes('enterprise')) return 'enterprise';
  return 'free';
}

export default router;