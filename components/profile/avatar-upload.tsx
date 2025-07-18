'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase, uploadImage, getImageUrl, deleteImage } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface AvatarUploadProps {
  currentAvatar?: string;
  displayName: string;
  onAvatarUpdate: (newAvatarUrl: string | null) => void;
}

export function AvatarUpload({ currentAvatar, displayName, onAvatarUpdate }: AvatarUploadProps) {
  const { user } = useAuth();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setShowUploadDialog(true);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    try {
      // Delete old avatar if it exists and is from our storage
      if (currentAvatar && currentAvatar.includes('user-avatars')) {
        try {
          const oldPath = currentAvatar.split('/user-avatars/')[1];
          if (oldPath) {
            await deleteImage('user-avatars', oldPath);
          }
        } catch (error) {
          console.warn('Failed to delete old avatar:', error);
        }
      }

      // Upload new avatar
      const fileName = `${user.id}-${Date.now()}.${selectedFile.name.split('.').pop()}`;
      const filePath = `avatars/${fileName}`;
      
      await uploadImage(selectedFile, 'user-avatars', filePath);
      const publicUrl = getImageUrl('user-avatars', filePath);
      
      // Update user profile in database
      const { error } = await supabase
        .from('users')
        .update({ avatar: publicUrl })
        .eq('id', user.id);

      if (error) throw error;

      onAvatarUpdate(publicUrl);
      toast.success('Profile picture updated successfully!');
      setShowUploadDialog(false);
      
      // Clean up
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    setUploading(true);
    try {
      // Delete from storage if it's our image
      if (currentAvatar && currentAvatar.includes('user-avatars')) {
        try {
          const path = currentAvatar.split('/user-avatars/')[1];
          if (path) {
            await deleteImage('user-avatars', path);
          }
        } catch (error) {
          console.warn('Failed to delete avatar from storage:', error);
        }
      }

      // Update user profile in database
      const { error } = await supabase
        .from('users')
        .update({ avatar: null })
        .eq('id', user.id);

      if (error) throw error;

      onAvatarUpdate(null);
      toast.success('Profile picture removed successfully!');
    } catch (error) {
      console.error('Remove avatar error:', error);
      toast.error('Failed to remove profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setShowUploadDialog(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  return (
    <>
      <div className="relative group">
        <Avatar className="h-24 w-24 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <AvatarImage src={currentAvatar || ''} alt={displayName} />
          <AvatarFallback className="text-2xl">
            {displayName?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        {/* Overlay on hover */}
        <div 
          className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="h-6 w-6 text-white" />
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a new profile picture or remove the current one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Preview */}
            {previewUrl && (
              <div className="flex justify-center">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={previewUrl} alt="Preview" />
                  <AvatarFallback className="text-3xl">
                    {displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={uploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>

              {currentAvatar && (
                <Button
                  variant="destructive"
                  onClick={handleRemoveAvatar}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Remove Current Picture
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Upload Guidelines */}
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium">Guidelines:</p>
              <ul className="space-y-1 text-xs">
                <li>• Maximum file size: 2MB</li>
                <li>• Supported formats: JPG, PNG, GIF, WebP</li>
                <li>• Recommended: Square images (1:1 ratio)</li>
                <li>• Minimum resolution: 200x200 pixels</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}