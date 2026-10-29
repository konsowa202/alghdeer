-- Dashboard authorization for Supabase Auth users.
-- Passwords remain exclusively in Supabase Auth; no password is stored here.
create table if not exists public.staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'staff' check (role in ('staff', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.staff_members enable row level security;
alter table public.staff_members force row level security;
revoke all on table public.staff_members from anon, authenticated;
grant select on table public.staff_members to authenticated;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $function$
  select exists (
    select 1 from public.staff_members
    where user_id = (select auth.uid()) and is_active
  );
$function$;

revoke all on function private.is_staff() from public;
grant execute on function private.is_staff() to authenticated;

create policy staff_read_own_membership
on public.staff_members for select to authenticated
using (user_id = (select auth.uid()));

create policy authenticated_staff_full_access
on public.bookings for all to authenticated
using (private.is_staff())
with check (private.is_staff());
