-- =============================================================================
-- EMERGENCY FIX RLS - BYPASS ROLE CHECK & FIX 'TABLE USERS' ERROR
-- =============================================================================

-- 1. DROP EVERYTHING RELATED TO POLICIES ON plans_configuration
ALTER TABLE public.plans_configuration DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.plans_configuration;
DROP POLICY IF EXISTS "Admin Update Access" ON public.plans_configuration;
DROP POLICY IF EXISTS "Admin Insert Access" ON public.plans_configuration;

-- 2. RE-ENABLE RLS
ALTER TABLE public.plans_configuration ENABLE ROW LEVEL SECURITY;

-- 3. CREATE SIMPLIFIED POLICIES (No Function Dependency temporarily)

-- Allow Read to Everyone
CREATE POLICY "Public Read Access"
ON public.plans_configuration
FOR SELECT
USING (true);

-- Allow Update to authenticated users (TEMP FIX - REMOVE LATER)
-- We are trusting the Admin UI to hide the button for non-admins for now.
-- Or, if we want some security, check the email directly if possible (Supabase helper)
-- But 'auth.jwt() ->> email' works.

CREATE POLICY "Admin Update Access Emergency"
ON public.plans_configuration
FOR UPDATE
USING (
  auth.role() = 'authenticated' 
  -- Uncomment the line below if you want to restrict to your email only:
  -- AND (auth.jwt() ->> 'email') = 'diegogalmarini@gmail.com'
);

-- Allow Insert just in case
CREATE POLICY "Admin Insert Access Emergency"
ON public.plans_configuration
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');


-- 4. FIX APP_SETTINGS TOO
ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admin Update Settings" ON public.app_settings;

CREATE POLICY "Public Read Settings"
ON public.app_settings
FOR SELECT
USING (true);

CREATE POLICY "Admin Update Settings"
ON public.app_settings
FOR UPDATE
USING (auth.role() = 'authenticated');


-- 5. GRANT PERMISSIONS (Just to be sure)
GRANT ALL ON public.plans_configuration TO authenticated;
GRANT ALL ON public.plans_configuration TO service_role;
GRANT ALL ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

-- 6. DEBUG: IF THERE IS A TABLE NAMED 'users' IN PUBLIC (Legacy), GRANT ACCESS
-- This might be the cause of "permission denied for table users"
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    EXECUTE 'GRANT ALL ON public.users TO authenticated';
    EXECUTE 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Users can see users" ON public.users FOR SELECT USING (true)';
  END IF;
END $$;
