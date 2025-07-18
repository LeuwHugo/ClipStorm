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
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  videoUrl: z.string().url('Please enter a valid URL'),
  paymentAmount: z.number().min(1, 'Payment amount must be at least 1'),
  paymentMetric: z.enum(['thousand', 'million']),
  minimumViews: z.number().min(1000, 'Minimum views must be at least 1,000'),
  totalBudget: z.number().min(1, 'Budget must be at least $1'),
  expiresAt: z.string().optional(),
  status: z.enum(['active', 'paused', 'completed']),
});

type EditCampaignForm = z.infer<typeof editCampaignSchema>;

interface EditCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign;
  onUpdate: (updatedCampaign: Campaign) => void;
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
      toast.success('Campaign updated successfully!');
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Failed to update campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Campaign
          </DialogTitle>
          <DialogDescription>
            Update your campaign details and settings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Epic Gaming Moments Compilation" {...field} />
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
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="paymentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Amount ($)</FormLabel>
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
                    <FormLabel>Per</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select metric" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="thousand">Thousand Views</SelectItem>
                        <SelectItem value="million">Million Views</SelectItem>
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
                    <FormLabel>Minimum Views</FormLabel>
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
                    <FormLabel>Total Budget ($)</FormLabel>
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  'Updating...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Campaign
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}