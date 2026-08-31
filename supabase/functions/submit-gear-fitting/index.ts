import { postToN8n } from "../_shared/n8n.ts";
import {
  extractToolArgs,
  getServiceClient,
  handleOptions,
  jsonResponse,
} from "../_shared/http.ts";
import type { ToolErrorResult } from "../_shared/skiTypes.ts";
import { validateGearFitting } from "./validate.ts";

type BookingRow = {
  id: string;
  status: string;
  guest_name: string;
  contact: string;
  arrival_date: string;
  departure_date: string;
  package_type: string;
};

type GearFittingRow = {
  id: string;
  booking_id: string;
  height_cm: number;
  boot_size: number;
  skill_level: string;
  notes: string | null;
  created_at: string;
};

function isBookingRow(value: unknown): value is BookingRow {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.guest_name === "string" &&
    typeof row.contact === "string"
  );
}

function isGearRow(value: unknown): value is GearFittingRow {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const row = value as Record<string, unknown>;
  return typeof row.id === "string" && typeof row.booking_id === "string";
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

  const parsed = validateGearFitting(extractToolArgs(body));
  if (!parsed.ok) {
    return jsonResponse(
      { success: false, error: parsed.error } satisfies ToolErrorResult,
      400,
    );
  }

  try {
    const supabase = getServiceClient();
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        "id, status, guest_name, contact, arrival_date, departure_date, package_type",
      )
      .eq("id", parsed.data.booking_id)
      .maybeSingle();

    if (bookingError || !isBookingRow(booking)) {
      return jsonResponse(
        {
          success: false,
          found: false,
          message: "No booking found for that booking_id.",
        },
        404,
      );
    }

    if (booking.status === "cancelled") {
      return jsonResponse(
        {
          success: false,
          error: "Cannot submit gear fitting for a cancelled booking.",
        } satisfies ToolErrorResult,
        409,
      );
    }

    const { data, error } = await supabase
      .from("gear_fittings")
      .insert({
        booking_id: parsed.data.booking_id,
        height_cm: parsed.data.height_cm,
        boot_size: parsed.data.boot_size,
        skill_level: parsed.data.skill_level,
        notes: parsed.data.notes,
      })
      .select(
        "id, booking_id, height_cm, boot_size, skill_level, notes, created_at",
      )
      .single();

    if (error || !isGearRow(data)) {
      return jsonResponse(
        {
          success: false,
          error: error?.message ?? "Failed to save gear fitting",
        } satisfies ToolErrorResult,
        500,
      );
    }

    let emailed = false;
    if (booking.contact.includes("@")) {
      try {
        await postToN8n({
          event: "gear_fitting_confirmed",
          type: "GEAR_FITTING_CONFIRMED",
          to: booking.contact,
          guestName: booking.guest_name,
          contact: booking.contact,
          booking_id: booking.id,
          arrival_date: booking.arrival_date,
          departure_date: booking.departure_date,
          package_type: booking.package_type,
          height_cm: data.height_cm,
          boot_size: data.boot_size,
          skill_level: data.skill_level,
          notes: data.notes,
          sentAt: new Date().toISOString(),
        });
        emailed = true;
      } catch {
        // Fitting saved even if email notification fails.
      }
    }

    return jsonResponse(
      {
        success: true,
        gear_fitting: data,
        emailed,
        agent_guidance:
          "Confirm the fitting is saved and equipment will be staged before the first ski day. If emailed is true, tell the guest a confirmation email is on its way.",
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
