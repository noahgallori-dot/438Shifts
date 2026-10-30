-- ============================================================================
-- 438 SHIFTS • SUPABASE DATABASE SETUP SCRIPT
-- Run this once in your Supabase Dashboard -> SQL Editor -> New Query
-- Project URL: https://pxykvlbsnccjaghskqco.supabase.co
-- ============================================================================

-- 1. Create the Shifts table
CREATE TABLE IF NOT EXISTS public.shifts (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'open',
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT DEFAULT '',
  author_phone TEXT NOT NULL,
  author_level INTEGER NOT NULL DEFAULT 1,
  author_avatar TEXT DEFAULT '👨‍🍳',
  author_avatar_bg TEXT DEFAULT '#FFE8E6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the Associates Roster table (remembers profiles across devices)
CREATE TABLE IF NOT EXISTS public.associates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  avatar TEXT DEFAULT '👨‍🍳',
  avatar_bg TEXT DEFAULT '#FFE8E6',
  email_verified BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  device JSONB DEFAULT '{}'::jsonb
);

-- 3. Enable Row Level Security (RLS) with public access policies for the publishable key
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.associates ENABLE ROW LEVEL SECURITY;

-- Allow read/insert/update/delete on shifts for all clients using the publishable key
DROP POLICY IF EXISTS "Public shifts access" ON public.shifts;
CREATE POLICY "Public shifts access"
  ON public.shifts
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow read/insert/update/delete on associates for all clients using the publishable key
DROP POLICY IF EXISTS "Public associates access" ON public.associates;
CREATE POLICY "Public associates access"
  ON public.associates
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Enable Realtime so shift changes and deletions sync instantly across devices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'shifts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shifts;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'associates'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.associates;
  END IF;
END $$;

