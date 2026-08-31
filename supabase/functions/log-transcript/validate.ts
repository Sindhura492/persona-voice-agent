import {
  TRANSCRIPT_OUTCOMES,
  type LogTranscriptPayload,
  type TranscriptOutcome,
} from "./types.ts";

export type ValidationSuccess<T> = { ok: true; data: T };
export type ValidationFailure = { ok: false; error: string };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value.trim() : null;
}

function asOutcome(value: unknown): TranscriptOutcome | null {
  if (typeof value !== "string") {
    return null;
  }
  const slug = value.trim().toLowerCase();
  if (slug === "reserved") {
    return "booked";
  }
  if ((TRANSCRIPT_OUTCOMES as readonly string[]).includes(slug)) {
    return slug as TranscriptOutcome;
  }
  return null;
}

function asDuration(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.round(value);
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.round(parsed);
    }
  }

  return null;
}

function durationFromTimestamps(
  start: unknown,
  end: unknown,
): number | null {
  if (typeof start !== "number" || typeof end !== "number") {
    return null;
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return null;
  }

  return Math.round((end - start) / 1000);
}

function outcomeFromDisconnection(reason: string | null): TranscriptOutcome {
  if (!reason) {
    return "abandoned";
  }

  if (reason.includes("transfer") || reason.includes("escalat")) {
    return "escalated";
  }

  if (
    reason === "agent_hangup" ||
    reason === "user_hangup" ||
    reason === "call_ended"
  ) {
    return "abandoned";
  }

  return "abandoned";
}

function fromFlatPayload(input: Record<string, unknown>): ValidationResult<LogTranscriptPayload> {
  const sessionId = asString(input.session_id);
  const transcriptText = asString(input.transcript_text);
  const duration = asDuration(input.duration_seconds);
  const outcome = asOutcome(input.outcome);

  if (!sessionId) {
    return { ok: false, error: "session_id is required" };
  }

  if (!transcriptText) {
    return { ok: false, error: "transcript_text is required" };
  }

  if (duration === null) {
    return { ok: false, error: "duration_seconds must be a non-negative number" };
  }

  if (!outcome) {
    return {
      ok: false,
      error: `outcome must be one of: ${TRANSCRIPT_OUTCOMES.join(", ")}`,
    };
  }

  return {
    ok: true,
    data: {
      session_id: sessionId,
      transcript_text: transcriptText,
      duration_seconds: duration,
      outcome,
    },
  };
}

function fromRetellWebhook(
  body: Record<string, unknown>,
): ValidationResult<LogTranscriptPayload> {
  if (!isRecord(body.call)) {
    return { ok: false, error: "Retell webhook missing call object" };
  }

  const call = body.call;
  const sessionId = asString(call.call_id);
  const transcriptText = asString(call.transcript) ?? "";

  const cost = isRecord(call.call_cost) ? call.call_cost : null;
  const durationFromCost = cost
    ? asDuration(cost.total_duration_seconds)
    : null;
  const duration =
    durationFromCost ??
    durationFromTimestamps(call.start_timestamp, call.end_timestamp);

  const analysis = isRecord(call.call_analysis) ? call.call_analysis : null;
  const custom = analysis && isRecord(analysis.custom_analysis_data)
    ? analysis.custom_analysis_data
    : null;

  const explicitOutcome =
    asOutcome(custom?.outcome) ??
    asOutcome(call.outcome) ??
    asOutcome(body.outcome);

  const disconnection = asString(call.disconnection_reason);
  const outcome =
    explicitOutcome ?? outcomeFromDisconnection(disconnection);

  if (!sessionId) {
    return { ok: false, error: "call.call_id is required" };
  }

  if (!transcriptText) {
    return { ok: false, error: "call.transcript is required" };
  }

  if (duration === null) {
    return { ok: false, error: "Unable to determine duration_seconds" };
  }

  return {
    ok: true,
    data: {
      session_id: sessionId,
      transcript_text: transcriptText,
      duration_seconds: duration,
      outcome,
    },
  };
}

export function validateLogTranscript(
  input: unknown,
): ValidationResult<LogTranscriptPayload> {
  if (!isRecord(input)) {
    return { ok: false, error: "Payload must be an object" };
  }

  if (isRecord(input.call) || typeof input.event === "string") {
    return fromRetellWebhook(input);
  }

  return fromFlatPayload(input);
}
