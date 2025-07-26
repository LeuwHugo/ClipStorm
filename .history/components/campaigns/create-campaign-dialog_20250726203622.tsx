'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
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
import { uploadImage, getImageUrl } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { PaymentDialog } from './payment-dialog';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const createCampaignSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  videoUrl: z.string().url('Please enter a valid URL'),
  thumbnail: z.string().min(1, 'Please upload a thumbnail image'),
  paymentAmount: z.number().min(1, 'Payment amount must be at least 1'),
  paymentMetric: z.enum(['thousand', 'million'], {
    required_error: 'Please select a payment metric',
  }),
  minimumViews: z.number().min(1000, 'Minimum views must be at least 1,000'),
  totalBudget: z.number().min(1, 'Budget must be at least $1'),
  expiresAt: z.string().optional(),
  rules: z.array(z.string().min(1, 'Rule cannot be empty')).min(1, 'At least one rule is required'),
});

type CreateCampaignForm = z.infer<typeof createCampaignSchema>;

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function CreateCampaignDialog({
  open,
  onOpenChange,
  onCreateCampaign,
}: CreateCampaignDialogProps) {
  const { user } = useAuth();
  const [rules, setRules] = useState<string[]>(['']);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [pendingCampaign, setPendingCampaign] = useState<any>(null);

  const form = useForm<CreateCampaignForm>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      title: '',
      videoUrl: '',
      thumbnail: '',
      paymentAmount: 250,
      paymentMetric: 'million',
      minimumViews: 100000,
      totalBudget: 1000,
      expiresAt: '',
      rules: [''],
    },
  });

  const addRule = () => {
    setRules([...rules, '']);
    form.setValue('rules', [...rules, '']);
  };

  const removeRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    setRules(newRules);
    form.setValue('rules', newRules);
  };

  const updateRule = (index: number, value: string) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
    form.setValue('rules', newRules);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setThumbnailFile(file);

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);

      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `campaign-thumbnails/${fileName}`;
      
      await uploadImage(file, 'campaign-images', filePath);
      const publicUrl = getImageUrl('campaign-images', filePath);
      
      form.setValue('thumbnail', publicUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setThumbnailFile(null);
      setThumbnailPreview('');
    } finally {
      setUploading(false);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
    form.setValue('thumbnail', '');
    
    // Revoke the object URL to free memory
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
  };

  const onSubmit = async (data: CreateCampaignForm) => {
    if (!user) {
      toast.error('You must be logged in to create a campaign');
      return;
    }

    // Convert payment amount based on metric
    const amountPerMillionViews = data.paymentMetric === 'million' 
      ? data.paymentAmount 
      : data.paymentAmount * 1000; // Convert thousands to millions

      const campaignData = {
      creator_id: user.id, 
      title: data.title,
      video_url: data.videoUrl,
      thumbnail: form.getValues('thumbnail'), // Use the uploaded image URL
      /* ✅  flatten into the real columns */
      amount_per_million_views: amountPerMillionViews,
      minimum_views: data.minimumViews,
      rules: data.rules.filter(rule => rule.trim() !== ''),
      status: 'paused', // Start as paused until payment is completed
      total_budget: data.totalBudget,
      remaining_budget: data.totalBudget,
      expires_at: data.expiresAt === "" ? null : data.expiresAt,
    };

/* 1️⃣  Persist a “paused” draft so we get a real ID */
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert(campaignData)
        .select();

      const row = Array.isArray(data) && data.length > 0 ? data[0] : null;

      if (error || !row) throw error;

      /* 2️⃣  Pass the real ID to the payment dialog */
      setPendingCampaign({ ...campaignData, id: row.id });
      setShowPaymentDialog(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create campaign draft');
    }
  };

  const handlePaymentSuccess = () => {
    if (pendingCampaign) {
      // Update campaign status to active after successful payment
      const activeCampaign = { ...pendingCampaign, status: 'active' as const };
      onCreateCampaign(activeCampaign);
      
      // Reset form and state
      form.reset();
      setRules(['']);
      removeThumbnail();
      setPendingCampaign(null);
      setShowPaymentDialog(false);
      
      toast.success('Campaign created and funded successfully!');
    }
  };

  const watchedPaymentAmount = form.watch('paymentAmount');
  const watchedPaymentMetric = form.watch('paymentMetric');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Set up a new video campaign for content creators to participate in.
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
                  <FormDescription>
                    A catchy title that describes your video content
                  </FormDescription>
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
                  <FormDescription>
                    Link to your original video (YouTube, Twitch, etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Thumbnail Upload */}
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {!thumbnailPreview ? (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                          <div className="text-center">
                            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <div className="mt-4">
                              <Label htmlFor="thumbnail-upload" className="cursor-pointer">
                                <span className="mt-2 block text-sm font-medium text-foreground">
                                  Upload thumbnail image
                                </span>
                                <span className="mt-1 block text-xs text-muted-foreground">
                                  PNG, JPG, GIF up to 5MB
                                </span>
                              </Label>
                              <Input
                                id="thumbnail-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={uploading}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              className="mt-4"
                              onClick={() => document.getElementById('thumbnail-upload')?.click()}
                              disabled={uploading}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {uploading ? 'Uploading...' : 'Choose Image'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={removeThumbnail}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload an eye-catching thumbnail for your campaign
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Configuration */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Payment Configuration</Label>
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
              
              {/* Payment Preview */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Payment Preview</h4>
                <p className="text-sm text-muted-foreground">
                  Creators will earn <span className="font-medium text-foreground">
                    ${watchedPaymentAmount}
                  </span> per {watchedPaymentMetric === 'million' ? 'million' : 'thousand'} views
                  {watchedPaymentMetric === 'thousand' && (
                    <span className="text-xs ml-1">
                      (${watchedPaymentAmount * 1000}/million views)
                    </span>
                  )}
                </p>
              </div>
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
            </div>

            <div>
              <Label className="text-base font-medium">Campaign Rules</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Set specific requirements for content creators to follow
              </p>
              <div className="space-y-3">
                {rules.map((rule, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder={`Rule ${index + 1}: e.g., Add credit "@solocrea.media"`}
                        value={rule}
                        onChange={(e) => updateRule(index, e.target.value)}
                      />
                    </div>
                    {rules.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRule(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRule}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={uploading}>
                Create & Fund Campaign
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>

        {/* Payment Dialog */}
        {pendingCampaign && (
          <PaymentDialog
            open={showPaymentDialog}
            onOpenChange={setShowPaymentDialog}
            campaignTitle={pendingCampaign.title}
            amount={pendingCampaign.total_budget || 0}
            campaignId={pendingCampaign.id}   // real ID, no fallback
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}