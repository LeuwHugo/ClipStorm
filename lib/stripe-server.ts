import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Create a payment intent for campaign budget
export async function createCampaignPaymentIntent(
  amount: number, // in cents
  campaignId: string,
  creatorId: string,
  metadata?: Record<string, string>
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        type: 'campaign_budget',
        campaign_id: campaignId,
        creator_id: creatorId,
        ...metadata,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

// Create Stripe Connect account for clippers
export async function createConnectAccount(
  email: string,
  userId: string,
  country: string = 'US'
) {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        user_id: userId,
      },
    });

    return account;
  } catch (error) {
    console.error('Error creating Connect account:', error);
    throw error;
  }
}

// Create account link for Connect onboarding
export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink;
  } catch (error) {
    console.error('Error creating account link:', error);
    throw error;
  }
}

// Transfer funds to clipper
export async function transferToClipper(
  amount: number, // in cents
  clipperStripeAccountId: string,
  submissionId: string,
  metadata?: Record<string, string>
) {
  try {
    const transfer = await stripe.transfers.create({
      amount,
      currency: 'usd',
      destination: clipperStripeAccountId,
      metadata: {
        type: 'clip_payment',
        submission_id: submissionId,
        ...metadata,
      },
    });

    return transfer;
  } catch (error) {
    console.error('Error creating transfer:', error);
    throw error;
  }
}

// Get account details
export async function getAccountDetails(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    return account;
  } catch (error) {
    console.error('Error retrieving account:', error);
    throw error;
  }
}

// Create login link for Connect dashboard
export async function createLoginLink(accountId: string) {
  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink;
  } catch (error) {
    console.error('Error creating login link:', error);
    throw error;
  }
}