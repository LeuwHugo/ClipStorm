// app/api/payments/create-campaign-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createCampaignPaymentIntent } from '@/lib/stripe-server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
export async function POST(request: NextRequest) {
  try {
    console.log('=== Payment Intent Creation Request ===');
    
    const { amount, campaignId, creatorId } = await request.json();
    console.log('Request data:', { amount, campaignId, creatorId });

    // Validate required fields
    if (!amount || !campaignId || !creatorId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, campaignId, creatorId' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    // Get authorization header from request
    const authorization = request.headers.get('authorization');
    console.log('Authorization header present:', !!authorization);

    if (!authorization) {
      console.log('Missing authorization header');
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Verify user is authenticated and is the creator
    const token = authorization.replace('Bearer ', '');
    console.log('Token length:', token.length);
    
    // Create a Supabase client with the user's token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    console.log('Auth result:', { user: !!user, error: !!authError });

    if (authError || !user || user.id !== creatorId) {
      console.log('Auth failed:', { authError, userId: user?.id, expectedCreatorId: creatorId });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

        /** ── Use an authenticated client so RLS sees the caller ── */
    const supabaseWithAuth = createClient(
      process.env.SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // Verify campaign exists and belongs to creator
   const { data: campaign, error: campaignError } = await supabaseWithAuth
      .from('campaigns')
      .select('id, creator_id, title, total_budget')
     .eq('id', campaignId)
      .single();

    console.log('Campaign query result:', { campaign: !!campaign, error: !!campaignError });

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create payment intent
    const paymentIntent = await createCampaignPaymentIntent(
      Math.round(amount * 100), // Convert to cents
      campaignId,
      creatorId,
      {
        campaign_title: campaign.title,
      }
    );

    console.log('Payment intent created successfully:', paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Error creating campaign payment intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}