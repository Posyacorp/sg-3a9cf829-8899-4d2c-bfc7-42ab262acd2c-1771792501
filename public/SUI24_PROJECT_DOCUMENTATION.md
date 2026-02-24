# Sui24.trade - Complete Project Documentation

## Project Overview

**Project Name:** Sui24.trade  
**Type:** Crypto Trading & MLM Investment Platform  
**Primary Coin:** SUI (Sui Blockchain)  
**Tech Stack:** Next.js 15.5, TypeScript, Supabase, Tailwind CSS  
**Deployment:** Vercel  
**Live URL:** https://sui24.trade

---

## Core Concept

Sui24.trade combines five major components:
1. 1000x Crypto Futures Trading (Demo & Live)
2. Package-Based ROI System (Task clicking rewards)
3. 24-Level MLM Commission Structure
4. Polymarket-Style Prediction Markets
5. Multi-Wallet Management System

---

## Investment Package System

### Package Structure (9 Tiers)

| Package | Investment (SUI) | Max ROI Percent | Daily ROI Cap |
|---------|------------------|-----------------|---------------|
| 1 | 30 | 220 | 10 percent |
| 2 | 100 | 230 | 10 percent |
| 3 | 250 | 240 | 10 percent |
| 4 | 750 | 250 | 10 percent |
| 5 | 2,500 | 260 | 10 percent |
| 6 | 5,000 | 270 | 10 percent |
| 7 | 7,500 | 280 | 10 percent |
| 8 | 10,000 | 290 | 10 percent |
| 9 | 15,000 | 300 | 10 percent |

### ROI Distribution Rules

**Task-Based Clicking System:**
- User clicks Activity Task button every 3 hours
- 30-minute window for clicking after timer expires
- Random reward percentage (0.5 to 3 percent)
- Maximum 10 percent daily ROI cap
- Missed clicks: ROI goes to donation fund (still counts toward total payout)

**Example: Package 1 (30 SUI at 220 percent ROI)**
- Total payout: 66 SUI (30 multiplied by 2.2)
- Duration: approximately 22-30 days (depending on clicking consistency)
- Daily earnings: approximately 3 SUI max (10 percent of 30)

### Package Purchase Flow

1. User deposits SUI to Main Wallet
2. User selects package from packages page
3. System deducts 5 percent admin fee (hidden)
4. Package activated in user dashboard
5. Timer starts - first click available after 3 hours
6. User clicks every 3 hours to claim ROI
7. ROI credited to ROI Wallet
8. Process continues until max ROI reached

---

## Multi-Wallet System

### Four Wallet Types

#### 1. Main Wallet (Deposit Wallet)
- Primary deposit address
- Fresh funds for new packages
- Withdrawal available (50 percent tax if external)
- Can send to other wallets internally

#### 2. ROI Wallet
- Receives task clicking rewards
- Can be used for package purchases (70 percent rule applies)
- Can transfer to P2P wallet
- Tracks total ROI earned

#### 3. Earning Wallet (Commission Wallet)
- Receives MLM commissions
- Receives Star Rank bonuses
- Can be used for package purchases (70 percent rule applies)
- Tracks referral earnings

#### 4. P2P Wallet
- Internal transfer system
- User-to-user transfers (1 percent fee)
- Can be used for package purchases (70 percent rule applies)
- Instant transfers between users

### 70/30 Rule for Package Purchases

**Rule:** When buying packages using internal wallets (ROI, Earning, P2P):
- Maximum 70 percent from internal wallets
- Minimum 30 percent must be fresh deposit (Main Wallet)

**Example: Buying 100 SUI Package**
- Can use up to 70 SUI from ROI/Earning/P2P wallets
- Must deposit at least 30 SUI fresh funds to Main Wallet

**Exception:** First package purchase from Main Wallet equals 100 percent allowed

---

## 24-Level MLM Commission Structure

### ROI-to-ROI Commission (When Downline Earns)

