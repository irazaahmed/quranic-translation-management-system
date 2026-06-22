-- Migration: final email date on items
-- When the final email has been sent, the item is COMPLETE — even if some
-- pipeline stage was skipped/left empty (e.g. FPR not done but the file was
-- still emailed out).
--
-- Run this in the Supabase SQL Editor (after the earlier ET migrations).

ALTER TABLE et_items
  ADD COLUMN IF NOT EXISTS final_email_date DATE;
