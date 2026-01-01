-- Update Stripe Price IDs for all plans
-- Run this in Supabase SQL Editor

UPDATE plans_configuration
SET 
    stripe_price_id_monthly = 'price_1Sf2awE6uV8OiTn7D4jA0LJR',
    stripe_price_id_annual = 'price_1Sf2doE6uV8OiTn7HQBD2MmP'
WHERE id = 'pro';

UPDATE plans_configuration
SET 
    stripe_price_id_monthly = 'price_1Sf2f1E6uV8OiTn7TF4WHCnn',
    stripe_price_id_annual = 'price_1Sf2g8E6uV8OiTn7gFQkHPHV'
WHERE id = 'business';

UPDATE plans_configuration
SET 
    stripe_price_id_monthly = 'price_1Sf2heE6uV8OiTn7mjopQSI2',
    stripe_price_id_annual = 'price_1Sf2iSE6uV8OiTn7B9jthSqw'
WHERE id = 'business_plus';

-- Verify the update
SELECT id, name, stripe_price_id_monthly, stripe_price_id_annual 
FROM plans_configuration
WHERE id IN ('pro', 'business', 'business_plus');
