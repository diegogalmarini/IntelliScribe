-- Migration to enable RLS on configuration tables
-- Fixes critical vulnerability: "rls_disabled_in_public"

-- Enable Row Level Security for plans_configuration
ALTER TABLE public.plans_configuration ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security for app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
