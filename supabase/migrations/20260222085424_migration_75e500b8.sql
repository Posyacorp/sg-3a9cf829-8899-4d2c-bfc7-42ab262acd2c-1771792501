-- =====================================================
-- WALLETS SYSTEM (Multi-Wallet)
-- =====================================================

CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  main_balance DECIMAL(20, 2) DEFAULT 0 CHECK (main_balance >= 0),
  roi_balance DECIMAL(20, 2) DEFAULT 0 CHECK (roi_balance >= 0),
  earning_balance DECIMAL(20, 2) DEFAULT 0 CHECK (earning_balance >= 0),
  p2p_balance DECIMAL(20, 2) DEFAULT 0 CHECK (p2p_balance >= 0),
  locked_balance DECIMAL(20, 2) DEFAULT 0 CHECK (locked_balance >= 0),
  total_deposited DECIMAL(20, 2) DEFAULT 0,
  total_withdrawn DECIMAL(20, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" ON wallets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet" ON wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_wallets_user ON wallets(user_id);

-- Update timestamp trigger
CREATE TRIGGER trigger_update_wallets_timestamp
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to create wallet for new user
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_user_wallet
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_wallet();