-- Normalize ET holder names so every name is a single, canonical Workforce name.
-- Merges first-name / spelling variants into the matching workforce member,
-- and cleans up non-person "junk" entries. New people (Sagheer, Rafique, …) are
-- added to et_people separately so they can be edited like anyone else.
--
-- Safe to re-run (idempotent): renames match the old variants which no longer
-- exist after the first run; inserts are guarded by NOT EXISTS.

-- ── 1. Merge name variants into existing workforce names ──────────────────────
UPDATE et_stages SET person = 'Ibrar Shafi'        WHERE person = 'Ibrar';
UPDATE et_stages SET person = 'Dawud Hanif'        WHERE person IN ('Dawood', 'dawood');
UPDATE et_stages SET person = 'Wasim Abbas'        WHERE person = 'Wasim';
UPDATE et_stages SET person = 'Waqar Qureshi'      WHERE person = 'Waqar';
UPDATE et_stages SET person = 'Qamar Madani'       WHERE person = 'Qamar';
UPDATE et_stages SET person = 'Mrs. Shazma Ahmed'  WHERE person IN ('Mrs. Shazma', 'Shazma Ahmed');
UPDATE et_stages SET person = 'Jawwad Jamil (USA)' WHERE person IN ('Jawwad Jamil USA', 'Jawwad');
UPDATE et_stages SET person = 'Zameer Ahmed'       WHERE person IN ('Zamir', 'zameer');

-- Apply the same renames to the returns log.
UPDATE et_returns SET person = 'Ibrar Shafi'        WHERE person = 'Ibrar';
UPDATE et_returns SET person = 'Dawud Hanif'        WHERE person IN ('Dawood', 'dawood');
UPDATE et_returns SET person = 'Wasim Abbas'        WHERE person = 'Wasim';
UPDATE et_returns SET person = 'Waqar Qureshi'      WHERE person = 'Waqar';
UPDATE et_returns SET person = 'Qamar Madani'       WHERE person = 'Qamar';
UPDATE et_returns SET person = 'Mrs. Shazma Ahmed'  WHERE person IN ('Mrs. Shazma', 'Shazma Ahmed');
UPDATE et_returns SET person = 'Jawwad Jamil (USA)' WHERE person IN ('Jawwad Jamil USA', 'Jawwad');
UPDATE et_returns SET person = 'Zameer Ahmed'       WHERE person IN ('Zamir', 'zameer');

-- ── 2. Clean up non-person "junk" holder entries ─────────────────────────────
-- "n"  = this stage wasn't needed / no work done → mark the stage Not Applicable.
UPDATE et_stages SET person = NULL, not_applicable = true WHERE person = 'n';
-- "done" = work happened but the person is unknown → keep the work, drop the name.
UPDATE et_stages SET person = NULL WHERE person = 'done';
-- The two descriptive notes ("emailed to Aashir…", "Very old project…") are left as-is.

-- Merge the remaining tail variants / honorific forms.
UPDATE et_stages SET person = 'Ahmed Raza Malawi' WHERE person IN ('Ahmed Raza', 'Ahmed Raza - AI');
UPDATE et_stages SET person = 'Wasim Abbas'        WHERE person IN ('Waseem Bhai', 'Wasim bhai');
UPDATE et_stages SET person = 'Ghulam Shabbir'     WHERE person = 'Ghulam Shabbir c/o Aashir';
UPDATE et_stages SET person = 'Ali Haider'         WHERE person = 'Ali Haider Bhai';
UPDATE et_returns SET person = 'Ahmed Raza Malawi' WHERE person IN ('Ahmed Raza', 'Ahmed Raza - AI');
UPDATE et_returns SET person = 'Wasim Abbas'        WHERE person IN ('Waseem Bhai', 'Wasim bhai');
UPDATE et_returns SET person = 'Ghulam Shabbir'     WHERE person = 'Ghulam Shabbir c/o Aashir';
UPDATE et_returns SET person = 'Ali Haider'         WHERE person = 'Ali Haider Bhai';

-- "DONE" (uppercase) — same as "done": work happened, person unknown → drop name.
UPDATE et_stages SET person = NULL WHERE person = 'DONE';

-- ── 3. Add the remaining real holders to the Workforce ───────────────────────
INSERT INTO et_people (name, active)
SELECT v.name, true
FROM (VALUES
  ('Sagheer'), ('Rafique'), ('Mehmood'), ('Zeeshan'), ('Ghulam Shabbir'),
  ('Hafiz Kalim'), ('Abdul Wasay'), ('Farhan'), ('Sajid'), ('Umar'), ('Ata'),
  ('Bilal Raja'), ('Bilal USA'), ('Abdul Majid'), ('Faraz Ahmed'), ('Asim Fareed'),
  ('Ali Haider'), ('Iqra Furqan'), ('Mahsheed'), ('Syed Owais'), ('Uzma')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM et_people p WHERE p.name = v.name);
