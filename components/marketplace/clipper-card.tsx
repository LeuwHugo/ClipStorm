'use client';

import { Star, Clock, Globe, Play } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/lib/types';

interface ClipperCardProps {
  clipper: User;
  onViewProfile: (clipperId: string) => void;
}

export function ClipperCard({ clipper, onViewProfile }: ClipperCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={clipper.avatar} alt={clipper.displayName} />
            <AvatarFallback>{clipper.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{clipper.displayName}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{clipper.rating || 0}</span>
              <span>({clipper.reviewCount || 0} reviews)</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {clipper.bio || 'Professional video editor specializing in short-form content'}
        </p>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{clipper.turnaroundTime || 24}h turnaround</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span>{clipper.languages?.join(', ') || 'English'}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {clipper.portfolio?.slice(0, 3).map((video, index) => (
            <div key={index} className="relative group">
              <div className="w-20 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Play className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-muted-foreground">Starting from</span>
            <p className="font-semibold">$0.05/1K views</p>
          </div>
          <Badge variant="secondary">3 shorts</Badge>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => onViewProfile(clipper.id)}
        >
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
}