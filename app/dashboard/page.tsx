'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  Euro, 
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

// Fonction pour transformer les données de la base de données en types TypeScript
const transformCampaignData = (dbCampaign: any): Campaign => ({
  id: dbCampaign.id,
  creatorId: dbCampaign.creator_id,
  title: dbCampaign.title,
  videoUrl: dbCampaign.video_url,
  thumbnail: dbCampaign.thumbnail,
  amountPerMillionViews: dbCampaign.amount_per_million_views,
  minimumViews: dbCampaign.minimum_views,
  rules: dbCampaign.rules || [],
  status: dbCampaign.status,
  totalBudget: dbCampaign.total_budget,
  remainingBudget: dbCampaign.remaining_budget,
  createdAt: new Date(dbCampaign.created_at),
  updatedAt: new Date(dbCampaign.updated_at),
  expiresAt: dbCampaign.expires_at ? new Date(dbCampaign.expires_at) : undefined,
  trackingCode: dbCampaign.tracking_code,
  durationDays: dbCampaign.duration_days,
  cpmvRate: dbCampaign.cpmv_rate,
  creatorInfo: dbCampaign.creator_info,
});

const transformSubmissionData = (dbSubmission: any): ClipSubmission => ({
  id: dbSubmission.id,
  campaignId: dbSubmission.campaign_id,
  submitterId: dbSubmission.submitter_id,
  clipUrl: dbSubmission.clip_url,
  platform: dbSubmission.platform,
  viewCount: dbSubmission.view_count,
  submittedAt: new Date(dbSubmission.submitted_at),
  status: dbSubmission.status,
  paymentAmount: dbSubmission.payment_amount,
  rejectionReason: dbSubmission.rejection_reason,
  verifiedAt: dbSubmission.verified_at ? new Date(dbSubmission.verified_at) : undefined,
  trackingCodeVerified: dbSubmission.tracking_code_verified,
});

