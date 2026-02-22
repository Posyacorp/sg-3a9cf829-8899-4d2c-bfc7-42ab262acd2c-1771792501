-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'master_admin')
    )
  );

-- Create or replace wallet balance update function
CREATE OR REPLACE FUNCTION update_wallet_balance(
  p_user_id UUID,
  p_wallet_type TEXT,
  p_amount NUMERIC
) RETURNS VOID AS $$
BEGIN
  IF p_wallet_type = 'main_wallet' THEN
    UPDATE wallets SET main_balance = main_balance + p_amount WHERE user_id = p_user_id;
  ELSIF p_wallet_type = 'roi_wallet' THEN
    UPDATE wallets SET roi_balance = roi_balance + p_amount WHERE user_id = p_user_id;
  ELSIF p_wallet_type = 'earning_wallet' THEN
    UPDATE wallets SET earning_balance = earning_balance + p_amount WHERE user_id = p_user_id;
  ELSIF p_wallet_type = 'p2p_wallet' THEN
    UPDATE wallets SET p2p_balance = p2p_balance + p_amount WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;