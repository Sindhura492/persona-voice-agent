import {
  extractToolArgs,
  getServiceClient,
  handleOptions,
  jsonResponse,
} from "../_shared/http.ts";
import { postToN8n } from "../_shared/n8n.ts";
import type { ToolErrorResult } from "../_shared/skiTypes.ts";
import { validateJoinWaitlist } from "./validate.ts";

type WaitlistRow = {
  id: string;
  guest_name: string;
  contact: string;
  requested_date: string;
  lesson_level: string;
  status: string;
  created_at: string;
};

function isWaitlistRow(value: unknown): value is WaitlistRow {
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

  const parsed = validateJoinWaitlist(extractToolArgs(body));
  if (!parsed.ok) {
    return jsonResponse(
      { success: false, error: parsed.error } satisfies ToolErrorResult,
      400,
    );
  }

  try {
    const supabase = getServiceClient();
    const { count, error: countError } = await supabase
      .from("waitlist_entries")
      .select("id", { count: "exact", head: true })
      .eq("requested_date", parsed.data.requested_date)
      .eq("lesson_level", parsed.data.lesson_level)
      .eq("status", "waiting");

    if (countError) {
      return jsonResponse(
        { success: false, error: countError.message } satisfies ToolErrorResult,
        500,
      );
    }

    const { data, error } = await supabase
      .from("waitlist_entries")
      .insert({
        guest_name: parsed.data.guest_name,
        contact: parsed.data.contact,
        requested_date: parsed.data.requested_date,
        lesson_level: parsed.data.lesson_level,
        status: "waiting",
      })
      .select(
        "id, guest_name, contact, requested_date, lesson_level, status, created_at",
      )
      .single();

    if (error || !isWaitlistRow(data)) {
      return jsonResponse(
        {
          success: false,
          error: error?.message ?? "Failed to join waitlist",
        } satisfies ToolErrorResult,
        500,
      );
    }

    const position = (count ?? 0) + 1;

    let emailed = false;
    if (data.contact.includes("@")) {
      try {
        await postToN8n({
          event: "waitlist_joined",
          type: "WAITLIST_JOINED",
          to: data.contact,
          guestName: data.guest_name,
          contact: data.contact,
          waitlist_id: data.id,
          requested_date: data.requested_date,
          lesson_level: data.lesson_level,
          queue_position: position,
          status: data.status,
          sentAt: new Date().toISOString(),
        });
        emailed = true;
      } catch {
        // Waitlist entry saved even if email fails.
      }
    }

    return jsonResponse(
      {
        success: true,
        waitlist_entry: data,
        queue_position: position,
        emailed,
        message:
          `You are #${position} on the waitlist for ${parsed.data.lesson_level} lessons on ${parsed.data.requested_date}. We will notify you if a spot opens.`,
        agent_guidance: emailed
          ? "Confirm their waitlist position and that a confirmation email was sent."
          : "Confirm their waitlist position. No email was sent (no email contact).",
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
