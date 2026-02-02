-- Migration: 20260202_implement_rag_schema.sql
-- Goal: Support Retrieval-Augmented Generation (RAG) for long transcripts

-- 1. Ensure pgvector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the recording_chunks table
CREATE TABLE IF NOT EXISTS public.recording_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recording_id UUID NOT NULL REFERENCES public.recordings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(768), -- Dimension for Google text-embedding-004
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate chunks for the same recording/index
    UNIQUE(recording_id, chunk_index)
);

-- 3. Enable RLS
ALTER TABLE public.recording_chunks ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Users can insert their own chunks"
ON public.recording_chunks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own chunks"
ON public.recording_chunks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own chunks"
ON public.recording_chunks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chunks"
ON public.recording_chunks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_chunks_recording_id ON public.recording_chunks(recording_id);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON public.recording_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 6. Updated Vector Similarity Search Function (Includes Metadata)
CREATE OR REPLACE FUNCTION public.match_recording_chunks (
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT,
  filter_recording_ids UUID[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  recording_id UUID,
  content TEXT,
  similarity FLOAT,
  recording_title TEXT,
  recording_date TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id,
    rc.recording_id,
    rc.content,
    1 - (rc.embedding <=> query_embedding) AS similarity,
    r.title as recording_title,
    r.date as recording_date
  FROM public.recording_chunks rc
  JOIN public.recordings r ON r.id = rc.recording_id
  WHERE (filter_recording_ids IS NULL OR rc.recording_id = ANY(filter_recording_ids))
  AND 1 - (rc.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

