import {
  asContact,
  asNumber,
  asString,
  isRecord,
  type ValidationResult,
} from "../_shared/validateCommon.ts";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type RedeemPointsPayload = {
  contact: string;
  points: number;
  booking_id: string | null;
};

export function validateRedeemPoints(
  input: unknown,
): ValidationResult<RedeemPointsPayload> {
  if (!isRecord(input)) {
    return { ok: false, error: "Payload must be an object" };
  }

  const contact = asContact(input.contact) ?? asContact(input.email);
  const points =
    asNumber(input.points) ??
    asNumber(input.points_amount) ??
    asNumber(input.amount);
  const bookingId =
    asString(input.booking_id) ?? asString(input.bookingId);

  if (!contact || contact.length < 3) {
    return { ok: false, error: "contact is required" };
  }
  if (points === null || !Number.isInteger(points) || points <= 0) {
    return {
      ok: false,
      error: "points must be a positive whole number",
    };
  }
  if (bookingId && !UUID_RE.test(bookingId)) {
    return { ok: false, error: "booking_id must be a valid UUID when provided" };
  }

  return {
    ok: true,
    data: {
      contact,
      points,
      booking_id: bookingId,
    },
  };
}
