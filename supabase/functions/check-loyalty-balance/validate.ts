import { asContact, asString, isRecord, type ValidationResult } from "../_shared/validateCommon.ts";

export type LoyaltyLookupPayload = {
  contact: string;
};

export function validateLoyaltyLookup(
  input: unknown,
): ValidationResult<LoyaltyLookupPayload> {
  if (!isRecord(input)) {
    return { ok: false, error: "Payload must be an object" };
  }

  const contact = asContact(input.contact) ?? asContact(input.email);
  if (!contact || contact.length < 3) {
    return { ok: false, error: "contact is required" };
  }

  return { ok: true, data: { contact } };
}
