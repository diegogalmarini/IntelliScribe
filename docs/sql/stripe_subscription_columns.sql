-- Migration: Add Stripe subscription columns to profiles table
-- Created: 2025-12-24
-- Purpose: Fix webhook crash - Missing subscription_id column

-- Add Stripe-related columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT DEFAULT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_id ON public.profiles(subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_customer_id ON public.profiles(stripe_customer_id);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.subscription_id IS 'Stripe subscription ID from checkout.session';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Subscription status: active, past_due, canceled, inactive';
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID for billing management';

-- Verify the columns exist
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('subscription_id', 'subscription_status', 'stripe_customer_id');
