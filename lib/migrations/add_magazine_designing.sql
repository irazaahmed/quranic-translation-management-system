-- Migration: magazine (mgz) "Designing" stage.
--
-- A magazine article has a Designing step that sits BETWEEN Final Formatting
-- (FF) and Final Proofreading (FPR). To keep that order with integer sequence
-- numbers, FPR is renumbered to 9 for magazine items, so the magazine pipeline
-- becomes: TR..FF = 1-7, DSN (Designing) = 8, FPR = 9. Every other content type
-- is unaffected.
--
-- Run this in the Supabase SQL Editor (after add_wsb_sisters_phase.sql).

-- 1) Allow the new stage code on et_stages.
ALTER TABLE et_stages DROP CONSTRAINT IF EXISTS et_stages_stage_check;
ALTER TABLE et_stages ADD CONSTRAINT et_stages_stage_check
  CHECK (stage IN ('TR', 'IF', 'CM', 'ED', 'NR', 'ST', 'FF', 'FPR', 'PIS', 'FFM', 'DSN'));

-- 2) For magazine items, move FPR to seq 9 (Designing takes seq 8).
--    Run this BEFORE inserting Designing so seq 8 is free.
UPDATE et_stages s
SET seq = 9
FROM et_items i
WHERE s.item_id = i.id AND lower(i.type) = 'mgz' AND s.stage = 'FPR';

-- 3) Add the Designing stage (seq 8) to magazine items that don't have it yet.
--    (person / dates start empty; not_applicable / merged take their defaults.)
INSERT INTO et_stages (item_id, stage, seq)
SELECT i.id, 'DSN', 8
FROM et_items i
WHERE lower(i.type) = 'mgz'
  AND NOT EXISTS (SELECT 1 FROM et_stages s WHERE s.item_id = i.id AND s.stage = 'DSN');
