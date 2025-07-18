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

// Gig types
export const GigSchema = z.object({
  id: z.string(),
  clipperId: z.string(),
  title: z.string(),
  description: z.string(),
  pricePerThousandViews: z.number(),
  turnaroundTime: z.number(),
  deliverables: z.array(z.string()),
  examples: z.array(z.string()),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Gig = z.infer<typeof GigSchema>;

// Order types
export const OrderStatusSchema = z.enum([
  'pending',
  'accepted',
  'in_progress',
  'delivered',
  'approved',
  'cancelled'
]);

export const OrderSchema = z.object({
  id: z.string(),
  gigId: z.string(),
  creatorId: z.string(),
  clipperId: z.string(),
  status: OrderStatusSchema,
  brief: z.string(),
  assets: z.array(z.string()),
  deliveredVideos: z.array(z.string()),
  totalViews: z.number(),
  amountPaid: z.number(),
  stripePaymentIntentId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Order = z.infer<typeof OrderSchema>;

// Metrics types
export const MetricSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  videoUrl: z.string(),
  platform: z.enum(['youtube', 'tiktok', 'instagram']),
  viewCount: z.number(),
  lastChecked: z.date(),
  createdAt: z.date(),
});

export type Metric = z.infer<typeof MetricSchema>;

// Review types
export const ReviewSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  reviewerId: z.string(),
  reviewedUserId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  createdAt: z.date(),
});

export type Review = z.infer<typeof ReviewSchema>;

// Campaign types
export const CampaignSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  title: z.string(),
  videoUrl: z.string().url(),
  thumbnail: z.string().url(),
  payPerView: z.object({
    amountPerMillionViews: z.number(),
    minimumViews: z.number(),
  }),
  rules: z.array(z.string()),
  status: z.enum(['active', 'paused', 'completed']),
  totalBudget: z.number().optional(),
  remainingBudget: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  expiresAt: z.date().optional(),
  creatorInfo: z.object({
    displayName: z.string(),
    avatar: z.string().optional(),
  }).optional(),
});

export type Campaign = z.infer<typeof CampaignSchema>;

// Clip submission types
export const ClipSubmissionSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  submitterId: z.string(),
  clipUrl: z.string().url(),
  platform: z.enum(['tiktok', 'instagram', 'youtube', 'twitter']),
  viewCount: z.number(),
  submittedAt: z.date(),
  status: z.enum(['pending', 'approved', 'rejected', 'paid']),
  paymentAmount: z.number().optional(),
  rejectionReason: z.string().optional(),
  verifiedAt: z.date().optional(),
});

export type ClipSubmission = z.infer<typeof ClipSubmissionSchema>;