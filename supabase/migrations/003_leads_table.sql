-- Leads table — captures registration form submissions from marketing pages
-- RegistrationModal inserts here; admin reads via /admin/leads

create table public.leads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  source_page text not null default 'home',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_type text,
  browser text,
  referrer text,
  created_at timestamptz not null default now()
);

create index idx_leads_created on public.leads(created_at);
create index idx_leads_source on public.leads(source_page);

-- RLS: anonymous visitors can insert; admin reads via service key
alter table public.leads enable row level security;

create policy "Anyone can insert leads"
  on public.leads for insert
  with check (true);
