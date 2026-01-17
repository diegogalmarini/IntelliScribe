-- Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- Create a table to store recording embeddings
create table if not exists public.recording_embeddings (
  id uuid primary key default uuid_generate_v4(),
  recording_id uuid references public.recordings(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  content text not null, -- The text that was embedded (summary or transcript snippet)
  embedding vector(768), -- Gemini 768 dimensions for text-embedding-004
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.recording_embeddings enable row level security;

-- Create policies for recording_embeddings
create policy "Users can view their own embeddings"
  on public.recording_embeddings for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own embeddings"
  on public.recording_embeddings for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own embeddings"
  on public.recording_embeddings for delete
  using ( auth.uid() = user_id );

-- Function to match recordings based on embedding similarity
create or replace function match_recordings (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
returns table (
  id uuid,
  recording_id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    re.id,
    re.recording_id,
    re.content,
    1 - (re.embedding <=> query_embedding) as similarity
  from recording_embeddings re
  where re.user_id = p_user_id
    and 1 - (re.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;
