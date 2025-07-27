'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Video, User, Search, Plus, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { LanguageSelector } from '@/components/ui/language-selector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/use-user-role';
import { useTranslations } from '@/hooks/use-translations';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { logout } from '@/lib/auth';

export function Navbar() {
  const { user } = useAuth();
  const { isCreator } = useUserRole();
  const { t } = useTranslations();
  const router = useRouter();
  const [userAvatar, setUserAvatar] = useState<string>('');

  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('avatar')
          .eq('id', user.id)
          .single();
        
        if (!error && data?.avatar) {
          setUserAvatar(data.avatar);
        }
      } catch (error) {
        console.error('Error fetching user avatar:', error);
      }
    };

    fetchUserAvatar();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Video className="h-6 w-6 text-primary" />
          ClipWave
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/marketplace" className="hidden">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4 mr-2" />
              {t('common.browse')}
            </Button>
          </Link>

          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  {t('common.dashboard')}
                </Button>
              </Link>
              
              <Link href="/campaigns">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  {t('navigation.campaigns')}
                </Button>
              </Link>
              
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  3
                </Badge>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-8 w-8 rounded-full hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={userAvatar || user.user_metadata?.avatar_url || user.user_metadata?.picture || ''} 
                        alt={user.user_metadata?.full_name || user.email || ''} 
                      />
                      <AvatarFallback>
                        {user.user_metadata?.full_name?.charAt(0) || 
                         user.user_metadata?.name?.charAt(0) || 
                         user.email?.charAt(0)?.toUpperCase() || 
                         'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      {t('common.profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      {t('common.settings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    {t('common.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-auto">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  {t('common.login')}
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">
                  {t('common.signup')}
                </Button>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}