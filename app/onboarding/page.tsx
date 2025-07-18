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

      toast.success('Profile created successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-purple-50/50 to-blue-50/50 dark:from-primary/5 dark:via-purple-900/10 dark:to-blue-900/10 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {step > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
                </div>
                <span className="text-sm font-medium">Choose Role</span>
              </div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {step > 2 ? <CheckCircle className="h-4 w-4" /> : '2'}
                </div>
                <span className="text-sm font-medium">Profile Setup</span>
              </div>
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {step > 3 ? <CheckCircle className="h-4 w-4" /> : '3'}
                </div>
                <span className="text-sm font-medium">Complete</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Welcome to ClipWave!</CardTitle>
                <CardDescription>
                  Let's get you set up. First, tell us what you're here for.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary"
                    onClick={() => handleRoleSelect('creator')}
                  >
                    <CardContent className="p-6 text-center">
                      <User className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="font-semibold text-lg mb-2">Content Creator</h3>
                      <p className="text-sm text-muted-foreground">
                        I create content and need skilled video editors to help me make viral clips
                      </p>
                    </CardContent>
                  </Card>

                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary"
                    onClick={() => handleRoleSelect('clipper')}
                  >
                    <CardContent className="p-6 text-center">
                      <Scissors className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="font-semibold text-lg mb-2">Video Editor</h3>
                      <p className="text-sm text-muted-foreground">
                        I'm a skilled video editor looking to work with content creators
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Profile Setup */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Set Up Your Profile</CardTitle>
                <CardDescription>
                  Tell us about yourself to help others find and work with you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location (Optional)</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder={userRole === 'creator' 
                      ? "Tell editors about your content style and what you're looking for..."
                      : "Describe your editing experience and specialties..."
                    }
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Languages</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['English', 'Spanish', 'French', 'German', 'Portuguese', 'Japanese'].map((language) => (
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

                {userRole === 'creator' && (
                  <>
                    <div>
                      <Label>Platforms</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['YouTube', 'TikTok', 'Instagram', 'Twitch', 'Twitter'].map((platform) => (
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
                        <Label htmlFor="channelName">Channel Name (Optional)</Label>
                        <Input
                          id="channelName"
                          value={formData.channelName}
                          onChange={(e) => setFormData(prev => ({ ...prev, channelName: e.target.value }))}
                          placeholder="Your main channel name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subscriberCount">Subscriber Count (Optional)</Label>
                        <Input
                          id="subscriberCount"
                          type="number"
                          value={formData.subscriberCount}
                          onChange={(e) => setFormData(prev => ({ ...prev, subscriberCount: parseInt(e.target.value) || 0 }))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </>
                )}

                {userRole === 'clipper' && (
                  <div>
                    <Label htmlFor="turnaroundTime">Typical Turnaround Time (hours)</Label>
                    <Input
                      id="turnaroundTime"
                      type="number"
                      value={formData.turnaroundTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, turnaroundTime: parseInt(e.target.value) || 24 }))}
                      placeholder="24"
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={() => setStep(3)} className="flex-1">
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Complete */}
          {step === 3 && (
            <Card>
              <CardHeader className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">You're All Set!</CardTitle>
                <CardDescription>
                  Your profile is ready. Let's get you started on ClipWave.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Profile Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role:</span>
                      <span className="capitalize">{userRole}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{formData.displayName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Languages:</span>
                      <span>{formData.languages.join(', ')}</span>
                    </div>
                    {userRole === 'creator' && formData.platforms.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Platforms:</span>
                        <span>{formData.platforms.join(', ')}</span>
                      </div>
                    )}
                    {userRole === 'clipper' && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Turnaround:</span>
                        <span>{formData.turnaroundTime} hours</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Next Steps:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {userRole === 'creator' ? (
                      <>
                        <li>• Browse our marketplace to find skilled video editors</li>
                        <li>• Create your first campaign to get clips made</li>
                        <li>• Set up payment methods for seamless transactions</li>
                      </>
                    ) : (
                      <>
                        <li>• Complete your portfolio with your best work</li>
                        <li>• Browse available campaigns and submit clips</li>
                        <li>• Set up your payout preferences</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleComplete} className="flex-1" disabled={loading}>
                    {loading ? 'Creating Profile...' : 'Complete Setup'}
                  </Button>
                  <Button variant="outline" onClick={() => setStep(2)} disabled={loading}>
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}