-- =====================================================
-- PREDICTION TRADES
-- =====================================================
CREATE TABLE IF NOT EXISTS prediction_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_id UUID NOT NULL REFERENCES prediction_markets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prediction TEXT NOT NULL CHECK (prediction IN ('yes', 'no')),
  amount NUMERIC(20, 2) NOT NULL CHECK (amount > 0),
  shares NUMERIC(20, 8) NOT NULL,
  entry_probability NUMERIC(5, 2) NOT NULL,
  payout NUMERIC(20, 2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost', 'cancelled')),
  wallet_type TEXT NOT NULL DEFAULT 'main' CHECK (wallet_type IN ('main', 'roi', 'earning', 'p2p')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies
ALTER TABLE prediction_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trades"
  ON prediction_trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create trades"
  ON prediction_trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_prediction_trades_user ON prediction_trades(user_id);
CREATE INDEX idx_prediction_trades_market ON prediction_trades(market_id);
CREATE INDEX idx_prediction_trades_status ON prediction_trades(status);
CREATE INDEX idx_prediction_trades_created_at ON prediction_trades(created_at DESC);