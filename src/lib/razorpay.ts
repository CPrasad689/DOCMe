import { supabase } from './supabase';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createRazorpayOrder = async (planType: string, billingCycle: string = 'monthly') => {
  // Get token from Supabase session
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  const apiUrl = import.meta.env.VITE_API_URL || 'https://docme.org.in/api';
  
  const response = await fetch(`${apiUrl}/payment/subscription/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ planType, billingCycle })
  });

  if (!response.ok) {
    throw new Error('Failed to create order');
  }

  return response.json();
};

export const verifyRazorpayPayment = async (paymentData: any, planType: string, billingCycle: string = 'monthly') => {
  // Get token from Supabase session
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  const apiUrl = import.meta.env.VITE_API_URL || 'https://docme.org.in/api';
  
  const response = await fetch(`${apiUrl}/payment/subscription/verify-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ...paymentData,
      planType,
      billingCycle
    })
  });

  if (!response.ok) {
    throw new Error('Payment verification failed');
  }

  return response.json();
};

export const initiateRazorpayPayment = async (
  planType: string, 
  billingCycle: string = 'monthly',
  userDetails: { name: string; email: string; phone?: string }
) => {
  // Load Razorpay script
  const isLoaded = await loadRazorpay();
  if (!isLoaded) {
    throw new Error('Failed to load Razorpay');
  }

  // Create order
  const orderData = await createRazorpayOrder(planType, billingCycle);

  // Plan details for display
  const planDetails = {
    pro: {
      monthly: { name: 'DOCMe Pro Monthly', amount: 1990 },
      yearly: { name: 'DOCMe Pro Yearly', amount: 19900 }
    },
    enterprise: {
      monthly: { name: 'DOCMe Enterprise Monthly', amount: 9990 },
      yearly: { name: 'DOCMe Enterprise Yearly', amount: 99900 }
    }
  };

  const plan = planDetails[planType as keyof typeof planDetails][billingCycle as keyof typeof planDetails.pro];

  return new Promise((resolve, reject) => {
    const options: RazorpayOptions = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'DOCMe',
      description: plan.name,
      order_id: orderData.orderId,
      handler: async (response: any) => {
        try {
          const verificationResult = await verifyRazorpayPayment(response, planType, billingCycle);
          resolve(verificationResult);
        } catch (error) {
          reject(error);
        }
      },
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.phone || ''
      },
      theme: {
        color: '#3B82F6'
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled by user'));
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  });
};

export const cancelSubscription = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  const apiUrl = import.meta.env.VITE_API_URL || 'https://docme.org.in/api';
  
  const response = await fetch(`${apiUrl}/payment/subscription/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to cancel subscription');
  }

  return response.json();
};

export const getPaymentHistory = async (page: number = 1, limit: number = 20) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  const apiUrl = import.meta.env.VITE_API_URL || 'https://docme.org.in/api';
  
  const response = await fetch(`${apiUrl}/payment/payments/history?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch payment history');
  }

  return response.json();
};

export const getInvoices = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  const apiUrl = import.meta.env.VITE_API_URL || 'https://docme.org.in/api';
  
  const response = await fetch(`${apiUrl}/payment/invoices`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }

  return response.json();
};