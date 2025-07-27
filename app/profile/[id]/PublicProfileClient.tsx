'use client&apos;;

import { useState, useEffect } from 'react&apos;;
import { useParams, useRouter } from 'next/navigation&apos;;
import { motion } from 'framer-motion&apos;;
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
} from 'lucide-react&apos;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from &apos;@/components/ui/card&apos;;
import { Button } from &apos;@/components/ui/button&apos;;
import { Badge } from &apos;@/components/ui/badge&apos;;
import { Avatar, AvatarFallback, AvatarImage } from &apos;@/components/ui/avatar&apos;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &apos;@/components/ui/tabs&apos;;
import { supabase } from &apos;@/lib/supabase&apos;;
import { User } from &apos;@/lib/types&apos;;

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
          .from('users&apos;)
          .select(&apos;*')
          .eq('id&apos;, params.id as string)
          .single();

        if (userError) {
          console.error(&apos;Error fetching user:&apos;, userError);
          router.push(&apos;/');
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
        if (userData.role === 'creator&apos;) {
          const { data: campaignsData, error: campaignsError } = await supabase
            .from('campaigns&apos;)
            .select(&apos;*')
            .eq('creator_id&apos;, params.id as string)
            .eq('status&apos;, 'active&apos;)
            .order('created_at&apos;, { ascending: false })
            .limit(6);

          if (!campaignsError && campaignsData) {
            setCampaigns(campaignsData);
          }
        }

        // Fetch user's submissions if they're a clipper
        if (userData.role === 'clipper&apos;) {
          const { data: submissionsData, error: submissionsError } = await supabase
            .from('clip_submissions&apos;)
            .select(`
              *,
              campaigns (
                title,
                creator_id
              )
            `)
            .eq('submitter_id&apos;, params.id as string)
            .eq('status&apos;, 'approved&apos;)
            .order('submitted_at&apos;, { ascending: false })
            .limit(6);

          if (!submissionsError && submissionsData) {
            setSubmissions(submissionsData);
          }
        }
      } catch (error) {
        console.error(&apos;Error fetching profile:&apos;, error);
        router.push(&apos;/');
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
          i < rating ? 'fill-yellow-400 text-yellow-400&apos; : 'text-gray-300&apos;
        }`}
      />
    ));
  };

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      tiktok: &apos;🎵&apos;,
      instagram: &apos;📷&apos;,
      youtube: &apos;📺&apos;,
      twitter: &apos;🐦&apos;,
    };
    return icons[platform] || &apos;🎬&apos;;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl&quot;>
        <div className="flex items-center justify-center min-h-[400px]&quot;>
          <div className="text-center&quot;>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4&quot;></div>
            <p className="text-muted-foreground&quot;>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl&quot;>
        <div className="text-center py-12&quot;>
          <h1 className="text-2xl font-bold mb-4&quot;>User Not Found</h1>
          <p className="text-muted-foreground mb-6&quot;>
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
    <div className="container mx-auto px-4 py-8 max-w-6xl&quot;>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8&quot;>
          <Button variant="ghost&quot; size="sm&quot; onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2&quot; />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8&quot;>
          {/* Profile Info */}
          <div className="lg:col-span-2&quot;>
            <div className="flex items-start gap-6 mb-6&quot;>
              <Avatar className="h-24 w-24&quot;>
                <AvatarImage src={user.avatar} alt={user.displayName} />
                <AvatarFallback className="text-2xl&quot;>{user.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1&quot;>
                <h1 className="text-3xl font-bold mb-2&quot;>{user.displayName}</h1>
                <p className="text-muted-foreground mb-4&quot;>
                  {user.role === 'creator&apos; ? &apos;Content Creator&apos; : &apos;Professional Video Editor&apos;}
                </p>
                
                <div className="flex items-center gap-6 mb-4&quot;>
                  {user.role === 'clipper&apos; && user.rating && (
                    <div className="flex items-center gap-2&quot;>
                      <div className="flex&quot;>{renderStars(Math.floor(user.rating))}</div>
                      <span className="font-medium&quot;>{user.rating}</span>
                      <span className="text-sm text-muted-foreground&quot;>({user.reviewCount} reviews)</span>
                    </div>
                  )}
                  {user.role === 'clipper&apos; && user.turnaroundTime && (
                    <div className="flex items-center gap-2&quot;>
                      <Clock className="h-4 w-4 text-muted-foreground&quot; />
                      <span className="text-sm&quot;>{user.turnaroundTime}h delivery</span>
                    </div>
                  )}
                  {user.role === 'creator&apos; && (
                    <div className="flex items-center gap-2&quot;>
                      <Video className="h-4 w-4 text-muted-foreground&quot; />
                      <span className="text-sm&quot;>{campaigns.length} active campaigns</span>
                    </div>
                  )}
                </div>

                {user.languages && (
                  <div className="flex flex-wrap gap-2 mb-4&quot;>
                    {user.languages.map((lang) => (
                      <Badge key={lang} variant="secondary&quot;>{lang}</Badge>
                    ))}
                  </div>
                )}

                <p className="text-muted-foreground leading-relaxed&quot;>
                  {user.bio || (user.role === 'creator&apos; 
                    ? &apos;Content creator looking for skilled video editors to create viral clips.&apos;
                    : &apos;Professional video editor specializing in short-form content creation.&apos;
                  )}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8&quot;>
              {user.role === 'creator&apos; ? (
                <>
                  <Card>
                    <CardContent className="p-4 text-center&quot;>
                      <div className="text-2xl font-bold text-primary&quot;>{campaigns.length}</div>
                      <div className="text-sm text-muted-foreground&quot;>Active Campaigns</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center&quot;>
                      <div className="text-2xl font-bold text-primary&quot;>{user.subscriberCount?.toLocaleString() || &apos;0'}</div>
                      <div className="text-sm text-muted-foreground&quot;>Subscribers</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center&quot;>
                      <div className="text-2xl font-bold text-primary&quot;>{user.platforms?.length || 0}</div>
                      <div className="text-sm text-muted-foreground&quot;>Platforms</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center&quot;>
                      <div className="text-2xl font-bold text-primary&quot;>
                        {Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))}
                      </div>
                      <div className="text-sm text-muted-foreground&quot;>Days Active</div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card>
                    <CardContent className="p-4 text-center&quot;>
                      <div className="text-2xl font-bold text-primary&quot;>{submissions.length}</div>
                      <div className="text-sm text-muted-foreground&quot;>Approved Clips</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center&quot;>
                      <div className="text-2xl font-bold text-primary&quot;>
                        {submissions.reduce((sum, sub) => sum + sub.view_count, 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground&quot;>Total Views</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center&quot;>
                      <div className="text-2xl font-bold text-primary&quot;>{user.rating || &apos;N/A&apos;}</div>
                      <div className="text-sm text-muted-foreground&quot;>Rating</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center&quot;>
                      <div className="text-2xl font-bold text-primary&quot;>{user.turnaroundTime || 24}h</div>
                      <div className="text-sm text-muted-foreground&quot;>Delivery Time</div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6&quot;>
            {user.role === 'creator&apos; && user.platforms && (
              <Card>
                <CardHeader>
                  <CardTitle>Platforms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3&quot;>
                  {user.platforms.map((platform) => (
                    <div key={platform} className="flex items-center gap-3&quot;>
                      <span className="text-lg&quot;>{getPlatformIcon(platform.toLowerCase())}</span>
                      <span className="font-medium&quot;>{platform}</span>
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
                <div className="flex items-center gap-2&quot;>
                  <Calendar className="h-4 w-4 text-muted-foreground&quot; />
                  <span>{user.createdAt.toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue={user.role === 'creator&apos; ? 'campaigns&apos; : 'submissions&apos;}>
          <TabsList>
            <TabsTrigger value={user.role === 'creator&apos; ? 'campaigns&apos; : 'submissions&apos;}>
              {user.role === 'creator&apos; ? &apos;Active Campaigns&apos; : &apos;Recent Work&apos;}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={user.role === 'creator&apos; ? 'campaigns&apos; : 'submissions&apos;} className="mt-6&quot;>
            {user.role === 'creator&apos; ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-lg transition-shadow cursor-pointer&quot;>
                    <CardContent className="p-4&quot;>
                      <div className="aspect-video rounded-lg overflow-hidden mb-4&quot;>
                        <img
                          src={campaign.thumbnail}
                          alt={campaign.title}
                          className="w-full h-full object-cover&quot;
                        />
                      </div>
                      <h3 className="font-semibold mb-2 line-clamp-2&quot;>{campaign.title}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground&quot;>
                        <span>${campaign.amount_per_million_views}/1M views</span>
                        <Badge variant="secondary&quot;>{campaign.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
                {submissions.map((submission) => (
                  <Card key={submission.id} className="hover:shadow-lg transition-shadow&quot;>
                    <CardContent className="p-4&quot;>
                      <div className="flex items-center justify-between mb-3&quot;>
                        <Badge variant="secondary&quot;>Approved</Badge>
                        <span className="text-2xl&quot;>{getPlatformIcon(submission.platform)}</span>
                      </div>
                      <div className="space-y-2&quot;>
                        <div className="flex justify-between&quot;>
                          <span className="text-sm text-muted-foreground&quot;>Views</span>
                          <span className="font-medium&quot;>{submission.view_count.toLocaleString()}</span>
                        </div>
                        {submission.payment_amount && (
                          <div className="flex justify-between&quot;>
                            <span className="text-sm text-muted-foreground&quot;>Earned</span>
                            <span className="font-medium text-green-600&quot;>${submission.payment_amount}</span>
                          </div>
                        )}
                        <div className="flex justify-between&quot;>
                          <span className="text-sm text-muted-foreground&quot;>Submitted</span>
                          <span className="text-sm&quot;>{new Date(submission.submitted_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline&quot;
                        size="sm&quot;
                        className="w-full mt-3&quot;
                        onClick={() => window.open(submission.clip_url, &apos;_blank&apos;)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2&quot; />
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