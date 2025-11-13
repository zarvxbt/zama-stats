
create table creators (
  id uuid primary key default gen_random_uuid(),
  x_handle text,
  prize text,
  details text,
  created_at timestamptz default now()
);
