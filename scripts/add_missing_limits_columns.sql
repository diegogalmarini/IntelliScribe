-- ADD MISSING LIMIT COLUMNS TO PROFILES
-- This ensures 'storage' and 'calls' are tracked per user, as requested.

-- 1. Add columns if not exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS storage_limit INTEGER DEFAULT 0; -- In GB
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS call_limit INTEGER DEFAULT 0;    -- For Dialer

-- 2. Backfill Data based on Plan Configuration Logic (Official Limits)
-- Free: 24 min IA, 0 GB, 0 Calls
UPDATE profiles SET storage_limit = 0, call_limit = 0 WHERE plan_id = 'free';

-- Pro: 300 min IA, 5 GB, 0 Calls
UPDATE profiles SET minutes_limit = 300, storage_limit = 5, call_limit = 0 WHERE plan_id = 'pro';

-- Business: 600 min IA, 20 GB, 0 Calls
UPDATE profiles SET minutes_limit = 600, storage_limit = 20, call_limit = 0 WHERE plan_id = 'business';

-- Business + Call: 800 min IA, 50 GB, 300 Calls
UPDATE profiles SET minutes_limit = 800, storage_limit = 50, call_limit = 300 WHERE plan_id = 'business_plus';

-- 3. Verify Limits in plans_configuration (Ensure they match the UI screenshots)
-- This updates the 'defaults' so the adminService dynamic fetch gets the right values
UPDATE plans_configuration SET limits = '{"transcription_minutes": 24, "storage_gb": 0, "call_minutes": 0}' WHERE id = 'free';
UPDATE plans_configuration SET limits = '{"transcription_minutes": 300, "storage_gb": 5, "call_minutes": 0}' WHERE id = 'pro';
UPDATE plans_configuration SET limits = '{"transcription_minutes": 600, "storage_gb": 20, "call_minutes": 0}' WHERE id = 'business';
UPDATE plans_configuration SET limits = '{"transcription_minutes": 800, "storage_gb": 50, "call_minutes": 300}' WHERE id = 'business_plus';
