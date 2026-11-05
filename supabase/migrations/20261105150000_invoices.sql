create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique check (char_length(invoice_number) between 4 and 40),
  booking_id text references public.bookings(id) on delete set null,
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  customer_phone text not null default '' check (char_length(customer_phone) <= 40),
  customer_email text not null default '' check (char_length(customer_email) <= 160),
  company text not null default '' check (char_length(company) <= 120),
  event_at timestamptz,
  guest_count integer not null default 1 check (guest_count between 1 and 5000),
  status text not null default 'draft' check (status in ('draft', 'approved', 'issued')),
  currency text not null default 'SAR' check (currency = 'SAR'),
  line_items jsonb not null default '[]'::jsonb check (jsonb_typeof(line_items) = 'array'),
  discount numeric(14,2) not null default 0 check (discount >= 0),
  commission_type text not null default 'none' check (commission_type in ('none', 'percent', 'fixed')),
  commission_value numeric(14,2) not null default 0 check (commission_value >= 0),
  show_commission boolean not null default true,
  tax_rate numeric(5,2) not null default 0 check (tax_rate between 0 and 100),
  subtotal numeric(14,2) not null default 0 check (subtotal >= 0),
  commission_amount numeric(14,2) not null default 0 check (commission_amount >= 0),
  tax_amount numeric(14,2) not null default 0 check (tax_amount >= 0),
  total numeric(14,2) not null default 0 check (total >= 0),
  notes text not null default '' check (char_length(notes) <= 4000),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index invoices_created_at_idx on public.invoices (created_at desc);
create index invoices_booking_id_idx on public.invoices (booking_id);
create index invoices_customer_phone_idx on public.invoices (customer_phone);

alter table public.invoices enable row level security;
alter table public.invoices force row level security;
revoke all on table public.invoices from anon, authenticated;
grant select, insert, update, delete on table public.invoices to authenticated;

create policy authenticated_staff_full_access_invoices
on public.invoices for all to authenticated
using (private.is_staff())
with check (private.is_staff());
