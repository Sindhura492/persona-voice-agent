import { mockAvailability } from "../_shared/availability.ts";
import { findActiveBooking, isBookingRow } from "../_shared/bookingLookup.ts";
import {
  extractToolArgs,
  getServiceClient,
  handleOptions,
  jsonResponse,
} from "../_shared/http.ts";
import type { ToolErrorResult } from "../_shared/skiTypes.ts";
import type { PackageType } from "../_shared/skiTypes.ts";
import { validateRescheduleBooking } from "./validate.ts";

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

  const parsed = validateRescheduleBooking(extractToolArgs(body));
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
            "No active booking found for that booking_id or contact. Ask the guest to confirm details.",
        },
        404,
      );
    }

    const availability = mockAvailability({
      package_type: existing.package_type as PackageType,
      arrival_date: parsed.data.arrival_date,
      departure_date: parsed.data.departure_date,
      lift_pass_included: existing.lift_pass_included,
      lessons_included: existing.lessons_included,
    });

    const requested = availability.packages.find(
      (pkg) => pkg.package_type === existing.package_type,
    );

    if (!requested?.available) {
      return jsonResponse(
        {
          success: false,
          error:
            "New dates are not available for this package. Suggest alternatives from check_availability.",
        } satisfies ToolErrorResult,
        409,
      );
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({
        arrival_date: parsed.data.arrival_date,
        departure_date: parsed.data.departure_date,
        status: "rescheduled",
      })
      .eq("id", existing.id)
      .select(
        "id, guest_name, contact, package_type, arrival_date, departure_date, lift_pass_included, lessons_included, status, created_at",
      )
      .single();

    if (error || !isBookingRow(data)) {
      return jsonResponse(
        {
          success: false,
          error: error?.message ?? "Failed to reschedule booking",
        } satisfies ToolErrorResult,
        500,
      );
    }

    return jsonResponse({
      success: true,
      booking: data,
      previous_arrival_date: existing.arrival_date,
      previous_departure_date: existing.departure_date,
      estimated_total: requested.total,
      currency: requested.currency,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return jsonResponse(
      { success: false, error: message } satisfies ToolErrorResult,
      500,
    );
  }
});
