-- ============================================================
-- Migration 003: Authentication, Roles & RLS lock-down
-- ============================================================
-- Adds a profiles table linked to Supabase Auth users with a
-- role (admin / editor / viewer), and tightens Row Level Security
-- so that:
--   * ANYONE (even logged-out) can VIEW data        (SELECT)
--   * Only logged-in staff (admin/editor) can WRITE  (INSERT/UPDATE/DELETE)
--   * Only admins can manage users / roles
--
-- Run this whole file in the Supabase SQL Editor.
-- ============================================================

-- ------------------------------------------------------------
-- 1. profiles table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'viewer'
                CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 2. Helper functions (SECURITY DEFINER avoids recursive RLS
--    when reading the caller's own role from profiles)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Can the caller write data? (admin or editor)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
$$;

-- Is the caller an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ------------------------------------------------------------
-- 3. Auto-create a profile row whenever an auth user is created.
--    Role can be passed via user metadata ("role"); defaults to viewer.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'viewer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- 4. RLS on profiles
-- ------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_self_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_self_or_admin" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

-- Writes to profiles happen via the service-role admin client (bypasses RLS),
-- so no INSERT/UPDATE/DELETE policies are granted to normal users here.

-- ------------------------------------------------------------
-- 5. Lock down data tables: public read, staff-only write
-- ------------------------------------------------------------

-- LANGUAGES ---------------------------------------------------
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on languages" ON public.languages;
DROP POLICY IF EXISTS "languages_public_read"  ON public.languages;
DROP POLICY IF EXISTS "languages_staff_write"  ON public.languages;

CREATE POLICY "languages_public_read" ON public.languages
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

CREATE POLICY "meetings_public_read" ON public.meetings
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

CREATE POLICY "projects_public_read" ON public.projects
  FOR SELECT USING (true);
CREATE POLICY "projects_staff_insert" ON public.projects
  FOR INSERT WITH CHECK (public.is_staff());
CREATE POLICY "projects_staff_update" ON public.projects
  FOR UPDATE USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "projects_staff_delete" ON public.projects
  FOR DELETE USING (public.is_staff());

-- ------------------------------------------------------------
-- 6. Create your FIRST ADMIN
-- ------------------------------------------------------------
-- a) Create a user in Supabase Dashboard → Authentication → Users → "Add user"
--    (set email + password, tick "Auto Confirm User").
-- b) Then run (replace the email):
--
--   UPDATE public.profiles
--   SET role = 'admin'
--   WHERE email = 'your-admin-email@example.com';
--
-- After that, log in with that account inside the app to manage everything.
-- ============================================================
