create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;

create table if not exists public.bookings (
  id text primary key check (char_length(id) between 1 and 80),
  name text not null check (char_length(name) between 2 and 120),
  phone text not null default '—' check (char_length(phone) <= 40),
  email text not null default '' check (char_length(email) <= 160),
  company text not null default '—' check (char_length(company) <= 120),
  group_size integer not null default 10 check (group_size between 1 and 5000),
  notes text not null default '' check (char_length(notes) <= 4000),
  preferred_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'deposit', 'completed', 'cancelled')),
  source text not null default 'website' check (source in ('website', 'staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  history jsonb not null default '[]'::jsonb
    check (jsonb_typeof(history) = 'array')
);

create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists bookings_preferred_at_idx on public.bookings (preferred_at);
create index if not exists bookings_status_idx on public.bookings (status);

-- Only a SHA-256 fingerprint is stored, never the raw server key.
create table if not exists private.api_secrets (
  id smallint primary key default 1 check (id = 1),
  key_hash text not null
);

insert into private.api_secrets (id, key_hash)
values (1, 'b1ad7972742fe9641792ddad59d2772b7ad1d1fee1b6e7d39f3b0aa0293e2ada')
on conflict (id) do update set key_hash = excluded.key_hash;

create or replace function private.is_authorized_server()
returns boolean
language plpgsql
security definer
set search_path = private, pg_temp
as $function$
declare
  request_headers jsonb;
  provided_key text;
begin
  request_headers := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  provided_key := request_headers->>'x-alghdeer-key';

  if provided_key is null or length(provided_key) < 32 then
    return false;
  end if;

  return exists (
    select 1 from private.api_secrets s
    where s.key_hash = encode(extensions.digest(provided_key, 'sha256'), 'hex')
  );
exception when others then
  return false;
end;
$function$;

revoke all on table private.api_secrets from anon, authenticated;
revoke all on function private.is_authorized_server() from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_authorized_server() to anon, authenticated;

alter table public.bookings enable row level security;
alter table public.bookings force row level security;

revoke all on table public.bookings from anon, authenticated;
grant select, insert, update, delete on table public.bookings to anon, authenticated;

create policy server_full_access
on public.bookings for all to anon, authenticated
using (private.is_authorized_server())
with check (private.is_authorized_server());