| Level Range | Commission Percent | Notes |
|-------------|-------------------|-------|
| Level 1 | 3.0 | Direct referrals |
| Level 2 | 2.0 | Second level |
| Level 3 | 1.0 | Third level |
| Level 4-6 | 0.5 each | Three levels |
| Level 7-18 | 0.25 each | Twelve levels |
| Level 19-21 | 0.5 each | Three levels |
| Level 22 | 1.0 | Deep level |
| Level 23 | 2.0 | Deeper level |
| Level 24 | 3.0 | Deepest level |

**Total Potential:** Up to 12.25 percent of downline ROI earnings

### Qualification Rules

1. **Upline Must Have Active Package:** Minimum 100 SUI investment
2. **Direct Referral Requirement:** Must have at least 1 direct referral per level
3. **Single-Direction Rule:** To unlock each level, upline must recruit 1 person on that specific level path
4. **Self-Referral Blocked:** Cannot refer yourself

### Star Rank System (Team Volume Based)

| Rank | Team Volume (SUI) | Referral Commission | Benefits |
|------|-------------------|---------------------|----------|
| Star 1 | 100 | 3 percent | Basic rank |
| Star 2 | 500 | 6 percent | Enhanced earnings |
| Star 3 | 2,500 | 9 percent | Leadership bonus |
| Star 4 | 12,500 | 12 percent | Elite status |
| Star 5 | 75,000 | 15 percent | Diamond tier |
| Star 6 | 375,000 | 18 percent | Platinum tier |
| Star 7 | 2,250,000 | 21 percent | Top rank |

**Team Volume Calculation:** Sum of all downline deposits (24 levels deep)

---

## Fee Structure and Admin Revenue

### Entry Fees (Hidden from Users)

**5 Percent Admin Fee on Package Purchase:**
- Deducted immediately upon package activation
- Goes to admin secret wallet
- Example: 100 SUI package equals 5 SUI to admin, 95 SUI to user ROI pool

### Withdrawal Fees

**External Withdrawal (Outside Platform):**
- 50 percent tax on withdrawal amount
- Goes to admin secret wallet
- Example: Withdraw 100 SUI equals User receives 50 SUI, Admin gets 50 SUI

**P2P Transfer Fee:**
- 1 percent of transfer amount
- Goes to admin wallet
- Example: Transfer 100 SUI equals Recipient gets 99 SUI, Admin gets 1 SUI

### Trading Revenue

**1000x Futures Trading:**
- User wins/losses equals Platform profit
- Demo mode uses virtual balance
- Live mode uses actual wallet balances
- Platform takes opposite side of all trades

---

## Trading Features (1000x Futures)

### Supported Assets
- BTC/USDT
- ETH/USDT
- SUI/USDT
- SOL/USDT

### Trading Modes

#### Demo Mode (Pre-Login)
- Virtual 1000 USDT balance
- Practice trading without risk
- Full functionality to test
- Same interface as live mode

#### Live Mode (Post-Login)
- Use any wallet balance (Main, ROI, Earning, P2P)
- Real profit/loss affects wallet
- Up to 1000x leverage
- Manual claim or auto TP/SL

### Trading Mechanics

**Position Opening:**
1. Select asset (BTC, ETH, SUI, SOL)
2. Choose direction (Long/Short or Up/Down)
3. Set leverage (1x to 1000x)
4. Enter position size in SUI
5. Set Take Profit (TP) and Stop Loss (SL) - optional
6. Confirm trade

**Position Management:**
- Real-time profit and loss calculation
- Manual close at any time
- Auto TP/SL triggers when target reached
- Liquidation at 100 percent loss

**Example Trade:**
- Deposit: 10 SUI
- Leverage: 100x
- Position size: 1,000 SUI
- BTC price moves 1 percent equals 10 SUI profit (100 percent gain)
- BTC price moves negative 1 percent equals 10 SUI loss (100 percent loss, liquidated)

---

## Polymarket-Style Prediction Markets

### Market Structure

**Market Types:**
- Crypto price predictions
- Event-based outcomes
- Yes/No questions
- Time-bound resolutions

**Example Markets:**
- Will BTC reach 100K USD by March 2026?
- Will SUI hit 5 USD this quarter?
- Will ETH outperform BTC next month?

### Share Trading

**YES/NO Shares:**
- Each share equals probability weight
- Price equals probability multiplied by 100
- Example: 70 percent YES probability equals 0.70 USD per YES share

