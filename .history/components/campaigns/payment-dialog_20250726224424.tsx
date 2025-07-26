// components/campaigns/payment-dialog.tsx

'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import React from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignTitle: string;
  amount: number;
  campaignId: string;
  onPaymentSuccess: () => void;
}

function PaymentForm({ 
  campaignTitle, 
  amount, 
  campaignId, 
  onPaymentSuccess, 
  onClose 
}: {
  campaignTitle: string;
  amount: number;
  campaignId: string;
  onPaymentSuccess: () => void;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    setIsProcessing(true);

    try {
      // Get the current session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error('Authentication required. Please log in again.');
        setIsProcessing(false);
        return;
      }

      // Create payment intent on the server
      const response = await fetch('/api/payments/create-campaign-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount,
          campaignId,
          creatorId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        setIsProcessing(false);
        return;
      }

      const { clientSecret, error: serverError } = await response.json();

      if (serverError) {
        toast.error(serverError);
        setIsProcessing(false);
        return;
      }

      // Vérifier que le clientSecret est présent
      if (!clientSecret) {
        toast.error('Payment initialization failed. Please try again.');
        setIsProcessing(false);
        return;
      }

      // First, submit the form to validate the payment method
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        toast.error(submitError.message || 'Payment validation failed');
        setIsProcessing(false);
        return;
      }

      // Then confirm the payment
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/campaigns/${campaignId}?payment=success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Stripe payment error:', error);
        
        // Gestion spécifique des erreurs Stripe
        if (error.type === 'card_error' || error.type === 'validation_error') {
          toast.error(error.message || 'Payment validation failed');
        } else if (error.type === 'invalid_request_error') {
          toast.error('Invalid payment request. Please try again.');
        } else {
          toast.error(error.message || 'Payment failed');
        }
      } else {
        // Mise à jour manuelle de la campagne en attendant le webhook
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { error: updateError } = await supabase
              .from('campaigns')
              .update({
                status: 'active',
                payment_status: 'paid',
                total_budget: amount,
                remaining_budget: amount,
                stripe_payment_intent_id: clientSecret.split('_secret_')[0], // Extraire l'ID du PaymentIntent
              })
              .eq('id', campaignId);

            if (updateError) {
              console.error('Error updating campaign status:', updateError);
            }
          }
        } catch (updateErr) {
          console.error('Error in manual campaign update:', updateErr);
        }

        toast.success('Payment successful! Your campaign is now active.');
        onPaymentSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
            <CardDescription>
              You&apos;re about to fund your campaign &quot;{campaignTitle}&quot;
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Campaign Budget</span>
                <span className="font-semibold">${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing Fee</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">${amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <PaymentElement />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay ${amount.toFixed(2)}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isProcessing}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function PaymentDialog({
  open,
  onOpenChange,
  campaignTitle,
  amount,
  campaignId,
  onPaymentSuccess,
}: PaymentDialogProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const initializePayment = async () => {
    if (!user || !open) return;

    setLoading(true);
    try {
      // Get the current session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      const response = await fetch('/api/payments/create-campaign-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount,
          campaignId,
          creatorId: user.id,
        }),
      });

      console.log('Payment initialization response:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Payment initialization error:', errorData);
        toast.error(errorData.error || `Failed to initialize payment: ${response.status}`);
        setLoading(false);
        return;
      }
      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }

      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error initializing payment:', error);
      toast.error('Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  // Initialize payment when dialog opens
  React.useEffect(() => {
    if (open) {
      initializePayment();
    } else {
      setClientSecret('');
    }
  }, [open]);

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Fund Your Campaign</DialogTitle>
          <DialogDescription>
            Pay the campaign budget to activate your campaign and start receiving submissions.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Initializing payment...</span>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={stripeOptions}>
            <PaymentForm
              campaignTitle={campaignTitle}
              amount={amount}
              campaignId={campaignId}
              onPaymentSuccess={onPaymentSuccess}
              onClose={() => onOpenChange(false)}
            />
          </Elements>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to initialize payment</p>
            <Button onClick={initializePayment} className="mt-4">
              Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}