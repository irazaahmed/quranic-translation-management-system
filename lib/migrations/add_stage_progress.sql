-- Migration: Per-language Para/Stage progress tracking
-- Run this SQL in your Supabase SQL Editor.
--
-- Each language (which belongs to a project) progresses the 30 paras of the
-- Quran through 6 sequential stages. For every (language, stage) pair we store
-- how many paras have reached that stage and since when.
--
--   Stages (in pipeline order):
--     translation  ->  comparison  ->  formation  ->  tafteesh
--                  ->  designing   ->  final_proof_reading
--
-- Example (Sirat ul Jinan - English):
--   translation=28, comparison=25, formation=24, tafteesh=22, designing=18, final_proof_reading=9

CREATE TABLE IF NOT EXISTS stage_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN (
    'translation',
    'comparison',
    'formation',
    'tafteesh',
    'designing',
    'final_proof_reading'
  )),
  -- How many paras have completed (reached) this stage. 0..30
  current_para INTEGER NOT NULL DEFAULT 0 CHECK (current_para >= 0 AND current_para <= 30),
  -- When this stage's current para count was last advanced (manual).
  since_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- One row per (language, stage)
  UNIQUE (language_id, stage)
);

CREATE INDEX IF NOT EXISTS idx_stage_progress_language ON stage_progress(language_id);
CREATE INDEX IF NOT EXISTS idx_stage_progress_stage ON stage_progress(stage);

-- Row Level Security — mirror the existing tables (open for now).
ALTER TABLE stage_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on stage_progress" ON stage_progress;
CREATE POLICY "Allow all operations on stage_progress" ON stage_progress
  FOR ALL USING (true) WITH CHECK (true);
