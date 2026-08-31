import {
  isRecord,
  requireBookingLookup,
  type ValidationResult,
} from "../_shared/validateCommon.ts";

export type LookupBookingPayload = {
  booking_id: string | null;
  contact: string;
};

export function validateLookupBooking(
  input: unknown,
): ValidationResult<LookupBookingPayload> {
  if (!isRecord(input)) {
    return { ok: false, error: "Payload must be an object" };
  }

  const lookup = requireBookingLookup(input);
  if (!lookup.ok) {
    return lookup;
  }

  return {
    ok: true,
    data: {
      booking_id: lookup.data.booking_id,
      contact: lookup.data.contact,
    },
  };
}
