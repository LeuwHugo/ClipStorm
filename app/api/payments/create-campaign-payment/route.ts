import { NextRequest, NextResponse } from 'next/server';
import { createCampaignPaymentIntent } from '@/lib/stripe-server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { amount, campaignId, creatorId } = await request.json();

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

    // Get authorization header
    const headersList = headers();
    const authorization = headersList.get('authorization');

    if (!authorization) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Verify user is authenticated and is the creator
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    );

    if (authError || !user || user.id !== creatorId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify campaign exists and belongs to creator
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, creator_id, title, total_budget')
      .eq('id', campaignId)
      .eq('creator_id', creatorId)
      .single();

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