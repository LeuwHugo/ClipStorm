'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Star, 
  Clock, 
  Globe, 
  Video,
  Eye,
  TrendingUp,
  Calendar,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';

export default function PublicProfileClient() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!params.id) return;
      
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', params.id as string)
          .single();

        if (userError) {
          console.error('Error fetching user:', userError);
          router.push('/');
          return;
        }

        const userProfile: User = {
          id: userData.id,
          email: userData.email,
          displayName: userData.display_name,
          avatar: userData.avatar,
          role: userData.role,
          bio: userData.bio,
          rating: userData.rating,
          reviewCount: userData.review_count,
          turnaroundTime: userData.turnaround_time,
          languages: userData.languages,
          portfolio: userData.portfolio,
          platforms: userData.platforms,
          channelName: userData.channel_name,
          subscriberCount: userData.subscriber_count,
          createdAt: new Date(userData.created_at),
          updatedAt: new Date(userData.updated_at),
        };

        setUser(userProfile);

        // Fetch user's campaigns if they're a creator
        if (userData.role === 'creator') {
          const { data: campaignsData, error: campaignsError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('creator_id', params.id as string)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(6);

          if (!campaignsError && campaignsData) {
            setCampaigns(campaignsData);
          }
        }

        // Fetch user's submissions if they're a clipper
        if (userData.role === 'clipper') {
          const { data: submissionsData, error: submissionsError } = await supabase
            .from('clip_submissions')
            .select(`
              *,
              campaigns (
                title,
                creator_id
              )
            `)
            .eq('submitter_id', params.id as string)
            .eq('status', 'approved')
            .order('submitted_at', { ascending: false })
            .limit(6);

          if (!submissionsError && submissionsData) {
            setSubmissions(submissionsData);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [params.id, router]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The user you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="flex items-start gap-6 mb-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.displayName} />
                <AvatarFallback className="text-2xl">{user.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{user.displayName}</h1>
                <p className="text-muted-foreground mb-4">
                  {user.role === 'creator' ? 'Content Creator' : 'Professional Video Editor'}
                </p>
                
                <div className="flex items-center gap-6 mb-4">
                  {user.role === 'clipper' && user.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(Math.floor(user.rating))}</div>
                      <span className="font-medium">{user.rating}</span>
                      <span className="text-sm text-muted-foreground">({user.reviewCount} reviews)</span>
                    </div>
                  )}
                  {user.role === 'clipper' && user.turnaroundTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.turnaroundTime}h delivery</span>
                    </div>
                  )}
                  {user.role === 'creator' && (
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{campaigns.length} active campaigns</span>
                    </div>
                  )}
                </div>

                {user.languages && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {user.languages.map((lang) => (
                      <Badge key={lang} variant="secondary">{lang}</Badge>
                    ))}
                  </div>
                )}

                <p className="text-muted-foreground leading-relaxed">
                  {user.bio || (user.role === 'creator' 
                    ? 'Content creator looking for skilled video editors to create viral clips.'
                    : 'Professional video editor specializing in short-form content creation.'
                  )}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {user.role === 'creator' ? (
                <>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{campaigns.length}</div>
                      <div className="text-sm text-muted-foreground">Active Campaigns</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{user.subscriberCount?.toLocaleString() || '0'}</div>
                      <div className="text-sm text-muted-foreground">Subscribers</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{user.platforms?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Platforms</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))}
                      </div>
                      <div className="text-sm text-muted-foreground">Days Active</div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{submissions.length}</div>
                      <div className="text-sm text-muted-foreground">Approved Clips</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {submissions.reduce((sum, sub) => sum + sub.view_count, 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Views</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{user.rating || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">Rating</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{user.turnaroundTime || 24}h</div>
                      <div className="text-sm text-muted-foreground">Delivery Time</div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {user.role === 'creator' && user.platforms && (
              <Card>
                <CardHeader>
                  <CardTitle>Platforms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user.platforms.map((platform) => (
                    <div key={platform} className="flex items-center gap-3">
                      <span className="text-lg">{getPlatformIcon(platform.toLowerCase())}</span>
                      <span className="font-medium">{platform}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Member Since</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{user.createdAt.toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue={user.role === 'creator' ? 'campaigns' : 'submissions'}>
          <TabsList>
            <TabsTrigger value={user.role === 'creator' ? 'campaigns' : 'submissions'}>
              {user.role === 'creator' ? 'Active Campaigns' : 'Recent Work'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={user.role === 'creator' ? 'campaigns' : 'submissions'} className="mt-6">
            {user.role === 'creator' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="aspect-video rounded-lg overflow-hidden mb-4 relative">
                        <Image
                          src={campaign.thumbnail}
                          alt={campaign.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <h3 className="font-semibold mb-2 line-clamp-2">{campaign.title}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>${campaign.amount_per_million_views}/1M views</span>
                        <Badge variant="secondary">{campaign.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {submissions.map((submission) => (
                  <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary">Approved</Badge>
                        <span className="text-2xl">{getPlatformIcon(submission.platform)}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Views</span>
                          <span className="font-medium">{submission.view_count.toLocaleString()}</span>
                        </div>
                        {submission.payment_amount && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Earned</span>
                            <span className="font-medium text-green-600">${submission.payment_amount}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Submitted</span>
                          <span className="text-sm">{new Date(submission.submitted_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => window.open(submission.clip_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Clip
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}