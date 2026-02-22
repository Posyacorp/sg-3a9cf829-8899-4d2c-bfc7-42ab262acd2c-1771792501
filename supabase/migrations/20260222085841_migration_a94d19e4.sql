-- =====================================================
-- MLM COMMISSIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS mlm_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('roi_commission', 'referral_commission', 'rank_bonus')),
  level INTEGER CHECK (level >= 1 AND level <= 24),
  commission_percentage NUMERIC(5, 2) NOT NULL,
  base_amount NUMERIC(20, 2) NOT NULL,
  commission_amount NUMERIC(20, 2) NOT NULL,
  package_id UUID REFERENCES packages(id),
  user_package_id UUID REFERENCES user_packages(id),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE mlm_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their commissions"
  ON mlm_commissions FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_mlm_commissions_user ON mlm_commissions(user_id);
CREATE INDEX idx_mlm_commissions_from_user ON mlm_commissions(from_user_id);
CREATE INDEX idx_mlm_commissions_level ON mlm_commissions(level);
CREATE INDEX idx_mlm_commissions_type ON mlm_commissions(type);
CREATE INDEX idx_mlm_commissions_created_at ON mlm_commissions(created_at DESC);