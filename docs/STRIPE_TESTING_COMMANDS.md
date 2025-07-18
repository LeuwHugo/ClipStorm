# 🧪 Stripe Testing Commands & Examples

## 🚀 **Quick Setup Commands**

### Install Stripe CLI (Alternative to ngrok)
```bash
# Option 1: Direct download (recommended)
curl -s https://packages.stripe.com/api/v1/binstubs/stripe/releases/latest/download | bash

# Option 2: Use npx (no global install)
npx stripe-cli --version

# Option 3: Local project install
npm install stripe-cli --save-dev
npx stripe login
```

### Start Webhook Forwarding
```bash
# Forward webhooks to your local development server
stripe listen --forward-to localhost:3000/api/payments/webhook

# This will output something like:
# > Ready! Your webhook signing secret is whsec_1234567890abcdef...
# Copy this secret to your .env.local file
```

## 💳 **Test Payment Scenarios**

### Test Campaign Creation Payment
```bash
# 1. Start your development server
npm run dev

# 2. In another terminal, start webhook forwarding
stripe listen --forward-to localhost:3000/api/payments/webhook

# 3. Create campaign with these test details:
Campaign Title: "Test Gaming Campaign"
Budget: $1000
Test Card: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123
ZIP: 12345
```

### Test Different Card Scenarios
```bash
# Success scenarios
Card: 4242 4242 4242 4242 (Visa)
Card: 5555 5555 5555 4444 (Mastercard)

# Decline scenarios  
Card: 4000 0000 0000 0002 (Generic decline)
Card: 4000 0000 0000 9995 (Insufficient funds)

# Authentication required
Card: 4000 0025 0000 3155 (3D Secure)
```

## 🔗 **Test Stripe Connect Setup**

### Test Clipper Onboarding
```bash
# Test business information for Connect accounts
Business Type: Individual
Name: Test Clipper
Email: clipper@example.com
Phone: +1 555-123-4567
DOB: 01/01/1990
Address: 123 Test St, Test City, CA 90210
SSN: 000-00-0000 (test SSN for US)

# Test bank account
Routing Number: 110000000
Account Number: 000123456789
```

## 🎮 **Complete Testing Flow**

### Step 1: Test Campaign Creation
```bash
# 1. Navigate to http://localhost:3000/campaigns
# 2. Click "Create Campaign"
# 3. Fill form with test data
# 4. Use test card: 4242 4242 4242 4242
# 5. Verify payment succeeds
# 6. Check campaign status becomes "active"
```

### Step 2: Test Clipper Setup
```bash
# 1. Sign up as clipper
# 2. Go to profile page
# 3. Click "Set Up Payments with Stripe"
# 4. Complete Connect onboarding with test data
# 5. Verify account shows "Active"
```

### Step 3: Test Clip Payment
```bash
# 1. Submit clip with 500K views
# 2. Verify auto-approval and $125 payment calculation
# 3. As creator, click "Pay $125"
# 4. Verify transfer to clipper
# 5. Check campaign budget: $1000 → $875
```

## 🔍 **Debugging Commands**

### Check Stripe Events
```bash
# List recent events
stripe events list --limit 10

# Get specific event details
stripe events retrieve evt_1234567890

# Resend webhook for testing
stripe events resend evt_1234567890
```

### Test Webhook Manually
```bash
# Send test webhook
stripe trigger payment_intent.succeeded

# Send test Connect account update
stripe trigger account.updated
```

### Check Payment Intents
```bash
# List payment intents
stripe payment_intents list --limit 10

# Get specific payment intent
stripe payment_intents retrieve pi_1234567890
```

## 📊 **Monitoring Commands**

### Real-time Event Monitoring
```bash
# Monitor all Stripe events
stripe listen

# Monitor specific events only
stripe listen --events payment_intent.succeeded,transfer.created

# Monitor with custom endpoint
stripe listen --forward-to https://your-domain.com/api/payments/webhook
```

### Check Account Status
```bash
# List Connect accounts
stripe accounts list

# Get account details
stripe accounts retrieve acct_1234567890

# Check account capabilities
stripe accounts retrieve acct_1234567890 --expand capabilities
```

## 🚨 **Troubleshooting Commands**

### Common Issues & Solutions

#### Webhook Not Receiving Events
```bash
# Check webhook endpoint status
curl -X POST http://localhost:3000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'

# Verify webhook secret
echo $STRIPE_WEBHOOK_SECRET

# Test webhook signature verification
stripe listen --print-secret
```

#### Payment Intent Creation Fails
```bash
# Test API key permissions
stripe balance retrieve

# Check if Connect is enabled
stripe accounts list

# Verify environment variables
echo $STRIPE_SECRET_KEY | head -c 20
```

#### Connect Account Issues
```bash
# Check account requirements
stripe accounts retrieve acct_1234567890 --expand requirements

# List account capabilities
stripe accounts retrieve acct_1234567890 --expand capabilities

# Check verification status
stripe accounts retrieve acct_1234567890 --expand verification
```

## 🎯 **Success Verification**

### Verify Complete Integration
```bash
# 1. Check payment intent created
stripe payment_intents list --limit 1

# 2. Check Connect account created  
stripe accounts list --limit 1

# 3. Check transfer created
stripe transfers list --limit 1

# 4. Verify webhook delivery
stripe events list --type payment_intent.succeeded --limit 1
```

### Database Verification
```sql
-- Check campaign payment status
SELECT id, title, total_budget, remaining_budget, payment_status, stripe_payment_intent_id 
FROM campaigns 
ORDER BY created_at DESC 
LIMIT 5;

-- Check clipper Stripe accounts
SELECT id, display_name, stripe_account_id 
FROM users 
WHERE role = 'clipper' AND stripe_account_id IS NOT NULL;

-- Check clip payments
SELECT id, view_count, payment_amount, status, stripe_transfer_id
FROM clip_submissions 
WHERE status IN ('approved', 'paid')
ORDER BY submitted_at DESC 
LIMIT 5;
```

This approach eliminates the need for global npm installations while providing comprehensive testing capabilities for your Stripe integration!