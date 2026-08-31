import type { AvailabilityQuery } from "../_shared/availability.ts";
import {
  asContact,
  asNumber,
  asString,
  isRecord,
  type ValidationResult,
} from "../_shared/validateCommon.ts";
import { validateAvailabilityPayload } from "../check-availability/validate.ts";

export type CreateBookingPayload = AvailabilityQuery & {
  guest_name: string;
  contact: string;
  loyalty_points_redeemed: number;
};

export function validateCreateBooking(
  input: unknown,
): ValidationResult<CreateBookingPayload> {
  const base = validateAvailabilityPayload(input);
  if (!base.ok) {
    return base;
  }

  if (!isRecord(input)) {
    return { ok: false, error: "Payload must be an object" };
  }

  const guestName = asString(input.guest_name) ?? asString(input.guestName);
  const contact = asContact(input.contact);

  if (!guestName) {
    return { ok: false, error: "guest_name is required" };
  }
  if (!contact || contact.length < 3) {
    return { ok: false, error: "contact is required" };
  }

  const pointsRaw =
    asNumber(input.loyalty_points_redeemed) ??
    asNumber(input.loyaltyPointsRedeemed) ??
    asNumber(input.points_redeemed) ??
    0;
  const loyaltyPoints =
    pointsRaw !== null && Number.isInteger(pointsRaw) && pointsRaw >= 0
      ? pointsRaw
      : 0;

  return {
    ok: true,
    data: {
      ...base.data,
      guest_name: guestName,
      contact,
      loyalty_points_redeemed: loyaltyPoints,
    },
  };
}
