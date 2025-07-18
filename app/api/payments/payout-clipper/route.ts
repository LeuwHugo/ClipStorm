import { NextRequest, NextResponse } from 'next/server';
import { transferToClipper } from '@/lib/stripe-server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { submissionId, amount } = await request.json();

    // Validate required fields
    if (!submissionId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: submissionId, amount' },
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

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get submission details and verify user is the campaign creator
    const { data: submission, error: submissionError } = await supabase
      .from('clip_submissions')
      .select(`
        *,
        campaigns!inner (
          id,
          creator_id,
          title,
          remaining_budget
        )
      `)
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Verify user is the campaign creator
    if (submission.campaigns.creator_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - not campaign creator' },
        { status: 403 }
      );
    }

    // Verify submission is approved but not yet paid
    if (submission.status !== 'approved') {
      return NextResponse.json(
        { error: 'Submission must be approved before payment' },
        { status: 400 }
      );
    }

    // Get clipper's Stripe account
    const { data: clipper, error: clipperError } = await supabase
      .from('users')
      .select('stripe_account_id, display_name')
      .eq('id', submission.submitter_id)
      .single();

    if (clipperError || !clipper || !clipper.stripe_account_id) {
      return NextResponse.json(
        { error: 'Clipper does not have a Stripe Connect account' },
        { status: 400 }
      );
    }

    // Check if campaign has sufficient budget
    if (submission.campaigns.remaining_budget < amount) {
      return NextResponse.json(
        { error: 'Insufficient campaign budget' },
        { status: 400 }
      );
    }

    // Create transfer to clipper
    const transfer = await transferToClipper(
      Math.round(amount * 100), // Convert to cents
      clipper.stripe_account_id,
      submissionId,
      {
        campaign_id: submission.campaign_id,
        campaign_title: submission.campaigns.title,
        clipper_name: clipper.display_name,
      }
    );

    // Update submission status and campaign budget
    const { error: updateError } = await supabase
      .from('clip_submissions')
      .update({
        status: 'paid',
        verified_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Error updating submission status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update submission status' },
        { status: 500 }
      );
    }

    // Update campaign remaining budget
    const { error: budgetError } = await supabase
      .from('campaigns')
      .update({
        remaining_budget: submission.campaigns.remaining_budget - amount,
      })
      .eq('id', submission.campaign_id);

    if (budgetError) {
      console.error('Error updating campaign budget:', budgetError);
    }

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      amount: amount,
      clipper: clipper.display_name,
    });

  } catch (error) {
    console.error('Error processing clipper payout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}