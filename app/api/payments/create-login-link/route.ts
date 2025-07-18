import { NextRequest, NextResponse } from 'next/server';
import { createLoginLink } from '@/lib/stripe-server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
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

    // Verify the account belongs to the user
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile || userProfile.stripe_account_id !== accountId) {
      return NextResponse.json(
        { error: 'Account not found or unauthorized' },
        { status: 403 }
      );
    }

    // Create login link
    const loginLink = await createLoginLink(accountId);

    return NextResponse.json({
      loginUrl: loginLink.url,
    });

  } catch (error) {
    console.error('Error creating login link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}