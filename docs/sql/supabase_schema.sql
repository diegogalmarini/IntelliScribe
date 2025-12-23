-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
-- Securely stores user data linked to Supabase Auth
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  phone_verified boolean default false,
  role text default 'Member', -- 'Admin', 'Member'
  
  -- Subscription Data
  plan_id text default 'free',
  subscription_status text default 'active',
  current_period_end timestamp with time zone,
  minutes_used int default 0,
  minutes_limit int default 24, -- Free tier limit
  storage_days_limit int default 7,
  
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS: Users can only see/edit their own profile
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Trigger to create profile on Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, avatar_url)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. RECORDINGS TABLE
create table public.recordings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  
  title text not null,
  description text,
  date timestamp with time zone default now(),
  duration text, -- Display string "00:10:00"
  duration_seconds int default 0,
  status text default 'Draft', -- 'Draft', 'Processed'
  audio_url text, -- Supabase Storage URL
  
  -- Metadata
  tags text[],
  participants int default 1,
  folder_id text, -- Can be linked to a folders table later
  
  -- JSON Data for complex structures
  notes jsonb default '[]'::jsonb, -- Array of NoteItem
  media jsonb default '[]'::jsonb, -- Array of MediaItem
  segments jsonb default '[]'::jsonb, -- Transcription segments
  
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS: Users can only see their own recordings
alter table public.recordings enable row level security;

create policy "Users can CRUD own recordings"
  on public.recordings for all
  using ( auth.uid() = user_id );

-- 3. STORAGE BUCKET POLICIES (Run this manually in Storage UI if SQL fails)
-- We assume a bucket named 'recordings' exists.
-- Allow authenticated uploads
-- create policy "Authenticated users can upload recordings"
-- on storage.objects for insert
-- with check ( bucket_id = 'recordings' and auth.role() = 'authenticated' );

-- create policy "Users can view own recordings"
-- on storage.objects for select
-- using ( bucket_id = 'recordings' and auth.uid()::text = (storage.foldername(name))[1] );

-- 4. AVATARS BUCKET POLICIES
-- 1. Crear el bucket 'avatars' si no existe
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Permitir que cualquiera VEA los avatares (público)
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- 3. Permitir que usuarios autenticados SUBAN su propio avatar
create policy "Users can upload their own avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );

-- 4. Permitir que usuarios autenticados ACTUALICEN su propio avatar
create policy "Users can update their own avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );
