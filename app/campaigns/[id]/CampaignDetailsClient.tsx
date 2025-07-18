'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Play, 
  DollarSign, 
  Eye, 
  Calendar, 
  Users, 
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  User
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SubmitClipDialog } from '@/components/campaigns/submit-clip-dialog';
import { Campaign, ClipSubmission } from '@/lib/types';

export default function CampaignDetailsClient() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [creatorInfo, setCreatorInfo] = useState<{
    displayName: string;
    avatar?: string;
  } | null>(null);
  const [submissions, setSubmissions] = useState<ClipSubmission[]>([]);
  const [campaignStats, setCampaignStats] = useState({
    totalSubmissions: 0,
    totalViews: 0,
    totalPaid: 0,
    approvedSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // Calculate approved submissions
  const approvedSubmissions = submissions.filter(sub => sub.status === 'approved');

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!params.id) return;
      
      try {
        // Fetch campaign with creator info
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select(`
            *,
            users!campaigns_creator_id_fkey (
              display_name,
              avatar
            )
          `)
          .eq('id', params.id as string)
          .single();

        if (campaignError) {
          console.error('Error fetching campaign:', campaignError);
          router.push('/campaigns');
          return;
        }

        const campaign: Campaign = {
          id: campaignData.id,
          creatorId: campaignData.creator_id,
          title: campaignData.title,
          videoUrl: campaignData.video_url,
          thumbnail: campaignData.thumbnail,
          payPerView: {
            amountPerMillionViews: campaignData.amount_per_million_views,
            minimumViews: campaignData.minimum_views,
          },
          rules: campaignData.rules,
          status: campaignData.status as 'active' | 'paused' | 'completed',
          totalBudget: campaignData.total_budget,
          remainingBudget: campaignData.remaining_budget,
          createdAt: new Date(campaignData.created_at),
          updatedAt: new Date(campaignData.updated_at),
          expiresAt: campaignData.expires_at ? new Date(campaignData.expires_at) : undefined,
        };

        setCampaign(campaign);

        // Set creator info
        if (campaignData.users) {
          setCreatorInfo({
            displayName: campaignData.users.display_name,
            avatar: campaignData.users.avatar,
          });
        }
        // Fetch submissions
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('clip_submissions')
          .select('*')
          .eq('campaign_id', params.id as string)
          .order('submitted_at', { ascending: false });

        if (submissionsError) {
          console.error('Error fetching submissions:', submissionsError);
        } else {
          const submissions: ClipSubmission[] = submissionsData.map(sub => ({
            id: sub.id,
            campaignId: sub.campaign_id,
            submitterId: sub.submitter_id,
            clipUrl: sub.clip_url,
            platform: sub.platform as 'tiktok' | 'instagram' | 'youtube' | 'twitter',
            viewCount: sub.view_count,
            submittedAt: new Date(sub.submitted_at),
            status: sub.status as 'pending' | 'approved' | 'rejected' | 'paid',
            paymentAmount: sub.payment_amount,
            rejectionReason: sub.rejection_reason,
            verifiedAt: sub.verified_at ? new Date(sub.verified_at) : undefined,
          }));
          setSubmissions(submissions);
          
          // Calculate real campaign stats
          const stats = {
            totalSubmissions: submissions.length,
            totalViews: submissions.reduce((sum, sub) => sum + sub.viewCount, 0),
            totalPaid: submissions
              .filter(sub => sub.status === 'approved' || sub.status === 'paid')
              .reduce((sum, sub) => sum + (sub.paymentAmount || 0), 0),
            approvedSubmissions: submissions.filter(sub => sub.status === 'approved').length,
          };
          setCampaignStats(stats);
        }
      } catch (error) {
        console.error('Error fetching campaign:', error);
        router.push('/campaigns');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [params.id, router]);

  const handleCreatorClick = () => {
    if (campaign) {
      router.push(`/profile/${campaign.creatorId}`);
    }
  };
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading campaign...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The campaign you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => router.push('/campaigns')}>
            Back to Campaigns
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
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

  // Use real calculated stats
  const budgetUsed = campaignStats.totalPaid / (campaign.totalBudget || 1) * 100;
  const remainingBudget = (campaign.totalBudget || 0) - campaignStats.totalPaid;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{campaign.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-muted-foreground">Campaign Details & Submissions</p>
              
              {/* Creator Info */}
              {creatorInfo && (
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
                  onClick={handleCreatorClick}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={creatorInfo.avatar} alt={creatorInfo.displayName} />
                    <AvatarFallback className="text-xs">
                      {creatorInfo.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    by {creatorInfo.displayName}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Button onClick={() => setShowSubmitDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Submit Clip
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Campaign Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="relative w-full h-64">
                  <Image
                    src={campaign.thumbnail}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                    fill
                    sizes="(max-width: 1024px) 100vw, 800px"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                    <Button
                      size="lg"
                      onClick={() => window.open(campaign.videoUrl, '_blank')}
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Watch Original
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Payment Terms</h3>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Per Million Views</p>
                          <p className="text-2xl font-bold text-green-600">
                            ${campaign.payPerView.amountPerMillionViews}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Minimum Views</p>
                          <p className="text-lg font-semibold">
                            {campaign.payPerView.minimumViews.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Campaign Rules</h3>
                    <div className="space-y-2">
                      {campaign.rules.map((rule, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-sm font-medium text-muted-foreground mt-0.5">
                            {index + 1}.
                          </span>
                          <p className="text-sm">{rule}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Used</span>
                    <span>{budgetUsed.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <span className="font-medium">${remainingBudget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Budget</span>
                    <span className="font-medium">${campaign.totalBudget?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Paid</span>
                    <span className="font-medium text-green-600">${campaignStats.totalPaid.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{campaignStats.totalViews.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Views</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold">{campaignStats.totalSubmissions}</div>
                    <div className="text-xs text-muted-foreground">Submissions</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{campaignStats.approvedSubmissions}</div>
                    <div className="text-xs text-muted-foreground">Approved</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {campaign.expiresAt && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Campaign Ends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {campaign.expiresAt.toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Math.ceil((campaign.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="submissions">All Submissions ({submissions.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedSubmissions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submissions.slice(0, 6).map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                        <span className="text-2xl">{getPlatformIcon(submission.platform)}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Views</span>
                          <span className="font-medium">{submission.viewCount.toLocaleString()}</span>
                        </div>
                        {submission.paymentAmount && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Payment</span>
                            <span className="font-medium text-green-600">${submission.paymentAmount}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Submitted</span>
                          <span className="text-sm">{submission.submittedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => window.open(submission.clipUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Clip
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="submissions" className="mt-6">
            <div className="space-y-4">
              {submissions.map((sub) => (
                <Card key={sub.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{getPlatformIcon(sub.platform)}</span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getStatusColor(sub.status)}>
                              {sub.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {sub.submittedAt.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span>{sub.viewCount.toLocaleString()} views</span>
                            {sub.paymentAmount && (
                              <span className="text-green-600 font-medium">
                                ${sub.paymentAmount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            const url = new URL(sub.clipUrl);
                            const key = url.pathname.replace(
                              '/storage/v1/object/public/delivered-videos/',
                              ''
                            );
                            const { data, error } = await supabase
                              .storage
                              .from('delivered-videos')
                              .createSignedUrl(key, 60);
                            if (error) {
                              console.error('signed-url error', error);
                              return;
                            }
                            setPlayingUrl(data!.signedUrl);
                            setIsPlaying(true);
                          } catch (err) {
                            window.open(sub.clipUrl, '_blank');
                          }
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Clip
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <div className="space-y-4">
              {approvedSubmissions.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{getPlatformIcon(submission.platform)}</span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Approved</span>
                            <span className="text-sm text-muted-foreground">
                              {submission.verifiedAt?.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span>{submission.viewCount.toLocaleString()} views</span>
                            <span className="text-green-600 font-medium">
                              ${submission.paymentAmount}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => window.open(submission.clipUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Clip
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <SubmitClipDialog
          open={showSubmitDialog}
          onOpenChange={setShowSubmitDialog}
          campaign={campaign}
        />
      </motion.div>
    </div>
  );
}