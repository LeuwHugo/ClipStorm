# 💰 ClipWave Payment Flow Diagram

## Overview
This document illustrates the complete payment flow in ClipWave, from campaign creation to clipper payouts.

## 🔄 Complete Payment Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CREATOR       │    │   CLIPWAVE      │    │   STRIPE        │
│                 │    │   PLATFORM      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐                 │                       │
    │ Create  │                 │                       │
    │Campaign │                 │                       │
    │$1000    │                 │                       │
    │Budget   │                 │                       │
    └────┬────┘                 │                       │
         │                       │                       │
         │ 1. Submit Campaign    │                       │
         ├──────────────────────▶│                       │
         │                       │                       │
         │                       │ 2. Create Payment     │
         │                       │    Intent ($1000)     │
         │                       ├──────────────────────▶│
         │                       │                       │
         │                       │ 3. Return Client      │
         │                       │    Secret             │
         │                       │◀──────────────────────┤
         │                       │                       │
         │ 4. Show Payment Form  │                       │
         │◀──────────────────────┤                       │
         │                       │                       │
         │ 5. Enter Card Details │                       │
         ├──────────────────────▶│                       │
         │                       │                       │
         │                       │ 6. Process Payment    │
         │                       │    ($1000)            │
         │                       ├──────────────────────▶│
         │                       │                       │
         │                       │ 7. Payment Success    │
         │                       │    Webhook            │
         │                       │◀──────────────────────┤
         │                       │                       │
         │ 8. Campaign Active    │                       │
         │   Budget: $1000       │                       │
         │◀──────────────────────┤                       │
         │                       │                       │
         │                       │                       │
┌─────────────────┐              │                       │
│   CLIPPER       │              │                       │
│                 │              │                       │
└─────────────────┘              │                       │
         │                       │                       │
    ┌────▼────┐                 │                       │
    │ Setup   │                 │                       │
    │ Stripe  │                 │                       │
    │Connect  │                 │                       │
    │Account  │                 │                       │
    └────┬────┘                 │                       │
         │                       │                       │
         │ 9. Request Connect    │                       │
         │    Account Setup      │                       │
         ├──────────────────────▶│                       │
         │                       │                       │
         │                       │ 10. Create Connect    │
         │                       │     Account           │
         │                       ├──────────────────────▶│
         │                       │                       │
         │                       │ 11. Return Onboarding│
         │                       │     Link              │
         │                       │◀──────────────────────┤
         │                       │                       │
         │ 12. Complete          │                       │
         │     Onboarding        │                       │
         ├──────────────────────▶│                       │
         │                       │                       │
    ┌────▼────┐                 │                       │
    │ Submit  │                 │                       │
    │ Clip    │                 │                       │
    │500K     │                 │                       │
    │Views    │                 │                       │
    └────┬────┘                 │                       │
         │                       │                       │
         │ 13. Submit Clip       │                       │
         │     (500K views)      │                       │
         ├──────────────────────▶│                       │
         │                       │                       │
         │                       │ 14. Auto-calculate   │
         │                       │     Payment: $125     │
         │                       │     (500K/1M × $250)  │
         │                       │                       │
         │ 15. Clip Approved     │                       │
         │     Payment: $125     │                       │
         │◀──────────────────────┤                       │
         │                       │                       │
         │                       │                       │
┌─────────────────┐              │                       │
│   CREATOR       │              │                       │
│                 │              │                       │
└─────────────────┘              │                       │
         │                       │                       │
         │ 16. Review & Approve  │                       │
         │     Payment           │                       │
         ├──────────────────────▶│                       │
         │                       │                       │
         │                       │ 17. Create Transfer   │
         │                       │     to Clipper ($125) │
         │                       ├──────────────────────▶│
         │                       │                       │
         │                       │ 18. Transfer Success  │
         │                       │     Webhook           │
         │                       │◀──────────────────────┤
         │                       │                       │
         │                       │ 19. Update Budget     │
         │                       │     $1000 → $875      │
         │                       │                       │
         │ 20. Budget Updated    │                       │
         │     Remaining: $875   │                       │
         │◀──────────────────────┤                       │
         │                       │                       │
┌─────────────────┐              │                       │
│   CLIPPER       │              │                       │
│                 │              │                       │
└─────────────────┘              │                       │
         │                       │                       │
         │ 21. Payment Received  │                       │
         │     $125 in Bank      │                       │
         │◀──────────────────────┤                       │
         │                       │                       │
```

## 🔍 Detailed Step Breakdown

### Phase 1: Campaign Creation & Funding
1. **Creator submits campaign** with $1000 budget
2. **Platform creates Stripe Payment Intent** for $1000
3. **Stripe returns client secret** for secure payment
4. **Creator sees payment form** with Stripe Elements
5. **Creator enters card details** and submits payment
6. **Stripe processes payment** and charges creator's card
7. **Webhook confirms payment** success to platform
8. **Campaign becomes active** with $1000 available budget

### Phase 2: Clipper Onboarding
9. **Clipper requests payout setup** in profile
10. **Platform creates Stripe Connect account** for clipper
11. **Stripe returns onboarding link** for account setup
12. **Clipper completes verification** (ID, bank details, tax info)

### Phase 3: Clip Submission & Payment
13. **Clipper submits clip** with 500K views to campaign
14. **Platform auto-calculates payment**: 500K ÷ 1M × $250 = $125
15. **Clip gets approved** for payment (meets minimum views)
16. **Creator reviews and approves** the $125 payment
17. **Platform creates Stripe transfer** from campaign funds to clipper
18. **Webhook confirms transfer** success
19. **Campaign budget updates**: $1000 - $125 = $875 remaining
20. **Creator sees updated budget** in dashboard
21. **Clipper receives $125** in their bank account (2-7 business days)

## 💡 Key Benefits

### For Creators
- **Upfront payment** ensures campaign is fully funded
- **Escrow protection** - funds only released for approved clips
- **Automatic budget tracking** - always know remaining funds
- **No payment processing** - platform handles all transactions

### For Clippers
- **Guaranteed payments** - funds are escrowed upfront
- **Direct bank deposits** - receive payments via Stripe Connect
- **Transparent pricing** - know exactly what you'll earn
- **Fast payouts** - payments processed immediately when approved

### For Platform
- **Revenue opportunities** - can charge platform fees
- **Reduced disputes** - funds are held in escrow
- **Compliance** - Stripe handles all payment regulations
- **Scalability** - supports global payments and currencies

## 🔒 Security Features

- **PCI Compliance** - Stripe handles all card data
- **Webhook Verification** - All webhooks are cryptographically signed
- **Account Verification** - Clippers must verify identity for payouts
- **Fraud Protection** - Stripe's ML models prevent fraudulent transactions
- **Dispute Handling** - Stripe manages chargebacks and disputes

## 📊 Financial Tracking

### Campaign Level
- Total budget paid by creator
- Remaining budget available
- Total paid to clippers
- Number of approved clips

### Clipper Level
- Total earnings across all campaigns
- Pending payments awaiting approval
- Payment history and transaction details
- Tax reporting (1099 forms for US clippers)

This payment flow ensures a secure, transparent, and efficient system for handling money between creators and clippers while maintaining compliance with financial regulations.