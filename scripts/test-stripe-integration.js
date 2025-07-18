#!/usr/bin/env node

/**
 * Test script for Stripe integration
 * Run with: node scripts/test-stripe-integration.js
 */

const crypto = require('crypto');

// Test webhook signature creation
function createTestWebhookSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

// Test payment intent webhook
function createPaymentSuccessWebhook(campaignId, creatorId, amount) {
  const payload = JSON.stringify({
    id: 'evt_test_webhook',
    object: 'event',
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_test_123',
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        status: 'succeeded',
        metadata: {
          type: 'campaign_budget',
          campaign_id: campaignId,
          creator_id: creatorId
        }
      }
    },
    created: Math.floor(Date.now() / 1000)
  });

  return payload;
}

// Test transfer webhook
function createTransferWebhook(submissionId, amount, accountId) {
  const payload = JSON.stringify({
    id: 'evt_test_webhook_transfer',
    object: 'event',
    type: 'transfer.created',
    data: {
      object: {
        id: 'tr_test_123',
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        destination: accountId,
        metadata: {
          type: 'clip_payment',
          submission_id: submissionId
        }
      }
    },
    created: Math.floor(Date.now() / 1000)
  });

  return payload;
}

// Test webhook endpoint
async function testWebhookEndpoint(payload, signature) {
  try {
    const response = await fetch('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature
      },
      body: payload
    });

    const result = await response.json();
    console.log('Webhook test result:', result);
    return response.ok;
  } catch (error) {
    console.error('Webhook test failed:', error);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Testing Stripe Integration...\n');

  // Test data
  const testCampaignId = 'test_campaign_123';
  const testCreatorId = 'test_creator_123';
  const testSubmissionId = 'test_submission_123';
  const testAccountId = 'acct_test_123';
  const webhookSecret = 'whsec_test_secret';

  // Test 1: Payment Intent Success
  console.log('1️⃣ Testing payment intent success webhook...');
  const paymentPayload = createPaymentSuccessWebhook(testCampaignId, testCreatorId, 1000);
  const paymentSignature = createTestWebhookSignature(paymentPayload, webhookSecret);
  
  const paymentTest = await testWebhookEndpoint(paymentPayload, paymentSignature);
  console.log(`   ${paymentTest ? '✅' : '❌'} Payment webhook test\n`);

  // Test 2: Transfer Success
  console.log('2️⃣ Testing transfer success webhook...');
  const transferPayload = createTransferWebhook(testSubmissionId, 125, testAccountId);
  const transferSignature = createTestWebhookSignature(transferPayload, webhookSecret);
  
  const transferTest = await testWebhookEndpoint(transferPayload, transferSignature);
  console.log(`   ${transferTest ? '✅' : '❌'} Transfer webhook test\n`);

  // Test 3: API Endpoints
  console.log('3️⃣ Testing API endpoints...');
  
  const endpoints = [
    '/api/payments/create-campaign-payment',
    '/api/payments/create-connect-account',
    '/api/payments/payout-clipper',
    '/api/payments/webhook'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });
      
      console.log(`   ${response.status < 500 ? '✅' : '❌'} ${endpoint} (${response.status})`);
    } catch (error) {
      console.log(`   ❌ ${endpoint} (Error: ${error.message})`);
    }
  }

  console.log('\n🎉 Stripe integration test complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Add real Stripe keys to .env.local');
  console.log('   2. Set up webhook forwarding with Stripe CLI');
  console.log('   3. Test with real payments using test cards');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  createTestWebhookSignature,
  createPaymentSuccessWebhook,
  createTransferWebhook,
  testWebhookEndpoint
};