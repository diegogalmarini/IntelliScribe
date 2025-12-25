-- =============================================================================
-- DIKTALO ADMIN DASHBOARD - RLS POLICIES
-- =============================================================================
-- Purpose: Grant admin users full access to all tables for CRM/ERP/Support
-- Security: Checks profiles.role = 'admin' before granting access
-- Execute: Run this in Supabase SQL Editor after creating first admin user
-- =============================================================================

-- STEP 1: Create helper function to check if current user is admin
-- This function is SECURITY DEFINER so it runs with elevated privileges
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_admin() IS 'Returns true if the current authenticated user has admin role';


-- STEP 2: PROFILES TABLE - Admin policies
-- Allow admins to view and update ALL user profiles

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (is_admin());

COMMENT ON POLICY "Admins can view all profiles" ON public.profiles IS 'Admins can view any user profile for CRM purposes';

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (is_admin());

COMMENT ON POLICY "Admins can update all profiles" ON public.profiles IS 'Admins can modify user plans, credits, and settings';


-- STEP 3: RECORDINGS TABLE - Admin policies
-- Allow admins to view, update, and delete ALL recordings (Ghost Mode + Support)

CREATE POLICY "Admins can view all recordings"
  ON public.recordings FOR SELECT
  USING (is_admin());

COMMENT ON POLICY "Admins can view all recordings" ON public.recordings IS 'Ghost Mode: Admins can view any user recordings for support debugging';

CREATE POLICY "Admins can update all recordings"
  ON public.recordings FOR UPDATE
  USING (is_admin());

COMMENT ON POLICY "Admins can update all recordings" ON public.recordings IS 'Admins can fix metadata or assist with failed transcriptions';

CREATE POLICY "Admins can delete all recordings"
  ON public.recordings FOR DELETE
  USING (is_admin());

COMMENT ON POLICY "Admins can delete all recordings" ON public.recordings IS 'Admins can remove problematic or abusive content';


-- STEP 4: FOLDERS TABLE - Admin policies (if exists)
-- Allow admins to view all user folders

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'folders') THEN
    EXECUTE 'CREATE POLICY "Admins can view all folders"
      ON public.folders FOR SELECT
      USING (is_admin())';
    
    COMMENT ON POLICY "Admins can view all folders" ON public.folders IS 'Admins can see user folder structures for support';
  END IF;
END $$;


-- STEP 5: STORAGE - Admin access to recordings bucket (optional)
-- Allow admins to view all audio files in storage

CREATE POLICY "Admins can view all recordings in storage"
  ON storage.objects FOR SELECT
  USING (is_admin() AND bucket_id = 'recordings');

COMMENT ON POLICY "Admins can view all recordings in storage" ON storage.objects IS 'Admins can access audio files for support and verification';


-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these after executing the policy creation to verify setup:

-- 1. Test as regular user (should return only own profile)
-- SELECT * FROM profiles WHERE id != auth.uid();
-- Expected: 0 rows or error

-- 2. Test as admin user (should return all profiles)
-- SELECT count(*) FROM profiles;
-- Expected: Total count of all users

-- 3. Verify admin function works
-- SELECT is_admin();
-- Expected: true (if you're admin), false (if regular user)

-- =============================================================================
-- MANUAL ADMIN CREATION
-- =============================================================================
-- To create your first admin user, run this with your email:
--
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'your@email.com';
--
-- Then verify with: SELECT role FROM profiles WHERE email = 'your@email.com';
-- =============================================================================
