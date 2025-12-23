-- Fix FK Constraint: recordings.user_id should reference profiles, not auth.users
-- This resolves the "Key (user_id) is not present in table users" error
-- 
-- Root Cause: The actual database constraint references auth.users, but our 
-- schema file expects it to reference public.profiles. Serverless functions
-- cannot see auth.users due to schema visibility issues.

-- Step 1: Drop the incorrect constraint
ALTER TABLE public.recordings 
DROP CONSTRAINT IF EXISTS recordings_user_id_fkey;

-- Step 2: Add the correct constraint referencing profiles
ALTER TABLE public.recordings 
ADD CONSTRAINT recordings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Verification: Check the new constraint
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='recordings';
