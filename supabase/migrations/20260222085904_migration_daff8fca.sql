-- =====================================================
-- PREDICTION MARKETS (Polymarket-style)
-- =====================================================
CREATE TABLE IF NOT EXISTS prediction_markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('crypto', 'politics', 'sports', 'entertainment', 'other')),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  resolution_date TIMESTAMP WITH TIME ZONE,
  outcome TEXT CHECK (outcome IN ('yes', 'no', 'cancelled')),
  yes_volume NUMERIC(20, 2) DEFAULT 0,
  no_volume NUMERIC(20, 2) DEFAULT 0,
  total_volume NUMERIC(20, 2) DEFAULT 0,
  yes_probability NUMERIC(5, 2) DEFAULT 50.00,
  no_probability NUMERIC(5, 2) DEFAULT 50.00,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'resolved', 'cancelled')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE prediction_markets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active markets"
  ON prediction_markets FOR SELECT
  USING (status IN ('active', 'closed', 'resolved'));

CREATE POLICY "Admins can manage markets"
  ON prediction_markets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND account_status = 'active'
    )
  );

-- Indexes
CREATE INDEX idx_prediction_markets_status ON prediction_markets(status);
CREATE INDEX idx_prediction_markets_category ON prediction_markets(category);
CREATE INDEX idx_prediction_markets_end_date ON prediction_markets(end_date);
CREATE INDEX idx_prediction_markets_created_at ON prediction_markets(created_at DESC);

-- Trigger
CREATE TRIGGER update_prediction_markets_timestamp
  BEFORE UPDATE ON prediction_markets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();