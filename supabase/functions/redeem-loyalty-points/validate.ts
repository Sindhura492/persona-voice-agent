import {
  asContact,
  asNumber,
  isRecord,
  type ValidationResult,
} from "../_shared/validateCommon.ts";

export type RedeemPointsPayload = {
  contact: string;
  points: number;
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

  if (!contact || contact.length < 3) {
    return { ok: false, error: "contact is required" };
  }
  if (points === null || !Number.isInteger(points) || points <= 0) {
    return {
      ok: false,
      error: "points must be a positive whole number",
    };
  }

  return { ok: true, data: { contact, points } };
}
