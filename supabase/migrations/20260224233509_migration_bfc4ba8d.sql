-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (fresh start)
DROP TABLE IF EXISTS prediction_bets CASCADE;
DROP TABLE IF EXISTS predictions CASCADE;
DROP TABLE IF EXISTS commissions CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS user_packages CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES auth.users(id),
  star_rank INTEGER DEFAULT 0,
  team_volume DECIMAL(20, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_admin BOOLEAN DEFAULT false,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create packages table
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  amount DECIMAL(20, 2) NOT NULL,
  roi_percentage DECIMAL(5, 2) NOT NULL,
  max_return_percentage DECIMAL(5, 2) NOT NULL,
  daily_roi_limit DECIMAL(5, 2) DEFAULT 10.00,
  task_interval_hours INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wallets table (4 wallet types)
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_type TEXT NOT NULL CHECK (wallet_type IN ('main', 'roi', 'earning', 'p2p')),
  balance DECIMAL(20, 8) DEFAULT 0,
  locked_balance DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, wallet_type)
);

-- Create user_packages table
CREATE TABLE user_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES packages(id),
  amount_invested DECIMAL(20, 2) NOT NULL,
  total_earned DECIMAL(20, 2) DEFAULT 0,
  max_return DECIMAL(20, 2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  last_task_click TIMESTAMP WITH TIME ZONE,
  next_task_available TIMESTAMP WITH TIME ZONE,
  missed_tasks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create tasks table (ROI clicking history)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_package_id UUID NOT NULL REFERENCES user_packages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_amount DECIMAL(20, 2) NOT NULL,
  reward_percentage DECIMAL(5, 2) NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'missed', 'donated')),
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'package_purchase', 'roi_claim', 'commission', 'p2p_transfer', 'admin_fee', 'withdrawal_tax')),
  from_wallet TEXT,
  to_wallet TEXT,
  amount DECIMAL(20, 8) NOT NULL,
  fee DECIMAL(20, 8) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected', 'cancelled')),
  hash_key TEXT,
  wallet_address TEXT,
  recipient_id UUID REFERENCES auth.users(id),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create commissions table (24-level MLM tracking)
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  commission_type TEXT NOT NULL CHECK (commission_type IN ('roi', 'referral', 'star_rank')),
  level INTEGER NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,
  source_transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create predictions table (Polymarket-style)
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'crypto',
  yes_price DECIMAL(10, 2) DEFAULT 50.00,
  no_price DECIMAL(10, 2) DEFAULT 50.00,
  total_volume DECIMAL(20, 8) DEFAULT 0,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  result TEXT CHECK (result IN ('yes', 'no', 'cancelled')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'resolved')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create prediction_bets table
CREATE TABLE prediction_bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bet_type TEXT NOT NULL CHECK (bet_type IN ('yes', 'no')),
  amount DECIMAL(20, 8) NOT NULL,
  shares DECIMAL(20, 8) NOT NULL,
  entry_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost', 'refunded')),
  payout DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default packages
INSERT INTO packages (name, amount, roi_percentage, max_return_percentage, daily_roi_limit) VALUES
  ('Starter Package', 30, 10, 220, 10),
  ('Bronze Package', 100, 10, 230, 10),
  ('Silver Package', 250, 10, 240, 10),
  ('Gold Package', 750, 10, 250, 10),
  ('Platinum Package', 2500, 10, 260, 10),
  ('Diamond Package', 5000, 10, 270, 10),
  ('Elite Package', 7500, 10, 280, 10),
  ('Master Package', 10000, 10, 290, 10),
  ('Legend Package', 15000, 10, 300, 10);

-- Create indexes for better performance
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX idx_profiles_referred_by ON profiles(referred_by);
CREATE INDEX idx_wallets_user_type ON wallets(user_id, wallet_type);
CREATE INDEX idx_user_packages_user_status ON user_packages(user_id, status);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, transaction_type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_commissions_to_user ON commissions(to_user_id);
CREATE INDEX idx_commissions_from_user ON commissions(from_user_id);
CREATE INDEX idx_prediction_bets_user ON prediction_bets(user_id);
CREATE INDEX idx_prediction_bets_prediction ON prediction_bets(prediction_id);