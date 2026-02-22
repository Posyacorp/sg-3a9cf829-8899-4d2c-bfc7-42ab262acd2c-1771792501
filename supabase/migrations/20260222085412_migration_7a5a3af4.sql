-- =====================================================
-- USER PACKAGES (Active Investments)
-- =====================================================

CREATE TABLE user_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES packages(id),
  deposit_amount DECIMAL(20, 2) NOT NULL,
  current_roi_earned DECIMAL(20, 2) DEFAULT 0,
  total_roi_percentage DECIMAL(5, 2) DEFAULT 0,
  max_roi_percentage DECIMAL(5, 2) NOT NULL,
  next_task_time TIMESTAMP WITH TIME ZONE,
  last_task_time TIMESTAMP WITH TIME ZONE,
  tasks_completed INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_completed BOOLEAN DEFAULT false,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE user_packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own packages" ON user_packages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own packages" ON user_packages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own packages" ON user_packages
  FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_packages_user ON user_packages(user_id);
CREATE INDEX idx_user_packages_active ON user_packages(is_active);
CREATE INDEX idx_user_packages_next_task ON user_packages(next_task_time);
CREATE INDEX idx_user_packages_purchased_at ON user_packages(purchased_at DESC);

-- Function to set next task time
CREATE OR REPLACE FUNCTION set_next_task_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.next_task_time IS NULL THEN
    NEW.next_task_time := NOW() + INTERVAL '3 hours';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_next_task_time
  BEFORE INSERT ON user_packages
  FOR EACH ROW
  EXECUTE FUNCTION set_next_task_time();