-- Migration: Add usage tracking fields to profiles table
-- File: docs/sql/usage_tracking.sql

-- Add columns for tracking monthly usage
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS minutes_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_reset_date TIMESTAMPTZ DEFAULT (date_trunc('month', now()) + interval '1 month');

-- Create index for faster resets
CREATE INDEX IF NOT EXISTS idx_profiles_usage_reset ON public.profiles(usage_reset_date);

-- Function to reset monthly usage for all users
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET 
    minutes_used = 0,
    usage_reset_date = usage_reset_date + interval '1 month'
  WHERE usage_reset_date <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION reset_monthly_usage IS 'Resets minutes_used to 0 for users whose billing cycle has ended. Run this daily with: SELECT reset_monthly_usage();';

-- Initial data migration: set reset date to first day of next month for existing users
UPDATE public.profiles 
SET usage_reset_date = date_trunc('month', now()) + interval '1 month'
WHERE usage_reset_date IS NULL;
