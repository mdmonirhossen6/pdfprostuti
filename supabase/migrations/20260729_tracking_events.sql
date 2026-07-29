-- Download + CTA conversion event tables (Prostuti BD Phase 3)
-- Run in Supabase SQL editor.

create table if not exists public.download_events (
  id uuid primary key default gen_random_uuid(),
  resource_id text,
  exam text default '',
  subject text default '',
  chapter text default '',
  slug text default '',
  link_kind text default 'primary',
  device text default 'unknown',
  referral text default '',
  referrer_host text default '',
  user_agent text default '',
  destination_url text default '',
  page_path text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.cta_events (
  id uuid primary key default gen_random_uuid(),
  resource_id text,
  exam text default '',
  subject text default '',
  chapter text default '',
  slug text default '',
  placement text default 'resource',
  device text default 'unknown',
  referral text default '',
  referrer_host text default '',
  user_agent text default '',
  destination_url text default '',
  page_path text default '',
  utm_source text default '',
  utm_medium text default '',
  utm_campaign text default '',
  utm_content text default '',
  created_at timestamptz not null default now()
);

create index if not exists download_events_created_at_idx on public.download_events (created_at desc);
create index if not exists download_events_resource_id_idx on public.download_events (resource_id);
create index if not exists download_events_exam_idx on public.download_events (exam);

create index if not exists cta_events_created_at_idx on public.cta_events (created_at desc);
create index if not exists cta_events_resource_id_idx on public.cta_events (resource_id);
create index if not exists cta_events_exam_idx on public.cta_events (exam);
create index if not exists cta_events_placement_idx on public.cta_events (placement);

alter table public.download_events enable row level security;
alter table public.cta_events enable row level security;

-- No anon policies: inserts go through server API with service role only.
comment on table public.download_events is 'PDF download conversion events';
comment on table public.cta_events is 'App CTA click events with UTM fields';
