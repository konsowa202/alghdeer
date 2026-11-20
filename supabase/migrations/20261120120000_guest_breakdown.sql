-- Guest breakdown: adults, children and extra people (maids, drivers) are priced
-- differently. group_size / guest_count stay the total (their sum).
alter table public.bookings
  add column if not exists adults integer check (adults between 0 and 5000),
  add column if not exists children integer check (children between 0 and 5000),
  add column if not exists extra_guests integer check (extra_guests between 0 and 5000);

alter table public.invoices
  add column if not exists adults integer check (adults between 0 and 5000),
  add column if not exists children integer check (children between 0 and 5000),
  add column if not exists extra_guests integer check (extra_guests between 0 and 5000);

notify pgrst, 'reload schema';
