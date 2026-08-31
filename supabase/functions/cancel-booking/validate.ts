import {
  isRecord,
  readCancelReason,
  requireBookingLookup,
  type ValidationResult,
} from "../_shared/validateCommon.ts";
import type { CancelReason } from "../_shared/skiTypes.ts";

export type CancelBookingPayload = {
  booking_id: string | null;
  contact: string;
  reason: CancelReason | null;
};

export function validateCancelBooking(
  input: unknown,
): ValidationResult<CancelBookingPayload> {
  if (!isRecord(input)) {
    return { ok: false, error: "Payload must be an object" };
  }

  const lookup = requireBookingLookup(input);
  if (!lookup.ok) {
    return lookup;
  }

  const reason = readCancelReason(input);

  return {
    ok: true,
    data: {
      booking_id: lookup.data.booking_id,
      contact: lookup.data.contact,
      reason,
    },
  };
}

export function cancellationPolicy(reason: CancelReason | null): {
  fee_waived: boolean;
  cancellation_fee_eur: number;
  policy_summary: string;
} {
  if (reason === "weather") {
    return {
      fee_waived: true,
      cancellation_fee_eur: 0,
      policy_summary:
        "Weather-related cancellation: all fees waived. Full refund on prepaid packages.",
    };
  }

  return {
    fee_waived: false,
    cancellation_fee_eur: 150,
    policy_summary:
      "Guest-choice cancellation: EUR 150 administrative fee applies. Remaining balance refunded within 5–7 business days.",
  };
}
