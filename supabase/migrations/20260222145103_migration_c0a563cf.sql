-- Create filter_presets table for saving custom filter combinations
CREATE TABLE IF NOT EXISTS filter_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  preset_name TEXT NOT NULL,
  filters JSONB NOT NULL, -- Store filter configuration as JSON
  is_public BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false, -- Mark as default preset for user
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_filter_presets_user_id ON filter_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_filter_presets_public ON filter_presets(is_public) WHERE is_public = true;

-- Enable RLS
ALTER TABLE filter_presets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own presets" ON filter_presets 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public presets" ON filter_presets 
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own presets" ON filter_presets 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presets" ON filter_presets 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presets" ON filter_presets 
  FOR DELETE USING (auth.uid() = user_id);

-- Create some default public presets for admins
INSERT INTO filter_presets (user_id, preset_name, filters, is_public) VALUES
  ((SELECT id FROM profiles WHERE email = 'admin@sui24.trade' LIMIT 1), 
   'High Value Users', 
   '{"sortBy":"current_balance","sortOrder":"desc","statusFilter":"active"}', 
   true),
  ((SELECT id FROM profiles WHERE email = 'admin@sui24.trade' LIMIT 1), 
   'Pending KYC', 
   '{"kycFilter":"pending","sortBy":"created_at","sortOrder":"desc"}', 
   true),
  ((SELECT id FROM profiles WHERE email = 'admin@sui24.trade' LIMIT 1), 
   'Top Earners This Month', 
   '{"dateRangeFilter":"this_month","sortBy":"total_earnings","sortOrder":"desc"}', 
   true),
  ((SELECT id FROM profiles WHERE email = 'admin@sui24.trade' LIMIT 1), 
   'Star 5+ Leaders', 
   '{"rankFilter":"5","sortBy":"team_volume","sortOrder":"desc"}', 
   true),
  ((SELECT id FROM profiles WHERE email = 'admin@sui24.trade' LIMIT 1), 
   'Recent Signups', 
   '{"dateRangeFilter":"this_week","sortBy":"created_at","sortOrder":"desc"}', 
   true),
  ((SELECT id FROM profiles WHERE email = 'admin@sui24.trade' LIMIT 1), 
   'Suspended Accounts', 
   '{"statusFilter":"suspended","sortBy":"created_at","sortOrder":"desc"}', 
   true)
ON CONFLICT DO NOTHING;