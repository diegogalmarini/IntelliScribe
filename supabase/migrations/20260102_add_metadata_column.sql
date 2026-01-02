-- Add metadata column to recordings table for storing temporal info (and future flexibility)
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Comment on column
COMMENT ON COLUMN recordings.metadata IS 'Stores additional metadata like temporal segments, Multi-Audio source info, etc.';
