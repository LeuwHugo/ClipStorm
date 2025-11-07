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
  Euro,
  CheckCircle
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
import { useMessages } from '@/hooks/use-messages';
import { AvatarUpload } from '@/components/profile/avatar-upload';
import { StripeConnectSetup } from '@/components/profile/stripe-connect-setup';
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
  const { t } = useMessages();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string>('');
  const [stripeAccountId, setStripeAccountId] = useState<string>('');
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
    languages: ['Français'],
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
          location: data.location || '',
          languages: data.languages || ['Français'],
          turnaroundTime: data.turnaround_time || 24,
          platforms: data.platforms || [],
          channelName: data.channel_name || '',
          subscriberCount: data.subscriber_count || 0,
          portfolio: data.portfolio || [],
        });
        setCurrentAvatar(data.avatar || '');
        setStripeAccountId(data.stripe_account_id || '');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchCampaignStats = async () => {
    if (!user) return;

    try {
      const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('creator_id', user.id);

      if (error) throw error;

      const totalCampaigns = campaigns?.length || 0;
      const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
      const totalViews = campaigns?.reduce((sum, c) => sum + (c.total_views || 0), 0) || 0;
      const totalSpent = campaigns?.reduce((sum, c) => sum + ((c.total_budget || 0) - (c.remaining_budget || 0)), 0) || 0;
      const avgPerformance = totalCampaigns > 0 ? totalViews / totalCampaigns : 0;

      setCampaignStats({
        totalCampaigns,
        activeCampaigns,
        totalViews,
        totalSpent,
        avgPerformance
      });
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

      const totalSubmissions = submissions?.length || 0;
      const approvedSubmissions = submissions?.filter(s => s.status === 'approved').length || 0;
      const totalEarnings = submissions?.reduce((sum, s) => sum + (s.payment_amount || 0), 0) || 0;
      const totalViews = submissions?.reduce((sum, s) => sum + (s.view_count || 0), 0) || 0;
      const avgRating = 0; // No rating system in MVP

      setSubmissionStats({
        totalSubmissions,
        approvedSubmissions,
        totalEarnings,
        avgRating,
        totalViews
      });
    } catch (error) {
      console.error('Error fetching submission stats:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          display_name: profile.displayName,
          bio: profile.bio,
          location: profile.location,
          languages: profile.languages,
          turnaround_time: profile.turnaroundTime,
          platforms: profile.platforms,
          channel_name: profile.channelName,
          subscriber_count: profile.subscriberCount,
          portfolio: profile.portfolio,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profil mis à jour avec succès !');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('profile.title')}</h1>
          <p className="text-muted-foreground">
            Gérez votre profil et vos préférences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="campaign-focus">Campagnes</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
                <CardDescription>
                  Gérez vos informations de base
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <AvatarUpload
                    currentAvatar={currentAvatar}
                    onAvatarChange={setCurrentAvatar}
                  />
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor="displayName">Nom d'affichage</Label>
                      <Input
                        id="displayName"
                        value={profile.displayName}
                        onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">Biographie</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Parlez-nous de vous..."
                        maxLength={500}
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Localisation</Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Ville, Pays"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        disabled={loading}
                      >
                        Annuler
                      </Button>
                      <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            {isCreator ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Campagnes</CardTitle>
                    <Video className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(campaignStats.totalCampaigns)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Campagnes Actives</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(campaignStats.activeCampaigns)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Vues</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(campaignStats.totalViews)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Dépensé</CardTitle>
                    <Euro className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(campaignStats.totalSpent)}</div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Soumissions</CardTitle>
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(submissionStats.totalSubmissions)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Soumissions Approuvées</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(submissionStats.approvedSubmissions)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Gains</CardTitle>
                    <Euro className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(submissionStats.totalEarnings)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Vues</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(submissionStats.totalViews)}</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Campaign Focus Tab */}
          <TabsContent value="campaign-focus" className="space-y-6">
            {/* Stripe Connect Setup for Clippers */}
            {isClipper && (
              <StripeConnectSetup
                stripeAccountId={stripeAccountId}
                onAccountCreated={(accountId) => setStripeAccountId(accountId)}
              />
            )}
            
            {isCreator ? (
              <Card>
                <CardHeader>
                  <CardTitle>Stratégie de Campagne</CardTitle>
                  <CardDescription>
                    Optimisez vos campagnes pour de meilleures performances et ROI
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Budget moyen par campagne</Label>
                      <div className="text-2xl font-bold">
                        {campaignStats.totalCampaigns > 0 
                          ? formatCurrency(campaignStats.totalSpent / campaignStats.totalCampaigns)
                          : formatCurrency(0)
                        }
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Vues moyennes par campagne</Label>
                      <div className="text-2xl font-bold">
                        {formatNumber(campaignStats.avgPerformance)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Performance des Clips</CardTitle>
                  <CardDescription>
                    Suivez vos performances et optimisez vos soumissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Taux d'approbation</Label>
                      <div className="text-2xl font-bold">
                        {submissionStats.totalSubmissions > 0 
                          ? `${Math.round((submissionStats.approvedSubmissions / submissionStats.totalSubmissions) * 100)}%`
                          : '0%'
                        }
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Gains moyens par clip</Label>
                      <div className="text-2xl font-bold">
                        {submissionStats.approvedSubmissions > 0 
                          ? formatCurrency(submissionStats.totalEarnings / submissionStats.approvedSubmissions)
                          : formatCurrency(0)
                        }
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