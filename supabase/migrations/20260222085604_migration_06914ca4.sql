-- =====================================================
-- TRADING SYSTEM (1000x Predictions)
-- =====================================================
CREATE TABLE IF NOT EXISTS trading_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL CHECK (symbol IN ('BTC', 'ETH', 'SUI', 'SOL')),
  direction TEXT NOT NULL CHECK (direction IN ('up', 'down')),
  entry_price DECIMAL(20, 8) NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  leverage INTEGER NOT NULL DEFAULT 1000,
  take_profit DECIMAL(20, 8),
  stop_loss DECIMAL(20, 8),
  exit_price DECIMAL(20, 8),
  profit_loss DECIMAL(20, 8),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'liquidated')),
  is_demo BOOLEAN DEFAULT false,
  auto_close BOOLEAN DEFAULT false,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for trading_positions
ALTER TABLE trading_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own positions"
  ON trading_positions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own positions"
  ON trading_positions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own positions"
  ON trading_positions FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trading_positions_user ON trading_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_positions_status ON trading_positions(status);
CREATE INDEX IF NOT EXISTS idx_trading_positions_symbol ON trading_positions(symbol);