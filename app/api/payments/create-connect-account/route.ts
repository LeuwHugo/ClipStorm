import { NextRequest, NextResponse } from 'next/server';
import { createConnectAccount, createAccountLink } from '@/lib/stripe-server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, country = 'US' } = await request.json();

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

    // Check if user is a clipper
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role, stripe_account_id')
      .eq('id', user.id)
      .single<{ role: 'creator' | 'clipper'; stripe_account_id: string | null }>();

    if (profileError || !userProfile || userProfile.role !== 'clipper') {
      return NextResponse.json(
        { error: 'Only clippers can create Connect accounts' },
        { status: 403 }
      );
    }

    // Check if user already has a Stripe account
    if (userProfile.stripe_account_id) {
      return NextResponse.json(
        { error: 'User already has a Stripe Connect account' },
        { status: 400 }
      );
    }

    // Create Stripe Connect account
    const account = await createConnectAccount(
      email || user.email || '',
      user.id,
      country
    );

    // Update user profile with Stripe account ID
    const { error: updateError } = await supabase
      .from('users')
      .update({ stripe_account_id: account.id })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user with Stripe account ID:', updateError);
      return NextResponse.json(
        { error: 'Failed to save Stripe account' },
        { status: 500 }
      );
    }

    // Create account link for onboarding
    const refreshUrl = `${request.nextUrl.origin}/profile?stripe_refresh=true`;
    const returnUrl = `${request.nextUrl.origin}/profile?stripe_success=true`;
    
    const accountLink = await createAccountLink(account.id, refreshUrl, returnUrl);

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });

  } catch (error) {
    console.error('Error creating Connect account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}