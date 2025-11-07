'use client';

import { Eye, Heart, MessageCircle, Hash, ExternalLink, Play, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipSubmission } from '@/lib/types';
import { formatNumber } from '@/lib/platform-metadata';
import Image from 'next/image';

interface ClipSubmissionCardProps {
  submission: ClipSubmission;
  showActions?: boolean;
  onViewClip?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onPayout?: () => void;
}

export function ClipSubmissionCard({
  submission,
  showActions = false,
  onViewClip,
  onApprove,
  onReject,
  onPayout,
}: ClipSubmissionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'paid':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      tiktok: '🎵',
      instagram: '📷',
      youtube: '📺',
      twitter: '🐦',
    };
    return icons[platform] || '🎬';
  };

  const getPlatformColor = (platform: string) => {
    const colors: { [key: string]: string } = {
      tiktok: 'bg-black text-white',
      instagram: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      youtube: 'bg-red-600 text-white',
      twitter: 'bg-blue-500 text-white',
    };
    return colors[platform] || 'bg-gray-600 text-white';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg line-clamp-1 flex-1">
                {submission.title || `${submission.platform.charAt(0).toUpperCase() + submission.platform.slice(1)} Clip`}
              </CardTitle>
              <Badge className={getStatusColor(submission.status)}>
                {submission.status}
              </Badge>
            </div>
            
            {submission.author && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                by {submission.author}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="secondary" className={`${getPlatformColor(submission.platform)} capitalize`}>
              {getPlatformIcon(submission.platform)} {submission.platform}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Thumbnail */}
        {submission.thumbnail && (
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={submission.thumbnail}
              alt={submission.title || 'Clip preview'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
              <Button
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() => window.open(submission.clipUrl, '_blank')}
              >
                <Play className="h-4 w-4 mr-2" />
                Watch
              </Button>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatNumber(submission.viewCount)}</span>
          </div>
          {submission.likeCount && (
            <div className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatNumber(submission.likeCount)}</span>
            </div>
          )}
          {submission.commentCount && (
            <div className="flex items-center gap-2 text-sm">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatNumber(submission.commentCount)}</span>
            </div>
          )}
        </div>

        {/* Hashtags */}
        {submission.hashtags && submission.hashtags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Hash className="h-4 w-4" />
              <span>Hashtags</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {submission.hashtags.slice(0, 5).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {submission.hashtags.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{submission.hashtags.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Payment Info */}
        {submission.paymentAmount && (
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Payment Amount</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-bold text-green-600">${submission.paymentAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submission Date */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Submitted {submission.submittedAt.toLocaleDateString()}</span>
          {submission.verifiedAt && (
            <span>Verified {submission.verifiedAt.toLocaleDateString()}</span>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(submission.clipUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Clip
            </Button>
            
            {submission.status === 'pending' && onApprove && onReject && (
              <>
                <Button
                  size="sm"
                  onClick={onApprove}
                  className="flex-shrink-0"
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onReject}
                  className="flex-shrink-0"
                >
                  Reject
                </Button>
              </>
            )}
            
            {submission.status === 'approved' && submission.paymentAmount && onPayout && (
              <Button
                size="sm"
                onClick={onPayout}
                className="flex-shrink-0"
              >
                Pay ${submission.paymentAmount.toFixed(2)}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 