import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
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
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'account.updated':
        await handleAccountUpdated(event.data.object);
        break;
      
      case 'transfer.created':
        await handleTransferCreated(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

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
  const { metadata } = paymentIntent;
  
  if (metadata.type === 'campaign_budget') {
    // Update campaign with payment confirmation
    const { error } = await supabase
      .from('campaigns')
      .update({
        status: 'active',
        remaining_budget: metadata.amount ? parseFloat(metadata.amount) / 100 : null,
      })
      .eq('id', metadata.campaign_id);

    if (error) {
      console.error('Error updating campaign after payment:', error);
    } else {
      console.log(`Campaign ${metadata.campaign_id} budget payment confirmed`);
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