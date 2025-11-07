import { z } from 'zod';

// User types
export const UserRoleSchema = z.enum(['creator', 'clipper']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  avatar: z.string().optional(),
  role: UserRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  
  // Creator specific fields
  platforms: z.array(z.enum(['youtube', 'twitch', 'tiktok'])).optional(),
  channelName: z.string().optional(),
  subscriberCount: z.number().optional(),
  
  // Clipper specific fields
  bio: z.string().optional(),
  portfolio: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  turnaroundTime: z.number().optional(), // in hours
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  
  // Stripe
  stripeAccountId: z.string().optional(),
  stripeCustomerId: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Campaign types
export const CampaignStatusSchema = z.enum(['active', 'paused', 'completed']);
export type CampaignStatus = z.infer<typeof CampaignStatusSchema>;

export const CampaignSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  title: z.string(),
  videoUrl: z.string().url(),
  thumbnail: z.string().url(),
  amountPerMillionViews: z.number(),
  minimumViews: z.number(),
  rules: z.array(z.string()),
  status: CampaignStatusSchema,
  totalBudget: z.number().optional(),
  remainingBudget: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  expiresAt: z.date().optional(),
  // MVP additions
  trackingCode: z.string().optional(),
  durationDays: z.number().optional(),
  cpmvRate: z.number().optional(),
  youtubeVideoId: z.string().optional(),
  youtubeValidationStatus: z.enum(['pending', 'valid', 'invalid']).optional(),
  creatorInfo: z.object({
    displayName: z.string(),
    avatar: z.string().optional(),
  }).optional(),
});

export type Campaign = z.infer<typeof CampaignSchema>;

// Clip submission types
export const SubmissionStatusSchema = z.enum(['pending', 'approved', 'rejected', 'paid']);
export type SubmissionStatus = z.infer<typeof SubmissionStatusSchema>;

export const ClipSubmissionSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  submitterId: z.string(),
  clipUrl: z.string().url(),
  platform: z.enum(['tiktok', 'instagram', 'youtube', 'twitter']),
  viewCount: z.number(),
  submittedAt: z.date(),
  status: SubmissionStatusSchema,
  paymentAmount: z.number().optional(),
  rejectionReason: z.string().optional(),
  verifiedAt: z.date().optional(),
  // MVP additions
  trackingCodeVerified: z.boolean().optional(),
});

export type ClipSubmission = z.infer<typeof ClipSubmissionSchema>;