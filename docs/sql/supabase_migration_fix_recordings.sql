-- Migration to fix recordings table column names
-- Run this in Supabase SQL Editor if you have old column names

-- Check if old columns exist and rename them
DO $$ 
BEGIN
    -- Rename date_string to date if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recordings' AND column_name = 'date_string'
    ) THEN
        ALTER TABLE public.recordings RENAME COLUMN date_string TO date;
        ALTER TABLE public.recordings ALTER COLUMN date TYPE timestamp with time zone USING date::timestamp with time zone;
    END IF;

    -- Rename duration_formatted to duration if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recordings' AND column_name = 'duration_formatted'
    ) THEN
        ALTER TABLE public.recordings RENAME COLUMN duration_formatted TO duration;
    END IF;

    -- Drop is_local column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recordings' AND column_name = 'is_local'
    ) THEN
        ALTER TABLE public.recordings DROP COLUMN is_local;
    END IF;

    -- Add notes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recordings' AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.recordings ADD COLUMN notes jsonb DEFAULT '[]'::jsonb;
    END IF;

    -- Add media column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recordings' AND column_name = 'media'
    ) THEN
        ALTER TABLE public.recordings ADD COLUMN media jsonb DEFAULT '[]'::jsonb;
    END IF;

    -- Add summary column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recordings' AND column_name = 'summary'
    ) THEN
        ALTER TABLE public.recordings ADD COLUMN summary text;
    END IF;
END $$;
