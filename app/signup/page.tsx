'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Tornado, User, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signUpWithEmail, signInWithGoogle, signInWithTwitch } from '@/lib/auth';
import { toast } from 'sonner';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<'creator' | 'clipper'>('creator');
  const [isProduction, setIsProduction] = useState(false);
  const router = useRouter();
  
  // Check if we're in production mode
  useEffect(() => {
    // NODE_ENV is replaced at build time by Next.js
    setIsProduction(process.env.NODE_ENV === 'production');
  }, []);
  
  // Block signup page in production
  if (isProduction) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Accès restreint</h1>
          <p className="text-muted-foreground">L'inscription est désactivée en mode production.</p>
        </div>
      </div>
    );
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signUpWithEmail(email, password, displayName, userRole);
      toast.success('Compte créé avec succès !');
      toast.info('Veuillez vérifier votre email pour un lien de confirmation avant de vous connecter. N\'oubliez pas de vérifier vos spams !');
      router.push('/onboarding');
    } catch (error) {
      if (error instanceof Error && error.message.includes('Email not confirmed')) {
        toast.error('Veuillez vérifier votre email et cliquer sur le lien de confirmation. N\'oubliez pas de vérifier vos spams !');
      } else {
        toast.error('Échec de la création du compte. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Redirection vers Google...');
      // Don't redirect here - OAuth will handle it
    } catch (error) {
      if (error instanceof Error && error.message.includes('provider is not enabled')) {
        toast.error('L\'inscription Google n\'est pas encore configurée. Veuillez utiliser l\'inscription par email ou contacter le support.');
      } else {
        toast.error('Échec de la création du compte avec Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTwitchSignup = async () => {
    setLoading(true);
    try {
      await signInWithTwitch();
      toast.success('Redirection vers Twitch...');
      // Don't redirect here - OAuth will handle it
    } catch (error) {
      if (error instanceof Error && error.message.includes('provider is not enabled')) {
        toast.error('L\'inscription Twitch n\'est pas encore configurée. Veuillez utiliser l\'inscription par email ou contacter le support.');
      } else {
        toast.error('Échec de la création du compte avec Twitch.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-primary/5 via-purple-50/50 to-blue-50/50 dark:from-primary/5 dark:via-purple-900/10 dark:to-blue-900/10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Tornado className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Rejoignez ClipStorm</CardTitle>
            <CardDescription>
              Créez votre compte et commencez à vous connecter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={userRole} onValueChange={(value) => setUserRole(value as 'creator' | 'clipper')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="creator" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Créateur
                </TabsTrigger>
                <TabsTrigger value="clipper" className="flex items-center gap-2">
                  <Scissors className="h-4 w-4" />
                  Monteur
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="creator" className="space-y-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-2">Pour les Créateurs de Contenu</h3>
                  <p className="text-sm text-muted-foreground">
                    Trouvez des monteurs vidéo qualifiés pour créer des TikToks, Reels et YouTube Shorts viraux
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="clipper" className="space-y-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-2">Pour les Monteurs Vidéo</h3>
                  <p className="text-sm text-muted-foreground">
                    Montrez vos compétences et soyez embauchés par des créateurs de contenu du monde entier
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Fournisseurs OAuth */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignup}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuer avec Google
              </Button>

              <Button
                variant="outline"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                onClick={handleTwitchSignup}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                </svg>
                Continuer avec Twitch
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou continuer avec email
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Nom complet</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Entrez votre nom complet"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Entrez votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Créez un mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Création du compte...' : 'Créer le compte'}
              </Button>
            </form>

            <div className="text-center text-sm">
              Vous avez déjà un compte ?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}