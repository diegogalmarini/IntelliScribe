-- EMERGENCY PERFORMANCE FIX FOR DIKTALO
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. MANDATORY: Composite index for dashboard list view
-- This covers the exact query: filter by user_id AND sort by created_at
CREATE INDEX IF NOT EXISTS idx_recordings_user_id_created_at_desc 
ON recordings(user_id, created_at DESC);

-- 2. Performance: Index for looking up folder content
CREATE INDEX IF NOT EXISTS idx_recordings_folder_id 
ON recordings(folder_id);

-- 3. Optimization: Slightly better RLS policy (using the index we just made)
-- This ensures the DB uses the user_id index for all filtered queries
DROP POLICY IF EXISTS "Users can CRUD own recordings" ON public.recordings;
CREATE POLICY "Users can CRUD own recordings"
ON public.recordings FOR ALL
USING ( (select auth.uid()) = user_id );

-- 4. DIAGNOSTIC: Check current indexes on the recordings table
SELECT
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    tablename = 'recordings';

-- 5. DIAGNOSTIC: Check count of recordings per user (Identify giant accounts)
-- SELECT user_id, count(*) FROM recordings GROUP BY user_id ORDER BY count DESC LIMIT 10;
