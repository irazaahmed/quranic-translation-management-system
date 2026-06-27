-- Migration: per-person planned work queue (managing board).
-- Run this in the Supabase SQL Editor.
--
-- Lets a manager note, for each workforce member, which items (books/work) they
-- are lined up to do and in what order — e.g. "right now on this book, next this
-- book for Translation". Each row links a workforce person to an existing item,
-- with an optional free-text note (the work/instruction), an ordering position,
-- and a done flag. It does NOT touch the pipeline or stages.

CREATE TABLE IF NOT EXISTS et_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES et_people(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES et_items(id) ON DELETE CASCADE,
  -- Optional note of what work / instruction (free text).
  note TEXT,
  -- Lower position = sooner in the queue (0 = next up / current plan).
  position INTEGER NOT NULL DEFAULT 0,
  done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_et_assignments_person ON et_assignments(person_id);
CREATE INDEX IF NOT EXISTS idx_et_assignments_item ON et_assignments(item_id);

ALTER TABLE et_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on et_assignments" ON et_assignments;
CREATE POLICY "Allow all on et_assignments" ON et_assignments FOR ALL USING (true) WITH CHECK (true);
