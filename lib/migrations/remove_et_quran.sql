-- Migration: remove Quran-e-Pak data from the English Translation module.
-- Run this in the Supabase SQL Editor.
--
-- Quran-e-Pak is tracked in the Quranic Translation module, so its items do not
-- belong in the English (et_items) pipeline. This permanently deletes every
-- English work item whose type is 'quran'. The related rows in et_stages and
-- et_returns are removed automatically via their ON DELETE CASCADE foreign keys.
--
-- (Optional) preview what will be deleted first:
--   SELECT id, title, type FROM et_items WHERE lower(type) = 'quran';

DELETE FROM et_items WHERE lower(type) = 'quran';
