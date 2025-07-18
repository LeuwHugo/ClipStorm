'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Star, 
  Video, 
  Users, 
  FileText,
  Plus,
  Eye,
  Play,
  Upload,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/use-user-role';
import { supabase } from '@/lib/supabase';
import { Campaign, ClipSubmission } from '@/lib/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { isCreator, isClipper } = useUserRole();
  const [activeTab, setActiveTab] = useState('overview');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<ClipSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats for creators
  const [creatorStats, setCreatorStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSpent: 0,
    totalSubmissions: 0,
    pendingReviews: 0,
  });

  // Stats for clippers
  const [clipperStats, setClipperStats] = useState({
    totalSubmissions: 0,
    approvedSubmissions: 0,
    pendingSubmissions: 0,
    totalEarnings: 0,
    totalViews: 0,
  });

  useEffect(() => {
    if (user) {
      if (isCreator) {
        fetchCreatorData();
      } else if (isClipper) {
        fetchClipperData();
      }
    }
  }, [user, isCreator, isClipper]);

  const fetchCreatorData = async () => {
    if (!user) return;
    
    try {
      // Fetch campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (campaignsError) throw campaignsError;

      const campaignsList = campaignsData?.map(campaign => ({
        id: campaign.id,
        creatorId: campaign.creator_id,
        title: campaign.title,
        videoUrl: campaign.video_url,
        thumbnail: campaign.thumbnail,
        payPerView: {
          amountPerMillionViews: campaign.amount_per_million_views,
          minimumViews: campaign.minimum_views,
        },
        rules: campaign.rules,
        status: campaign.status as 'active' | 'paused' | 'completed',
        totalBudget: campaign.total_budget,
        remainingBudget: campaign.remaining_budget,
        createdAt: new Date(campaign.created_at),
        updatedAt: new Date(campaign.updated_at),
        expiresAt: campaign.expires_at ? new Date(campaign.expires_at) : undefined,
      })) || [];

      setCampaigns(campaignsList);

      // Calculate stats
      const stats = {
        totalCampaigns: campaignsList.length,
        activeCampaigns: campaignsList.filter(c => c.status === 'active').length,
        totalSpent: campaignsList.reduce((sum, c) => sum + ((c.totalBudget || 0) - (c.remainingBudget || 0)), 0),
        totalSubmissions: 0, // Would fetch from submissions table
        pendingReviews: 0, // Would fetch pending submissions
      };

      setCreatorStats(stats);
    } catch (error) {
      console.error('Error fetching creator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClipperData = async () => {
    if (!user) return;
    
    try {
      // Fetch submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('clip_submissions')
        .select(`
          *,
          campaigns (
            title,
            creator_id
          )
        `)
        .eq('submitter_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(10);

      if (submissionsError) throw submissionsError;

      const submissionsList = submissionsData?.map(submission => ({
        id: submission.id,
        campaignId: submission.campaign_id,
        submitterId: submission.submitter_id,
        clipUrl: submission.clip_url,
        platform: submission.platform as 'tiktok' | 'instagram' | 'youtube' | 'twitter',
        viewCount: submission.view_count,
        submittedAt: new Date(submission.submitted_at),
        status: submission.status as 'pending' | 'approved' | 'rejected' | 'paid',
        paymentAmount: submission.payment_amount,
        rejectionReason: submission.rejection_reason,
        verifiedAt: submission.verified_at ? new Date(submission.verified_at) : undefined,
      })) || [];

      setSubmissions(submissionsList);

      // Calculate stats
      const stats = {
        totalSubmissions: submissionsList.length,
        approvedSubmissions: submissionsList.filter(s => s.status === 'approved').length,
        pendingSubmissions: submissionsList.filter(s => s.status === 'pending').length,
        totalEarnings: submissionsList.reduce((sum, s) => sum + (s.paymentAmount || 0), 0),
        totalViews: submissionsList.reduce((sum, s) => sum + s.viewCount, 0),
      };

      setClipperStats(stats);
    } catch (error) {
      console.error('Error fetching clipper data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'paused':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              {isCreator 
                ? `Welcome back! Manage your campaigns and track performance.`
                : `Welcome back! Track your submissions and earnings.`
              }
            </p>
          </div>
          {isCreator && (
            <Link href="/campaigns">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </Link>
          )}
          {isClipper && (
            <Link href="/campaigns">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Browse Campaigns
              </Button>
            </Link>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recent">
              {isCreator ? 'Recent Campaigns' : 'Recent Submissions'}
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {isCreator && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                      <Video className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{creatorStats.totalCampaigns}</div>
                      <p className="text-xs text-muted-foreground">
                        {creatorStats.activeCampaigns} active
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${creatorStats.totalSpent.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">
                        Across all campaigns
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{creatorStats.pendingReviews}</div>
                      <p className="text-xs text-muted-foreground">
                        Submissions awaiting review
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">85%</div>
                      <p className="text-xs text-muted-foreground">
                        Campaign success rate
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}

              {isClipper && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{clipperStats.totalSubmissions}</div>
                      <p className="text-xs text-muted-foreground">
                        {clipperStats.pendingSubmissions} pending
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${clipperStats.totalEarnings.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        From approved clips
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Math.round((clipperStats.approvedSubmissions / Math.max(clipperStats.totalSubmissions, 1)) * 100)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {clipperStats.approvedSubmissions} approved clips
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{clipperStats.totalViews.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">
                        Across all clips
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  {isCreator 
                    ? "Manage your campaigns and track performance"
                    : "Find new opportunities and track your progress"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isCreator && (
                    <>
                      <Link href="/campaigns">
                        <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                          <Plus className="h-6 w-6" />
                          <span>Create Campaign</span>
                        </Button>
                      </Link>
                      <Link href="/campaigns">
                        <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                          <Eye className="h-6 w-6" />
                          <span>View Campaigns</span>
                        </Button>
                      </Link>
                      <Link href="/profile">
                        <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                          <Users className="h-6 w-6" />
                          <span>Edit Profile</span>
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  {isClipper && (
                    <>
                      <Link href="/campaigns">
                        <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                          <Upload className="h-6 w-6" />
                          <span>Submit Clip</span>
                        </Button>
                      </Link>
                      <Link href="/campaigns">
                        <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                          <Video className="h-6 w-6" />
                          <span>Browse Campaigns</span>
                        </Button>
                      </Link>
                      <Link href="/profile">
                        <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                          <Star className="h-6 w-6" />
                          <span>Update Portfolio</span>
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            {isCreator && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Campaigns</CardTitle>
                  <CardDescription>
                    Your latest campaign activity and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.length > 0 ? (
                      campaigns.map((campaign) => (
                        <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Video className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{campaign.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                Created {campaign.createdAt.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                            <span className="font-semibold">${campaign.totalBudget?.toLocaleString()}</span>
                            <Link href={`/campaigns/${campaign.id}`}>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No campaigns yet</p>
                        <Link href="/campaigns">
                          <Button className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Campaign
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {isClipper && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Submissions</CardTitle>
                  <CardDescription>
                    Your latest clip submissions and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {submissions.length > 0 ? (
                      submissions.map((submission) => (
                        <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl">{getPlatformIcon(submission.platform)}</div>
                            <div>
                              <h3 className="font-semibold">
                                {submission.platform.charAt(0).toUpperCase() + submission.platform.slice(1)} Clip
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {submission.viewCount.toLocaleString()} views • {submission.submittedAt.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={getStatusColor(submission.status)}>
                              {submission.status}
                            </Badge>
                            {submission.paymentAmount && (
                              <span className="font-semibold text-green-600">
                                ${submission.paymentAmount.toFixed(2)}
                              </span>
                            )}
                            <Button size="sm" variant="outline" onClick={() => window.open(submission.clipUrl, '_blank')}>
                              <Play className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No submissions yet</p>
                        <Link href="/campaigns">
                          <Button className="mt-4">
                            <Upload className="h-4 w-4 mr-2" />
                            Submit Your First Clip
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isCreator ? 'Campaign Analytics' : 'Performance Analytics'}
                </CardTitle>
                <CardDescription>
                  {isCreator 
                    ? "Detailed insights into your campaign performance and ROI"
                    : "Track your submission performance and earnings over time"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isCreator 
                      ? "Campaign analytics dashboard coming soon"
                      : "Performance analytics dashboard coming soon"
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}