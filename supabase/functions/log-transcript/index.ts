import {
  getServiceClient,
  handleOptions,
  jsonResponse,
} from "../_shared/http.ts";
import type {
  LogTranscriptError,
  LogTranscriptResult,
  TranscriptOutcome,
} from "./types.ts";
import { validateLogTranscript } from "./validate.ts";

type TranscriptRow = {
  id: string;
  session_id: string;
  outcome: TranscriptOutcome;
};

function isTranscriptRow(value: unknown): value is TranscriptRow {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.session_id === "string" &&
    typeof row.outcome === "string"
  );
}

Deno.serve(async (request: Request): Promise<Response> => {
  const options = handleOptions(request);
  if (options) {
    return options;
  }

  if (request.method !== "POST") {
    return jsonResponse(
      { success: false, error: "Method not allowed" } satisfies LogTranscriptError,
      405,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { success: false, error: "Invalid JSON body" } satisfies LogTranscriptError,
      400,
    );
  }

  const parsed = validateLogTranscript(body);
  if (!parsed.ok) {
    return jsonResponse(
      { success: false, error: parsed.error } satisfies LogTranscriptError,
      400,
    );
  }

  const payload = parsed.data;

  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("transcripts")
      .insert({
        session_id: payload.session_id,
        transcript_text: payload.transcript_text,
        duration_seconds: payload.duration_seconds,
        outcome: payload.outcome,
      })
      .select("id, session_id, outcome")
      .single();

    if (error || !isTranscriptRow(data)) {
      return jsonResponse(
        {
          success: false,
          error: error?.message ?? "Failed to log transcript",
        } satisfies LogTranscriptError,
        500,
      );
    }

    return jsonResponse(
      {
        success: true,
        transcript_id: data.id,
        session_id: data.session_id,
        outcome: data.outcome,
      } satisfies LogTranscriptResult,
      201,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return jsonResponse(
      { success: false, error: message } satisfies LogTranscriptError,
      500,
    );
  }
});
