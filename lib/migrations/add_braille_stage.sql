-- Migration: allow the Braille-specific "convert_into_braille" stage.
-- Braille has its own pipeline (no Formation/Designing, plus Convert into Braille):
--   translation -> comparison -> convert_into_braille -> tafteesh -> final_proof_reading
-- Run this in your Supabase SQL Editor AFTER add_stage_progress.sql.

ALTER TABLE stage_progress DROP CONSTRAINT IF EXISTS stage_progress_stage_check;

ALTER TABLE stage_progress ADD CONSTRAINT stage_progress_stage_check
  CHECK (stage IN (
    'translation',
    'comparison',
    'formation',
    'convert_into_braille',
    'tafteesh',
    'designing',
    'final_proof_reading'
  ));
