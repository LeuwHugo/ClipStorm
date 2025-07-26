'use client';

import { useState } from 'react';
import { Calendar, DollarSign, Eye, Play, Users, MoreHorizontal, Edit, Pause, Trash2, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditCampaignDialog } from './edit-campaign-dialog';
import { SubmitClipDialog } from './submit-clip-dialog';
import { Campaign } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/use-user-role';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { PaymentDialog } from './payment-dialog';
import { deleteImage } from '@/lib/supabase';

interface CampaignCardProps {
  campaign: Campaign;
  creatorInfo?: {
    displayName: string;
    avatar?: string;
  };
  submissionStats?: {
    totalSubmissions: number;
    totalViews: number;
    totalPaid: number;
  };
  onUpdate?: (updatedCampaign: Campaign) => void;
  onDelete?: (campaignId: string) => void;
}

export function CampaignCard({ campaign, creatorInfo, submissionStats, onUpdate, onDelete }: CampaignCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isCreator, isClipper } = useUserRole();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const isOwner = user?.id === campaign.creatorId;
  const canManage = isCreator && isOwner;
  const canSubmit = isClipper && campaign.status === 'active';

  const handleCreatorClick = () => {
    router.push(`/profile/${campaign.creatorId}`);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleStatusToggle = async () => {
    if (!canManage || !onUpdate) return;
    
    setLoading(true);
    try {
      const newStatus = campaign.status === 'active' ? 'paused' : 'active';
      
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', campaign.id);

      if (error) throw error;

      const updatedCampaign = { ...campaign, status: newStatus as 'active' | 'paused' | 'completed' };
      onUpdate(updatedCampaign);
      
      toast.success(`Campaign ${newStatus === 'active' ? 'activated' : 'paused'} successfully!`);
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast.error('Failed to update campaign status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canManage || !onDelete) return;
    
    setLoading(true);
    try {
      // Supprimer l'image du bucket si présente
      if (campaign.thumbnail) {
        // Extraire le nom du bucket et le chemin de l'image
        // Supposons que le thumbnail est du type 'https://.../storage/v1/object/public/<bucket>/<path>'
        const match = campaign.thumbnail.match(/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
        if (match) {
          const bucket = match[1];
          const path = match[2];
          try {
            await deleteImage(bucket, path);
          } catch (imgErr) {
            console.warn('Image deletion failed:', imgErr);
          }
        }
      }
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaign.id);

      if (error) throw error;

      onDelete(campaign.id);
      toast.success('Campaign deleted successfully!');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  // Calculate budget used from actual payments
  const totalSpent = submissionStats?.totalPaid || 0;
  const budgetUsed = totalSpent / (campaign.totalBudget || 1) * 100;
  const remainingBudget = (campaign.totalBudget || 0) - totalSpent;

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg line-clamp-1">{campaign.title}</CardTitle>
                <Badge className={getStatusColor(campaign.status)}>
                  {campaign.status}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                ${campaign.payPerView.amountPerMillionViews}/1M views • Min {campaign.payPerView.minimumViews.toLocaleString()} views
              </CardDescription>
              
              {/* Creator Info */}
              {creatorInfo && !isOwner && (
                <div 
                  className="flex items-center gap-2 mt-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
                  onClick={handleCreatorClick}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={creatorInfo.avatar} alt={creatorInfo.displayName} />
                    <AvatarFallback className="text-xs">
                      {creatorInfo.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    by {creatorInfo.displayName}
                  </span>
                </div>
              )}
            </div>
            
            {/* Campaign Actions for Creators */}
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={loading}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Campaign
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={handleStatusToggle} disabled={loading}>
                    {campaign.status === 'active' ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause Campaign
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Activate Campaign
                      </>
                    )}
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Campaign
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img
              src={campaign.thumbnail}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
              <Button
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() => window.open(campaign.videoUrl, '_blank')}
              >
                <Play className="h-4 w-4 mr-2" />
                Watch
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget Used</span>
              <span className="font-medium">{budgetUsed.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(budgetUsed, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                ${remainingBudget.toLocaleString()} remaining
              </span>
              <span className="text-muted-foreground">
                of ${(campaign.totalBudget || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{submissionStats?.totalSubmissions || 0} submissions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span>{(submissionStats?.totalViews || 0).toLocaleString()} views</span>
            </div>
          </div>

          {campaign.expiresAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Expires {campaign.expiresAt.toLocaleDateString()}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              onClick={() => router.push(`/campaigns/${campaign.id}`)}
            >
              View Campaign
            </Button>
            
            {/* Submit Clip Button for Clippers */}
            {canSubmit && (
              <Button 
                variant="outline"
                onClick={() => setShowSubmitDialog(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Submit Clip
              </Button>
            )}
            {/* Fund Campaign Button for Creator if draft */}
            {canManage && campaign.status === 'draft' as any && (
              <Button 
                variant="outline"
                onClick={() => setShowPaymentDialog(true)}
              >
                💸 Fund Campaign
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Campaign Dialog */}
      {canManage && onUpdate && (
        <EditCampaignDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          campaign={campaign}
          onUpdate={onUpdate}
        />
      )}

      {/* Submit Clip Dialog */}
      {canSubmit && (
        <SubmitClipDialog
          open={showSubmitDialog}
          onOpenChange={setShowSubmitDialog}
          campaign={campaign}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{campaign.title}&quot;? This action cannot be undone.
              All submissions and data related to this campaign will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Deleting...' : 'Delete Campaign'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Dialog for funding draft campaign */}
      {canManage && campaign.status === 'draft' as any && (
        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          campaignTitle={campaign.title}
          amount={campaign.totalBudget ?? 0}
          campaignId={campaign.id}
          onPaymentSuccess={() => {
            setShowPaymentDialog(false);
            if (onUpdate) onUpdate({ ...campaign, status: 'active' });
          }}
        />
      )}
    </>
  );
}