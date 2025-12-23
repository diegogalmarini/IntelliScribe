-- 1. Create a composite index to optimize the dashboard query (fetch for specific user ordered by date)
CREATE INDEX IF NOT EXISTS idx_recordings_user_id_created_at 
ON recordings(user_id, created_at DESC);

-- 2. Optional: Check for unusually large recordings that might be causing row-size issues
-- This queries the internal storage size of the segments column
-- SELECT id, pg_column_size(segments) as segments_size 
-- FROM recordings 
-- ORDER BY segments_size DESC 
-- LIMIT 5;

-- 3. Optional: Cleanup any recordings with massive base64 in description or segments if they exist
-- (Only run if you suspect corrupted/giant rows are bloating the user's data)
-- DELETE FROM recordings WHERE user_id = 'YOUR_USER_ID' AND (length(description) > 1000000 OR pg_column_size(segments) > 5000000);
