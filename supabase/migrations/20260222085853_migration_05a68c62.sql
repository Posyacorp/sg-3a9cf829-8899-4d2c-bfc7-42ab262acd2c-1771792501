-- =====================================================
-- TASKS SYSTEM (ROI Claiming)
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_package_id UUID NOT NULL REFERENCES user_packages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_number INTEGER NOT NULL,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  roi_percentage NUMERIC(5, 2),
  roi_amount NUMERIC(20, 2),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'missed', 'donated')),
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_user_package ON tasks(user_package_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_window ON tasks(window_start, window_end);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);