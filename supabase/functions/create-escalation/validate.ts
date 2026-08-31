import { asString, isRecord, type ValidationResult } from "../_shared/validateCommon.ts";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CreateEscalationPayload = {
  reason: string;
  transcript_snippet: string | null;
  booking_id: string | null;
};

export function validateCreateEscalation(
  input: unknown,
): ValidationResult<CreateEscalationPayload> {
  if (!isRecord(input)) {
    return { ok: false, error: "Payload must be an object" };
  }

  const reason = asString(input.reason);
  const snippet =
    asString(input.transcript_snippet) ??
    asString(input.transcriptSnippet);
  const bookingId =
    asString(input.booking_id) ?? asString(input.bookingId);

  if (!reason || reason.length < 5) {
    return { ok: false, error: "reason is required (min 5 characters)" };
  }

  if (bookingId && !UUID_RE.test(bookingId)) {
    return { ok: false, error: "booking_id must be a valid UUID" };
  }

  return {
    ok: true,
    data: {
      reason,
      transcript_snippet: snippet,
      booking_id: bookingId,
    },
  };
}
