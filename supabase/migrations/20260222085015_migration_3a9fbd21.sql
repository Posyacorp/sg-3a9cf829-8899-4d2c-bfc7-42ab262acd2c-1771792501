-- =====================================================
-- USERS & AUTHENTICATION EXTENDED
-- =====================================================

-- Extend profiles table with platform-specific fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'master_admin'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS star_rank integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_volume numeric DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_earned numeric DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_deposited numeric DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_withdrawn numeric DEFAULT 0;

-- Create index for referral lookups
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- =====================================================
-- PACKAGES CONFIGURATION
-- =====================================================

CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  min_investment numeric NOT NULL,
  max_roi_percentage numeric NOT NULL,
  daily_roi_limit numeric DEFAULT 10,
  task_interval_hours integer DEFAULT 3,
  task_window_minutes integer DEFAULT 30,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for packages
CREATE POLICY "Anyone can view active packages" ON packages FOR SELECT USING (is_active = true);
CREATE POLICY "Only admins can manage packages" ON packages FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
);

-- Insert default packages
INSERT INTO packages (name, min_investment, max_roi_percentage, sort_order) VALUES
  ('Starter Package', 30, 220, 1),
  ('Bronze Package', 100, 230, 2),
  ('Silver Package', 250, 240, 3),
  ('Gold Package', 750, 250, 4),
  ('Platinum Package', 2500, 260, 5),
  ('Diamond Package', 5000, 270, 6),
  ('Elite Package', 7500, 280, 7),
  ('Master Package', 10000, 290, 8),
  ('Legend Package', 15000, 300, 9)
ON CONFLICT DO NOTHING;

-- =====================================================
-- USER PACKAGES (ACTIVE INVESTMENTS)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES packages(id),
  investment_amount numeric NOT NULL,
  total_roi_earned numeric DEFAULT 0,
  roi_percentage_earned numeric DEFAULT 0,
  max_roi_percentage numeric NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'locked')),
  last_claim_at timestamptz,
  next_claim_at timestamptz,
  claims_count integer DEFAULT 0,
  missed_claims integer DEFAULT 0,
  purchased_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own packages" ON user_packages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own packages" ON user_packages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all packages" ON user_packages FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_packages_user_id ON user_packages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_packages_status ON user_packages(status);
CREATE INDEX IF NOT EXISTS idx_user_packages_next_claim ON user_packages(next_claim_at);

-- =====================================================
-- WALLETS (MULTI-WALLET SYSTEM)
-- =====================================================

CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  main_balance numeric DEFAULT 0,
  roi_balance numeric DEFAULT 0,
  earning_balance numeric DEFAULT 0,
  p2p_balance numeric DEFAULT 0,
  locked_balance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own wallet" ON wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all wallets" ON wallets FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

-- =====================================================
-- TRANSACTIONS (ALL PLATFORM TRANSACTIONS)
-- =====================================================

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'package_purchase', 'roi_claim', 'commission', 'p2p_transfer', 'admin_fee', 'withdrawal_tax')),
  amount numeric NOT NULL,
  wallet_type text CHECK (wallet_type IN ('main', 'roi', 'earning', 'p2p')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected', 'failed')),
  from_wallet text,
  to_wallet text,
  recipient_id uuid REFERENCES profiles(id),
  hash_key text,
  wallet_address text,
  description text,
  admin_notes text,
  fee_amount numeric DEFAULT 0,
  net_amount numeric,
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (
  auth.uid() = user_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users can insert their own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
);
CREATE POLICY "Admins can update transactions" ON transactions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- =====================================================
-- MLM COMMISSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS mlm_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level integer NOT NULL CHECK (level >= 1 AND level <= 24),
  commission_type text NOT NULL CHECK (commission_type IN ('roi', 'deposit', 'star_rank')),
  base_amount numeric NOT NULL,
  commission_rate numeric NOT NULL,
  commission_amount numeric NOT NULL,
  package_id uuid REFERENCES packages(id),
  transaction_id uuid REFERENCES transactions(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE mlm_commissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own commissions" ON mlm_commissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all commissions" ON mlm_commissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mlm_commissions_user_id ON mlm_commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_commissions_from_user ON mlm_commissions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_commissions_level ON mlm_commissions(level);