-- 020: Leads CRM linkage + processing status
-- ADD-only. Extends public.leads with Bitrix references and processing state.

-- 1. Add columns to leads (nullable — existing rows stay valid)
alter table public.leads add column if not exists bitrix_deal_id bigint;
alter table public.leads add column if not exists bitrix_contact_id bigint;
alter table public.leads add column if not exists status text not null default 'new'
  check (status in ('new', 'in_progress', 'done', 'invalid'));
alter table public.leads add column if not exists assigned_to text;
alter table public.leads add column if not exists status_changed_at timestamptz;

create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_bitrix_deal on public.leads(bitrix_deal_id) where bitrix_deal_id is not null;

-- 2. Audit history for status changes
create table if not exists public.lead_state_history (
  id bigserial primary key,
  lead_id uuid not null references public.leads(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by text,
  changed_at timestamptz not null default now(),
  note text
);
create index if not exists idx_lead_state_history_lead on public.lead_state_history(lead_id, changed_at desc);

alter table public.lead_state_history enable row level security;
grant all on public.lead_state_history to service_role;

-- 3. Trigger to auto-append history on status change
create or replace function public.log_lead_status_change()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    insert into public.lead_state_history (lead_id, from_status, to_status, changed_by, note)
    values (new.id, old.status, new.status, new.assigned_to, null);
    new.status_changed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_leads_status_change on public.leads;
create trigger trg_leads_status_change
  before update on public.leads
  for each row
  execute function public.log_lead_status_change();

comment on column public.leads.status is 'Admin workflow state: new | in_progress | done | invalid';
comment on column public.leads.bitrix_deal_id is 'FK into Bitrix crm.deal (assigned by /api/bitrix/lead after deal creation)';
