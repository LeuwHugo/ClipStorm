
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'
import { toast } from 'sonner'

export const signInWithEmail = async (email: string, password: string) => {
  // Block login in production
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Login is disabled in production mode')
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

export const signUpWithEmail = async (email: string, password: string, displayName?: string, role?: string) => {
  // Block signup in production
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Signup is disabled in production mode')
  }
  
  // First, sign up the user without any metadata to avoid trigger issues
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  
  if (error) throw error
  
  // If signup was successful and we have a user, create their profile manually
  if (data.user) {
    try {
      const { data: profileResult, error: profileError } = await supabase
        .rpc('create_user_profile_manual', {
          user_id: data.user.id,
          user_email: email,
          user_display_name: displayName,
          user_role: (role as 'creator' | 'clipper') || 'creator'
        })
      
      if (profileError) {
        console.warn('Failed to create user profile:', profileError)
        // Don't throw error here - user is created, profile can be created later
      }
    } catch (profileError) {
      console.warn('Failed to create user profile:', profileError)
      // Don't throw error here - user is created, profile can be created later
    }
  }
  
  return data
}

export const signInWithGoogle = async () => {
  // Block login in production
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Login is disabled in production mode')
  }
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    }
  })
  
  if (error) throw error
  return data
}

export const signInWithTwitch = async () => {
  // Block login in production
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Login is disabled in production mode')
  }
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'twitch',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'user:read:email',
    }
  })
  
  if (error) throw error
  return data
}

export const signInWithTikTok = async () => {
  // TikTok OAuth is not natively supported by Supabase
  // You would need to implement a custom OAuth flow
  toast.error('TikTok login requires custom implementation. Please use email or other providers for now.')
  throw new Error('TikTok OAuth not implemented - requires custom solution')
}

export const logout = async () => {
  // Block logout in production
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Logout is disabled in production mode')
  }
  
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null)
  })
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}