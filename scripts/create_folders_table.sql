-- 1. Create Folders Table
CREATE TABLE IF NOT EXISTS folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3b82f6', -- Default blue
    icon TEXT DEFAULT 'folder',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add RLS Policies for Folders (Security)
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own folders" 
    ON folders FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own folders" 
    ON folders FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders" 
    ON folders FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders" 
    ON folders FOR DELETE 
    USING (auth.uid() = user_id);

-- 3. Link Recordings to Folders
ALTER TABLE recordings 
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;
