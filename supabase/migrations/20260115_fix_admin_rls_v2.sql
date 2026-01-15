-- CRITICAL FIX: Admin Panel RLS with Service Role Bypass
-- This migration fixes the "permission denied for table users" error

-- IMPORTANT: The previous migration failed because it tried to access auth.users
-- which is a system table that cannot be accessed in RLS policies.
-- 
-- SOLUTION: We'll use a function with SECURITY DEFINER to bypass RLS for admins

-- 1. Drop ALL old policies (from v1 and any previous attempts)
DROP POLICY IF EXISTS "Owner emergency access to plans" ON public.plans_configuration;
DROP POLICY IF EXISTS "Owner emergency access to settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can read all plans" ON public.plans_configuration;
DROP POLICY IF EXISTS "Admins can update all plans" ON public.plans_configuration;
DROP POLICY IF EXISTS "Admins can insert new plans" ON public.plans_configuration;
DROP POLICY IF EXISTS "Admins can delete plans" ON public.plans_configuration;
DROP POLICY IF EXISTS "Public can view plans" ON public.plans_configuration;
DROP POLICY IF EXISTS "Admins can read app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can update app settings" ON public.app_settings;

-- 2. Create a SECURITY DEFINER function to check if user is admin
-- This bypasses RLS and directly checks the profiles table
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    user_email TEXT;
BEGIN
    -- Get current user's role from profiles
    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = auth.uid();

    -- Emergency admin access by email (hardcoded fallback)
    SELECT email INTO user_email
    FROM public.profiles
    WHERE id = auth.uid();

    -- Return true if user is admin, super_admin, or the owner email
    RETURN (
        user_role IN ('admin', 'super_admin') 
        OR user_email = 'diegogalmarini@gmail.com'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Enable RLS on tables
ALTER TABLE public.plans_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 4. Create simple policies using the SECURITY DEFINER function
-- For plans_configuration
CREATE POLICY "Admins full access to plans"
ON public.plans_configuration
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Public can view plans (for pricing page)
CREATE POLICY "Public can view plans"
ON public.plans_configuration
FOR SELECT
USING (true);

-- For app_settings
CREATE POLICY "Admins full access to settings"
ON public.app_settings
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- 5. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

-- 6. CRITICAL: If the error persists, you may need to DISABLE RLS temporarily
-- Run this ONLY if the above doesn't work:
-- ALTER TABLE public.plans_configuration DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY;

-- VERIFICATION QUERY (run this to test if it works):
-- SELECT public.is_admin_user();
-- Should return TRUE for diegogalmarini@gmail.com
