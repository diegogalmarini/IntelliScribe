
-- Create system_logs table
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error')),
    message TEXT NOT NULL,
    context JSONB,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    url TEXT
);

-- Enable RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can insert logs (to prevent spam)
CREATE POLICY "Users can insert logs" ON public.system_logs
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Policy: Only service role or project admins can view logs (via Supabase Dash)
-- By default, no one can select if we don't add a policy.
-- If you want to view them from the app with a specific user, add appropriate policy.
