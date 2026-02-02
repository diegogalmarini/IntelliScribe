-- Migration: 20260202_create_recording_embeddings.sql
-- Goal: Add recording_embeddings table for whole-recording semantic search
-- Note: This is different from recording_chunks which handles chunked RAG

-- Enable pgvector if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create recording_embeddings table for full-recording embeddings
CREATE TABLE IF NOT EXISTS public.recording_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recording_id UUID NOT NULL UNIQUE REFERENCES public.recordings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT, -- Snippet for debugging (max 2000 chars)
    embedding VECTOR(768), -- Dimension for Google text-embedding-004
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.recording_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own embeddings"
ON public.recording_embeddings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own embeddings"
ON public.recording_embeddings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own embeddings"
ON public.recording_embeddings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own embeddings"
ON public.recording_embeddings FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_embeddings_recording_id ON public.recording_embeddings(recording_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_user_id ON public.recording_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON public.recording_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_recording_embeddings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_recording_embeddings_updated_at
BEFORE UPDATE ON public.recording_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_recording_embeddings_updated_at();
