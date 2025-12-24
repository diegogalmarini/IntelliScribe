-- Migration: Add storage_limit column to profiles table
-- Created: 2025-12-24
-- Purpose: Support storage enforcement per plan tier

-- Add storage_limit column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS storage_limit BIGINT DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.storage_limit IS 'Storage limit in bytes based on plan (0 for free tier)';

-- Update existing users with correct limits based on current plan
UPDATE public.profiles 
SET storage_limit = CASE 
  WHEN plan_id = 'business_plus' THEN 53687091200  -- 50 GB
  WHEN plan_id = 'business' THEN 21474836480        -- 20 GB
  WHEN plan_id = 'pro' THEN 5368709120              -- 5 GB
  ELSE 0                                             -- Free (retention-based)
END;

-- Verify the column was added and limits applied
SELECT 
  email, 
  plan_id, 
  minutes_limit,
  storage_limit,
  ROUND(storage_limit / 1073741824.0, 2) as storage_gb
FROM public.profiles 
ORDER BY storage_limit DESC
LIMIT 10;
