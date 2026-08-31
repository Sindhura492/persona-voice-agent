-- Demo guests for Snowveil voice concierge POC

delete from public.gear_fittings
where booking_id in (
  select id
  from public.bookings
  where contact in (
    'sindhura7649@gmail.com',
    'sindhurashivaprasad@gmail.com',
    'samarthabbi5@gmail.com',
    'sindhurashivaprasad49@gmail.com'
  )
);

delete from public.bookings
where contact in (
  'sindhura7649@gmail.com',
  'sindhurashivaprasad@gmail.com',
  'samarthabbi5@gmail.com',
  'sindhurashivaprasad49@gmail.com'
);

delete from public.loyalty_accounts
where contact in (
  'sindhura7649@gmail.com',
  'sindhurashivaprasad@gmail.com',
  'samarthabbi5@gmail.com',
  'sindhurashivaprasad49@gmail.com'
);

delete from public.waitlist_entries
where contact in (
  'sindhura7649@gmail.com',
  'sindhurashivaprasad@gmail.com',
  'samarthabbi5@gmail.com',
  'sindhurashivaprasad49@gmail.com'
);

insert into public.bookings (
  guest_name,
  contact,
  package_type,
  arrival_date,
  departure_date,
  lift_pass_included,
  lessons_included,
  status
) values
(
  'Sindhura S',
  'sindhura7649@gmail.com',
  'alpine_escape',
  '2026-12-10',
  '2026-12-14',
  true,
  true,
  'confirmed'
),
(
  'Shivaprasad S',
  'sindhurashivaprasad@gmail.com',
  'summit_luxury',
  '2026-01-15',
  '2026-01-18',
  true,
  false,
  'pending'
),
(
  'Samarth',
  'samarthabbi5@gmail.com',
  'family_adventure',
  '2026-02-20',
  '2026-02-23',
  true,
  true,
  'confirmed'
),
(
  'Pandu',
  'sindhurashivaprasad49@gmail.com',
  'day_pass',
  '2026-09-02',
  '2026-09-03',
  true,
  false,
  'rescheduled'
);

insert into public.loyalty_accounts (guest_name, contact, points_balance)
values
  ('Sindhura S', 'sindhura7649@gmail.com', 4200),
  ('Shivaprasad S', 'sindhurashivaprasad@gmail.com', 1850),
  ('Samarth', 'samarthabbi5@gmail.com', 760),
  ('Pandu', 'sindhurashivaprasad49@gmail.com', 320);

insert into public.gear_fittings (
  booking_id,
  height_cm,
  boot_size,
  skill_level,
  notes
)
select
  b.id,
  168,
  38.0,
  'intermediate',
  'Prefers slightly stiff boots for carving.'
from public.bookings b
where b.contact = 'samarthabbi5@gmail.com';

insert into public.waitlist_entries (
  guest_name,
  contact,
  requested_date,
  lesson_level,
  status
)
values
(
  'Pandu',
  'sindhurashivaprasad49@gmail.com',
  '2026-09-02',
  'beginner',
  'waiting'
);