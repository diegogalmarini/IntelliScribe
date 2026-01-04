-- Note: valid for Supabase SQL Editor execution
-- We assume RLS is already enabled on storage.objects (default in Supabase).
-- We do NOT run 'ALTER TABLE storage.objects ENABLE RLS' because it requires superuser execution.

-- 1. Drop existing policies to prevent conflicts if re-running
DROP POLICY IF EXISTS "Allow authenticated uploads to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads from own folder" ON storage.objects;

-- 2. Create INSERT Policy (Write Access)
-- Allow users to upload ONLY to their own folder: recordings/{userId}/*
CREATE POLICY "Allow authenticated uploads to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recordings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Create SELECT Policy (Read Access)
-- Allow users to read ONLY from their own folder
CREATE POLICY "Allow authenticated reads from own folder"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'recordings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Note: We use (storage.foldername(name))[1] for robustness, but 'name LIKE auth.uid() || "/%"' also works.
