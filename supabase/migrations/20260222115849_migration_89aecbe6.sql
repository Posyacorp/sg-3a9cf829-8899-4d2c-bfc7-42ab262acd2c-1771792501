-- Add username column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);