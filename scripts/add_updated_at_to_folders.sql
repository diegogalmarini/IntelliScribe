-- Add updated_at column to folders table if it doesn't exist
ALTER TABLE folders 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
