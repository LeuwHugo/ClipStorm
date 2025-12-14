'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Scissors, CheckCircle, ArrowRight, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userRole, setUserRole] = useState<'creator' | 'clipper'>('creator');
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
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
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleRoleSelect = (role: 'creator' | 'clipper') => {
    setUserRole(role);
    setStep(2);
  };

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // First ensure user profile exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (!existingUser) {
        // Create user profile if it doesn't exist
        const { error: createError } = await supabase
          .rpc('create_user_profile_manual', {
            user_id: user.id,
            user_email: user.email || '',
            user_display_name: formData.displayName,
            user_role: userRole
          });
        
        if (createError) {
          console.error('Error creating user profile:', createError);
        }
      }
      
      // Update user profile with onboarding data
      const { error } = await supabase
        .from('users')
        .update({
          display_name: formData.displayName,
          bio: formData.bio || null,
          languages: formData.languages,
          turnaround_time: userRole === 'clipper' ? formData.turnaroundTime : null,
          // Creator specific fields
          platforms: userRole === 'creator' ? formData.platforms : null,
          channel_name: userRole === 'creator' ? formData.channelName : null,
          subscriber_count: userRole === 'creator' ? formData.subscriberCount : null,
          // Clipper specific fields
          portfolio: userRole === 'clipper' ? formData.portfolio : null,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profil créé avec succès !');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Erreur lors de la création du profil');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Bienvenue sur ClipStorm</h1>
            <p className="text-xl text-muted-foreground">
              Choisissez votre rôle pour commencer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Creator Card */}
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                userRole === 'creator' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleRoleSelect('creator')}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Créateur de Contenu</CardTitle>
                <CardDescription>
                  Je veux créer des campagnes et payer pour des clips
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Créer des campagnes TikTok
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Définir votre budget
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Recevoir des clips de qualité
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Payer uniquement pour les résultats
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Clipper Card */}
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                userRole === 'clipper' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleRoleSelect('clipper')}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scissors className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Monteur Vidéo</CardTitle>
                <CardDescription>
                  Je veux soumettre des clips et gagner de l&apos;argent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Voir les campagnes disponibles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Soumettre vos clips TikTok
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Gagner de l&apos;argent automatiquement
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Recevoir des paiements via Stripe
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button 
              size="lg" 
              onClick={() => setStep(2)}
              disabled={!userRole}
              className="min-w-[200px]"
            >
              Continuer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complétez votre profil</h1>
          <p className="text-muted-foreground">
            {userRole === 'creator' 
              ? 'Configurez votre profil de créateur de contenu'
              : 'Configurez votre profil de monteur vidéo'
            }
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <Label htmlFor="displayName">Nom d&apos;affichage</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Votre nom ou nom d&apos;utilisateur"
                />
              </div>

              <div>
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder={userRole === 'creator' 
                    ? "Parlez-nous de votre contenu et de ce que vous recherchez..."
                    : "Parlez-nous de votre expérience en montage vidéo..."
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="location">Localisation</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ville, Pays"
                />
              </div>

              {/* Languages */}
              <div>
                <Label>Langues</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien'].map((language) => (
                    <Badge
                      key={language}
                      variant={formData.languages.includes(language) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleLanguageToggle(language)}
                    >
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Role-specific fields */}
              {userRole === 'creator' && (
                <>
                  <div>
                    <Label>Plateformes</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['TikTok', 'YouTube', 'Instagram', 'Twitch'].map((platform) => (
                        <Badge
                          key={platform}
                          variant={formData.platforms.includes(platform) ? 'default' : 'outline'}
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
                      <Label htmlFor="channelName">Nom de la chaîne</Label>
                      <Input
                        id="channelName"
                        value={formData.channelName}
                        onChange={(e) => setFormData(prev => ({ ...prev, channelName: e.target.value }))}
                        placeholder="@votre_chaine"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subscriberCount">Nombre d&apos;abonnés</Label>
                      <Input
                        id="subscriberCount"
                        type="number"
                        value={formData.subscriberCount}
                        onChange={(e) => setFormData(prev => ({ ...prev, subscriberCount: parseInt(e.target.value) || 0 }))}
                        placeholder="1000"
                      />
                    </div>
                  </div>
                </>
              )}

              {userRole === 'clipper' && (
                <div>
                  <Label htmlFor="turnaroundTime">Délai de livraison (heures)</Label>
                  <Input
                    id="turnaroundTime"
                    type="number"
                    value={formData.turnaroundTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, turnaroundTime: parseInt(e.target.value) || 24 }))}
                    placeholder="24"
                  />
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Retour
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={loading || !formData.displayName}
                >
                  {loading ? 'Création...' : 'Terminer'}
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}