-- =====================================================
-- MLM NETWORK STRUCTURE (24 Levels)
-- =====================================================
CREATE TABLE IF NOT EXISTS mlm_network (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sponsor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 24),
  path TEXT NOT NULL, -- Materialized path: '/{sponsor1}/{sponsor2}/.../{user_id}/'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, sponsor_id, level)
);

-- RLS Policies
ALTER TABLE mlm_network ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their network"
  ON mlm_network FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = sponsor_id);

CREATE POLICY "System can insert network records"
  ON mlm_network FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_mlm_network_user ON mlm_network(user_id);
CREATE INDEX idx_mlm_network_sponsor ON mlm_network(sponsor_id);
CREATE INDEX idx_mlm_network_level ON mlm_network(level);
CREATE INDEX idx_mlm_network_path ON mlm_network USING gin(path gin_trgm_ops);

-- Trigger
CREATE TRIGGER update_mlm_network_timestamp
  BEFORE UPDATE ON mlm_network
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to build MLM network when user joins
CREATE OR REPLACE FUNCTION build_mlm_network()
RETURNS TRIGGER AS $$
DECLARE
  sponsor_user_id UUID;
  current_level INTEGER := 1;
  current_path TEXT;
  upline_record RECORD;
BEGIN
  -- Get the sponsor (referred_by)
  sponsor_user_id := NEW.referred_by;
  
  IF sponsor_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Start building the path
  current_path := '/' || NEW.id::TEXT || '/';

  -- Insert direct sponsor (Level 1)
  INSERT INTO mlm_network (user_id, sponsor_id, level, path)
  VALUES (NEW.id, sponsor_user_id, 1, '/' || sponsor_user_id::TEXT || current_path);

  -- Build up to 24 levels
  FOR upline_record IN
    SELECT sponsor_id, level
    FROM mlm_network
    WHERE user_id = sponsor_user_id
    ORDER BY level ASC
    LIMIT 23
  LOOP
    current_level := upline_record.level + 1;
    
    INSERT INTO mlm_network (user_id, sponsor_id, level, path)
    VALUES (NEW.id, upline_record.sponsor_id, current_level, '/' || upline_record.sponsor_id::TEXT || current_path)
    ON CONFLICT DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-build MLM network
CREATE TRIGGER trigger_build_mlm_network
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION build_mlm_network();