-- One-off backfill: wsb items that were already completed (first final email
-- already sent) should also count as complete under the new sisters-phase logic,
-- since they were all sent before this feature existed. Set the second final
-- email to the first one's date. In-progress / pending wsb items (no first
-- final email yet) are deliberately left untouched.

UPDATE et_items
SET final_email_date_2 = final_email_date,
    status = 'completed'
WHERE lower(type) = 'wsb'
  AND final_email_date IS NOT NULL
  AND final_email_date_2 IS NULL
  AND stopped = false;
