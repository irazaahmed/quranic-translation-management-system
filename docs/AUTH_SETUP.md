# Authentication & Roles — Setup Guide

This app now supports **public viewing** for everyone, while **adding / editing /
deleting** data requires logging in with the right role.

## Roles

| Role     | View | Add / Edit / Delete data | Manage users |
|----------|:----:|:------------------------:|:------------:|
| (not logged in) | ✅ | ❌ | ❌ |
| **Viewer** | ✅ | ❌ | ❌ |
| **Editor** | ✅ | ✅ | ❌ |
| **Admin**  | ✅ | ✅ | ✅ |

## One-time setup

### 1. Add the service-role key to `.env.local`
Supabase Dashboard → **Settings → API → `service_role` secret** → copy it into:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

> This key is server-only and must **never** be exposed to the browser. It is only
> used inside admin-guarded server actions to create/delete auth users.

### 2. Run the database migration
Open Supabase **SQL Editor** and run the whole file:

```
database/migrations/003_auth_and_roles.sql
```

This creates the `profiles` table + roles, a signup trigger, and locks down RLS so
the public can read but only staff can write.

### 3. Create your first admin
1. Supabase Dashboard → **Authentication → Users → Add user**
   - Enter email + password, tick **Auto Confirm User**.
2. Back in **SQL Editor**, run (with your email):

   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
   ```

### 4. Log in
Restart the dev server (`npm run dev`), open the app, click **Login**, and sign in
with the admin account. You'll see a **Manage Users** option in the top-right user
menu — from there you can create Editors/Viewers/Admins without touching SQL again.

## How it's enforced (defense in depth)

1. **Database RLS** — the real boundary. Even with the public anon key, Postgres
   rejects any insert/update/delete unless the request carries a logged-in
   admin/editor session.
2. **Server actions** — every write action calls `requireStaff()` and returns a
   friendly error for viewers.
3. **Proxy (middleware)** — `/admin/*` and create/edit routes redirect non-staff.
4. **UI** — Add/Edit/Delete buttons are hidden from viewers.
