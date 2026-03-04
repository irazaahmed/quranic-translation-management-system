-- Migration: Add work_status column to languages table
-- Run this SQL to update your existing Supabase database

-- Add the work_status column with default value and CHECK constraint
ALTER TABLE languages
ADD COLUMN work_status TEXT NOT NULL DEFAULT 'not_started' 
CHECK (work_status IN ('not_started', 'in_progress', 'completed'));

-- Create index for better query performance on work_status
CREATE INDEX IF NOT EXISTS idx_languages_work_status ON languages(work_status);
