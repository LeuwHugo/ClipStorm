# 🧪 Stripe Testing Guide for ClipWave

This guide helps you test the complete Stripe integration using test data and scenarios.

## 🎯 Test Scenarios

### Scenario 1: Successful Campaign Creation
```
Creator: john@example.com
Campaign: "Epic Gaming Moments"
Budget: $1000
Card: 4242 4242 4242 4242
Expected: Campaign created and funded successfully
```

### Scenario 2: Failed Payment
```
Creator: jane@example.com
Campaign: "Cooking Tips"
Budget: $500
Card: 4000 0000 0000 0002 (declined)
Expected: Payment fails, campaign not created
```

### Scenario 3: Clipper Payout
```
Clipper: alex@example.com
Clip: 750K views on TikTok
Campaign: $250/million views
Expected: $187.50 payment to clipper
```

## 💳 Test Card Numbers

### Successful Payments
- **Visa**: `4242 4242 4242 4242`
- **Mastercard**: `5555 5555 5555 4444`
- **American Express**: `3782 822463 10005`

### Failed Payments
- **Generic decline**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`
- **Lost card**: `4000 0000 0000 9987`

### Authentication Required
- **3D Secure**: `4000 0025 0000 3155`
- **3D Secure 2**: `4000 0027 6000 3184`

### Test Details
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

## 🔗 Testing Stripe Connect

### Test Business Information
```
Business Type: Individual
First Name: Test
Last Name: Clipper
Email: clipper@example.com
Phone: +1 555-123-4567
DOB: 01/01/1990
Address: 123 Test St, Test City, CA 90210
SSN: 000-00-0000 (test SSN)
```

### Test Bank Account
```
Routing Number: 110000000
Account Number: 000123456789
Account Type: Checking
```

## 🎮 Step-by-Step Testing

### Test 1: Campaign Creation Payment

1. **Start Campaign Creation**
   ```bash
   # Navigate to /campaigns
   # Click "Create Campaign"
   ```

2. **Fill Campaign Details**
   ```
   Title: "Test Gaming Campaign"
   Video URL: "https://youtube.com/watch?v=test123"
   Payment: $250 per million views
   Minimum Views: 100,000
   Budget: $1000
   ```

3. **Upload Thumbnail**
   - Use any test image file
   - Verify upload to Supabase storage

4. **Submit & Pay**
   - Click "Create & Fund Campaign"
   - Use test card: `4242 4242 4242 4242`
   - Verify payment success
   - Check campaign status becomes "active"

### Test 2: Clipper Connect Setup

1. **Create Clipper Account**
   ```bash
   # Sign up as clipper
   # Complete onboarding
   ```

2. **Set Up Payments**
   ```bash
   # Go to profile page
   # Click "Set Up Payments with Stripe"
   ```

3. **Complete Connect Onboarding**
   - Use test business information above
   - Complete all verification steps
   - Verify account shows as "Active"

### Test 3: Clip Submission & Payment

1. **Submit Clip**
   ```
   Platform: TikTok
   URL: https://tiktok.com/@test/video/123
   Views: 500,000
   Expected Payment: $125 (500K/1M × $250)
   ```

2. **Verify Auto-Approval**
   - Check clip status becomes "approved"
   - Verify payment amount calculated correctly

3. **Process Payout**
   - As campaign creator, click "Pay $125"
   - Verify transfer to clipper's account
   - Check campaign budget updates: $1000 → $875

## 🔍 Verification Checklist

### Campaign Creation
- [ ] Payment intent created successfully
- [ ] Payment processed without errors
- [ ] Campaign status updated to "active"
- [ ] Budget amount correctly stored
- [ ] Webhook received and processed

### Clipper Onboarding
- [ ] Connect account created
- [ ] Onboarding link generated
- [ ] Account verification completed
- [ ] Account ID stored in user profile
- [ ] Dashboard access working

### Clip Payments
- [ ] Payment amount calculated correctly
- [ ] Transfer created successfully
- [ ] Campaign budget decremented
- [ ] Clipper account credited
- [ ] Transaction logged properly

## 🚨 Error Testing

### Test Payment Failures
```javascript
// Test with declined card
Card: 4000 0000 0000 0002
Expected: "Your card was declined"

// Test with insufficient funds
Card: 4000 0000 0000 9995
Expected: "Your card has insufficient funds"
```

### Test Connect Account Issues
```javascript
// Test incomplete onboarding
// Don't complete all verification steps
Expected: Account shows "Pending" status

// Test invalid bank details
Routing: 123456789 (invalid)
Expected: Error during bank verification
```

### Test Webhook Failures
```bash
# Temporarily disable webhook endpoint
# Process a payment
Expected: Payment succeeds but status not updated
# Re-enable webhook
# Manually trigger webhook replay in Stripe dashboard
```

## 📊 Monitoring Test Results

### Stripe Dashboard
1. **Payments** → View all test payments
2. **Connect** → Monitor account creations
3. **Transfers** → Track clipper payouts
4. **Webhooks** → Check delivery status

### Application Logs
```bash
# Check API logs for errors
npm run dev
# Monitor console for webhook processing
# Verify database updates
```

### Database Verification
```sql
-- Check campaign payment status
SELECT id, title, total_budget, remaining_budget, payment_status 
FROM campaigns;

-- Check clip submissions and payments
SELECT id, view_count, payment_amount, status 
FROM clip_submissions;

-- Check user Stripe accounts
SELECT id, display_name, stripe_account_id 
FROM users WHERE role = 'clipper';
```

## 🎯 Success Criteria

### Campaign Creation
✅ Creator can fund campaign with test card
✅ Payment intent created and confirmed
✅ Campaign becomes active immediately
✅ Budget tracking works correctly

### Clipper Onboarding
✅ Clipper can create Connect account
✅ Onboarding flow completes successfully
✅ Account verification works
✅ Dashboard access granted

### Payment Processing
✅ Clips auto-approved based on views
✅ Payment calculations are accurate
✅ Transfers complete successfully
✅ Budget updates in real-time

## 🔄 Continuous Testing

### Automated Tests (Future)
```javascript
// Example test structure
describe('Stripe Integration', () => {
  test('Campaign payment succeeds', async () => {
    // Test payment flow
  });
  
  test('Clipper payout works', async () => {
    // Test transfer flow
  });
  
  test('Webhook processing', async () => {
    // Test webhook handling
  });
});
```

### Manual Testing Schedule
- **Daily**: Test basic payment flows
- **Weekly**: Test error scenarios
- **Monthly**: Full end-to-end testing
- **Before releases**: Complete regression testing

This testing guide ensures your Stripe integration works reliably before going live with real payments!