'use client';

import { useState } from 'react';
import { CreditCard, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface StripeConnectSetupProps {
  stripeAccountId?: string;
  onAccountCreated: (accountId: string) => void;
}

export function StripeConnectSetup({ stripeAccountId, onAccountCreated }: StripeConnectSetupProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get the current session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error('Authentication required. Please log in again.');
        return;
      }
      const response = await fetch('/api/payments/create-connect-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: user.email,
          country: 'US', // You might want to make this configurable
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Redirect to Stripe onboarding
      window.location.href = data.onboardingUrl;
      
    } catch (error) {
      console.error('Error creating Connect account:', error);
      toast.error('Failed to create Stripe account');
    } finally {
      setLoading(false);
    }
  };

  const handleManageAccount = async () => {
    if (!stripeAccountId) return;

    setLoading(true);
    try {
      // Get the current session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error('Authentication required. Please log in again.');
        return;
      }
      const response = await fetch('/api/payments/create-login-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          accountId: stripeAccountId,
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Open Stripe dashboard in new tab
      window.open(data.loginUrl, '_blank');
      
    } catch (error) {
      console.error('Error creating login link:', error);
      toast.error('Failed to access Stripe dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Setup
        </CardTitle>
        <CardDescription>
          Set up your Stripe Connect account to receive payments for your clips
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stripeAccountId ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Stripe account connected</span>
              <Badge variant="secondary">Active</Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Your Stripe Connect account is set up and ready to receive payments. 
              You can manage your account settings and view payouts through the Stripe dashboard.
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleManageAccount}
                disabled={loading}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Account
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <span className="font-medium">Payment setup required</span>
              <Badge variant="outline">Pending</Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              To receive payments for your clips, you need to set up a Stripe Connect account. 
              This is a secure way to handle payments and is required by financial regulations.
            </p>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">What you'll need:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Government-issued ID</li>
                <li>• Bank account information</li>
                <li>• Tax identification number</li>
                <li>• Business information (if applicable)</li>
              </ul>
            </div>

            <Button
              onClick={handleCreateAccount}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                'Creating account...'
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Set Up Payments with Stripe
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}