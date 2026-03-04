-- Quranic Translation Manager - Database Schema
-- Language Meeting Notes Manager
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- NEW SCHEMA: Language Meeting Notes Manager
-- ============================================

-- Table 1: languages
-- Stores the list of languages being managed with metadata
CREATE TABLE IF NOT EXISTS languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country TEXT NOT NULL,
  language TEXT NOT NULL,
  responsible_person TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  last_meeting_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: meetings
-- Stores individual meeting records with notes, participants, and action items
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_type TEXT,
  participants TEXT,
  discussion_points TEXT,
  translation_progress TEXT,
  progress_percentage INTEGER CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  action_items TEXT,
  next_meeting_date TIMESTAMP WITH TIME ZONE,
  meeting_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
-- Languages indexes
CREATE INDEX IF NOT EXISTS idx_languages_country ON languages(country);
CREATE INDEX IF NOT EXISTS idx_languages_language ON languages(language);
CREATE INDEX IF NOT EXISTS idx_languages_priority ON languages(priority);
CREATE INDEX IF NOT EXISTS idx_languages_last_meeting ON languages(last_meeting_at);
CREATE INDEX IF NOT EXISTS idx_languages_created_at ON languages(created_at);

-- Meetings indexes
CREATE INDEX IF NOT EXISTS idx_meetings_language_id ON meetings(language_id);
CREATE INDEX IF NOT EXISTS idx_meetings_meeting_date ON meetings(meeting_date DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_meeting_type ON meetings(meeting_type);
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON meetings(created_at);

-- Composite index for efficient language meeting history queries
CREATE INDEX IF NOT EXISTS idx_meetings_language_date ON meetings(language_id, meeting_date DESC);

-- ============================================
-- TRIGGER: Auto-update languages.last_meeting_at
-- ============================================

-- Function to update last_meeting_at when meetings are inserted/updated/deleted
CREATE OR REPLACE FUNCTION update_last_meeting_at()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE languages 
    SET last_meeting_at = NEW.meeting_date,
        updated_at = NOW()
    WHERE id = NEW.language_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update to the previous meeting date
    UPDATE languages 
    SET last_meeting_at = (
      SELECT MAX(meeting_date) 
      FROM meetings 
      WHERE language_id = OLD.language_id
    ),
    updated_at = NOW()
    WHERE id = OLD.language_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger on meetings table
DROP TRIGGER IF EXISTS trg_update_last_meeting_at ON meetings;
CREATE TRIGGER trg_update_last_meeting_at
AFTER INSERT OR UPDATE OR DELETE ON meetings
FOR EACH ROW EXECUTE FUNCTION update_last_meeting_at();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on both tables
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Languages policies (allow all operations for now - customize based on your auth needs)
CREATE POLICY "Allow all operations on languages" ON languages
  FOR ALL USING (true) WITH CHECK (true);

-- Meetings policies
CREATE POLICY "Allow all operations on meetings" ON meetings
  FOR ALL USING (true) WITH CHECK (true);
