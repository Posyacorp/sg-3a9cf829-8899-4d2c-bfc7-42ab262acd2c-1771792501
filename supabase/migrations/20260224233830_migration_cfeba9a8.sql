-- Add role column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Fix walletService transaction type issue by creating a view or just updating code? Updating code is better.
-- But let's make sure the column exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'transaction_type') THEN
        ALTER TABLE transactions RENAME COLUMN type TO transaction_type;
    END IF;
END $$;