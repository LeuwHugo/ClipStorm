'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Eye, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignCard } from '@/components/campaigns/campaign-card';
import { CreateCampaignDialog } from '@/components/campaigns/create-campaign-dialog';
import { Campaign } from '@/lib/types';
import { useUserRole } from '@/hooks/use-user-role';

export default function CampaignsPage() {
  const { user } = useAuth();
  const { isCreator, isClipper, loading: roleLoading } = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignStats, setCampaignStats] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        let query = supabase
          .from('campaigns')
          .select(`
            *,
            users!campaigns_creator_id_fkey (
              display_name,
              avatar
            )
          `);
        
        // If user is a clipper, only show active campaigns
        if (isClipper) {
          query = query.eq('status', 'active');
        }
        
        // If user is a creator, show all their campaigns
        if (isCreator && user) {
          query = query.eq('creator_id', user.id);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const campaignsData = data.map(campaign => ({
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
          creatorInfo: campaign.users ? {
            displayName: campaign.users.display_name,
            avatar: campaign.users.avatar,
          } : undefined,
        })) as Campaign[];
        
        setCampaigns(campaignsData);
        
        // Fetch submission stats for each campaign
        await fetchCampaignStats(campaignsData.map(c => c.id));
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCampaignStats = async (campaignIds: string[]) => {
      try {
        const { data: submissions, error } = await supabase
          .from('clip_submissions')
          .select('campaign_id, view_count, payment_amount, status')
          .in('campaign_id', campaignIds);

        if (error) throw error;

        const stats: {[key: string]: any} = {};
        
        campaignIds.forEach(campaignId => {
          const campaignSubmissions = submissions?.filter(s => s.campaign_id === campaignId) || [];
          
          stats[campaignId] = {
            totalSubmissions: campaignSubmissions.length,
            totalViews: campaignSubmissions.reduce((sum, s) => sum + (s.view_count || 0), 0),
            totalPaid: campaignSubmissions
              .filter(s => s.status === 'approved' || s.status === 'paid')
              .reduce((sum, s) => sum + (s.payment_amount || 0), 0),
          };
        });
        
        setCampaignStats(stats);
      } catch (error) {
        console.error('Error fetching campaign stats:', error);
      }
    };
    fetchCampaigns();
  }, [isCreator, isClipper, user]);

  const handleUpdateCampaign = (updatedCampaign: Campaign) => {
    setCampaigns(campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaigns(campaigns.filter(c => c.id !== campaignId));
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // For clippers, only show active campaigns regardless of tab
    if (isClipper) {
      return matchesSearch && campaign.status === 'active';
    }
    
    // For creators, show campaigns based on tab selection
    const matchesTab = activeTab === 'all' || campaign.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleCreateCampaign = async (newCampaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      // First, ensure the user exists in the users table
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (userError && userError.code === 'PGRST116') {
        // User doesn't exist, create them first
        const { error: insertUserError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role: 'creator',
            avatar: user.user_metadata?.avatar_url,
          });

        if (insertUserError) {
          console.error('Error creating user:', insertUserError);
          console.error('Failed to create user profile');
          return;
        }
      }

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          creator_id: user.id,
          title: newCampaign.title,
          video_url: newCampaign.videoUrl,
          thumbnail: newCampaign.thumbnail,
          amount_per_million_views: newCampaign.payPerView.amountPerMillionViews,
          minimum_views: newCampaign.payPerView.minimumViews,
          rules: newCampaign.rules,
          status: newCampaign.status,
          total_budget: newCampaign.totalBudget,
          remaining_budget: newCampaign.remainingBudget,
          expires_at: newCampaign.expiresAt?.toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const campaign: Campaign = {
        id: data.id,
        creatorId: data.creator_id,
        title: data.title,
        videoUrl: data.video_url,
        thumbnail: data.thumbnail,
        payPerView: {
          amountPerMillionViews: data.amount_per_million_views,
          minimumViews: data.minimum_views,
        },
        rules: data.rules,
        status: data.status as 'active' | 'paused' | 'completed',
        totalBudget: data.total_budget,
        remainingBudget: data.remaining_budget,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      };
      
      setCampaigns([campaign, ...campaigns]);
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalBudget: campaigns.reduce((sum, c) => sum + (c.totalBudget || 0), 0),
    totalSpent: Object.values(campaignStats).reduce((sum: number, stats: any) => sum + (stats.totalPaid || 0), 0),
  };

  if (loading || roleLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading campaigns...</p>
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
            <h1 className="text-3xl font-bold">Video Campaigns</h1>
            <p className="text-muted-foreground">
              Create and manage your video campaigns for content creators
            </p>
          </div>
          {isCreator && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          )}
        </div>

        {isClipper && (
          <div className="bg-muted/50 border border-muted rounded-lg p-6 mb-8">
            <h3 className="font-semibold mb-2">Browse Active Campaigns</h3>
            <p className="text-muted-foreground">
              As a Clipper, you can view active campaigns and submit your clips for review. 
              Browse the campaigns below and click &quot;Submit Clip&quot; on any active campaign that interests you.
            </p>
          </div>
        )}

        {!isCreator && !isClipper && (
          <div className="bg-muted/50 border border-muted rounded-lg p-6 mb-8">
            <h3 className="font-semibold mb-2">Account Setup Required</h3>
            <p className="text-muted-foreground">
              Please complete your profile setup to access campaign features. 
              Choose &quot;Creator&quot; to create campaigns or &quot;Clipper&quot; to submit clips to existing campaigns.
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalBudget.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalSpent.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {isCreator && (
            <TabsList>
              <TabsTrigger value="all">All Campaigns</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          )}
          
          {isClipper && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Active Campaigns</h2>
              <p className="text-sm text-muted-foreground">
                Submit your clips to any of these active campaigns
              </p>
            </div>
          )}

          <TabsContent value={activeTab} className="mt-6">
            {filteredCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map((campaign, index) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <CampaignCard 
                      campaign={campaign} 
                      creatorInfo={(campaign as any).creatorInfo}
                      submissionStats={campaignStats[campaign.id]}
                      onUpdate={handleUpdateCampaign}
                      onDelete={handleDeleteCampaign}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'Try adjusting your search terms' : 'Create your first campaign to get started'}
                  </p>
                  {!searchTerm && isCreator && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {isCreator && (
          <CreateCampaignDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onCreateCampaign={handleCreateCampaign}
          />
        )}
      </motion.div>
    </div>
  );
}