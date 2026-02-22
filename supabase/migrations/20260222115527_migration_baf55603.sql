-- Create platform settings table for wallet addresses
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view/modify settings
CREATE POLICY "Only admins can manage settings" ON platform_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert wallet addresses
INSERT INTO platform_settings (setting_key, setting_value)
VALUES 
  ('main_deposit_wallet', '0xf57c83c39866238fe4860ef426426d170c3b6f6b'),
  ('admin_secret_wallet', '0xe7da79a7fea4ea3c8656c6d647a6bc31752d72c7')
ON CONFLICT (setting_key) DO UPDATE 
SET setting_value = EXCLUDED.setting_value, updated_at = NOW();