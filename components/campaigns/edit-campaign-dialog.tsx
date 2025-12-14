'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit, Save, X } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const editCampaignSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(100, 'Le titre doit faire moins de 100 caractères'),
  videoUrl: z.string().url('Veuillez entrer une URL valide'),
  paymentAmount: z.number().min(1, 'Le montant de paiement doit être d\'au moins 1'),
  paymentMetric: z.enum(['thousand', 'million']),
  minimumViews: z.number().min(1000, 'Le minimum de vues doit être d\'au moins 1 000'),
  totalBudget: z.number().min(1, 'Le budget doit être d\'au moins 1€'),
  expiresAt: z.string().optional(),
  status: z.enum(['active', 'paused', 'completed']),
});

type EditCampaignForm = z.infer<typeof editCampaignSchema>;

interface EditCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign;
  onUpdate: (campaign: Campaign) => void;
}

export function EditCampaignDialog({
  open,
  onOpenChange,
  campaign,
  onUpdate,
}: EditCampaignDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<EditCampaignForm>({
    resolver: zodResolver(editCampaignSchema),
    defaultValues: {
      title: campaign.title,
      videoUrl: campaign.videoUrl,
      paymentAmount: campaign.payPerView.amountPerMillionViews >= 1000 
        ? campaign.payPerView.amountPerMillionViews / 1000 
        : campaign.payPerView.amountPerMillionViews,
      paymentMetric: campaign.payPerView.amountPerMillionViews >= 1000 ? 'million' : 'thousand',
      minimumViews: campaign.payPerView.minimumViews,
      totalBudget: campaign.totalBudget || 0,
      expiresAt: campaign.expiresAt ? campaign.expiresAt.toISOString().split('T')[0] : '',
      status: campaign.status,
    },
  });

  const onSubmit = async (data: EditCampaignForm) => {
    setLoading(true);
    try {
      // Convert payment amount based on metric
      const amountPerMillionViews = data.paymentMetric === 'million' 
        ? data.paymentAmount 
        : data.paymentAmount * 1000;

      const { error } = await supabase
        .from('campaigns')
        .update({
          title: data.title,
          video_url: data.videoUrl,
          amount_per_million_views: amountPerMillionViews,
          minimum_views: data.minimumViews,
          status: data.status,
          total_budget: data.totalBudget,
          remaining_budget: data.totalBudget, // Reset remaining budget when total budget changes
          expires_at: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
        })
        .eq('id', campaign.id);

      if (error) throw error;

      const updatedCampaign: Campaign = {
        ...campaign,
        title: data.title,
        videoUrl: data.videoUrl,
        payPerView: {
          amountPerMillionViews: amountPerMillionViews,
          minimumViews: data.minimumViews,
        },
        status: data.status,
        totalBudget: data.totalBudget,
        remainingBudget: data.totalBudget,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        updatedAt: new Date(),
      };

      onUpdate(updatedCampaign);
      onOpenChange(false);
      toast.success('Campagne mise à jour avec succès !');
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Échec de la mise à jour de la campagne');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Modifier la Campagne</DialogTitle>
          <DialogDescription>
            Mettez à jour les paramètres de votre campagne
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre de la Campagne</FormLabel>
                    <FormControl>
                      <Input placeholder="Titre de la campagne" {...field} />
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
                    <FormLabel>URL Vidéo Source</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="paymentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant de Paiement (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="250"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMetric"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Par</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une métrique" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="thousand">Mille Vues</SelectItem>
                        <SelectItem value="million">Million de Vues</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minimumViews"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vues Minimum</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Total (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d&apos;Expiration (Optionnel)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut de la Campagne</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">En Pause</SelectItem>
                      <SelectItem value="completed">Terminée</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Mise à jour...' : 'Sauvegarder'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}