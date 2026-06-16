-- ============================================================
-- 003b: Re-run RLS policies safely (idempotent)
-- ------------------------------------------------------------
-- Use this if migration 003 failed midway with:
--   ERROR: 42710: policy "..." already exists
-- It drops each policy first, then recreates it, so it can be
-- run any number of times without errors.
--
-- Requires the public.is_staff() function from migration 003
-- (which is created before the policies, so it already exists).
--
-- Paste this whole file into the Supabase SQL Editor and Run.
-- ============================================================

-- LANGUAGES ---------------------------------------------------
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on languages" ON public.languages;
DROP POLICY IF EXISTS "languages_public_read"  ON public.languages;
DROP POLICY IF EXISTS "languages_staff_write"  ON public.languages;
DROP POLICY IF EXISTS "languages_staff_insert" ON public.languages;
DROP POLICY IF EXISTS "languages_staff_update" ON public.languages;
DROP POLICY IF EXISTS "languages_staff_delete" ON public.languages;

CREATE POLICY "languages_public_read"  ON public.languages
  FOR SELECT USING (true);
CREATE POLICY "languages_staff_insert" ON public.languages
  FOR INSERT WITH CHECK (public.is_staff());
CREATE POLICY "languages_staff_update" ON public.languages
  FOR UPDATE USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "languages_staff_delete" ON public.languages
  FOR DELETE USING (public.is_staff());

-- MEETINGS ----------------------------------------------------
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on meetings" ON public.meetings;
DROP POLICY IF EXISTS "meetings_public_read"  ON public.meetings;
DROP POLICY IF EXISTS "meetings_staff_insert" ON public.meetings;
DROP POLICY IF EXISTS "meetings_staff_update" ON public.meetings;
DROP POLICY IF EXISTS "meetings_staff_delete" ON public.meetings;

CREATE POLICY "meetings_public_read"  ON public.meetings
  FOR SELECT USING (true);
CREATE POLICY "meetings_staff_insert" ON public.meetings
  FOR INSERT WITH CHECK (public.is_staff());
CREATE POLICY "meetings_staff_update" ON public.meetings
  FOR UPDATE USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "meetings_staff_delete" ON public.meetings
  FOR DELETE USING (public.is_staff());

-- PROJECTS ----------------------------------------------------
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on projects" ON public.projects;
DROP POLICY IF EXISTS "projects_public_read"  ON public.projects;
DROP POLICY IF EXISTS "projects_staff_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_staff_update" ON public.projects;
DROP POLICY IF EXISTS "projects_staff_delete" ON public.projects;

CREATE POLICY "projects_public_read"  ON public.projects
  FOR SELECT USING (true);
CREATE POLICY "projects_staff_insert" ON public.projects
  FOR INSERT WITH CHECK (public.is_staff());
CREATE POLICY "projects_staff_update" ON public.projects
  FOR UPDATE USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "projects_staff_delete" ON public.projects
  FOR DELETE USING (public.is_staff());

-- ============================================================
-- After this succeeds, make your first admin (replace email):
--
--   UPDATE public.profiles SET role = 'admin'
--   WHERE email = 'your-admin-email@example.com';
--
-- Check it worked:
--   SELECT email, role FROM public.profiles;
-- ============================================================
