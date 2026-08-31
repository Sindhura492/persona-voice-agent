create type public.transcript_outcome as enum (
  'booked',
  'rescheduled',
  'cancelled',
  'gear_fitted',
  'loyalty_checked',
  'waitlisted',
  'escalated',
  'abandoned'
);

create table public.transcripts (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  transcript_text text not null,
  duration_seconds integer not null check (duration_seconds >= 0),
  outcome public.transcript_outcome not null,
  created_at timestamptz not null default now()
);

create index transcripts_outcome_idx on public.transcripts (outcome);
create index transcripts_created_at_idx on public.transcripts (created_at desc);

alter table public.transcripts enable row level security;
