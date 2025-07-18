# 🔗 Webhook Testing Alternatives for ClipWave

Since you're experiencing permission issues with installing ngrok globally, here are several alternative approaches to test Stripe webhooks locally.

## 🎯 **Option 1: Use Stripe CLI (Recommended)**

The Stripe CLI is the official tool for webhook testing and doesn't require global npm installation.

### Installation
```bash
# Download Stripe CLI directly
curl -s https://packages.stripe.com/api/v1/binstubs/stripe/releases/latest/download | bash

# Or use package manager without global install
npx stripe-cli
```

### Setup & Usage
```bash
# Login to your Stripe account
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/payments/webhook

# This will give you a webhook signing secret like:
# whsec_1234567890abcdef...
```

### Add to .env.local
```env
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

## 🎯 **Option 2: Use Localtunnel (No Installation)**

Localtunnel provides a public URL for your local server without installation.

### Usage
```bash
# Install locally in your project (not globally)
npm install localtunnel

# Create tunnel
npx localtunnel --port 3000

# This gives you a URL like: https://abc123.loca.lt
```

### Configure Stripe Webhook
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://abc123.loca.lt/api/payments/webhook`
3. Select events: `payment_intent.succeeded`, `account.updated`, `transfer.created`

## 🎯 **Option 3: Use Cloudflare Tunnel**

Free and doesn't require installation.

### Setup
```bash
# Download cloudflared
curl -L --output cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared

# Create tunnel
./cloudflared tunnel --url http://localhost:3000
```

## 🎯 **Option 4: Deploy to Vercel for Testing**

Deploy your app to get a public URL for webhook testing.

### Quick Deploy
```bash
# Install Vercel CLI locally
npm install vercel

# Deploy
npx vercel

# Use the deployment URL for webhooks
# Example: https://clipwave-abc123.vercel.app/api/payments/webhook
```

## 🎯 **Option 5: Mock Webhook Testing**

Test webhook handling without external services.

### Create Test Webhook Handler
```javascript
// test/webhook-test.js
const crypto = require('crypto');

function createTestWebhook(eventType, data) {
  const payload = JSON.stringify({
    id: 'evt_test_webhook',
    object: 'event',
    type: eventType,
    data: { object: data },
    created: Math.floor(Date.now() / 1000)
  });

  // Create test signature
  const signature = crypto
    .createHmac('sha256', 'whsec_test_secret')
    .update(payload, 'utf8')
    .digest('hex');

  return {
    payload,
    signature: `t=${Math.floor(Date.now() / 1000)},v1=${signature}`
  };
}

// Test payment success
const paymentSuccessWebhook = createTestWebhook('payment_intent.succeeded', {
  id: 'pi_test_123',
  amount: 100000, // $1000 in cents
  metadata: {
    type: 'campaign_budget',
    campaign_id: 'test_campaign_id',
    creator_id: 'test_creator_id'
  }
});

console.log('Test webhook:', paymentSuccessWebhook);
```

## 🎯 **Option 6: Use Development Environment Variables**

For initial testing, you can skip webhook verification temporarily.

### Modify Webhook Handler for Testing
```javascript
// In your webhook route, add development mode
export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');

  let event;

  // Skip signature verification in development
  if (process.env.NODE_ENV === 'development' && !signature) {
    event = JSON.parse(body);
  } else {
    // Normal webhook verification
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature!,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  }

  // Rest of webhook handling...
}
```

## 🧪 **Testing Without Webhooks**

You can test the payment flow without webhooks by manually updating the database.

### Manual Testing Steps
1. **Create Campaign**: Use test card to create campaign
2. **Check Stripe Dashboard**: Verify payment succeeded
3. **Manually Update Database**: 
   ```sql
   UPDATE campaigns 
   SET status = 'active', payment_status = 'paid' 
   WHERE id = 'your_campaign_id';
   ```
4. **Test Clip Submission**: Submit clip and verify payment calculation
5. **Test Payout**: Process clipper payment

## 🎯 **Recommended Approach**

For your current setup, I recommend **Option 1 (Stripe CLI)** because:
- ✅ Official Stripe tool
- ✅ Most reliable webhook testing
- ✅ Provides real webhook signing secrets
- ✅ Easy to set up and use
- ✅ Works in any environment

### Quick Start with Stripe CLI
```bash
# 1. Download Stripe CLI
curl -s https://packages.stripe.com/api/v1/binstubs/stripe/releases/latest/download | bash

# 2. Login to Stripe
stripe login

# 3. Start webhook forwarding
stripe listen --forward-to localhost:3000/api/payments/webhook

# 4. Copy the webhook secret to .env.local
# 5. Test your payment flow!
```

This approach will give you the most accurate testing environment for your Stripe integration!