**Trading Mechanics:**
1. Buy YES or NO shares at current probability price
2. Market resolves when outcome known
3. Winning shares equals 1.00 USD payout
4. Losing shares equals 0.00 USD (total loss)

**Platform Revenue:**
- Trading fees on buy/sell
- Market maker spread
- Unresolved market positions

---

## Authentication and Security

### User Registration

**Required Fields:**
- Email (unique, validated)
- Password (minimum 8 characters)
- Username (unique, alphanumeric)
- Referral Code (optional)

**Automatic Generation:**
- User gets unique referral code (8 characters)
- Profile created in profiles table
- Referral link: https://sui24.trade/signup?ref=USER_CODE

### IP Binding

**Single Referral Link:**
- Each user gets 1 unique referral code
- IP address tracked on first click
- Prevents referral manipulation
- Stored in referral_clicks table

### Security Measures

1. **Password Requirements:**
   - Minimum 8 characters
   - Must include uppercase, lowercase, number
   - Hashed with bcrypt

2. **Email Verification:**
   - Supabase handles email confirmation
   - Account activation required
   - Temporary bypass available (currently active)

3. **Session Management:**
   - JWT tokens
   - Secure cookie storage
   - Auto logout after inactivity

---

## Deposit and Withdrawal System

### Deposit Process (Manual Verification)

**User Steps:**
1. Click Deposit in dashboard
2. Select wallet type (Main Wallet recommended)
3. System displays admin SUI wallet address
4. User copies address
5. User sends SUI from their external wallet
6. User enters in platform:
   - Amount sent
   - Transaction hash
   - Optional: Screenshot proof
7. User submits for admin approval

**Admin Verification:**
1. Admin sees pending deposit in admin dashboard
2. Admin verifies transaction on SUI blockchain explorer
3. Admin clicks Approve or Reject
4. If approved: Amount credited to user Main Wallet
5. Transaction recorded in transactions table
6. User receives notification

### Withdrawal Process

**Internal Withdrawal (P2P Transfer):**
1. User clicks Transfer to User
2. Enters recipient username
3. Enters amount
4. Selects source wallet
5. System deducts 1 percent fee
6. Instant transfer completed
7. Both users see transaction history

**External Withdrawal (Off-Platform):**
1. User clicks Withdraw
2. Enters external SUI wallet address
3. Enters amount
4. System shows 50 percent tax warning
5. User confirms withdrawal
6. Admin reviews and approves
7. Admin sends SUI to user address
8. 50 percent goes to admin secret wallet
9. Transaction marked complete

### Minimum Requirements

- Minimum Deposit: 30 SUI
- Minimum Withdrawal: 10 SUI
- Minimum Package Purchase: 30 SUI (Package 1)
- Minimum P2P Transfer: 5 SUI

---

## User Dashboard Features

### Dashboard Overview

**Wallet Balances Display:**
- Main Wallet: Shows deposit balance
- ROI Wallet: Shows earned ROI
- Earning Wallet: Shows commission earnings
- P2P Wallet: Shows transferred funds
- Total Balance: Sum of all wallets

### Active Packages Section

**Package Cards Show:**
- Package number and investment amount
- Current ROI earned vs Max ROI
- Progress bar (percentage of max ROI reached)
- Next click available time
- Click button (enabled/disabled based on timer)
- Days remaining estimate

**Example Package Card:**
```
Package 1 - 30 SUI Investment
ROI: 15.5 SUI / 66 SUI (23.5 percent)
Progress: [=====>..................] 23.5 percent
Next Click: Available in 2h 15m
Status: Active
```

### Task Clicking Functionality

**Click Button Behavior:**
1. Enabled only during 30-minute window after 3-hour timer
2. User clicks button
3. Random ROI percentage calculated (0.5 to 3 percent)
4. Amount calculated (percentage of package investment)
5. Credited to ROI Wallet
6. Timer resets for next 3 hours
7. Daily cap check (max 10 percent per day)

**Missed Click Handling:**
- Timer expires without click
- ROI amount still counts toward total payout
- Goes to donation fund (admin wallet)
- Timer resets normally
- User notified of missed opportunity

