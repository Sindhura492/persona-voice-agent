import {
  isRecord,
  requireBookingLookup,
  validateStayDates,
  asString,
  type ValidationResult,
} from "../_shared/validateCommon.ts";

export type RescheduleBookingPayload = {
  booking_id: string | null;
  contact: string;
  arrival_date: string;
  departure_date: string;
};

export function validateRescheduleBooking(
  input: unknown,
): ValidationResult<RescheduleBookingPayload> {
  if (!isRecord(input)) {
    return { ok: false, error: "Payload must be an object" };
  }

  const lookup = requireBookingLookup(input);
  if (!lookup.ok) {
    return lookup;
  }

  const arrival =
    asString(input.arrival_date) ??
    asString(input.arrivalDate) ??
    asString(input.new_arrival_date);
  const departure =
    asString(input.departure_date) ??
    asString(input.departureDate) ??
    asString(input.new_departure_date);

  if (!arrival) {
    return { ok: false, error: "arrival_date is required as YYYY-MM-DD" };
  }
  if (!departure) {
    return { ok: false, error: "departure_date is required as YYYY-MM-DD" };
  }

  const dates = validateStayDates(arrival, departure);
  if (!dates.ok) {
    return dates;
  }

  return {
    ok: true,
    data: {
      booking_id: lookup.data.booking_id,
      contact: lookup.data.contact,
      arrival_date: dates.data.arrival_date,
      departure_date: dates.data.departure_date,
    },
  };
}
