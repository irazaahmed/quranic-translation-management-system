-- ============================================
-- Multi-Project Support Migration
-- ============================================
-- This script adds project management to QTMS
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. Create projects table
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. Add project_id to languages table
-- ============================================
-- Add the column (nullable initially)
ALTER TABLE languages 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- ============================================
-- 3. Insert default projects
-- ============================================
INSERT INTO projects (id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Kanz ul Irfan', 'Kanz ul Irfan translation project'),
  ('00000000-0000-0000-0000-000000000002', 'Taleem ul Quran', 'Taleem ul Quran translation project'),
  ('00000000-0000-0000-0000-000000000003', 'Sirat ul Jinan', 'Sirat ul Jinan translation project')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. Assign existing languages to Kanz ul Irfan
-- ============================================
UPDATE languages 
SET project_id = '00000000-0000-0000-0000-000000000001'
WHERE project_id IS NULL;

-- ============================================
-- 5. Add index for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_languages_project_id ON languages(project_id);

-- ============================================
-- 6. Make project_id NOT NULL (after data migration)
-- ============================================
ALTER TABLE languages 
ALTER COLUMN project_id SET NOT NULL;

-- ============================================
-- 7. Add foreign key constraint if not exists
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'languages_project_id_fkey'
  ) THEN
    ALTER TABLE languages
    ADD CONSTRAINT languages_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- 8. Update RLS policies for projects table
-- ============================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow all operations on projects (adjust based on your auth needs)
CREATE POLICY "Allow all operations on projects" ON projects
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Verification Queries
-- ============================================
-- Check projects
SELECT * FROM projects;

-- Check languages with project assignment
SELECT l.country, l.language, p.name as project 
FROM languages l 
LEFT JOIN projects p ON l.project_id = p.id;

-- ============================================
-- Rollback Script (if needed)
-- ============================================
-- To rollback, run these commands in order:
-- ALTER TABLE languages DROP CONSTRAINT IF EXISTS languages_project_id_fkey;
-- ALTER TABLE languages DROP COLUMN IF EXISTS project_id;
-- DROP TABLE IF EXISTS projects CASCADE;
