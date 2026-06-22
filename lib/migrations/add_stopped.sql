-- Migration: stopped / skipped projects
-- Some projects get cancelled mid-way (e.g. stopped FOA — Faizan Online Academy
-- work). Marking an item "stopped" removes it from the active lists and
-- reminders, and files it under a "Skipped" view for the record.
--
-- Run this in the Supabase SQL Editor (after the earlier ET migrations).

ALTER TABLE et_items
  ADD COLUMN IF NOT EXISTS stopped BOOLEAN NOT NULL DEFAULT false;