### MLM Tree Visualization

**Tree Features:**
- Visual representation of downline structure
- 24 levels displayed
- Hover over user shows:
  - Username
  - Investment amount
  - Active packages
  - Total ROI earned
  - Commission generated
  - Registration date
- Click to expand/collapse levels
- Color coding by activity status
- Search and filter options

### Transaction History

**Displays All Transactions:**
- Deposits (pending, approved, rejected)
- Withdrawals (pending, approved, rejected)
- Package purchases
- ROI earnings
- Commission earnings
- P2P transfers (sent/received)
- Trading profits/losses

**Transaction Details:**
- Date and time
- Type and status
- Amount in SUI
- Transaction hash (for blockchain transactions)
- Fees deducted
- Balance after transaction

### Referral System

**Referral Link Management:**
- Unique referral code displayed
- Copy referral link button
- QR code for easy sharing
- Referral statistics:
  - Total referrals (direct)
  - Total team size (24 levels)
  - Total team volume
  - Active referrals
  - Commission earned from referrals

---

## Admin Dashboard Features

### Admin Overview

**Statistics Dashboard:**
- Total users registered
- Total deposits (pending and approved)
- Total withdrawals (pending and approved)
- Total platform balance
- Active packages count
- Total ROI distributed
- Total commissions paid
- Platform profit (trading, fees, taxes)

### User Management

**User List Features:**
- View all registered users
- Search by username, email, referral code
- Filter by status (active, suspended, banned)
- View user details:
  - Registration date
  - Email verification status
  - Wallet balances
  - Active packages
  - Total deposits/withdrawals
  - Referral tree

**User Actions:**
- Edit user details
- Suspend/ban user account
- Reset user password
- View user transaction history
- Manually adjust wallet balances (emergency)
- View user MLM structure

### Transaction Management

**Pending Deposits:**
- List of all pending deposits
- User details
- Amount and transaction hash
- Submitted timestamp
- Verification status
- Actions:
  - Approve (credit to user wallet)
  - Reject (with reason)
  - Request more info

**Pending Withdrawals:**
- List of all pending withdrawals
- User details
- Amount and destination address
- Withdrawal type (internal/external)
- Fee calculation
- Actions:
  - Approve (process withdrawal)
  - Reject (with reason)
  - Hold (for investigation)

### Package Management

**Package Configuration:**
- Edit package details:
  - Investment amount
  - Max ROI percentage
  - Daily ROI cap
  - Min/max click rewards
- Enable/disable packages
- Create new packages
- View package statistics:
  - Total purchases
  - Total ROI distributed
  - Active packages

### Platform Settings

**Configuration Options:**
- Admin wallet addresses (secret wallet, deposit wallet)
- Fee percentages (entry fee, withdrawal tax, P2P fee)
- Minimum/maximum limits
- ROI click timing (3-hour interval, 30-minute window)
- MLM commission rates (24 levels)
- Star rank requirements
- Email notification settings
- Platform maintenance mode

### Reports and Analytics

**Financial Reports:**
- Daily/Weekly/Monthly revenue
- Deposit vs Withdrawal analysis
- Package purchase trends
- ROI distribution reports
- Commission payout reports
- Trading profit/loss reports

**User Analytics:**
- New registrations over time
- User activity patterns
- Referral network growth
- Package popularity
- Average user lifetime value

---

## Database Schema

### Tables Structure

**profiles**
- id (UUID, primary key)
- user_id (UUID, foreign key to auth.users)
- username (text, unique)
- email (text)
- referral_code (text, unique)
- referred_by (UUID, foreign key to profiles)
- created_at (timestamp)
- status (text: active, suspended, banned)

**wallets**
- id (UUID, primary key)
- user_id (UUID, foreign key to profiles)
- main_wallet (numeric, default 0)
- roi_wallet (numeric, default 0)
- earning_wallet (numeric, default 0)
- p2p_wallet (numeric, default 0)
- updated_at (timestamp)

