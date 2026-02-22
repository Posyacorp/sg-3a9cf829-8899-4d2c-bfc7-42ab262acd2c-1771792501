-- =====================================================
-- TRANSACTIONS SYSTEM
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'p2p_send', 'p2p_receive', 'package_purchase', 'roi_claim', 'commission', 'admin_fee', 'admin_tax')),
  wallet_type TEXT NOT NULL CHECK (wallet_type IN ('main', 'roi', 'earning', 'p2p')),
  amount NUMERIC(20, 2) NOT NULL CHECK (amount > 0),
  fee NUMERIC(20, 2) DEFAULT 0,
  net_amount NUMERIC(20, 2) NOT NULL,
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  package_id UUID REFERENCES packages(id),
  hash_key TEXT,
  wallet_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_note TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create deposit/p2p transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id AND type IN ('deposit', 'p2p_send'));

CREATE POLICY "Admins can manage all transactions"
  ON transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND account_status = 'active'
    )
  );

-- Indexes
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_from_to ON transactions(from_user_id, to_user_id);

-- Trigger
CREATE TRIGGER update_transactions_timestamp
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();