-- Migration: English Translation module (production pipeline)
-- Adds three NEW tables. Does NOT touch the existing Quranic tables
-- (languages / meetings / projects). Run this in the Supabase SQL Editor.
--
-- Domain: each work item (book / bayan / magazine article) flows through an
-- 8-stage pipeline:  TR -> IF -> CM -> ED -> NR -> ST -> FF -> FPR
-- Each stage has a person + a "sent" date + a "received back" date.
-- The "current step / current holder" is COMPUTED from the stage rows
-- (first stage that is applicable and not yet received back), so it never
-- has to be maintained by hand.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: et_people  (Workforce)
-- ============================================
CREATE TABLE IF NOT EXISTS et_people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  -- Comma-separated skills, e.g. "TR, CM, ED, NR, FPR" (matches the Excel sheet).
  skills TEXT,
  email TEXT,
  working_hours TEXT,
  dpr_link TEXT,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: et_items  (work items)
-- ============================================
CREATE TABLE IF NOT EXISTS et_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  -- Content type code: bks, dwk, wsb, fsp, wbl, quran, mgz, aer, rpr, wss ...
  type TEXT,
  -- Which board/sheet this item belongs to.
  board TEXT NOT NULL DEFAULT 'main_2026'
    CHECK (board IN ('main_2026', 'kanzul_madaris', 'magazine')),
  received_date DATE,
  word_count INTEGER,
  -- Target delivery date (used by the weekly reminders view).
  delivery_date DATE,
  priority TEXT CHECK (priority IN ('low', 'normal', 'urgent')),
  -- High-level lifecycle status. Current STEP is computed from et_stages;
  -- this flag is mainly to separate finished work from the active backlog.
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('pending_assignment', 'in_progress', 'completed')),
  further_process TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: et_stages  (one row per item per pipeline stage)
-- ============================================
CREATE TABLE IF NOT EXISTS et_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES et_items(id) ON DELETE CASCADE,
  stage TEXT NOT NULL
    CHECK (stage IN ('TR', 'IF', 'CM', 'ED', 'NR', 'ST', 'FF', 'FPR')),
  -- Pipeline order: TR=1, IF=2, CM=3, ED=4, NR=5, ST=6, FF=7, FPR=8.
  seq INTEGER NOT NULL,
  person TEXT,
  sent_date DATE,
  received_back_date DATE,
  -- Some items skip a stage entirely ("NA" in the sheet).
  not_applicable BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (item_id, stage)
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_et_items_board ON et_items(board);
CREATE INDEX IF NOT EXISTS idx_et_items_type ON et_items(type);
CREATE INDEX IF NOT EXISTS idx_et_items_status ON et_items(status);
CREATE INDEX IF NOT EXISTS idx_et_items_delivery ON et_items(delivery_date);
CREATE INDEX IF NOT EXISTS idx_et_stages_item ON et_stages(item_id);
CREATE INDEX IF NOT EXISTS idx_et_stages_person ON et_stages(person);
CREATE INDEX IF NOT EXISTS idx_et_stages_item_seq ON et_stages(item_id, seq);

-- ============================================
-- Trigger: keep et_items.updated_at / et_stages.updated_at fresh
-- ============================================
CREATE OR REPLACE FUNCTION et_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_et_items_updated_at ON et_items;
CREATE TRIGGER trg_et_items_updated_at
BEFORE UPDATE ON et_items
FOR EACH ROW EXECUTE FUNCTION et_touch_updated_at();

DROP TRIGGER IF EXISTS trg_et_stages_updated_at ON et_stages;
CREATE TRIGGER trg_et_stages_updated_at
BEFORE UPDATE ON et_stages
FOR EACH ROW EXECUTE FUNCTION et_touch_updated_at();

-- ============================================
-- Row Level Security (match existing tables: open policies;
-- writes are gated in server actions via requireStaff()).
-- ============================================
ALTER TABLE et_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE et_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE et_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on et_people" ON et_people;
CREATE POLICY "Allow all on et_people" ON et_people FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on et_items" ON et_items;
CREATE POLICY "Allow all on et_items" ON et_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on et_stages" ON et_stages;
CREATE POLICY "Allow all on et_stages" ON et_stages FOR ALL USING (true) WITH CHECK (true);