**packages**
- id (UUID, primary key)
- package_number (integer)
- investment_amount (numeric)
- max_roi_percentage (numeric)
- daily_roi_cap (numeric)
- min_click_reward (numeric)
- max_click_reward (numeric)
- status (text: active, inactive)

**user_packages**
- id (UUID, primary key)
- user_id (UUID, foreign key to profiles)
- package_id (UUID, foreign key to packages)
- investment_amount (numeric)
- total_roi_earned (numeric, default 0)
- max_roi_amount (numeric)
- last_click_time (timestamp)
- next_click_time (timestamp)
- clicks_today (integer, default 0)
- roi_today (numeric, default 0)
- status (text: active, completed, cancelled)
- created_at (timestamp)

**transactions**
- id (UUID, primary key)
- user_id (UUID, foreign key to profiles)
- transaction_type (text: deposit, withdrawal, package_purchase, roi_earning, commission, p2p_transfer, trading)
- amount (numeric)
- fee_amount (numeric, default 0)
- status (text: pending, approved, rejected, completed)
- transaction_hash (text, nullable)
- notes (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)

**mlm_commissions**
- id (UUID, primary key)
- from_user_id (UUID, foreign key to profiles)
- to_user_id (UUID, foreign key to profiles)
- level (integer)
- commission_amount (numeric)
- commission_type (text: roi, deposit)
- created_at (timestamp)

**star_ranks**
- id (UUID, primary key)
- user_id (UUID, foreign key to profiles)
- rank (integer: 1-7)
- team_volume (numeric)
- commission_percentage (numeric)
- achieved_at (timestamp)

**referral_clicks**
- id (UUID, primary key)
- referral_code (text)
- ip_address (text)
- clicked_at (timestamp)

**prediction_markets**
- id (UUID, primary key)
- question (text)
- description (text)
- yes_shares (integer, default 0)
- no_shares (integer, default 0)
- yes_probability (numeric)
- no_probability (numeric)
- total_volume (numeric)
- resolution (text: pending, yes, no, cancelled)
- created_at (timestamp)
- resolved_at (timestamp, nullable)

**trading_positions**
- id (UUID, primary key)
- user_id (UUID, foreign key to profiles)
- asset (text: BTC, ETH, SUI, SOL)
- direction (text: long, short)
- leverage (integer)
- entry_price (numeric)
- position_size (numeric)
- take_profit (numeric, nullable)
- stop_loss (numeric, nullable)
- current_pnl (numeric)
- status (text: open, closed, liquidated)
- opened_at (timestamp)
- closed_at (timestamp, nullable)

---

## API Endpoints

### Authentication
- POST /api/auth/signup - Register new user
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout
- POST /api/auth/forgot-password - Request password reset
- POST /api/auth/reset-password - Reset password with token

### User
- GET /api/user/profile - Get user profile
- PUT /api/user/profile - Update user profile
- GET /api/user/wallets - Get wallet balances
- GET /api/user/packages - Get active packages
- GET /api/user/transactions - Get transaction history
- GET /api/user/referrals - Get referral tree

### Packages
- GET /api/packages - Get all available packages
- POST /api/packages/purchase - Purchase a package
- POST /api/packages/click - Claim ROI from package

### Transactions
- POST /api/transactions/deposit - Submit deposit request
- POST /api/transactions/withdraw - Submit withdrawal request
- POST /api/transactions/p2p-transfer - Internal transfer

### Trading
- GET /api/trading/prices - Get current crypto prices
- POST /api/trading/open-position - Open trading position
- POST /api/trading/close-position - Close trading position
- GET /api/trading/positions - Get user positions

### Predictions
- GET /api/predictions/markets - Get prediction markets
- POST /api/predictions/buy-shares - Buy YES/NO shares
- POST /api/predictions/sell-shares - Sell shares

### Admin
- GET /api/admin/users - Get all users
- PUT /api/admin/users/:id - Update user
- GET /api/admin/transactions/pending - Get pending transactions
- POST /api/admin/transactions/approve - Approve transaction
- POST /api/admin/transactions/reject - Reject transaction
- GET /api/admin/statistics - Get platform statistics
- PUT /api/admin/settings - Update platform settings

---

## Technical Implementation Details

