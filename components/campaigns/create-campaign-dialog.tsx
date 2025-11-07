'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Campaign } from '@/lib/types';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { PaymentDialog } from './payment-dialog';
import { createClient } from '@supabase/supabase-js';
import { validateYouTubeUrlBasic, getYouTubeThumbnail } from '@/lib/youtube-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const createCampaignSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(100, 'Le titre doit faire moins de 100 caractères'),
  videoUrl: z.string().url('Veuillez entrer une URL YouTube valide'),
  totalBudget: z.number().min(20, 'Le budget doit être d\'au moins 20€'),
  durationDays: z.number().min(1, 'La durée doit être d\'au moins 1 jour').max(30, 'La durée ne peut pas dépasser 30 jours'),
  cpmvRate: z.number().min(0.01, 'Le CPMV doit être d\'au moins 0.01€'),
});

type CreateCampaignForm = z.infer<typeof createCampaignSchema>;

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCampaign: (campaign: Campaign) => void;
}

export function CreateCampaignDialog({
  open,
  onOpenChange,
  onCreateCampaign,
}: CreateCampaignDialogProps) {
  const { user } = useAuth();
  const [validating, setValidating] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [pendingCampaign, setPendingCampaign] = useState<any>(null);

  const form = useForm<CreateCampaignForm>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      title: '',
      videoUrl: '',
      totalBudget: 100,
      durationDays: 30,
      cpmvRate: 0.50,
    },
  });

  const validateYouTubeUrl = async (url: string) => {
    const validation = validateYouTubeUrlBasic(url);
    if (!validation.isValid) {
      form.setError('videoUrl', { message: 'URL YouTube invalide' });
      return false;
    }
    return true;
  };

  const onSubmit = async (data: CreateCampaignForm) => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer une campagne');
      return;
    }

    setValidating(true);

    // Valider l'URL YouTube
    const isValidUrl = await validateYouTubeUrl(data.videoUrl);
    if (!isValidUrl) {
      setValidating(false);
      return;
    }

    // Extraire l'ID YouTube et générer la miniature
    const validation = validateYouTubeUrlBasic(data.videoUrl);
    const youtubeVideoId = validation.videoId;
    const thumbnail = youtubeVideoId ? getYouTubeThumbnail(youtubeVideoId, 'high') : '';

    const campaignData = {
      creator_id: user.id, 
      title: data.title,
      video_url: data.videoUrl,
      thumbnail: thumbnail,
      youtube_video_id: youtubeVideoId,
      youtube_validation_status: 'pending',
      amount_per_million_views: data.cpmvRate * 1000, // CPMV = €/M vues, donc pour 1M vues = CPMV * 1000
      minimum_views: 1000, // Valeur par défaut pour MVP
      rules: [], // Pas de règles pour MVP
      status: 'draft', // Start as draft until payment is completed
      total_budget: data.totalBudget,
      remaining_budget: data.totalBudget,
      duration_days: data.durationDays,
      cpmv_rate: data.cpmvRate,
      expires_at: new Date(Date.now() + data.durationDays * 24 * 60 * 60 * 1000).toISOString(),
    };

/* 1️⃣  Persist a "paused" draft so we get a real ID */
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert(campaignData)
        .select();

      const row = Array.isArray(data) && data.length > 0 ? data[0] : null;

      if (error || !row) throw error;

      // Fermer le formulaire et rafraîchir la liste
      onCreateCampaign({
        id: row.id,
        creatorId: row.creator_id,
        title: row.title,
        videoUrl: row.video_url,
        thumbnail: row.thumbnail,
        payPerView: {
          amountPerMillionViews: row.amount_per_million_views,
          minimumViews: row.minimum_views,
        },
        rules: row.rules,
        status: row.status,
        totalBudget: row.total_budget,
        remainingBudget: row.remaining_budget,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
        trackingCode: row.tracking_code,
        durationDays: row.duration_days,
        cpmvRate: row.cpmv_rate,
        youtubeVideoId: row.youtube_video_id,
        youtubeValidationStatus: row.youtube_validation_status,
      });
      onOpenChange(false);

      setPendingCampaign(null); // Ne pas ouvrir la popup de paiement automatiquement
    } catch (err) {
      console.error(err);
      toast.error('Échec de la création du brouillon de campagne');
    } finally {
      setValidating(false);
    }
  };

  const handlePaymentSuccess = () => {
    if (pendingCampaign) {
      // Update campaign status to active after successful payment
      const activeCampaign = { ...pendingCampaign, status: 'active' as const };
      onCreateCampaign(activeCampaign);
      
      // Reset form and state
      form.reset();
      setPendingCampaign(null);
      setShowPaymentDialog(false);
      
      toast.success('Campagne créée et financée avec succès !');
    }
  };



  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Créer une Nouvelle Campagne</DialogTitle>
            <DialogDescription>
              Configurez votre campagne TikTok pour attirer les meilleurs monteurs vidéo
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* MVP: 4 champs seulement */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre de la Campagne</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Montage Gaming TikTok Viral" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL YouTube</FormLabel>
                      <FormControl>
                        <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Lien vers la vidéo YouTube source
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="totalBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100"
                            min="20"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Minimum 20€</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="durationDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée (jours)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="30"
                            min="1"
                            max="30"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Maximum 30 jours</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="cpmvRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPMV (€/M vues)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.50"
                          min="0.01"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Coût par mille vues (ex: 0.50€ = 500€ par million de vues)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* MVP: Affichage du tracking code généré */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">
                  Code de tracking généré automatiquement
                </div>
                <div className="font-mono text-lg font-bold bg-background p-2 rounded border">
                  {form.watch('title') ? 'ABC123XY' : '---' /* Placeholder - sera généré côté serveur */}
                </div>
              </div>


              <div className="flex justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={validating}>
                  {validating ? 'Validation...' : 'Créer la Campagne'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {showPaymentDialog && pendingCampaign && (
        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          amount={pendingCampaign.totalBudget}
          campaignId={pendingCampaign.id}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}