-- ============================================================
-- Client DB schema — run this once in Supabase SQL Editor
-- ============================================================

-- Clients
create table if not exists clients (
  id text primary key,
  name text not null,
  color text not null,
  industry text not null,
  sort_order int default 0
);

-- Seats (belong to a client)
create table if not exists seats (
  id text primary key,
  client_id text not null references clients(id) on delete cascade,
  name text not null,
  sort_order int default 0
);

-- Sheets (belong to a seat, each has its own column schema)
create table if not exists sheets (
  id text primary key,
  seat_id text not null references seats(id) on delete cascade,
  name text not null,
  icon text default '▦',
  sort_order int default 0
);

-- Columns (schema definition per sheet)
create table if not exists columns (
  id uuid default gen_random_uuid() primary key,
  sheet_id text not null references sheets(id) on delete cascade,
  key text not null,
  label text not null,
  type text not null,
  width int default 150,
  options jsonb,
  sticky boolean default false,
  editable boolean default false,
  prefix text,
  suffix text,
  sort_order int default 0,
  unique(sheet_id, key)
);

-- Rows (JSONB data — flexible per-sheet schema)
create table if not exists rows (
  id uuid default gen_random_uuid() primary key,
  sheet_id text not null references sheets(id) on delete cascade,
  data jsonb not null default '{}',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Disable RLS for now (add auth later)
alter table clients disable row level security;
alter table seats disable row level security;
alter table sheets disable row level security;
alter table columns disable row level security;
alter table rows disable row level security;

-- Enable realtime on rows table
alter publication supabase_realtime add table rows;
