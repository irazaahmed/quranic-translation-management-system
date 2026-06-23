-- Backfill final_email_date for items whose pipeline is already complete (the
-- last applicable stage has its received-back date) but that have no final email
-- date recorded. We use the latest received-back date across the item's
-- applicable stages as the final-email date, and mark the item completed.
--
-- Setting final_email_date is what makes an item count as "Complete — final
-- email sent" everywhere in the app.

UPDATE et_items i
SET final_email_date = sub.last_back,
    status = 'completed'
FROM (
  SELECT s.item_id,
         MAX(s.received_back_date) AS last_back,
         (ARRAY_AGG(s.received_back_date ORDER BY s.seq DESC))[1] AS last_stage_back
  FROM et_stages s
  WHERE NOT (s.not_applicable OR s.merged)
  GROUP BY s.item_id
) sub
WHERE i.id = sub.item_id
  AND i.final_email_date IS NULL
  AND i.stopped = false
  AND sub.last_stage_back IS NOT NULL;
