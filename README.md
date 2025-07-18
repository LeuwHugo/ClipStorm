# ClipWave - Video Editor Marketplace

A modern SaaS marketplace that connects content creators with skilled video editors for short-form content creation (TikTok, Instagram Reels, YouTube Shorts).

## Features

- 🎬 **Multi-role Authentication**: OAuth for creators, email/Google for editors
- 🔍 **Advanced Marketplace**: Searchable profiles with portfolio galleries
- 📋 **Complete Order Workflow**: Brief submission, asset upload, chat, versioning
- 📊 **Metrics Tracking**: View count polling and performance analytics
- 💰 **Stripe Integration**: Metered billing and Connect for payouts
- ⭐ **Reviews & Ratings**: Comprehensive feedback system
- 🔔 **Notifications**: Email and in-app notifications
- 🎨 **Modern UI**: Dark/light theme, responsive design, smooth animations

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **Framer Motion** for animations

### Backend
- **Supabase** (Database, Auth, Storage)
- **Stripe** for payments and payouts
- **Zod** for schema validation

### Development
- **ESLint** and **Prettier** for code quality
- **pnpm** for package management
- **Vercel** for deployment

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd clipwave
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
clipwave/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── dashboard/         # User dashboard
│   ├── marketplace/       # Marketplace pages
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   └── marketplace/       # Marketplace components
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
  rating?: number;
  reviewCount?: number;
  // Stripe
  stripeAccountId?: string;
  stripeCustomerId?: string;
}
```

### Gigs Collection
```typescript
{
  id: string;
  clipperId: string;
  title: string;
  description: string;
  pricePerThousandViews: number;
  turnaroundTime: number;
  deliverables: string[];
  examples: string[];
  active: boolean;
}
```

### Orders Collection
```typescript
{
  id: string;
  gigId: string;
  creatorId: string;
  clipperId: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'delivered' | 'approved' | 'cancelled';
  brief: string;
  assets: string[];
  deliveredVideos: string[];
  totalViews: number;
  amountPaid: number;
}
```

## API Routes

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/marketplace/clippers` - Get clipper profiles
- `POST /api/orders/create` - Create new order
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/webhook` - Stripe webhook handler

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
4. Configure metered billing products

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