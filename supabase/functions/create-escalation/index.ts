import {
  extractToolArgs,
  getServiceClient,
  handleOptions,
  jsonResponse,
} from "../_shared/http.ts";
import type { ToolErrorResult } from "../_shared/skiTypes.ts";
import { validateCreateEscalation } from "./validate.ts";

type EscalationRow = {
  id: string;
  booking_id: string | null;
  reason: string;
  transcript_snippet: string | null;
  status: string;
  created_at: string;
};

function isEscalationRow(value: unknown): value is EscalationRow {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const row = value as Record<string, unknown>;
  return typeof row.id === "string";
}

Deno.serve(async (request: Request): Promise<Response> => {
  const options = handleOptions(request);
  if (options) {
    return options;
  }

  if (request.method !== "POST") {
    return jsonResponse(
      { success: false, error: "Method not allowed" } satisfies ToolErrorResult,
      405,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { success: false, error: "Invalid JSON body" } satisfies ToolErrorResult,
      400,
    );
  }

  const parsed = validateCreateEscalation(extractToolArgs(body));
  if (!parsed.ok) {
    return jsonResponse(
      { success: false, error: parsed.error } satisfies ToolErrorResult,
      400,
    );
  }

  try {
    const supabase = getServiceClient();

    if (parsed.data.booking_id) {
      const { data: booking } = await supabase
        .from("bookings")
        .select("id")
        .eq("id", parsed.data.booking_id)
        .maybeSingle();

      if (!booking) {
        return jsonResponse(
          {
            success: false,
            found: false,
            message: "No booking found for that booking_id.",
          },
          404,
        );
      }
    }

    const { data, error } = await supabase
      .from("escalations")
      .insert({
        booking_id: parsed.data.booking_id,
        reason: parsed.data.reason,
        transcript_snippet: parsed.data.transcript_snippet,
        status: "open",
      })
      .select(
        "id, booking_id, reason, transcript_snippet, status, created_at",
      )
      .single();

    if (error || !isEscalationRow(data)) {
      return jsonResponse(
        {
          success: false,
          error: error?.message ?? "Failed to create escalation",
        } satisfies ToolErrorResult,
        500,
      );
    }

    return jsonResponse(
      {
        success: true,
        escalation: data,
        message:
          "Escalation logged. A mountain concierge lead will follow up shortly.",
      },
      201,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return jsonResponse(
      { success: false, error: message } satisfies ToolErrorResult,
      500,
    );
  }
});
