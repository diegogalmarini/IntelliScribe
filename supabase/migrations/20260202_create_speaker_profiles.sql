-- Migration: Create Speaker Profiles table
-- Description: Stores persistent identities for individuals identified in recordings.

-- 0. Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.speaker_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    color TEXT,
    voice_signature VECTOR(768), -- Dimension for Google text-embedding-004 fallback or future voice-to-vec
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.speaker_profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users can manage their own speaker profiles"
    ON public.speaker_profiles
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_speaker_profiles_user_id ON public.speaker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_speaker_profiles_name ON public.speaker_profiles USING gin (name gin_trgm_ops); -- Assuming pg_trgm is enabled
