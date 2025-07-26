// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

// Create a Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  console.log('=== Webhook received ===');
  
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');

  console.log('Signature present:', !!signature);
  console.log('Body length:', body.length);

  if (!signature) {
    console.log('No signature provided');
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('Event type:', event.type);
    console.log('Event data:', JSON.stringify(event.data, null, 2));
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Processing payment_intent.succeeded');
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'account.updated':
        console.log('Processing account.updated');
        await handleAccountUpdated(event.data.object);
        break;
      
      case 'transfer.created':
        console.log('Processing transfer.created');
        await handleTransferCreated(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    console.log('Webhook processed successfully');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const { metadata, id: paymentIntentId, amount } = paymentIntent;
  
  if (metadata.type === 'campaign_budget') {
    // Convert amount from cents to dollars
    const budgetAmount = amount ? amount / 100 : 0;
    
    // Update campaign with payment confirmation
    const { error } = await supabase
      .from('campaigns')
      .update({
        status: 'active',
        payment_status: 'paid',
        total_budget: budgetAmount,
        remaining_budget: budgetAmount,
        stripe_payment_intent_id: paymentIntentId,
      })
      .eq('id', metadata.campaign_id);

    if (error) {
      console.error('Error updating campaign after payment:', error);
    } else {
      console.log(`Campaign ${metadata.campaign_id} budget payment confirmed with $${budgetAmount}`);
    }
  }
}

async function handleAccountUpdated(account: any) {
  // Update user profile when Stripe account is updated
  const { metadata } = account;
  
  if (metadata.user_id) {
    const { error } = await supabase
      .from('users')
      .update({
        stripe_account_id: account.id,
      })
      .eq('id', metadata.user_id);

    if (error) {
      console.error('Error updating user Stripe account:', error);
    }
  }
}

async function handleTransferCreated(transfer: any) {
  const { metadata } = transfer;
  
  if (metadata.type === 'clip_payment' && metadata.submission_id) {
    // Update submission status to paid
    const { error } = await supabase
      .from('clip_submissions')
      .update({
        status: 'paid',
        verified_at: new Date().toISOString(),
      })
      .eq('id', metadata.submission_id);

    if (error) {
      console.error('Error updating submission after transfer:', error);
    } else {
      console.log(`Submission ${metadata.submission_id} marked as paid`);
    }
  }
}