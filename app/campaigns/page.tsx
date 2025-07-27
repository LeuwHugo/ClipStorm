'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Eye, Clock, DollarSign, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignCard } from '@/components/campaigns/campaign-card';
import { CreateCampaignDialog } from '@/components/campaigns/create-campaign-dialog';
import { Campaign } from '@/lib/types';
import { useUserRole } from '@/hooks/use-user-role';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

export default function CampaignsPage() {
  const { user } = useAuth();
  const { isCreator, isClipper, loading: roleLoading } = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignStats, setCampaignStats] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);
  
  // Filtres et tri
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minBudget: '',
    maxBudget: '',
    minViews: '',
    hasSubmissions: false,
    hasExpiry: false,
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  // Fonctions de filtrage et tri
  const sortCampaigns = (campaigns: Campaign[]) => {
    return [...campaigns].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'budget':
          aValue = a.totalBudget || 0;
          bValue = b.totalBudget || 0;
          break;
        case 'views':
          aValue = campaignStats[a.id]?.totalViews || 0;
          bValue = campaignStats[b.id]?.totalViews || 0;
          break;
        case 'submissions':
          aValue = campaignStats[a.id]?.totalSubmissions || 0;
          bValue = campaignStats[b.id]?.totalSubmissions || 0;
          break;
        case 'expiresAt':
          aValue = a.expiresAt?.getTime() || 0;
          bValue = b.expiresAt?.getTime() || 0;
          break;
        default: // createdAt
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const applyFilters = (campaign: Campaign) => {
    const stats = campaignStats[campaign.id] || {};
    
    // Filtre par budget minimum
    if (filters.minBudget && (campaign.totalBudget || 0) < parseFloat(filters.minBudget)) {
      return false;
    }
    
    // Filtre par budget maximum
    if (filters.maxBudget && (campaign.totalBudget || 0) > parseFloat(filters.maxBudget)) {
      return false;
    }
    
    // Filtre par vues minimum
    if (filters.minViews && (stats.totalViews || 0) < parseInt(filters.minViews)) {
      return false;
    }
    
    // Filtre par soumissions
    if (filters.hasSubmissions && (stats.totalSubmissions || 0) === 0) {
      return false;
    }
    
    // Filtre par date d'expiration
    if (filters.hasExpiry && !campaign.expiresAt) {
      return false;
    }
    
    return true;
  };

  const clearFilters = () => {
    setFilters({
      minBudget: '',
      maxBudget: '',
      minViews: '',
      hasSubmissions: false,
      hasExpiry: false,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.minBudget) count++;
    if (filters.maxBudget) count++;
    if (filters.minViews) count++;
    if (filters.hasSubmissions) count++;
    if (filters.hasExpiry) count++;
    return count;
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // For clippers, only show active campaigns (jamais de draft)
    if (isClipper) {
      return matchesSearch && campaign.status === 'active' && applyFilters(campaign);
    }
    
    // For creators, show campaigns based on tab selection
    const matchesTab = activeTab === 'all' || campaign.status === activeTab;
    return matchesSearch && matchesTab && applyFilters(campaign);
  });

  // Appliquer le tri
  const sortedCampaigns = sortCampaigns(filteredCampaigns);

  const handleCreateCampaign = (newCampaign: Campaign) => {
    setCampaigns([newCampaign, ...campaigns]);
    setShowCreateDialog(false);
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
            <h1 className="text-3xl font-bold tracking-tight">Video Campaigns</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your video campaigns for content creators
            </p>
          </div>
          {isCreator && (
            <Button onClick={() => setShowCreateDialog(true)} className="font-medium">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          )}
        </div>

        {isClipper && (
          <div className="bg-muted/30 border border-border/50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold mb-2 text-lg">Browse Active Campaigns</h3>
            <p className="text-muted-foreground">
              As a Clipper, you can view active campaigns and submit your clips for review. 
              Browse the campaigns below and click &quot;Submit Clip&quot; on any active campaign that interests you.
            </p>
          </div>
        )}

        {!isCreator && !isClipper && (
          <div className="bg-muted/30 border border-border/50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold mb-2 text-lg">Account Setup Required</h3>
            <p className="text-muted-foreground">
              Please complete your profile setup to access campaign features. 
              Choose &quot;Creator&quot; to create campaigns or &quot;Clipper&quot; to submit clips to existing campaigns.
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalBudget.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-border transition-colors">
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
              className="pl-10 border-border/50 focus:border-border"
            />
          </div>
          
          {/* Bouton Filtres */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="border-border/50 hover:border-border">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Campaigns</SheetTitle>
                <SheetDescription>
                  Filter campaigns by budget, views, and other criteria.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                {/* Budget Range */}
                <div className="space-y-3">
                  <Label>Budget Range ($)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Min budget"
                      type="number"
                      value={filters.minBudget}
                      onChange={(e) => setFilters({...filters, minBudget: e.target.value})}
                    />
                    <Input
                      placeholder="Max budget"
                      type="number"
                      value={filters.maxBudget}
                      onChange={(e) => setFilters({...filters, maxBudget: e.target.value})}
                    />
                  </div>
                </div>
                
                <Separator />
                
                {/* Minimum Views */}
                <div className="space-y-3">
                  <Label>Minimum Views</Label>
                  <Input
                    placeholder="e.g., 1000000"
                    type="number"
                    value={filters.minViews}
                    onChange={(e) => setFilters({...filters, minViews: e.target.value})}
                  />
                </div>
                
                <Separator />
                
                {/* Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasSubmissions"
                      checked={filters.hasSubmissions}
                      onCheckedChange={(checked) => 
                        setFilters({...filters, hasSubmissions: checked as boolean})
                      }
                    />
                    <Label htmlFor="hasSubmissions">Has submissions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasExpiry"
                      checked={filters.hasExpiry}
                      onCheckedChange={(checked) => 
                        setFilters({...filters, hasExpiry: checked as boolean})
                      }
                    />
                    <Label htmlFor="hasExpiry">Has expiry date</Label>
                  </div>
                </div>
                
                <Separator />
                
                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="flex-1"
                  >
                    Clear Filters
                  </Button>
                  <Button 
                    onClick={() => setShowFilters(false)}
                    className="flex-1"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Bouton Tri */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border/50 hover:border-border">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort
                {sortOrder === 'asc' ? (
                  <ArrowUp className="h-4 w-4 ml-2" />
                ) : (
                  <ArrowDown className="h-4 w-4 ml-2" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => {setSortBy('createdAt'); setSortOrder('desc');}}>
                <ArrowDown className="h-4 w-4 mr-2" />
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {setSortBy('createdAt'); setSortOrder('asc');}}>
                <ArrowUp className="h-4 w-4 mr-2" />
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {setSortBy('title'); setSortOrder('asc');}}>
                <ArrowUp className="h-4 w-4 mr-2" />
                Title A-Z
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {setSortBy('title'); setSortOrder('desc');}}>
                <ArrowDown className="h-4 w-4 mr-2" />
                Title Z-A
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {setSortBy('budget'); setSortOrder('desc');}}>
                <ArrowDown className="h-4 w-4 mr-2" />
                Highest Budget
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {setSortBy('budget'); setSortOrder('asc');}}>
                <ArrowUp className="h-4 w-4 mr-2" />
                Lowest Budget
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {setSortBy('views'); setSortOrder('desc');}}>
                <ArrowDown className="h-4 w-4 mr-2" />
                Most Views
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {setSortBy('submissions'); setSortOrder('desc');}}>
                <ArrowDown className="h-4 w-4 mr-2" />
                Most Submissions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {setSortBy('expiresAt'); setSortOrder('asc');}}>
                <ArrowUp className="h-4 w-4 mr-2" />
                Expires Soon
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {isCreator && (
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="all">All Campaigns</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          )}
          
          {isClipper && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Active Campaigns</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Submit your clips to any of these active campaigns
              </p>
            </div>
          )}

          <TabsContent value={activeTab} className="mt-0">
            {sortedCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCampaigns.map((campaign, index) => (
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
              <Card className="text-center py-12 border-border/50">
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