"use client";

import { useCallback } from "react";
import { Badge } from "@/components/ui/Badge";
import { contactsMatch } from "@/features/shared/guestContact";
import { useGuestContact } from "@/features/shared/GuestContactProvider";
import { STATUS_OVERLAY_CLASS } from "@/features/shared/statusOverlay";
import { useGuestScopedRow } from "@/features/shared/useGuestScopedRow";
import {
  bookingStatusHeadline,
  formatPackageLabel,
  formatStayDates,
  parseBooking,
  type Booking,
} from "./bookingTypes";

function bookingFootnote(booking: Booking): string {
  if (booking.status === "cancelled") {
    return "Cancellation on file. Fees follow the policy read aloud.";
  }
  if (booking.status === "rescheduled") {
    return "New dates saved. Confirmation email shortly.";
  }
  return "Concierge confirms within the hour.";
}

export function BookingStatus() {
  const { guestContact, sessionScopedAt } = useGuestContact();

  const parse = useCallback((row: unknown) => parseBooking(row), []);

  const belongsToGuest = useCallback(
    (booking: Booking, contact: string) => contactsMatch(booking.contact, contact),
    [],
  );

  const booking = useGuestScopedRow<Booking>({
    guestContact,
    sessionScopedAt,
    table: "bookings",
    events: ["INSERT", "UPDATE"],
    parse,
    channelName: "ski-bookings",
    belongsToGuest,
  });

  if (!booking) {
    return null;
  }

  return (
    <aside aria-live="polite" className={STATUS_OVERLAY_CLASS}>
      <Badge className="font-semibold text-charcoal">
        {bookingStatusHeadline(booking.status)}
      </Badge>
      <h2 className="mt-xs font-display text-h3 text-charcoal">
        {booking.guest_name}
      </h2>
      <dl className="mt-sm grid grid-cols-2 gap-x-md gap-y-xs text-caption text-graphite">
        <div>
          <dt className="text-slate">Package</dt>
          <dd className="text-charcoal">
            {formatPackageLabel(booking.package_type)}
          </dd>
        </div>
        <div>
          <dt className="text-slate">Dates</dt>
          <dd className="text-charcoal">
            {formatStayDates(booking.arrival_date, booking.departure_date)}
          </dd>
        </div>
        <div>
          <dt className="text-slate">Lift pass</dt>
          <dd className="text-charcoal">
            {booking.lift_pass_included ? "Included" : "Not included"}
          </dd>
        </div>
        <div>
          <dt className="text-slate">Ref</dt>
          <dd className="font-mono text-charcoal-muted">
            {booking.id.slice(0, 8).toUpperCase()}
          </dd>
        </div>
      </dl>
      <p className="mt-sm border-t border-stone pt-sm text-caption text-graphite">
        {bookingFootnote(booking)}
      </p>
    </aside>
  );
}
