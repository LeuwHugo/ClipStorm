'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Camera, 
  Edit3, 
  Save, 
  Upload,
  Play,
  ExternalLink,
  Star,
  Clock,
  Globe,
  Trash2,
  Video,
  TrendingUp,
  Eye,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/use-user-role';
import { useTranslations } from '@/hooks/use-translations';
import { AvatarUpload } from '@/components/profile/avatar-upload';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalViews: number;
  totalSpent: number;
  avgPerformance: number;
}

interface SubmissionStats {
  totalSubmissions: number;
  approvedSubmissions: number;
  totalEarnings: number;
  avgRating: number;
  totalViews: number;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { isCreator, isClipper } = useUserRole();
  const { t } = useTranslations();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string>('');
  const [campaignStats, setCampaignStats] = useState<CampaignStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalViews: 0,
    totalSpent: 0,
    avgPerformance: 0
  });
  const [submissionStats, setSubmissionStats] = useState<SubmissionStats>({
    totalSubmissions: 0,
    approvedSubmissions: 0,
    totalEarnings: 0,
    avgRating: 0,
    totalViews: 0
  });
  
  // Profile data
  const [profile, setProfile] = useState({
    displayName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
    bio: '',
    location: '',
    languages: ['English'],
    turnaroundTime: 24,
    // Creator specific
    platforms: [] as string[],
    channelName: '',
    subscriberCount: 0,
    // Clipper specific
    portfolio: [] as string[],
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      if (isCreator) {
        fetchCampaignStats();
      } else if (isClipper) {
        fetchSubmissionStats();
      }
    }
  }, [user, isCreator, isClipper]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProfile({
          displayName: data.display_name || '',
          bio: data.bio || '',
          location: '',
          languages: data.languages || ['English'],
          turnaroundTime: data.turnaround_time || 24,
          platforms: data.platforms || [],
          channelName: data.channel_name || '',
          subscriberCount: data.subscriber_count || 0,
          portfolio: data.portfolio || [],
        });
        setCurrentAvatar(data.avatar || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleAvatarUpdate = (newAvatarUrl: string | null) => {
    setCurrentAvatar(newAvatarUrl || '');
  };

  const fetchCampaignStats = async () => {
    if (!user) return;
    
    try {
      const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('creator_id', user.id);
      
      if (error) throw error;
      
      const stats = {
        totalCampaigns: campaigns?.length || 0,
        activeCampaigns: campaigns?.filter(c => c.status === 'active').length || 0,
        totalViews: 0, // Would calculate from submissions
        totalSpent: campaigns?.reduce((sum, c) => sum + ((c.total_budget || 0) - (c.remaining_budget || 0)), 0) || 0,
        avgPerformance: 0 // Would calculate based on campaign performance
      };
      
      setCampaignStats(stats);
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
    }
  };

  const fetchSubmissionStats = async () => {
    if (!user) return;
    
    try {
      const { data: submissions, error } = await supabase
        .from('clip_submissions')
        .select('*')
        .eq('submitter_id', user.id);
      
      if (error) throw error;
      
      const stats = {
        totalSubmissions: submissions?.length || 0,
        approvedSubmissions: submissions?.filter(s => s.status === 'approved').length || 0,
        totalEarnings: submissions?.reduce((sum, s) => sum + (s.payment_amount || 0), 0) || 0,
        avgRating: 4.8, // Would calculate from reviews
        totalViews: submissions?.reduce((sum, s) => sum + s.view_count, 0) || 0
      };
      
      setSubmissionStats(stats);
    } catch (error) {
      console.error('Error fetching submission stats:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          display_name: profile.displayName,
          bio: profile.bio,
          languages: profile.languages,
          turnaround_time: isClipper ? profile.turnaroundTime : null,
          platforms: isCreator ? profile.platforms : null,
          channel_name: isCreator ? profile.channelName : null,
          subscriber_count: isCreator ? profile.subscriberCount : null,
          portfolio: isClipper ? profile.portfolio : null,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success(t('profile.profileUpdated'));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('profile.failedToUpdate'));
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageToggle = (language: string) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handlePlatformToggle = (platform: string) => {
    setProfile(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <AvatarUpload
              currentAvatar={currentAvatar || user?.user_metadata?.avatar_url}
              displayName={profile.displayName}
              onAvatarUpdate={handleAvatarUpdate}
            />
            <div>
              <h1 className="text-3xl font-bold">{profile.displayName}</h1>
              <p className="text-muted-foreground">
                {isCreator ? 'Content Creator' : 'Video Editor & Clipper'}
              </p>
              <div className="flex items-center gap-4 mt-2">
                {isClipper && (
                  <>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{submissionStats.avgRating}</span>
                      <span className="text-sm text-muted-foreground">rating</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile.turnaroundTime}h delivery</span>
                    </div>
                  </>
                )}
                {isCreator && (
                  <div className="flex items-center gap-1">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{campaignStats.totalCampaigns} campaigns</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              t('common.loading')
            ) : isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('profile.saveChanges')}
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                {t('profile.editProfile')}
              </>
            )}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isCreator && (
            <>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{campaignStats.totalCampaigns}</div>
                  <div className="text-sm text-muted-foreground">Total Campaigns</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{campaignStats.activeCampaigns}</div>
                  <div className="text-sm text-muted-foreground">Active Campaigns</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">${campaignStats.totalSpent.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{campaignStats.totalViews.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Views</div>
                </CardContent>
              </Card>
            </>
          )}
          
          {isClipper && (
            <>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{submissionStats.totalSubmissions}</div>
                  <div className="text-sm text-muted-foreground">Total Submissions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{submissionStats.approvedSubmissions}</div>
                  <div className="text-sm text-muted-foreground">Approved Clips</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">${submissionStats.totalEarnings.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total Earnings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{submissionStats.totalViews.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Views</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Info</TabsTrigger>
            <TabsTrigger value="campaign-focus">
              {isCreator ? 'Campaign Strategy' : 'Submission History'}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  {isCreator 
                    ? "Manage your creator profile to attract the best video editors"
                    : "Showcase your skills to attract campaign creators"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          value={profile.displayName}
                          onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                        />
                      </div>
                      {isClipper && (
                        <div>
                          <Label htmlFor="turnaround">Turnaround Time (hours)</Label>
                          <Input
                            id="turnaround"
                            type="number"
                            value={profile.turnaroundTime}
                            onChange={(e) => setProfile(prev => ({ ...prev, turnaroundTime: parseInt(e.target.value) }))}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder={isCreator 
                          ? "Describe your content style and what you're looking for in video editors..."
                          : "Describe your editing experience, style, and specialties..."
                        }
                        value={profile.bio}
                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label>Languages</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['English', 'Spanish', 'French', 'German', 'Portuguese', 'Japanese'].map((language) => (
                          <Badge
                            key={language}
                            variant={profile.languages.includes(language) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => handleLanguageToggle(language)}
                          >
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {isCreator && (
                      <>
                        <div>
                          <Label>Platforms</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {['YouTube', 'TikTok', 'Instagram', 'Twitch', 'Twitter'].map((platform) => (
                              <Badge
                                key={platform}
                                variant={profile.platforms.includes(platform) ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => handlePlatformToggle(platform)}
                              >
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="channelName">Channel Name</Label>
                            <Input
                              id="channelName"
                              value={profile.channelName}
                              onChange={(e) => setProfile(prev => ({ ...prev, channelName: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="subscriberCount">Subscriber Count</Label>
                            <Input
                              id="subscriberCount"
                              type="number"
                              value={profile.subscriberCount}
                              onChange={(e) => setProfile(prev => ({ ...prev, subscriberCount: parseInt(e.target.value) || 0 }))}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="font-semibold mb-2">About</h3>
                      <p className="text-muted-foreground">
                        {profile.bio || (isCreator 
                          ? 'Content creator looking for skilled video editors to create viral clips.'
                          : 'Professional video editor specializing in short-form content creation.'
                        )}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium mb-1">Languages</h4>
                        <div className="flex flex-wrap gap-1">
                          {profile.languages.map((lang) => (
                            <Badge key={lang} variant="secondary" className="text-xs">{lang}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      {isCreator && (
                        <div>
                          <h4 className="font-medium mb-1">Platforms</h4>
                          <div className="flex flex-wrap gap-1">
                            {profile.platforms.map((platform) => (
                              <Badge key={platform} variant="secondary" className="text-xs">{platform}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {isClipper && (
                        <div>
                          <h4 className="font-medium mb-1">Delivery Time</h4>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{profile.turnaroundTime} hours</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaign Focus Tab */}
          <TabsContent value="campaign-focus" className="space-y-6">
            {isCreator ? (
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Strategy</CardTitle>
                  <CardDescription>
                    Optimize your campaigns for better performance and ROI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3">Campaign Performance</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Success Rate</span>
                            <span className="font-medium">85%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Avg. Submissions</span>
                            <span className="font-medium">12 per campaign</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">ROI</span>
                            <span className="font-medium text-green-600">+240%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-3">Optimization Tips</h3>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Set clear campaign rules</li>
                          <li>• Offer competitive rates</li>
                          <li>• Provide quality source material</li>
                          <li>• Respond quickly to submissions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Submission History</CardTitle>
                  <CardDescription>
                    Track your clip submissions and earnings across campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3">Performance Metrics</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Approval Rate</span>
                            <span className="font-medium">{Math.round((submissionStats.approvedSubmissions / Math.max(submissionStats.totalSubmissions, 1)) * 100)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Avg. Views per Clip</span>
                            <span className="font-medium">{Math.round(submissionStats.totalViews / Math.max(submissionStats.totalSubmissions, 1)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Avg. Earnings</span>
                            <span className="font-medium text-green-600">${(submissionStats.totalEarnings / Math.max(submissionStats.approvedSubmissions, 1)).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-3">Growth Tips</h3>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Follow campaign rules carefully</li>
                          <li>• Submit high-quality clips</li>
                          <li>• Focus on trending content</li>
                          <li>• Build relationships with creators</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}