import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { BookingRow } from "./skiTypes.ts";
import { normalizeContact } from "./validateCommon.ts";

const BOOKING_COLUMNS =
  "id, guest_name, contact, package_type, arrival_date, departure_date, lift_pass_included, lessons_included, status, estimated_total_eur, final_total_eur, loyalty_points_redeemed, loyalty_discount_eur, created_at";

export function isBookingRow(value: unknown): value is BookingRow {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.guest_name === "string" &&
    typeof row.contact === "string" &&
    typeof row.package_type === "string" &&
    typeof row.arrival_date === "string" &&
    typeof row.departure_date === "string" &&
    typeof row.lift_pass_included === "boolean" &&
    typeof row.lessons_included === "boolean" &&
    typeof row.status === "string" &&
    typeof row.created_at === "string"
  );
}

export async function findActiveBooking(
  supabase: SupabaseClient,
  lookup: { booking_id: string | null; contact: string },
): Promise<BookingRow | null> {
  const contact = normalizeContact(lookup.contact);

  if (lookup.booking_id) {
    const { data, error } = await supabase
      .from("bookings")
      .select(BOOKING_COLUMNS)
      .eq("id", lookup.booking_id)
      .neq("status", "cancelled")
      .maybeSingle();

    if (!error && isBookingRow(data)) {
      return data;
    }

    // Stale booking_id (e.g. cancelled then rebooked); fall back to contact.
    if (!contact) {
      return null;
    }
  } else if (!contact) {
    return null;
  }

  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_COLUMNS)
    .ilike("contact", contact)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !isBookingRow(data)) {
    return null;
  }
  return data;
}
