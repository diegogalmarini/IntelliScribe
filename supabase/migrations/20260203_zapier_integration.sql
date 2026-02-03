-- 1. Add configuration columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS zapier_webhook_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS auto_sync_enabled BOOLEAN DEFAULT false;

-- 2. Create table for integration logs (for debugging and transparency)
CREATE TABLE IF NOT EXISTS public.integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recording_id UUID REFERENCES public.recordings(id) ON DELETE CASCADE,
  status TEXT, -- 'success' | 'error'
  payload JSONB,
  response_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS on logs
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Users can only see their own logs
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'integration_logs' 
        AND policyname = 'Users can view own logs'
    ) THEN
        CREATE POLICY "Users can view own logs" ON public.integration_logs
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;
