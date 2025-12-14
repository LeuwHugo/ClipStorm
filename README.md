# ClipStorm - TikTok Campaign Platform

A modern SaaS platform that connects content creators with clippers for viral TikTok campaigns.

## Features

- 🎬 **Multi-role Authentication**: Email/password with role selection (Creator/Clipper)
- 📋 **Campaign Creation**: Simple 4-field campaign setup with TikTok URL validation
- 📤 **Clip Submissions**: Easy TikTok clip submission with tracking code validation
- 📊 **Auto Tracking**: Automated view counting and payment calculations
- 💰 **Stripe Integration**: Direct payments and Connect for clipper payouts
- 🔔 **Email Notifications**: Critical notifications for campaign events
- 🎨 **Modern UI**: Dark/light theme, responsive design, mobile-first

## Tech Stack

### Frontend
- **Next.js 13** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **Framer Motion** for animations

### Backend
- **Supabase** (Database, Auth, Storage)
- **Stripe** for payments and Connect payouts
- **Zod** for schema validation

### Development
- **ESLint** and **Prettier** for code quality
- **pnpm** for package management
- **Vercel** for deployment

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd clipstorm
   pnpm install
   ```

2. **Environment Setup**
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase config values
   - Add your Stripe keys

3. **Supabase Setup**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Run migrations
   supabase db push
   ```

4. **Development Server**
   ```bash
   pnpm dev
   ```

5. **Visit Application**
   - Frontend: http://localhost:3000
   - Supabase Studio: https://app.supabase.com

## Project Structure

```
clipstorm/
├── app/                    # Next.js app directory
│   ├── auth/              # Auth pages (login, signup)
│   ├── dashboard/         # User dashboard
│   ├── campaigns/         # Campaign management
│   ├── submit-clips/      # Clip submission
│   ├── create-campaign/   # Campaign creation
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   └── campaigns/         # Campaign components
├── lib/                   # Utilities and configurations
│   ├── supabase.ts        # Supabase config
│   ├── auth.ts            # Authentication helpers
│   ├── stripe.ts          # Stripe integration
│   └── types.ts           # TypeScript types
├── hooks/                 # Custom React hooks
├── supabase/              # Supabase migrations and functions
└── public/                # Static assets
```

## Database Schema

### Users Collection
```typescript
{
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  role: 'creator' | 'clipper';
  // Creator fields
  platforms?: ['youtube', 'twitch', 'tiktok'];
  channelName?: string;
  subscriberCount?: number;
  // Clipper fields
  bio?: string;
  portfolio?: string[];
  languages?: string[];
  turnaroundTime?: number;
  // Stripe
  stripeAccountId?: string;
  stripeCustomerId?: string;
}
```

### Campaigns Collection
```typescript
{
  id: string;
  creatorId: string;
  title: string;
  videoUrl: string;
  thumbnail: string;
  amountPerMillionViews: number;
  minimumViews: number;
  rules: string[];
  status: 'active' | 'paused' | 'completed';
  totalBudget: number;
  remainingBudget: number;
  trackingCode: string;
  durationDays: number;
  cpmvRate: number;
}
```

### Clip Submissions Collection
```typescript
{
  id: string;
  campaignId: string;
  submitterId: string;
  clipUrl: string;
  platform: 'tiktok';
  viewCount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  paymentAmount?: number;
  trackingCodeVerified: boolean;
}
```

## API Routes

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/campaigns/create` - Create new campaign
- `POST /api/clips/submit` - Submit clip for campaign
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/webhook` - Stripe webhook handler
- `POST /api/payments/create-connect-account` - Stripe Connect setup

## Deployment

### Prerequisites
- Supabase project
- Stripe account with test/live keys
- Vercel account

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## Configuration

### Supabase Setup
See `supabase/migrations/` for database schema and RLS policies.

### Stripe Setup
1. Create Stripe account
2. Enable Stripe Connect
3. Set up webhooks for payment events
4. Configure campaign payment products

### Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.