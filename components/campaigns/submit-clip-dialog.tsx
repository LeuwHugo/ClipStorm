'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, ExternalLink, CheckCircle, Eye, Heart, MessageCircle, Hash, Loader2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
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
import { Card, CardContent } from '@/components/ui/card';
import { Campaign } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { 
  fetchPlatformMetadata, 
  detectPlatform, 
  validatePlatformUrl, 
  formatNumber,
  PlatformMetadata 
} from '@/lib/platform-metadata';

const submitClipSchema = z.object({
  clipUrl: z.string().url('Please enter a valid URL'),
  platform: z.enum(['tiktok', 'instagram', 'youtube', 'twitter'], {
    required_error: 'Please select a platform',
  }),
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
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [metadata, setMetadata] = useState<PlatformMetadata | null>(null);
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);

  const form = useForm<SubmitClipForm>({
    resolver: zodResolver(submitClipSchema),
    defaultValues: {
      clipUrl: '',
      platform: undefined,
    },
  });

  const watchedUrl = form.watch('clipUrl');

  // Auto-détection de la plateforme quand l'URL change
  useEffect(() => {
    if (watchedUrl && validatePlatformUrl(watchedUrl)) {
      const urlInfo = detectPlatform(watchedUrl);
      setDetectedPlatform(urlInfo.platform);
      form.setValue('platform', urlInfo.platform);
      
      // Récupération automatique des métadonnées
      fetchMetadata(watchedUrl);
    } else {
      setDetectedPlatform(null);
      setMetadata(null);
    }
  }, [watchedUrl, form]);

  const fetchMetadata = async (url: string) => {
    if (!url || !validatePlatformUrl(url)) return;
    
    setIsFetchingMetadata(true);
    try {
      const data = await fetchPlatformMetadata(url);
      setMetadata(data);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      toast.error('Failed to fetch clip metadata');
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  const onSubmit = async (data: SubmitClipForm) => {
    if (!user) {
      toast.error('You must be logged in to submit a clip');
      return;
    }

    if (!metadata) {
      toast.error('Please wait for metadata to load or enter a valid URL');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate potential payment
      const potentialPayment = metadata.viewCount >= campaign.payPerView.minimumViews
        ? (metadata.viewCount / 1000000) * campaign.payPerView.amountPerMillionViews
        : 0;

      // Insert submission into Supabase
      const { data: submission, error } = await supabase
        .from('clip_submissions')
        .insert({
          campaign_id: campaign.id,
          submitter_id: user.id,
          clip_url: data.clipUrl,
          platform: data.platform,
          view_count: metadata.viewCount,
          like_count: metadata.likeCount,
          comment_count: metadata.commentCount,
          hashtags: metadata.hashtags,
          thumbnail: metadata.thumbnail,
          title: metadata.title,
          author: metadata.author,
          status: potentialPayment > 0 ? 'approved' : 'pending',
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
      setMetadata(null);
      setDetectedPlatform(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting clip:', error);
      toast.error('Failed to submit clip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const potentialPayment = metadata && metadata.viewCount >= campaign.payPerView.minimumViews
    ? (metadata.viewCount / 1000000) * campaign.payPerView.amountPerMillionViews
    : 0;

  const meetsMinimum = metadata && metadata.viewCount >= campaign.payPerView.minimumViews;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="clipUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clip URL</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="https://tiktok.com/@username/video/..." 
                              {...field} 
                            />
                            {isFetchingMetadata && (
                              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Paste the URL of your published clip. We&apos;ll automatically detect the platform and fetch statistics.
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                        {detectedPlatform && (
                          <FormDescription>
                            Auto-detected: {detectedPlatform.charAt(0).toUpperCase() + detectedPlatform.slice(1)}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1" disabled={isSubmitting || !metadata}>
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

            {/* Preview Section */}
            <div className="space-y-4">
              <h3 className="font-semibold">Clip Preview</h3>
              
              {isFetchingMetadata && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Fetching clip data...</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {metadata && (
                <Card>
                  <CardContent className="p-4 space-y-4">
                    {/* Thumbnail */}
                    {metadata.thumbnail && (
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <img
                          src={metadata.thumbnail}
                          alt={metadata.title || 'Clip preview'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="capitalize">
                            {metadata.platform}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Title and Author */}
                    {metadata.title && (
                      <div>
                        <h4 className="font-medium line-clamp-2">{metadata.title}</h4>
                        {metadata.author && (
                          <p className="text-sm text-muted-foreground">{metadata.author}</p>
                        )}
                      </div>
                    )}

                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatNumber(metadata.viewCount)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatNumber(metadata.likeCount)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatNumber(metadata.commentCount)}</span>
                      </div>
                    </div>

                    {/* Hashtags */}
                    {metadata.hashtags.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Hash className="h-4 w-4" />
                          <span>Hashtags</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {metadata.hashtags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Payment Preview */}
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <h4 className="font-semibold text-sm">Payment Preview</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">View Count</span>
                          <span className="font-medium">{formatNumber(metadata.viewCount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Minimum Required</span>
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
                            ⚠️ Clip needs {(campaign.payPerView.minimumViews - metadata.viewCount).toLocaleString()} more views to qualify for payment
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!metadata && !isFetchingMetadata && watchedUrl && (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                      <p>Enter a valid URL to see clip preview</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}