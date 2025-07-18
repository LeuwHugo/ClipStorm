'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/login?error=auth_callback_failed');
          return;
        }

        if (data.session) {
          // Check if user profile exists
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('id')
            .eq('id', data.session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // User doesn't exist, redirect to onboarding
            router.push('/onboarding');
          } else {
            // User exists, redirect to dashboard
            router.push('/dashboard');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        router.push('/login?error=unexpected_error');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}