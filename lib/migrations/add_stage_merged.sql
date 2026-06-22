-- Migration: mark pipeline stages as "merged"
-- Some items were split into parts; early stages (e.g. TR, CM) were done on the
-- parts, then the parts were merged into one file, leaving the per-part stages
-- empty. Marking such a stage as "merged" removes it from the active pipeline
-- (like N/A) but labels it clearly as merged rather than skipped.
--
-- Run this in the Supabase SQL Editor (after add_english_translation.sql).

ALTER TABLE et_stages
  ADD COLUMN IF NOT EXISTS merged BOOLEAN NOT NULL DEFAULT false;
