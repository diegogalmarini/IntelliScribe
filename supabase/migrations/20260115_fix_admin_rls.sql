-- Fix Admin Panel RLS Permissions
-- This migration grants admin users proper permissions to modify plans_configuration table

-- 1. Enable RLS on plans_configuration if not already enabled
ALTER TABLE public.plans_configuration ENABLE ROW LEVEL SECURITY;

-- 2. Create policy to allow admins to SELECT plans (read)
CREATE POLICY "Admins can read all plans"
ON public.plans_configuration FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- 3. Create policy to allow admins to UPDATE plans (write)
CREATE POLICY "Admins can update all plans"
ON public.plans_configuration FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- 4. Create policy to allow admins to INSERT new plans (if needed)
CREATE POLICY "Admins can insert new plans"
ON public.plans_configuration FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- 5. Create policy to allow admins to DELETE plans (if needed)
CREATE POLICY "Admins can delete plans"
ON public.plans_configuration FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- 6. Allow public SELECT access for pricing page (users need to see available plans)
CREATE POLICY "Public can view plans"
ON public.plans_configuration FOR SELECT
TO authenticated, anon
USING (true);

-- 7. Same policies for app_settings table
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read app settings"
ON public.app_settings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can update app settings"
ON public.app_settings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- CRITICAL: Grant emergency access to specific admin email
-- This is a fallback if role-based policies fail
CREATE POLICY "Owner emergency access to plans"
ON public.plans_configuration FOR ALL
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'diegogalmarini@gmail.com'
)
WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'diegogalmarini@gmail.com'
);

CREATE POLICY "Owner emergency access to settings"
ON public.app_settings FOR ALL
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'diegogalmarini@gmail.com'
)
WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'diegogalmarini@gmail.com'
);
