-- FIX PLAN LIMITS IN DATABASE
-- Run this in Supabase SQL Editor to correct all limits

-- 1. Update Plan Configurations (Official Source of Truth)
UPDATE plans_configuration SET limits = '{"transcription_minutes": 24, "storage_gb": 1}' WHERE id = 'free';
UPDATE plans_configuration SET limits = '{"transcription_minutes": 200, "storage_gb": 10}' WHERE id = 'pro';
UPDATE plans_configuration SET limits = '{"transcription_minutes": 600, "storage_gb": 50}' WHERE id = 'business';
UPDATE plans_configuration SET limits = '{"transcription_minutes": 1200, "storage_gb": 100}' WHERE id = 'business_plus';

-- 2. Fix Existing Users (Remove incorrect 10000 limits)
-- Reset everyone to their plan's correct limit
UPDATE profiles SET minutes_limit = 24 WHERE plan_id = 'free';
UPDATE profiles SET minutes_limit = 200 WHERE plan_id = 'pro';
UPDATE profiles SET minutes_limit = 600 WHERE plan_id = 'business';
UPDATE profiles SET minutes_limit = 1200 WHERE plan_id = 'business_plus';

-- 3. Safety check for older 'basic' or null plans
UPDATE profiles SET minutes_limit = 24 WHERE plan_id IS NULL OR plan_id = 'basic';
