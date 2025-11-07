'use client';

import { useState } from 'react';
import { Calendar, DollarSign, Eye, Play, Users, MoreHorizontal, Edit, Pause, Trash2, Upload, Copy, Check } from 'lucide-react';
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
import Image from 'next/image';

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
  const [copiedTrackingCode, setCopiedTrackingCode] = useState(false);

  const isOwner = user?.id === campaign.creatorId;
  const canManage = isCreator && isOwner;
  const canSubmit = isClipper && campaign.status === 'active';
  const canToggleStatus = canManage && (campaign.status === 'active' || campaign.status === 'paused');

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'paused':
        return 'En pause';
      case 'completed':
        return 'Terminée';
      default:
        return status;
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
      
      toast.success(`Campagne ${newStatus === 'active' ? 'activée' : 'mise en pause'} avec succès !`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de la campagne:', error);
      toast.error('Échec de la mise à jour du statut de la campagne');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canManage || !onDelete) return;
    
    setLoading(true);
    try {
      if (campaign.thumbnail) {
        const match = campaign.thumbnail.match(/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
        if (match) {
          const bucket = match[1];
          const path = match[2];
          try {
            await deleteImage(bucket, path);
          } catch (imgErr) {
            console.warn('Échec de la suppression de l\'image:', imgErr);
          }
        }
      }
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaign.id);

      if (error) throw error;

      onDelete(campaign.id);
      toast.success('Campagne supprimée avec succès !');
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la campagne:', error);
      toast.error('Échec de la suppression de la campagne');
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  // Calculate budget used from actual payments
  const totalSpent = submissionStats?.totalPaid || 0;
  const budgetUsed = totalSpent / (campaign.totalBudget || 1) * 100;
  const remainingBudget = (campaign.totalBudget || 0) - totalSpent;

  const handleCopyTrackingCode = async () => {
    if (!campaign.trackingCode) return;
    
    try {
      await navigator.clipboard.writeText(campaign.trackingCode);
      setCopiedTrackingCode(true);
      toast.success('Code de tracking copié !');
      setTimeout(() => setCopiedTrackingCode(false), 2000);
    } catch (error) {
      toast.error('Erreur lors de la copie du code');
    }
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 flex flex-col min-h-[580px] max-h-[650px]">
        {/* Header Section */}
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg line-clamp-1 flex-1">{campaign.title}</CardTitle>
                <Badge className={`${getStatusColor(campaign.status)} flex-shrink-0`}>
                  {getStatusText(campaign.status)}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2 text-sm">
                €{campaign.payPerView.amountPerMillionViews}/1M vues • Min {campaign.payPerView.minimumViews.toLocaleString()} vues
              </CardDescription>
              
              {/* Creator Info */}
              {creatorInfo && !isOwner && (
                <div 
                  className="flex items-center gap-2 mt-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
                  onClick={handleCreatorClick}
                >
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarImage src={creatorInfo.avatar} alt={creatorInfo.displayName} />
                    <AvatarFallback className="text-xs">
                      {creatorInfo.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate">
                    par {creatorInfo.displayName}
                  </span>
                </div>
              )}
            </div>
            
            {/* Campaign Actions for Creators */}
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={loading} className="flex-shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier la campagne
                  </DropdownMenuItem>
                  
                  {canToggleStatus && (
                  <DropdownMenuItem onClick={handleStatusToggle} disabled={loading}>
                    {campaign.status === 'active' ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Mettre en pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Activer la campagne
                      </>
                    )}
                  </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer la campagne
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        {/* Content Section */}
        <CardContent className="flex-1 flex flex-col space-y-4 pb-4">
          {/* Thumbnail */}
          <div className="relative aspect-video rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={campaign.thumbnail}
              alt={campaign.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
              <Button
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() => window.open(campaign.videoUrl, '_blank')}
              >
                <Play className="h-4 w-4 mr-2" />
                Regarder
              </Button>
            </div>
          </div>

          {/* Budget Section */}
          <div className="space-y-3 flex-shrink-0">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget utilisé</span>
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
                €{remainingBudget.toLocaleString()} restant
              </span>
              <span className="text-muted-foreground">
                sur €{(campaign.totalBudget || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-4 flex-shrink-0">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{submissionStats?.totalSubmissions || 0} soumissions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{(submissionStats?.totalViews || 0).toLocaleString()} vues</span>
            </div>
          </div>

          {/* MVP: Tracking Code Section */}
          {campaign.trackingCode && (
            <div className="flex-shrink-0">
              <div className="text-xs text-muted-foreground mb-1">Code de tracking</div>
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <code className="font-mono text-sm font-bold flex-1">
                  {campaign.trackingCode}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyTrackingCode}
                  className="h-6 w-6 p-0"
                >
                  {copiedTrackingCode ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Expiration Date */}
          {campaign.expiresAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Expire le {campaign.expiresAt.toLocaleDateString('fr-FR')}</span>
            </div>
          )}

          {/* Spacer to push buttons to bottom */}
          <div className="flex-1 min-h-[20px]"></div>

          {/* Action Buttons - Always at bottom */}
          <div className="flex gap-2 flex-shrink-0">
            <Button 
              className="flex-1 min-w-0" 
              onClick={() => router.push(`/campaigns/${campaign.id}`)}
            >
              <span className="truncate">Voir la campagne</span>
            </Button>
            
            {/* Conditional buttons */}
            {canToggleStatus && (
              <Button
                variant="outline"
                onClick={handleStatusToggle}
                disabled={loading}
                className="flex-shrink-0"
              >
                <span className="truncate">{campaign.status === 'active' ? 'Pause' : 'Activer'}</span>
              </Button>
            )}
            
            {canSubmit && (
              <Button 
                variant="outline"
                onClick={() => setShowSubmitDialog(true)}
                className="flex-shrink-0"
              >
                <Upload className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Soumettre un clip</span>
              </Button>
            )}
            
            {canManage && campaign.status === 'draft' as any && (
              <Button 
                variant="outline"
                onClick={() => setShowPaymentDialog(true)}
                className="flex-shrink-0"
              >
                <span className="truncate">💸 Financer</span>
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
            <AlertDialogTitle>Supprimer la campagne</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{campaign.title}" ? Cette action ne peut pas être annulée.
              Toutes les soumissions et données liées à cette campagne seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Suppression...' : 'Supprimer la campagne'}
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