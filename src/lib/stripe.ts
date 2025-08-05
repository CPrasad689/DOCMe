import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key');
}

export const stripe = await loadStripe(stripePublishableKey);

export const createCheckoutSession = async (priceId: string, planType: string) => {
  const response = await fetch('/api/subscription/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
    },
    body: JSON.stringify({ priceId, planType })
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  const { sessionId } = await response.json();
  
  if (!stripe) {
    throw new Error('Stripe not loaded');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  
  if (error) {
    throw error;
  }
};

export const createPortalSession = async () => {
  const response = await fetch('/api/subscription/create-portal-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to create portal session');
  }

  const { url } = await response.json();
  window.location.href = url;
};