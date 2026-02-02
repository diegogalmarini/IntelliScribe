-- Add language column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'es';

-- Add comment
COMMENT ON COLUMN profiles.language IS 'User preferred language: es or en';

-- Update existing users to Spanish (default for Diktalo)
UPDATE profiles 
SET language = 'es' 
WHERE language IS NULL;
