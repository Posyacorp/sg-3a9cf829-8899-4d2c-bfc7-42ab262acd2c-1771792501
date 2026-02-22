-- =====================================================
-- PACKAGES SYSTEM
-- =====================================================

CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  min_deposit DECIMAL(20, 2) NOT NULL,
  max_roi_percentage DECIMAL(5, 2) NOT NULL,
  daily_roi_limit DECIMAL(5, 2) DEFAULT 10.00,
  task_interval_hours INTEGER DEFAULT 3,
  task_window_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active packages" ON packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage packages" ON packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND account_status = 'active'
    )
  );

-- Insert default packages
INSERT INTO packages (name, min_deposit, max_roi_percentage, sort_order) VALUES
  ('Starter', 30, 220, 1),
  ('Bronze', 100, 230, 2),
  ('Silver', 250, 240, 3),
  ('Gold', 750, 250, 4),
  ('Platinum', 2500, 260, 5),
  ('Diamond', 5000, 270, 6),
  ('Elite', 7500, 280, 7),
  ('Master', 10000, 290, 8),
  ('Legend', 15000, 300, 9);

-- Indexes
CREATE INDEX idx_packages_active ON packages(is_active);
CREATE INDEX idx_packages_sort_order ON packages(sort_order);

-- Update timestamp trigger
CREATE TRIGGER trigger_update_packages_timestamp
  BEFORE UPDATE ON packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();