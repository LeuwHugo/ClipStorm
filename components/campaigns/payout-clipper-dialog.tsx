'use client';

import { useState } from 'react';
import { DollarSign, User, Video, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipSubmission } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface PayoutClipperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: ClipSubmission;
  onPayoutSuccess: () => void;
}

export function PayoutClipperDialog({
  open,
  onOpenChange,
  submission,
  onPayoutSuccess,
}: PayoutClipperDialogProps) {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayout = async () => {
    if (!user || !submission.paymentAmount) return;

    setIsProcessing(true);
    try {
      // Get the current session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error('Authentication required. Please log in again.');
        return;
      }
      const response = await fetch('/api/payments/payout-clipper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          submissionId: submission.id,
          amount: submission.paymentAmount,
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success(`Payment of $${submission.paymentAmount} sent to ${data.clipper}!`);
      onPayoutSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error processing payout:', error);
      toast.error('Failed to process payout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      tiktok: '🎵',
      instagram: '📷',
      youtube: '📺',
      twitter: '🐦',
    };
    return icons[platform] || '🎬';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pay Clipper
          </DialogTitle>
          <DialogDescription>
            Process payment for this approved clip submission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Submission Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">{getPlatformIcon(submission.platform)}</span>
                Clip Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform</span>
                <span className="font-medium capitalize">{submission.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">{submission.viewCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className="bg-green-100 text-green-800">
                  {submission.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted</span>
                <span className="font-medium">{submission.submittedAt.toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Amount</span>
                <span className="font-bold text-lg text-green-600">
                  ${submission.paymentAmount?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing Fee</span>
                <span className="font-medium">Covered by platform</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Clipper Receives</span>
                  <span className="font-bold text-lg">
                    ${submission.paymentAmount?.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Payment Confirmation
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  This payment will be sent immediately to the clipper's Stripe account. 
                  Make sure you've reviewed the clip and are satisfied with the quality.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handlePayout}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                'Processing Payment...'
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pay ${submission.paymentAmount?.toFixed(2)}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}