-- Store loyalty redemption on bookings for confirmation emails

alter table public.bookings
  add column if not exists estimated_total_eur numeric(10, 2),
  add column if not exists final_total_eur numeric(10, 2),
  add column if not exists loyalty_points_redeemed integer not null default 0
    check (loyalty_points_redeemed >= 0),
  add column if not exists loyalty_discount_eur numeric(10, 2) not null default 0
    check (loyalty_discount_eur >= 0);
