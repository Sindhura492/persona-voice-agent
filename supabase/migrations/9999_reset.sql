-- Drop legacy POC tables
drop table if exists public.order_status_lookups cascade;
drop table if exists public.automation_events cascade;
drop table if exists public.orders cascade;
drop table if exists public.returns cascade;
drop table if exists public.transcripts cascade;
drop table if exists public.reservations cascade;
drop table if exists public.faq_entries cascade;

drop type if exists public.transcript_outcome cascade;
