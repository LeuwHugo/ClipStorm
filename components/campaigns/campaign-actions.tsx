'use client&apos;;

import { useState } from 'react&apos;;
import { MoreHorizontal, Edit, Pause, Play, Trash2 } from 'lucide-react&apos;;
import { Button } from &apos;@/components/ui/button&apos;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &apos;@/components/ui/dropdown-menu&apos;;
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from &apos;@/components/ui/alert-dialog&apos;;
import { Campaign } from &apos;@/lib/types&apos;;
import { supabase } from &apos;@/lib/supabase&apos;;
import { toast } from 'sonner&apos;;

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
      const newStatus = campaign.status === 'active&apos; ? 'paused&apos; : 'active&apos;;
      
      const { error } = await supabase
        .from('campaigns&apos;)
        .update({ status: newStatus })
        .eq('id&apos;, campaign.id);

      if (error) throw error;

      const updatedCampaign = { ...campaign, status: newStatus as 'active&apos; | 'paused&apos; | 'completed&apos; };
      onUpdate(updatedCampaign);
      
      toast.success(`Campaign ${newStatus === 'active&apos; ? 'activated&apos; : 'paused&apos;} successfully!`);
    } catch (error) {
      console.error(&apos;Error updating campaign status:&apos;, error);
      toast.error(&apos;Failed to update campaign status&apos;);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('campaigns&apos;)
        .delete()
        .eq('id&apos;, campaign.id);

      if (error) throw error;

      onDelete(campaign.id);
      toast.success(&apos;Campaign deleted successfully!&apos;);
    } catch (error) {
      console.error(&apos;Error deleting campaign:&apos;, error);
      toast.error(&apos;Failed to delete campaign&apos;);
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost&quot; size="sm&quot; disabled={loading}>
            <MoreHorizontal className="h-4 w-4&quot; />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end&quot;>
          <DropdownMenuItem>
            <Edit className="h-4 w-4 mr-2&quot; />
            Edit Campaign
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleStatusToggle} disabled={loading}>
            {campaign.status === 'active&apos; ? (
              <>
                <Pause className="h-4 w-4 mr-2&quot; />
                Pause Campaign
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2&quot; />
                Activate Campaign
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive&quot;
            disabled={loading}
          >
            <Trash2 className="h-4 w-4 mr-2&quot; />
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90&quot;
            >
              {loading ? &apos;Deleting...&apos; : &apos;Delete Campaign&apos;}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}