-- Migration: Add usage tracking fields to profiles table
-- File: docs/sql/usage_tracking.sql

-- Add columns for tracking monthly usage
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS minutes_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_reset_date TIMESTAMPTZ DEFAULT (date_trunc('month', now()) + interval '1 month');

-- Create index for faster resets
CREATE INDEX IF NOT EXISTS idx_profiles_usage_reset ON public.profiles(usage_reset_date);

-- Create a simple log table for tracking resets
CREATE TABLE IF NOT EXISTS public.usage_reset_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reset_date TIMESTAMPTZ DEFAULT now(),
  users_affected INTEGER,
  trigger_type TEXT -- 'cron' or 'manual'
);

-- Function to reset monthly usage for all users (Updated with Logging)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  -- Perform the reset
  WITH updated AS (
    UPDATE public.profiles
    SET 
      minutes_used = 0,
      usage_reset_date = usage_reset_date + interval '1 month'
    WHERE usage_reset_date <= now()
    RETURNING id
  )
  SELECT count(*) INTO affected_count FROM updated;

  -- Log the result if anyone was affected
  IF affected_count > 0 THEN
    INSERT INTO public.usage_reset_logs (users_affected, trigger_type)
    VALUES (affected_count, 'cron');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index for logging
CREATE INDEX IF NOT EXISTS idx_usage_reset_logs_date ON public.usage_reset_logs(reset_date);

-- Add comment for documentation
COMMENT ON FUNCTION reset_monthly_usage IS 'Resets minutes_used to 0 for users whose billing cycle has ended. Now includes logging in usage_reset_logs.';

-- Initial data migration: set reset date to first day of next month for existing users
UPDATE public.profiles 
SET usage_reset_date = date_trunc('month', now()) + interval '1 month'
WHERE usage_reset_date IS NULL;
