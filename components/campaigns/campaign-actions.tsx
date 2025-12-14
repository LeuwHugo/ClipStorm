'use client';

import { useState } from 'react';
import { MoreHorizontal, Edit, Pause, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Campaign } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface CampaignActionsProps {
  campaign: Campaign;
  onUpdate: (updatedCampaign: Campaign) => void;
  onDelete: (campaignId: string) => void;
}

export function CampaignActions({ campaign, onUpdate, onDelete }: CampaignActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStatusToggle = async () => {
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
    setLoading(true);
    try {
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={loading}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
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
    </>
  );
}