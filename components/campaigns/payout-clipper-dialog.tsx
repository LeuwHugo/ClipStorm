// components/campaigns/payout-clipper-dialog.tsx
'use client';

import { useState } from 'react';
import { Euro, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ClipSubmission {
  id: string;
  campaignId: string;
  submitterId: string;
  clipUrl: string;
  platform: 'tiktok' | 'instagram' | 'youtube' | 'twitter';
  viewCount: number;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  paymentAmount?: number;
  rejectionReason?: string;
  verifiedAt?: Date;
}

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
  const [isProcessing, setIsProcessing] = useState(false);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'tiktok':
        return '🎵';
      case 'instagram':
        return '📷';
      case 'youtube':
        return '📺';
      case 'twitter':
        return '🐦';
      default:
        return '🎬';
    }
  };

  const handlePayout = async () => {
    if (!submission.paymentAmount) {
      toast.error('Aucun montant de paiement disponible');
      return;
    }

    setIsProcessing(true);
    try {
      // Update submission status to paid
      const { error } = await supabase
        .from('clip_submissions')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', submission.id);

      if (error) throw error;

      toast.success('Paiement traité avec succès !');
      onPayoutSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error processing payout:', error);
      toast.error('Erreur lors du traitement du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Payer le Monteur
          </DialogTitle>
          <DialogDescription>
            Traiter le paiement pour cette soumission de clip approuvée
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Submission Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">{getPlatformIcon(submission.platform)}</span>
                Soumission de Clip
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plateforme</span>
                <span className="font-medium capitalize">{submission.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vues</span>
                <span className="font-medium">{submission.viewCount.toLocaleString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Statut</span>
                <Badge className="bg-green-100 text-green-800">
                  {submission.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Soumis le</span>
                <span className="font-medium">{submission.submittedAt.toLocaleDateString('fr-FR')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Détails du Paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant du Paiement</span>
                <span className="font-medium text-green-600">
                  {submission.paymentAmount ? formatCurrency(submission.paymentAmount) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Méthode de Paiement</span>
                <span className="font-medium">Stripe Connect</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frais de Plateforme</span>
                <span className="font-medium text-red-600">-10%</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-medium">Montant Net</span>
                  <span className="font-bold text-green-600">
                    {submission.paymentAmount 
                      ? formatCurrency(submission.paymentAmount * 0.9)
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Paiement Sécurisé
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                  Le paiement sera transféré directement sur le compte Stripe Connect du monteur.
                  Le traitement prend 2-7 jours ouvrés.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handlePayout}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                'Traitement du Paiement...'
              ) : (
                <>
                  <Euro className="h-4 w-4 mr-2" />
                  Payer {submission.paymentAmount ? formatCurrency(submission.paymentAmount) : '0€'}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}