export default function DashboardPage() {
  const { user } = useAuth();
  const { isCreator, isClipper } = useUserRole();
  const [activeTab, setActiveTab] = useState('overview');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<ClipSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats pour les créateurs
  const [creatorStats, setCreatorStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSpent: 0,
    totalSubmissions: 0,
    pendingReviews: 0,
  });

  // Stats pour les clippers
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isCreator, isClipper]);

  const fetchCreatorData = async () => {
    if (!user) return;

    try {
      // Récupérer les campagnes
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      // Transformer les données
      const transformedCampaigns = (campaignsData || []).map(transformCampaignData);
      setCampaigns(transformedCampaigns);

      // Calculer les statistiques
      const totalCampaigns = transformedCampaigns.length;
      const activeCampaigns = transformedCampaigns.filter(c => c.status === 'active').length;
      const totalSpent = transformedCampaigns.reduce((sum, c) => {
        const spent = (c.totalBudget || 0) - (c.remainingBudget || 0);
        return sum + spent;
      }, 0);

      // Récupérer les soumissions pour les campagnes de ce créateur
      const campaignIds = transformedCampaigns.map(c => c.id);
      let totalSubmissions = 0;
      let pendingReviews = 0;

      if (campaignIds.length > 0) {
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('clip_submissions')
          .select('*')
          .in('campaign_id', campaignIds);

        if (!submissionsError && submissionsData) {
          const transformedSubmissions = submissionsData.map(transformSubmissionData);
          totalSubmissions = transformedSubmissions.length;
          pendingReviews = transformedSubmissions.filter(s => s.status === 'pending').length;
        }
      }

      setCreatorStats({
        totalCampaigns,
        activeCampaigns,
        totalSpent,
        totalSubmissions,
        pendingReviews,
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des données créateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClipperData = async () => {
    if (!user) return;

    try {
      // Récupérer les soumissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('clip_submissions')
        .select('*')
        .eq('submitter_id', user.id)
        .order('submitted_at', { ascending: false });

      if (submissionsError) throw submissionsError;

      // Transformer les données
      const transformedSubmissions = (submissionsData || []).map(transformSubmissionData);
      setSubmissions(transformedSubmissions);

      // Calculer les statistiques
      const totalSubmissions = transformedSubmissions.length;
      const approvedSubmissions = transformedSubmissions.filter(s => s.status === 'approved').length;
      const pendingSubmissions = transformedSubmissions.filter(s => s.status === 'pending').length;
      const totalEarnings = transformedSubmissions.reduce((sum, s) => sum + (s.paymentAmount || 0), 0);
      const totalViews = transformedSubmissions.reduce((sum, s) => sum + (s.viewCount || 0), 0);

      setClipperStats({
        totalSubmissions,
        approvedSubmissions,
        pendingSubmissions,
        totalEarnings,
        totalViews,
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des données clipper:', error);
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

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'tiktok':
        return '🎵';
      case 'instagram':
        return '📷';
      case 'youtube':
        return '📺';
      case 'twitter':
        return '🐦';
      default:
        return '🎬';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejeté';
      case 'paid':
        return 'Payé';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
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
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
          <p className="text-muted-foreground">
            {isCreator 
              ? 'Gérez vos campagnes et suivez vos performances'
              : 'Suivez vos soumissions et vos gains'
            }
          </p>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isCreator && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Campagnes</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(creatorStats.totalCampaigns)}</div>
                  <p className="text-xs text-muted-foreground">
                    {creatorStats.activeCampaigns} actives
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Dépensé</CardTitle>
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(creatorStats.totalSpent)}</div>
                  <p className="text-xs text-muted-foreground">
                    Sur toutes les campagnes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Soumissions</CardTitle>
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(creatorStats.totalSubmissions)}</div>
                  <p className="text-xs text-muted-foreground">
                    {creatorStats.pendingReviews} en attente
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+12%</div>
                  <p className="text-xs text-muted-foreground">
                    Ce mois-ci
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {isClipper && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Soumissions</CardTitle>
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(clipperStats.totalSubmissions)}</div>
                  <p className="text-xs text-muted-foreground">
                    {clipperStats.pendingSubmissions} en attente
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Gains</CardTitle>
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(clipperStats.totalEarnings)}</div>
                  <p className="text-xs text-muted-foreground">
                    Depuis les clips approuvés
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Vues</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(clipperStats.totalViews)}</div>
                  <p className="text-xs text-muted-foreground">
                    Sur tous vos clips
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taux d&apos;Approbation</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {clipperStats.totalSubmissions > 0 
                      ? `${Math.round((clipperStats.approvedSubmissions / clipperStats.totalSubmissions) * 100)}%`
                      : '0%'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Clips approuvés
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
            <TabsTrigger value="recent">
              {isCreator ? 'Campagnes récentes' : 'Soumissions récentes'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {isCreator && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Campagnes Actives</CardTitle>
                    <CardDescription>
                      Vos campagnes en cours
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {campaigns.filter(c => c.status === 'active').length > 0 ? (
                      <div className="space-y-4">
                        {campaigns
                          .filter(c => c.status === 'active')
                          .slice(0, 3)
                          .map((campaign) => (
                            <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h3 className="font-semibold">{campaign.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Budget: {formatCurrency(campaign.totalBudget || 0)}
                                </p>
                              </div>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/campaigns/${campaign.id}`}>
                                  Voir
                                </Link>
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">Aucune campagne active</p>
                        <Button asChild>
                          <Link href="/create-campaign">
                            <Plus className="h-4 w-4 mr-2" />
                            Créer une campagne
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Soumissions Récentes</CardTitle>
                    <CardDescription>
                      Dernières soumissions pour vos campagnes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {submissions.length > 0 ? (
                        submissions.slice(0, 3).map((submission) => (
                          <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="text-2xl">{getPlatformIcon(submission.platform)}</div>
                              <div>
                                <h3 className="font-semibold">
                                  {submission.platform.charAt(0).toUpperCase() + submission.platform.slice(1)} Clip
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {formatNumber(submission.viewCount)} vues • {submission.submittedAt.toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge className={getStatusColor(submission.status)}>
                                {getStatusText(submission.status)}
                              </Badge>
                              {submission.paymentAmount && (
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(submission.paymentAmount)}
                                </span>
                              )}
                              <Button size="sm" variant="outline" onClick={() => window.open(submission.clipUrl, '_blank')}>
                                <Play className="h-4 w-4 mr-2" />
                                Voir
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Aucune soumission récente</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {isClipper && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Soumissions Récentes</CardTitle>
                    <CardDescription>
                      Vos dernières soumissions de clips
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {submissions.length > 0 ? (
                        submissions.slice(0, 3).map((submission) => (
                          <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="text-2xl">{getPlatformIcon(submission.platform)}</div>
                              <div>
                                <h3 className="font-semibold">
                                  {submission.platform.charAt(0).toUpperCase() + submission.platform.slice(1)} Clip
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {formatNumber(submission.viewCount)} vues • {submission.submittedAt.toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge className={getStatusColor(submission.status)}>
                                {getStatusText(submission.status)}
                              </Badge>
                              {submission.paymentAmount && (
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(submission.paymentAmount)}
                                </span>
                              )}
                              <Button size="sm" variant="outline" onClick={() => window.open(submission.clipUrl, '_blank')}>
                                <Play className="h-4 w-4 mr-2" />
                                Voir
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">Aucune soumission récente</p>
                          <Button asChild>
                            <Link href="/submit-clips">
                              <Plus className="h-4 w-4 mr-2" />
                              Soumettre un clip
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Gains du Mois</CardTitle>
                    <CardDescription>
                      Vos revenus ce mois-ci
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div>
                          <h4 className="font-semibold">Gains Totaux</h4>
                          <p className="text-sm text-muted-foreground">Ce mois-ci</p>
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(clipperStats.totalEarnings)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div>
                          <h4 className="font-semibold">Clips Approuvés</h4>
                          <p className="text-sm text-muted-foreground">Ce mois-ci</p>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">
                          {clipperStats.approvedSubmissions}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary">
                        <div>
                          <h4 className="font-semibold">Prochain Paiement</h4>
                          <p className="text-sm text-muted-foreground">Via Stripe</p>
                        </div>
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(clipperStats.totalEarnings)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            {isCreator && (
              <Card>
                <CardHeader>
                  <CardTitle>Toutes les Campagnes</CardTitle>
                  <CardDescription>
                    Historique complet de vos campagnes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.length > 0 ? (
                      campaigns.map((campaign) => (
                        <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-semibold">{campaign.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Budget: {formatCurrency(campaign.totalBudget || 0)} • 
                              Statut: {campaign.status} • 
                              Créée le {campaign.createdAt.toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/campaigns/${campaign.id}`}>
                              Voir détails
                            </Link>
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">Aucune campagne créée</p>
                        <Button asChild>
                          <Link href="/create-campaign">
                            <Plus className="h-4 w-4 mr-2" />
                            Créer votre première campagne
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {isClipper && (
              <Card>
                <CardHeader>
                  <CardTitle>Toutes les Soumissions</CardTitle>
                  <CardDescription>
                    Historique complet de vos soumissions
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
                                {formatNumber(submission.viewCount)} vues • {submission.submittedAt.toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={getStatusColor(submission.status)}>
                              {getStatusText(submission.status)}
                            </Badge>
                            {submission.paymentAmount && (
                              <span className="font-semibold text-green-600">
                                {formatCurrency(submission.paymentAmount)}
                              </span>
                            )}
                            <Button size="sm" variant="outline" onClick={() => window.open(submission.clipUrl, '_blank')}>
                              <Play className="h-4 w-4 mr-2" />
                              Voir
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">Aucune soumission</p>
                        <Button asChild>
                          <Link href="/submit-clips">
                            <Plus className="h-4 w-4 mr-2" />
                            Soumettre votre premier clip
                          </Link>
                        </Button>
                      </div>
                    )}
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