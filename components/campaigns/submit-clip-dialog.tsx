'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, ExternalLink, CheckCircle } from 'lucide-react';
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
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

const submitClipSchema = z.object({
  clipUrl: z.string().url('Please enter a valid URL'),
  platform: z.enum(['tiktok', 'instagram', 'youtube', 'twitter'], {
    required_error: 'Please select a platform',
  }),
  viewCount: z.number().min(1, 'View count must be at least 1'),
});

type SubmitClipForm = z.infer<typeof submitClipSchema>;

interface SubmitClipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign;
}

export function SubmitClipDialog({
  open,
  onOpenChange,
  campaign,
}: SubmitClipDialogProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SubmitClipForm>({
    resolver: zodResolver(submitClipSchema),
    defaultValues: {
      clipUrl: '',
      platform: undefined,
      viewCount: 0,
    },
  });

  const onSubmit = async (data: SubmitClipForm) => {
    if (!user) {
      toast.error('You must be logged in to submit a clip');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate potential payment
      const potentialPayment = data.viewCount >= campaign.payPerView.minimumViews
        ? (data.viewCount / 1000000) * campaign.payPerView.amountPerMillionViews
        : 0;

      // Insert submission into Supabase and update campaign budget if payment qualifies
      const { data: submission, error } = await supabase
        .from('clip_submissions')
        .insert({
          campaign_id: campaign.id,
          submitter_id: user.id,
          clip_url: data.clipUrl,
          platform: data.platform,
          view_count: data.viewCount,
          status: potentialPayment > 0 ? 'approved' : 'pending', // Auto-approve if meets minimum
          payment_amount: potentialPayment > 0 ? potentialPayment : null,
        });

      if (error) throw error;

      // If payment qualifies, update campaign remaining budget
      if (potentialPayment > 0) {
        const { error: budgetError } = await supabase
          .from('campaigns')
          .update({
            remaining_budget: (campaign.remainingBudget || campaign.totalBudget || 0) - potentialPayment
          })
          .eq('id', campaign.id);

        if (budgetError) {
          console.error('Error updating campaign budget:', budgetError);
        }
      }
      toast.success(
        potentialPayment > 0
          ? `Clip approved! Payment: $${potentialPayment.toFixed(2)}`
          : `Clip submitted! Needs ${campaign.payPerView.minimumViews.toLocaleString()} views for payment.`
      );
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting clip:', error);
      toast.error('Failed to submit clip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedViewCount = form.watch('viewCount');
  const potentialPayment = watchedViewCount >= campaign.payPerView.minimumViews
    ? (watchedViewCount / 1000000) * campaign.payPerView.amountPerMillionViews
    : 0;

  const meetsMinimum = watchedViewCount >= campaign.payPerView.minimumViews;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Your Clip</DialogTitle>
          <DialogDescription>
            Submit your clip for "{campaign.title}" to check if it meets the payment requirements.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Rules Reminder */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Campaign Requirements</h3>
            <div className="space-y-1">
              {campaign.rules.map((rule, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground mt-0.5">{index + 1}.</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="clipUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clip URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://tiktok.com/@username/video/..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Link to your published clip on the platform
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                        <SelectItem value="instagram">📷 Instagram</SelectItem>
                        <SelectItem value="youtube">📺 YouTube</SelectItem>
                        <SelectItem value="twitter">🐦 Twitter</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="viewCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current View Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the current number of views on your clip
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Preview */}
              {watchedViewCount > 0 && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Payment Preview</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">View Count</span>
                      <span className="font-medium">{watchedViewCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Minimum Required</span>
                      <span className="font-medium">{campaign.payPerView.minimumViews.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Potential Payment</span>
                      <div className="flex items-center gap-2">
                        {meetsMinimum && <CheckCircle className="h-4 w-4 text-green-600" />}
                        <span className={`font-bold ${meetsMinimum ? 'text-green-600' : 'text-muted-foreground'}`}>
                          ${potentialPayment.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {!meetsMinimum && (
                      <p className="text-sm text-amber-600">
                        ⚠️ Clip needs {(campaign.payPerView.minimumViews - watchedViewCount).toLocaleString()} more views to qualify for payment
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Clip
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}