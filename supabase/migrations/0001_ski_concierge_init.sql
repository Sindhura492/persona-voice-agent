create extension if not exists pgcrypto;

drop table if exists public.gear_fittings cascade;
drop table if exists public.escalations cascade;
drop table if exists public.bookings cascade;
drop table if exists public.loyalty_accounts cascade;
drop table if exists public.waitlist_entries cascade;
drop table if exists public.faq_entries cascade;

drop type if exists public.booking_status cascade;
drop type if exists public.skill_level cascade;
drop type if exists public.waitlist_status cascade;
drop type if exists public.escalation_status cascade;

create type public.booking_status as enum (
  'pending',
  'confirmed',
  'rescheduled',
  'cancelled'
);

create type public.skill_level as enum (
  'beginner',
  'intermediate',
  'advanced'
);

create type public.waitlist_status as enum (
  'waiting',
  'notified',
  'expired'
);

create type public.escalation_status as enum (
  'open',
  'handled'
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  contact text not null,
  package_type text not null,
  arrival_date date not null,
  departure_date date not null,
  lift_pass_included boolean not null default false,
  lessons_included boolean not null default false,
  status public.booking_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint bookings_dates_check check (departure_date > arrival_date)
);

create table public.gear_fittings (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  height_cm integer not null check (height_cm > 0),
  boot_size numeric(4, 1) not null,
  skill_level public.skill_level not null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.loyalty_accounts (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  contact text not null,
  points_balance integer not null default 0 check (points_balance >= 0),
  created_at timestamptz not null default now()
);

create table public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  contact text not null,
  requested_date date not null,
  lesson_level public.skill_level not null,
  status public.waitlist_status not null default 'waiting',
  created_at timestamptz not null default now()
);

create table public.escalations (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings (id) on delete set null,
  reason text not null,
  transcript_snippet text,
  status public.escalation_status not null default 'open',
  created_at timestamptz not null default now()
);

create table public.faq_entries (
  id uuid primary key default gen_random_uuid(),
  question_en text not null,
  question_de text not null,
  answer_en text not null,
  answer_de text not null,
  tags text[] not null default '{}'::text[]
);

create index bookings_status_idx on public.bookings (status);
create index bookings_arrival_idx on public.bookings (arrival_date);
create index gear_fittings_booking_id_idx on public.gear_fittings (booking_id);
create index waitlist_entries_status_idx on public.waitlist_entries (status);
create index escalations_status_idx on public.escalations (status);

alter table public.bookings enable row level security;
alter table public.gear_fittings enable row level security;
alter table public.loyalty_accounts enable row level security;
alter table public.waitlist_entries enable row level security;
alter table public.escalations enable row level security;
alter table public.faq_entries enable row level security;

create policy "Public read faq_entries"
  on public.faq_entries
  for select
  to anon, authenticated
  using (true);