### Frontend Technologies
- Next.js 15.5 (Pages Router)
- React 18.3
- TypeScript
- Tailwind CSS 3.4
- Shadcn/UI components
- Framer Motion (animations)
- React Hook Form (form handling)
- Zod (validation)

### Backend Technologies
- Supabase (PostgreSQL database)
- Supabase Auth (authentication)
- Supabase Realtime (live updates)
- Next.js API Routes (serverless functions)

### External Services
- Resend (email notifications)
- CoinGecko API (crypto prices - planned)
- SUI Blockchain RPC (transaction verification - planned)

### Deployment
- Vercel (hosting and CI/CD)
- GitHub (version control)
- Environment variables managed in Vercel dashboard

---

## Current Implementation Status

### Completed Features
1. ✅ User authentication (signup, login, logout)
2. ✅ Landing page with SUI price ticker
3. ✅ Trading interface (demo and live)
4. ✅ Dashboard with wallet balances
5. ✅ Package display and purchase flow
6. ✅ Admin dashboard (user management, transaction approval)
7. ✅ Database schema and RLS policies
8. ✅ Multi-wallet system
9. ✅ Transaction history
10. ✅ Basic MLM tree visualization
11. ✅ Prediction markets interface
12. ✅ Profile management
13. ✅ Password reset flow

### In Progress
1. 🔄 Automated ROI clicking system
2. 🔄 Real-time crypto price integration
3. 🔄 MLM commission calculation and distribution
4. 🔄 Star rank system implementation
5. 🔄 P2P transfer functionality
6. 🔄 Trading position management
7. 🔄 Prediction market resolution

### Planned Features
1. 📋 Automated deposit verification via blockchain
2. 📋 Mobile app (React Native)
3. 📋 Advanced analytics dashboard
4. 📋 Automated email notifications
5. 📋 KYC verification system
6. 📋 Two-factor authentication
7. 📋 API for third-party integrations
8. 📋 Advanced referral tracking
9. 📋 Gamification features
10. 📋 Social sharing features

---

## Security Considerations

### Implemented Security Measures
1. ✅ Row Level Security (RLS) on all database tables
2. ✅ JWT-based authentication
3. ✅ Password hashing
4. ✅ SQL injection prevention (parameterized queries)
5. ✅ HTTPS enforcement
6. ✅ Environment variable protection
7. ✅ Admin-only routes protected

### Recommended Enhancements
1. 📋 Rate limiting on API endpoints
2. 📋 IP address blacklisting
3. 📋 Two-factor authentication
4. 📋 Withdrawal confirmation emails
5. 📋 Suspicious activity monitoring
6. 📋 Automated fraud detection
7. 📋 Regular security audits
8. 📋 Backup and disaster recovery plan

---

## Maintenance and Support

### Regular Maintenance Tasks
1. Monitor database performance
2. Review and approve pending transactions
3. Update crypto prices
4. Resolve prediction markets
5. Monitor user activity for fraud
6. Backup database daily
7. Review error logs
8. Update dependencies monthly

### User Support
- Email: support@sui24.trade (to be configured)
- Telegram: @sui24support (to be created)
- FAQ page: In progress
- Video tutorials: Planned

---

## Legal and Compliance

### Disclaimers
1. High-risk investment warning
2. No guaranteed returns
3. Platform fees clearly stated
4. Withdrawal terms and conditions
5. MLM structure disclosure
6. Trading risks disclosure

### Terms of Service
- User agreement required on signup
- Prohibited activities listed
- Account termination conditions
- Dispute resolution process
- Jurisdiction and governing law

### Privacy Policy
- Data collection disclosure
- Data usage and storage
- Third-party sharing policies
- User rights (access, deletion)
- Cookie policy

---

## Conclusion

Sui24.trade is a comprehensive platform combining multiple revenue streams:
- Trading platform (futures and predictions)
- Investment packages with ROI
- MLM networking opportunity
- P2P transfer system

The platform is designed for scalability and includes admin controls for managing all aspects of operations. Current implementation focuses on core functionality with plans for continuous improvement and feature additions.

For technical support or questions, contact the development team through the Softgen platform.

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-24  
**Prepared By:** Softgen AI Development Team