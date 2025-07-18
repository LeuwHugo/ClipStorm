export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string
          avatar: string | null
          role: 'creator' | 'clipper'
          created_at: string
          updated_at: string
          // Creator specific fields
          platforms: string[] | null
          channel_name: string | null
          subscriber_count: number | null
          // Clipper specific fields
          bio: string | null
          portfolio: string[] | null
          languages: string[] | null
          turnaround_time: number | null
          rating: number | null
          review_count: number | null
          // Stripe
          stripe_account_id: string | null
          stripe_customer_id: string | null
        }
        Insert: {
          id: string
          email: string
          display_name: string
          avatar?: string | null
          role: 'creator' | 'clipper'
          created_at?: string
          updated_at?: string
          platforms?: string[] | null
          channel_name?: string | null
          subscriber_count?: number | null
          bio?: string | null
          portfolio?: string[] | null
          languages?: string[] | null
          turnaround_time?: number | null
          rating?: number | null
          review_count?: number | null
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          avatar?: string | null
          role?: 'creator' | 'clipper'
          created_at?: string
          updated_at?: string
          platforms?: string[] | null
          channel_name?: string | null
          subscriber_count?: number | null
          bio?: string | null
          portfolio?: string[] | null
          languages?: string[] | null
          turnaround_time?: number | null
          rating?: number | null
          review_count?: number | null
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
        }
      }
      campaigns: {
        Row: {
          id: string
          creator_id: string
          title: string
          video_url: string
          thumbnail: string
          amount_per_million_views: number
          minimum_views: number
          rules: string[]
          status: 'active' | 'paused' | 'completed'
          total_budget: number | null
          remaining_budget: number | null
          created_at: string
          updated_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          video_url: string
          thumbnail: string
          amount_per_million_views: number
          minimum_views: number
          rules: string[]
          status?: 'active' | 'paused' | 'completed'
          total_budget?: number | null
          remaining_budget?: number | null
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          video_url?: string
          thumbnail?: string
          amount_per_million_views?: number
          minimum_views?: number
          rules?: string[]
          status?: 'active' | 'paused' | 'completed'
          total_budget?: number | null
          remaining_budget?: number | null
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
      }
      gigs: {
        Row: {
          id: string
          clipper_id: string
          title: string
          description: string
          price_per_thousand_views: number
          turnaround_time: number
          deliverables: string[]
          examples: string[]
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clipper_id: string
          title: string
          description: string
          price_per_thousand_views: number
          turnaround_time: number
          deliverables: string[]
          examples: string[]
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clipper_id?: string
          title?: string
          description?: string
          price_per_thousand_views?: number
          turnaround_time?: number
          deliverables?: string[]
          examples?: string[]
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          gig_id: string
          creator_id: string
          clipper_id: string
          status: 'pending' | 'accepted' | 'in_progress' | 'delivered' | 'approved' | 'cancelled'
          brief: string
          assets: string[]
          delivered_videos: string[]
          total_views: number
          amount_paid: number
          stripe_payment_intent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          gig_id: string
          creator_id: string
          clipper_id: string
          status?: 'pending' | 'accepted' | 'in_progress' | 'delivered' | 'approved' | 'cancelled'
          brief: string
          assets?: string[]
          delivered_videos?: string[]
          total_views?: number
          amount_paid?: number
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          gig_id?: string
          creator_id?: string
          clipper_id?: string
          status?: 'pending' | 'accepted' | 'in_progress' | 'delivered' | 'approved' | 'cancelled'
          brief?: string
          assets?: string[]
          delivered_videos?: string[]
          total_views?: number
          amount_paid?: number
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clip_submissions: {
        Row: {
          id: string
          campaign_id: string
          submitter_id: string
          clip_url: string
          platform: 'tiktok' | 'instagram' | 'youtube' | 'twitter'
          view_count: number
          submitted_at: string
          status: 'pending' | 'approved' | 'rejected' | 'paid'
          payment_amount: number | null
          rejection_reason: string | null
          verified_at: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          submitter_id: string
          clip_url: string
          platform: 'tiktok' | 'instagram' | 'youtube' | 'twitter'
          view_count: number
          submitted_at?: string
          status?: 'pending' | 'approved' | 'rejected' | 'paid'
          payment_amount?: number | null
          rejection_reason?: string | null
          verified_at?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          submitter_id?: string
          clip_url?: string
          platform?: 'tiktok' | 'instagram' | 'youtube' | 'twitter'
          view_count?: number
          submitted_at?: string
          status?: 'pending' | 'approved' | 'rejected' | 'paid'
          payment_amount?: number | null
          rejection_reason?: string | null
          verified_at?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          order_id: string
          reviewer_id: string
          reviewed_user_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          reviewer_id: string
          reviewed_user_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          reviewer_id?: string
          reviewed_user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      metrics: {
        Row: {
          id: string
          order_id: string
          video_url: string
          platform: 'youtube' | 'tiktok' | 'instagram'
          view_count: number
          last_checked: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          video_url: string
          platform: 'youtube' | 'tiktok' | 'instagram'
          view_count: number
          last_checked?: string
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          video_url?: string
          platform?: 'youtube' | 'tiktok' | 'instagram'
          view_count?: number
          last_checked?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'creator' | 'clipper'
      campaign_status: 'active' | 'paused' | 'completed'
      order_status: 'pending' | 'accepted' | 'in_progress' | 'delivered' | 'approved' | 'cancelled'
      submission_status: 'pending' | 'approved' | 'rejected' | 'paid'
      platform: 'tiktok' | 'instagram' | 'youtube' | 'twitter'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}