-- ============================================================
-- 004_meeting_schedule.sql
-- Fortnightly meeting schedule support.
--
-- Adds a weekly "assigned_day" to each language so the schedule
-- (see public/QTMS Record Meeting.png) can be tracked and the app
-- can remind whether each language's weekly meeting happened or not.
--
-- Cadence rule used by the app:
--   * A meeting is expected every 7 days (on the assigned weekday).
--   * If none happens, an escalated reminder shows after 14 days.
--
-- Idempotent: safe to run multiple times.
-- ============================================================

-- 1. Column ---------------------------------------------------
ALTER TABLE public.languages
  ADD COLUMN IF NOT EXISTS assigned_day text;

-- Constrain to weekday names (or NULL = unscheduled)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'languages_assigned_day_check'
  ) THEN
    ALTER TABLE public.languages
      ADD CONSTRAINT languages_assigned_day_check
      CHECK (assigned_day IS NULL OR assigned_day IN
        ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'));
  END IF;
END $$;

-- 2. Backfill from the fortnightly schedule screenshot --------
-- Matches on language + project name (case-insensitive). Any row
-- that does not match stays NULL and can be set from the app UI
-- (Schedule page → "Set day").
UPDATE public.languages l
SET assigned_day = v.day
FROM (VALUES
  ('Arabic',     'Kanz ul Irfan',   'Monday'),
  ('Braille',    'Kanz ul Irfan',   'Monday'),
  ('English',    'Sirat ul Jinan',  'Tuesday'),
  ('English',    'Taleem ul Quran', 'Tuesday'),
  ('French',     'Kanz ul Irfan',   'Tuesday'),
  ('Spanish',    'Kanz ul Irfan',   'Tuesday'),
  ('Tamil',      'Kanz ul Irfan',   'Wednesday'),
  ('Norwegian',  'Kanz ul Irfan',   'Wednesday'),
  ('Italian',    'Kanz ul Irfan',   'Wednesday'),
  ('Kashmiri',   'Kanz ul Irfan',   'Wednesday'),
  ('Punjabi',    'Kanz ul Irfan',   'Wednesday'),
  ('Indonesian', 'Kanz ul Irfan',   'Wednesday'),
  ('Bangla',     'Kanz ul Irfan',   'Thursday'),
  ('Bangla',     'Taleem ul Quran', 'Thursday'),
  ('Pashto',     'Taleem ul Quran', 'Thursday'),
  ('Portuguese', 'Taleem ul Quran', 'Thursday'),
  ('Portuguese', 'Kanz ul Irfan',   'Thursday'),
  ('Persian',    'Kanz ul Irfan',   'Thursday'),
  ('Sindhi',     'Taleem ul Quran', 'Friday'),
  ('Chinese',    'Kanz ul Irfan',   'Friday'),
  ('Brahui',     'Kanz ul Irfan',   'Friday'),
  ('German',     'Kanz ul Irfan',   'Saturday'),
  ('Swedish',    'Kanz ul Irfan',   'Saturday'),
  ('Turkish',    'Kanz ul Irfan',   'Saturday'),
  ('Swahili',    'Kanz ul Irfan',   'Saturday')
) AS v(language, project, day)
WHERE lower(l.language) = lower(v.language)
  AND l.project_id IN (
    SELECT id FROM public.projects WHERE lower(name) = lower(v.project)
  );

-- 3. Index for schedule queries -------------------------------
CREATE INDEX IF NOT EXISTS idx_languages_assigned_day
  ON public.languages(assigned_day);
