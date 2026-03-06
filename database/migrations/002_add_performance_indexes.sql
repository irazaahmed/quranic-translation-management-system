-- ============================================
-- Performance Indexes for QTMS
-- ============================================
-- These indexes optimize frequent queries used by the dashboard and reports
-- Run this in your Supabase SQL Editor

-- ============================================
-- Languages Table Indexes
-- ============================================

-- Index for filtering by work_status (used in dashboard for stale/urgent languages)
CREATE INDEX IF NOT EXISTS idx_languages_work_status 
ON languages(work_status);

-- Index for filtering by priority (used in dashboard for high priority languages)
CREATE INDEX IF NOT EXISTS idx_languages_priority 
ON languages(priority);

-- Index for filtering by last_meeting_at (used in dashboard for stale languages)
CREATE INDEX IF NOT EXISTS idx_languages_last_meeting_at 
ON languages(last_meeting_at);

-- Composite index for work_status + last_meeting_at (used together in dashboard queries)
CREATE INDEX IF NOT EXISTS idx_languages_status_last_meeting 
ON languages(work_status, last_meeting_at);

-- Index for sorting by language name (used in language list)
CREATE INDEX IF NOT EXISTS idx_languages_language_name 
ON languages(language);

-- ============================================
-- Meetings Table Indexes
-- ============================================

-- Index for filtering by language_id (used in all meeting lookups)
CREATE INDEX IF NOT EXISTS idx_meetings_language_id 
ON meetings(language_id);

-- Index for sorting by meeting_date (used in recent meetings, reports)
CREATE INDEX IF NOT EXISTS idx_meetings_meeting_date_desc 
ON meetings(meeting_date DESC);

-- Index for filtering meetings by date range (used in weekly/monthly reports)
CREATE INDEX IF NOT EXISTS idx_meetings_meeting_date 
ON meetings(meeting_date);

-- Composite index for language_id + meeting_date (used together in language detail pages)
CREATE INDEX IF NOT EXISTS idx_meetings_language_date 
ON meetings(language_id, meeting_date DESC);

-- ============================================
-- Projects Table Indexes
-- ============================================

-- Index for filtering languages by project_id (used in project stats)
CREATE INDEX IF NOT EXISTS idx_languages_project_id 
ON languages(project_id);

-- ============================================
-- Daily Updates Table Indexes
-- ============================================

-- Index for filtering by project_id (used in daily updates by project)
CREATE INDEX IF NOT EXISTS idx_daily_updates_project_id 
ON daily_updates(project_id);

-- Index for sorting by update_date (used in recent updates)
CREATE INDEX IF NOT EXISTS idx_daily_updates_update_date_desc 
ON daily_updates(update_date DESC);

-- Composite index for project_id + update_date (used together)
CREATE INDEX IF NOT EXISTS idx_daily_updates_project_date 
ON daily_updates(project_id, update_date DESC);

-- ============================================
-- Verification Queries
-- ============================================

-- List all indexes for languages table
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'languages' 
ORDER BY indexname;

-- List all indexes for meetings table
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'meetings' 
ORDER BY indexname;

-- List all indexes for projects table
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'projects' 
ORDER BY indexname;

-- ============================================
-- Notes
-- ============================================
-- 
-- These indexes optimize the following queries:
-- 1. Dashboard stats: work_status, last_meeting_at filters
-- 2. Recent meetings: meeting_date DESC + language_id join
-- 3. Language list: language name sorting
-- 4. Project stats: project_id + language joins
-- 5. Reports: date range filtering on meetings
--
-- Index maintenance:
-- PostgreSQL automatically maintains indexes, but you can reindex if needed:
-- REINDEX TABLE languages;
-- REINDEX TABLE meetings;
-- REINDEX TABLE projects;
