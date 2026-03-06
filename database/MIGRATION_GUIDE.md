# Multi-Project Migration Guide

This document explains how to migrate your QTMS database to support multiple translation projects.

## Overview

The multi-project extension adds:
- A new `projects` table to manage translation projects
- A `project_id` foreign key in the `languages` table
- Three default projects: **Kanz ul Irfan**, **Taleem ul Quran**, and **Sirat ul Jinan**
- Automatic assignment of existing languages to "Kanz ul Irfan"

## Database Schema

### Projects Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Project name (unique) |
| description | TEXT | Project description |
| created_at | TIMESTAMP | Creation timestamp |

**Note:** The `projects` table does NOT have an `updated_at` column.

### Languages Table (Modified)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| country | TEXT | Country name |
| language | TEXT | Language name |
| responsible_person | TEXT | Person responsible |
| priority | TEXT | low/medium/high |
| work_status | TEXT | not_started/in_progress/completed |
| project_id | UUID | Foreign key to projects (NOT NULL) |
| last_meeting_at | TIMESTAMP | Last meeting date |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Update timestamp |

## Migration Steps

### 1. Run the SQL Migration

Open your Supabase project and navigate to the **SQL Editor**. Run the migration script located at:

```
database/migrations/001_add_projects_table.sql
```

Or copy and paste the following SQL:

```sql
-- 1. Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add project_id to languages table
ALTER TABLE languages 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- 3. Insert default projects
INSERT INTO projects (id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Kanz ul Irfan', 'Kanz ul Irfan translation project'),
  ('00000000-0000-0000-0000-000000000002', 'Taleem ul Quran', 'Taleem ul Quran translation project'),
  ('00000000-0000-0000-0000-000000000003', 'Sirat ul Jinan', 'Sirat ul Jinan translation project')
ON CONFLICT (id) DO NOTHING;

-- 4. Assign existing languages to Kanz ul Irfan
UPDATE languages 
SET project_id = '00000000-0000-0000-0000-000000000001'
WHERE project_id IS NULL;

-- 5. Add index for performance
CREATE INDEX IF NOT EXISTS idx_languages_project_id ON languages(project_id);

-- 6. Make project_id NOT NULL
ALTER TABLE languages 
ALTER COLUMN project_id SET NOT NULL;

-- 7. Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 8. Add RLS policy
CREATE POLICY "Allow all operations on projects" ON projects
  FOR ALL USING (true) WITH CHECK (true);
```

### 2. Verify the Migration

After running the migration, verify the tables:

```sql
-- Check projects
SELECT * FROM projects;

-- Check languages with project assignment
SELECT l.country, l.language, p.name as project 
FROM languages l 
LEFT JOIN projects p ON l.project_id = p.id;
```

### 3. Rebuild the Application

After the migration is complete, rebuild your application:

```bash
npm run build
```

## New Features

### Dashboard
- **Project-wise Statistics**: View languages, meetings, and progress for each project
- Filter languages by project
- Track progress per project

### Language Management
- **Project Selection**: When adding a language, select which project it belongs to
- **Project Filtering**: Filter the languages list by project
- **Project Display**: See which project each language belongs to

### Meeting Management
- **Project-First Workflow**: Select a project first, then see only languages from that project
- **Filtered Language Selection**: Languages dropdown shows only languages from the selected project

## Default Projects

The migration creates three default projects with fixed IDs:

1. **Kanz ul Irfan** (`00000000-0000-0000-0000-000000000001`)
2. **Taleem ul Quran** (`00000000-0000-0000-0000-000000000002`)
3. **Sirat ul Jinan** (`00000000-0000-0000-0000-000000000003`)

All existing languages are automatically assigned to **Kanz ul Irfan**.

## Rollback

If you need to rollback the migration:

```sql
-- Remove the foreign key constraint
ALTER TABLE languages DROP CONSTRAINT IF EXISTS languages_project_id_fkey;

-- Drop the column
ALTER TABLE languages DROP COLUMN IF EXISTS project_id;

-- Drop the table
DROP TABLE IF EXISTS projects CASCADE;
```

## Questions?

If you encounter any issues during the migration, please check:
1. The SQL migration ran successfully
2. All existing languages have a `project_id`
3. The `projects` table contains the three default projects
4. The `projects` table schema matches: `id`, `name`, `description`, `created_at` (NO `updated_at`)
