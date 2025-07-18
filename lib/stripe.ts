import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

export const createPaymentIntent = async (amount: number, campaignId: string) => {
  const response = await fetch('/api/payments/create-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount, campaignId }),
  });
  
  return response.json();
};

export const createConnectAccount = async (email: string, country: string = 'US') => {
  const response = await fetch('/api/payments/create-connect-account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, country }),
  });
  
  return response.json();
};

export const payoutClipper = async (submissionId: string, amount: number) => {
  const response = await fetch('/api/payments/payout-clipper', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ submissionId, amount }),
  });
  
  return response.json();
};