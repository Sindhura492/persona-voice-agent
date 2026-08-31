import {
  asContact,
  asString,
  isRecord,
  type ValidationResult,
} from "../_shared/validateCommon.ts";

export type SendLoyaltyDetailsPayload = {
  contact: string;
  guest_name: string | null;
  include_redemption_guide: boolean;
};

export function validateSendLoyaltyDetails(
  input: unknown,
): ValidationResult<SendLoyaltyDetailsPayload> {
  if (!isRecord(input)) {
    return { ok: false, error: "Payload must be an object" };
  }

  const contact = asContact(input.contact) ?? asContact(input.email);
  if (!contact || !contact.includes("@") || contact.length < 5) {
    return {
      ok: false,
      error: "contact must be a valid email address for loyalty emails",
    };
  }

  const guestName = asString(input.guest_name) ?? asString(input.guestName);
  const includeGuide =
    input.include_redemption_guide === true ||
    input.includeRedemptionGuide === true ||
    input.include_discounts !== false;

  return {
    ok: true,
    data: {
      contact,
      guest_name: guestName,
      include_redemption_guide: includeGuide,
    },
  };
}
