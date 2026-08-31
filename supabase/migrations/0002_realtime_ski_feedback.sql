alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.gear_fittings;
alter publication supabase_realtime add table public.loyalty_accounts;
alter publication supabase_realtime add table public.waitlist_entries;

create policy "Public read bookings"
  on public.bookings
  for select
  to anon, authenticated
  using (true);

create policy "Public read gear_fittings"
  on public.gear_fittings
  for select
  to anon, authenticated
  using (true);

create policy "Public read loyalty_accounts"
  on public.loyalty_accounts
  for select
  to anon, authenticated
  using (true);

create policy "Public read waitlist_entries"
  on public.waitlist_entries
  for select
  to anon, authenticated
  using (true);
