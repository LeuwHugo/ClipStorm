# 🚀 ClipStorm Stripe Integration Setup Guide

This guide will walk you through setting up Stripe payments for your ClipStorm platform, enabling creators to pay campaign budgets upfront and clippers to receive payments automatically.

## 📋 Prerequisites

- Stripe account (create at https://stripe.com)
- ClipStorm application running locally or deployed
- Access to your Stripe dashboard
- Admin access to configure webhooks

## 🔧 Step 1: Create Stripe Account & Get API Keys

### 1.1 Sign up for Stripe
1. Go to https://stripe.com and create an account
2. Complete your business verification (required for live payments)
3. Navigate to your Stripe Dashboard

### 1.2 Get Your API Keys
1. In Stripe Dashboard, go to **Developers** → **API Keys**
2. Copy your **Publishable key** (starts with `pk_test_` for test mode)
3. Copy your **Secret key** (starts with `sk_test_` for test mode)
4. Keep these secure - you'll need them in the next step

## 🔐 Step 2: Configure Environment Variables

### 2.1 Create .env.local file
Create a `.env.local` file in your project root with your Stripe credentials:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdef...
STRIPE_SECRET_KEY=sk_test_51234567890abcdef...
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...

# Your existing Supabase config
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Important**: Never commit `.env.local` to version control. Add it to your `.gitignore` file.

## 🔗 Step 3: Enable Stripe Connect

Stripe Connect allows you to pay clippers directly to their bank accounts.

### 3.1 Enable Connect in Stripe Dashboard
1. Go to **Connect** in your Stripe Dashboard
2. Click **Get started**
3. Choose **Platform or marketplace** as your business model
4. Complete the Connect onboarding process

### 3.2 Configure Connect Settings
1. In Connect settings, enable **Express accounts**
2. Set your platform name: "ClipStorm"
3. Configure your branding (logo, colors)
4. Set up your platform fee structure (optional)

## 🎣 Step 4: Set Up Webhooks

Webhooks notify your application when payments succeed or fail.

### 4.1 Create Webhook Endpoint
1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://your-domain.com/api/payments/webhook`
   - For local development: `https://your-ngrok-url.ngrok.io/api/payments/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
   - `transfer.created`
   - `transfer.updated`

### 4.2 Get Webhook Secret
1. After creating the webhook, click on it
2. Copy the **Signing secret** (starts with `whsec_`)
3. Add this to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 4.3 Test Webhooks (Local Development)
For local testing, use ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 3000

# Use the ngrok URL for your webhook endpoint
```

## 💳 Step 5: Test the Payment Flow

### 5.1 Test Campaign Creation Payment
1. Create a new campaign in your app
2. Use Stripe test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Requires authentication**: `4000 0025 0000 3155`
3. Use any future expiry date and any 3-digit CVC

### 5.2 Test Clipper Onboarding
1. Sign up as a clipper
2. Go to profile settings
3. Click "Set Up Payments with Stripe"
4. Complete the Connect onboarding flow
5. Use test business information

### 5.3 Test Clip Payments
1. Submit a clip to an active campaign
2. Ensure it meets the minimum view requirements
3. As the campaign creator, approve and pay the clip
4. Verify the payment appears in the clipper's Stripe dashboard

## 🔄 Step 6: Payment Flow Walkthrough

### 6.1 Creator Journey
```
1. Creator creates campaign with $1000 budget
   ↓
2. Payment dialog opens with Stripe Elements
   ↓
3. Creator enters card details and pays $1000
   ↓
4. Stripe processes payment and holds funds
   ↓
5. Campaign becomes active with $1000 available budget
```

### 6.2 Clipper Journey
```
1. Clipper sets up Stripe Connect account
   ↓
2. Clipper submits clip with required views
   ↓
3. System auto-calculates payment based on views
   ↓
4. Creator approves payment
   ↓
5. Funds transfer from campaign budget to clipper
```

### 6.3 Automatic Calculations
- **Payment Formula**: `(views / 1,000,000) × amount_per_million_views`
- **Example**: 500K views × $250/million = $125 payment
- **Budget Update**: $1000 - $125 = $875 remaining

## 🛡️ Step 7: Security & Compliance

### 7.1 Webhook Security
- Always verify webhook signatures using `stripe.webhooks.constructEvent()`
- Use the webhook secret from your environment variables
- Handle webhook retries gracefully

### 7.2 Payment Security
- Never store card details in your database
- Use Stripe's secure payment forms (Elements)
- Implement proper error handling for failed payments

### 7.3 Connect Account Security
- Verify account ownership before transfers
- Implement proper access controls for payout functions
- Log all payment transactions for audit trails

## 🚨 Step 8: Error Handling

### 8.1 Common Payment Errors
- **Insufficient funds**: Show user-friendly error message
- **Card declined**: Suggest trying a different payment method
- **Authentication required**: Handle 3D Secure flow

### 8.2 Connect Account Errors
- **Account not verified**: Guide user through verification
- **Transfer limits**: Inform about daily/monthly limits
- **Account restrictions**: Provide clear next steps

## 📊 Step 9: Monitoring & Analytics

### 9.1 Stripe Dashboard
- Monitor payment volume and success rates
- Track Connect account onboarding
- Review dispute and chargeback rates

### 9.2 Application Metrics
- Campaign funding success rates
- Clipper payout completion rates
- Average time from submission to payment

## 🌐 Step 10: Going Live

### 10.1 Switch to Live Mode
1. Complete Stripe account verification
2. Update environment variables with live keys:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```
3. Update webhook endpoints to production URLs
4. Test the entire flow with small amounts

### 10.2 Production Checklist
- [ ] Stripe account fully verified
- [ ] Live API keys configured
- [ ] Webhooks pointing to production
- [ ] Connect platform approved
- [ ] Payment flow tested end-to-end
- [ ] Error handling tested
- [ ] Monitoring set up

## 🆘 Troubleshooting

### Common Issues

**Payment Intent Creation Fails**
- Check API key permissions
- Verify amount is in cents (multiply by 100)
- Ensure user authentication is working

**Webhook Not Receiving Events**
- Verify webhook URL is accessible
- Check webhook secret matches environment variable
- Ensure events are properly selected in Stripe dashboard

**Connect Account Creation Fails**
- Verify Connect is enabled in Stripe dashboard
- Check user has required information
- Ensure proper error handling for incomplete accounts

**Transfer to Clipper Fails**
- Verify clipper has completed Connect onboarding
- Check account has sufficient balance
- Ensure transfer amount doesn't exceed limits

### Support Resources
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Connect Guide](https://stripe.com/docs/connect)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)
- [API Reference](https://stripe.com/docs/api)

## 🎉 Success!

Once you've completed all steps, your ClipStorm platform will have:
- ✅ Secure campaign budget payments
- ✅ Automatic clipper payouts
- ✅ Real-time budget tracking
- ✅ Compliance with payment regulations
- ✅ Professional payment experience

Your creators can now fund campaigns with confidence, and clippers can receive payments directly to their bank accounts!