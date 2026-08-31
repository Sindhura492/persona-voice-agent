import { findActiveBooking, isBookingRow } from "../_shared/bookingLookup.ts";
import {
  extractToolArgs,
  getServiceClient,
  handleOptions,
  jsonResponse,
} from "../_shared/http.ts";
import type { ToolErrorResult } from "../_shared/skiTypes.ts";
import {
  cancellationPolicy,
  validateCancelBooking,
} from "./validate.ts";

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

  const parsed = validateCancelBooking(extractToolArgs(body));
  if (!parsed.ok) {
    return jsonResponse(
      { success: false, error: parsed.error } satisfies ToolErrorResult,
      400,
    );
  }

  try {
    const supabase = getServiceClient();
    const existing = await findActiveBooking(supabase, {
      booking_id: parsed.data.booking_id,
      contact: parsed.data.contact,
    });

    if (!existing) {
      return jsonResponse(
        {
          success: false,
          found: false,
          message:
            "No active booking found for that booking_id or contact.",
        },
        404,
      );
    }

    const policy = cancellationPolicy(parsed.data.reason);

    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", existing.id)
      .select(
        "id, guest_name, contact, package_type, arrival_date, departure_date, lift_pass_included, lessons_included, status, created_at",
      )
      .single();

    if (error || !isBookingRow(data)) {
      return jsonResponse(
        {
          success: false,
          error: error?.message ?? "Failed to cancel booking",
        } satisfies ToolErrorResult,
        500,
      );
    }

    return jsonResponse({
      success: true,
      booking: data,
      cancel_reason: parsed.data.reason ?? "unspecified",
      fee_waived: policy.fee_waived,
      cancellation_fee_eur: policy.cancellation_fee_eur,
      policy_summary: policy.policy_summary,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return jsonResponse(
      { success: false, error: message } satisfies ToolErrorResult,
      500,
    );
  }
});
