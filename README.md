# 🚀 Sui24.trade - Crypto Trading & MLM Platform

A comprehensive crypto trading platform with 1000x leverage, MLM referral system, and automated ROI rewards.

---

## ✅ Features

### 🎯 Core Features
- **1000x Crypto Futures Trading** (BTC, ETH, SUI, SOL)
- **Demo Trading Mode** ($1000 virtual balance)
- **9-Tier Investment Packages** (30-15,000 SUI)
- **Task-Based ROI System** (Click every 3 hours)
- **24-Level MLM Commission Structure**
- **Star Rank System** (7 levels based on team volume)
- **Multi-Wallet System** (Main, ROI, Earning, P2P)
- **Polymarket-Style Prediction Markets**

### 💰 Package System
| Package | Investment | Max ROI | Daily Max |
|---------|-----------|---------|-----------|
| 1 | 30 SUI | 220% | 10% |
| 2 | 100 SUI | 230% | 10% |
| 3 | 250 SUI | 240% | 10% |
| 4 | 750 SUI | 250% | 10% |
| 5 | 2,500 SUI | 260% | 10% |
| 6 | 5,000 SUI | 270% | 10% |
| 7 | 7,500 SUI | 280% | 10% |
| 8 | 10,000 SUI | 290% | 10% |
| 9 | 15,000 SUI | 300% | 10% |

### 📧 Email Notifications
- ✅ Welcome emails for new signups
- ✅ Deposit confirmations (pending/confirmed)
- ✅ Withdrawal notifications (pending/approved/rejected)
- ✅ ROI reward alerts
- ✅ Referral commission notifications

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5 (Pages Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **UI Components**: Shadcn/UI
- **Backend**: Supabase (Database, Auth, Storage)
- **Email**: Resend API
- **Deployment**: Vercel

---

## 📦 Installation

```bash
# Clone repository
git clone <repository-url>
cd sui24-trade

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

---

## 🔧 Environment Variables

Create `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend Email
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@sui24.trade
```

---

## 📧 Email Setup Guide

### 1. **Add DNS Records to Vercel**

Add these 3 DNS records in Vercel:

```bash
# Domain Verification
vercel dns add sui24.trade '_resend' TXT 're_4Hfi6v8A_CibTWfhQhCQnuYjL9B6HCRsH'

# DKIM
vercel dns add sui24.trade 'resend._domainkey' TXT 'p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDW+I0tSAquJZgGdWmlH7ieo4ID+Tc38qHvMqqg6CjHa/KfmczgTut+6OAShoqcZikra4N8l1CqSyzXSjOzXCpvKgzANUmESmh13aZmW1SJ7aW7ToL9cDZLCKRGp2SApFdEJDnhJWiGpT2bJj9kw0JzxqHfScQSswQr7iM8J3e4aQIDAQAB'

# SPF
vercel dns add sui24.trade '@' TXT 'v=spf1 include:resend.com ~all'
```

### 2. **Get Resend API Key**

1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create new API key
3. Copy and add to `.env.local`

### 3. **Verify Domain in Resend**

1. Add domain to Resend
2. Wait 10-15 minutes for DNS propagation
3. Click "Verify" in Resend dashboard
4. Confirm all 3 records show green checkmarks ✅

### 4. **Test Email Integration**

```bash
# Test via API
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

Or use the built-in test page at: `/api/test-email`

---

## 📧 Email Functions

### Import Email Service

```typescript
import {
  sendWelcomeEmail,
  sendDepositEmail,
  sendWithdrawalEmail,
  sendROIEmail,
  sendReferralCommissionEmail,
} from "@/lib/emailService";
```

### Send Welcome Email

```typescript
await sendWelcomeEmail({
  userName: "John Doe",
  userEmail: "user@example.com",
  referralCode: "ABC123",
});
```

### Send Deposit Email

```typescript
await sendDepositEmail({
  userName: "John Doe",
  userEmail: "user@example.com",
  amount: 100,
  txHash: "0x123...",
  status: "confirmed", // or "pending"
});
```

### Send Withdrawal Email

```typescript
await sendWithdrawalEmail({
  userName: "John Doe",
  userEmail: "user@example.com",
  amount: 50,
  walletAddress: "0xabc...",
  status: "approved", // "pending" or "rejected"
  fees: 25, // 50% tax
});
```

### Send ROI Email

```typescript
await sendROIEmail({
  userName: "John Doe",
  userEmail: "user@example.com",
  amount: 3.5,
  packageName: "Package 1 (30 SUI)",
  totalEarned: 15.5,
});
```

### Send Referral Commission Email

```typescript
await sendReferralCommissionEmail({
  userName: "John Doe",
  userEmail: "user@example.com",
  amount: 0.9,
  fromUser: "Jane Smith",
  level: 3,
});
```

---

## 🚀 API Endpoints

### `/api/send-email` (POST)
Send custom emails

**Request:**
```json
{
  "to": "user@example.com",
  "subject": "Your Subject",
  "html": "<h1>Email HTML</h1>",
  "from": "noreply@sui24.trade" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "emailId": "re_123..."
}
```

### `/api/test-email` (POST)
Test email integration

**Request:**
```json
{
  "email": "test@example.com"
}
```

---

## 📊 Project Structure

```
src/
├── pages/
│   ├── api/
│   │   ├── send-email.ts      # Email sending endpoint
│   │   └── test-email.ts      # Email test endpoint
│   ├── index.tsx              # Homepage
│   ├── trade.tsx              # Trading interface
│   ├── dashboard.tsx          # User dashboard
│   ├── wallets.tsx            # Multi-wallet management
│   ├── predictions.tsx        # Prediction markets
│   └── admin/
│       └── dashboard.tsx      # Admin panel
├── lib/
│   └── emailService.ts        # Email helper functions
├── services/
│   ├── authService.ts         # Authentication
│   ├── userService.ts         # User management
│   ├── packageService.ts      # Package system
│   ├── walletService.ts       # Wallet operations
│   └── adminService.ts        # Admin functions
└── components/
    ├── MLMTree.tsx            # MLM tree visualization
    └── ui/                    # Shadcn UI components
```

---

## 🎨 Admin Features

- User management (view, edit, suspend, ban)
- Transaction approval (deposits/withdrawals)
- Package configuration
- Platform settings
- Secret admin wallet (5% entry + 50% withdrawal tax)
- Statistics overview

---

## 🔐 Security Features

- Row Level Security (RLS) on all database tables
- IP-based referral link binding
- Transaction hash verification
- Admin approval for deposits/withdrawals
- 50% tax on external withdrawals
- Anti-spam measures

---

## 📈 MLM Commission Structure

**24-Level ROI-to-ROI Commission:**
- Level 1: 3.0%
- Level 2: 2.0%
- Level 3: 1.0%
- Level 4-6: 0.5% each
- Level 7-18: 0.25% each
- Level 19-21: 0.5% each
- Level 22: 1.0%
- Level 23: 2.0%
- Level 24: 3.0%

**Star Rank System:**
| Rank | Team Volume | Commission |
|------|------------|-----------|
| Star 1 | 100 SUI | 3% |
| Star 2 | 500 SUI | 6% |
| Star 3 | 2,500 SUI | 9% |
| Star 4 | 12,500 SUI | 12% |
| Star 5 | 75,000 SUI | 15% |
| Star 6 | 375,000 SUI | 18% |
| Star 7 | 2,250,000 SUI | 21% |

---

## 📝 License

© 2026 Sui24.trade - All rights reserved

---

## 🤝 Support

For issues or questions, contact the development team.