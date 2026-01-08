-- Diktalo - Master Migration Script v1.0
-- Este script configura la base de datos completa para el nuevo proyecto Supabase.
-- Incluye: Extensiones, Tablas (Profiles, Folders, Recordings), RLS, Disparadores y Storage.

-- =========================================================================
-- 1. CONFIGURACIÓN INICIAL Y EXTENSIONES
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =========================================================================
-- 2. TABLA PROFILES
-- Almacena información de usuario vinculada a Supabase Auth.
-- =========================================================================

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

-- =========================================================================
-- 3. TABLA FOLDERS
-- Organización de grabaciones en carpetas.
-- =========================================================================

create table public.folders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text check (type in ('system', 'user')) default 'user',
  icon text,
  created_at timestamp with time zone default now()
);

-- RLS: Users can only CRUD their own folders
alter table public.folders enable row level security;

create policy "Users can view own folders"
  on public.folders for select
  using ( auth.uid() = user_id );

create policy "Users can insert own folders"
  on public.folders for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own folders"
  on public.folders for update
  using ( auth.uid() = user_id );

create policy "Users can delete own folders"
  on public.folders for delete
  using ( auth.uid() = user_id );

-- =========================================================================
-- 4. TABLA RECORDINGS
-- Almacena metadatos y enlaces a grabaciones.
-- =========================================================================

create table public.recordings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  
  title text not null,
  description text,
  date timestamp with time zone default now(),
  duration text, -- Display string "00:10:00"
  duration_seconds int default 0,
  status text default 'Draft', -- 'Draft', 'Processed', 'Completed'
  audio_url text, -- Supabase Storage URL
  
  -- Metadata
  tags text[],
  participants int default 1,
  -- Foreign Key explícita a folders
  folder_id uuid references public.folders(id) on delete set null,
  
  -- JSON Data for complex structures (mantener vacío por defecto para no pesar)
  notes jsonb default '[]'::jsonb, -- Array of NoteItem
  media jsonb default '[]'::jsonb, -- Array of MediaItem
  segments jsonb default '[]'::jsonb, -- Transcription segments
  summary text,
  
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS: Users can only see their own recordings
alter table public.recordings enable row level security;

create policy "Users can CRUD own recordings"
  on public.recordings for all
  using ( auth.uid() = user_id );

-- =========================================================================
-- 5. ÍNDICES (CRÍTICO PARA PERFORMANCE)
-- =========================================================================

-- Índice compuesto para queries de lista ordenadas por fecha (Dashboard)
CREATE INDEX IF NOT EXISTS idx_recordings_user_id_created_at 
ON public.recordings(user_id, created_at DESC);

-- Índice simple por user_id (Búsquedas generales)
CREATE INDEX IF NOT EXISTS idx_recordings_user_id 
ON public.recordings(user_id);

-- Índice por folder_id (Filtrado por carpetas)
CREATE INDEX IF NOT EXISTS idx_recordings_folder_id 
ON public.recordings(folder_id);

-- Índices similares para folders
CREATE INDEX IF NOT EXISTS idx_folders_user_id 
ON public.folders(user_id);

-- =========================================================================
-- 6. STORAGE
-- Configuración de buckets. NOTA: Los buckets a veces requieren creación manual en UI.
-- Este script inserta en storage.buckets si es posible.
-- =========================================================================

-- Bucket: avatars (Public)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Users can upload their own avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can update their own avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Bucket: recordings (Private)
insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', false)
on conflict (id) do nothing;

create policy "Users can view own recordings file"
  on storage.objects for select
  using ( bucket_id = 'recordings' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can upload own recordings file"
  on storage.objects for insert
  with check ( bucket_id = 'recordings' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can delete own recordings file"
  on storage.objects for delete
  using ( bucket_id = 'recordings' and auth.uid()::text = (storage.foldername(name))[1] );
