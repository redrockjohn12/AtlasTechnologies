-- Atlas Technologies CRM + website leads
-- Run this entire file once in Supabase SQL Editor.
-- IMPORTANT: use only the publishable/anon key in browser code. Never put a service-role/secret key in this repo.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'owner' check (role in ('owner','staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  service text,
  budget text,
  subject text,
  message text,
  status text not null default 'new' check (status in ('new','contacted','qualified','proposal','won','lost')),
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  name text not null,
  email text,
  phone text,
  company text,
  status text not null default 'active' check (status in ('active','inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  name text not null,
  service text,
  status text not null default 'planning' check (status in ('planning','active','review','completed','paused')),
  value numeric(14,2) not null default 0 check (value >= 0),
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_status_idx on public.leads(status);
create index if not exists customers_created_at_idx on public.customers(created_at desc);
create index if not exists projects_created_at_idx on public.projects(created_at desc);
create index if not exists projects_status_idx on public.projects(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists leads_updated_at on public.leads;
create trigger leads_updated_at before update on public.leads for each row execute function public.set_updated_at();

drop trigger if exists customers_updated_at on public.customers;
create trigger customers_updated_at before update on public.customers for each row execute function public.set_updated_at();

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.customers enable row level security;
alter table public.projects enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Public website may create leads only. It may not read, update or delete CRM data.
drop policy if exists leads_public_insert on public.leads;
create policy leads_public_insert on public.leads for insert to anon, authenticated
with check (char_length(trim(name)) >= 2 and char_length(trim(email)) >= 3);

-- Authenticated Atlas users can operate the CRM.
drop policy if exists leads_staff_select on public.leads;
create policy leads_staff_select on public.leads for select to authenticated using (true);

drop policy if exists leads_staff_update on public.leads;
create policy leads_staff_update on public.leads for update to authenticated using (true) with check (true);

drop policy if exists leads_staff_delete on public.leads;
create policy leads_staff_delete on public.leads for delete to authenticated using (true);

drop policy if exists leads_staff_insert on public.leads;
create policy leads_staff_insert on public.leads for insert to authenticated with check (true);

drop policy if exists customers_staff_all on public.customers;
create policy customers_staff_all on public.customers for all to authenticated using (true) with check (true);

drop policy if exists projects_staff_all on public.projects;
create policy projects_staff_all on public.projects for all to authenticated using (true) with check (true);

grant insert on public.leads to anon;
grant select, insert, update, delete on public.leads to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, update on public.profiles to authenticated;

drop view if exists public.crm_summary;
create or replace view public.crm_summary as
select
  (select count(*) from public.leads) as total_leads,
  (select count(*) from public.leads where status = 'new') as new_leads,
  (select count(*) from public.customers) as total_customers,
  (select count(*) from public.projects where status in ('planning','active','review')) as active_projects,
  (select coalesce(sum(value),0) from public.projects where status <> 'completed') as pipeline_value;

grant select on public.crm_summary to authenticated;
