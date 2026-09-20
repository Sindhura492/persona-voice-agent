import { findActiveBookings } from "../_shared/bookingLookup.ts";
import {
  extractToolArgs,
  getServiceClient,
  handleOptions,
  jsonResponse,
} from "../_shared/http.ts";
import type { ToolErrorResult } from "../_shared/skiTypes.ts";
import { validateLookupBooking } from "./validate.ts";

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

  const parsed = validateLookupBooking(extractToolArgs(body));
  if (!parsed.ok) {
    return jsonResponse(
      { success: false, error: parsed.error } satisfies ToolErrorResult,
      400,
    );
  }

  try {
    const supabase = getServiceClient();
    const bookings = await findActiveBookings(supabase, {
      booking_id: parsed.data.booking_id,
      contact: parsed.data.contact,
    });

    if (bookings.length === 0) {
      return jsonResponse({
        success: true,
        found: false,
        count: 0,
        bookings: [],
        message:
          "No active booking found for that booking_id or contact. Ask the guest to confirm details.",
      });
    }

    return jsonResponse({
      success: true,
      found: true,
      count: bookings.length,
      // Keep `booking` for older prompt/tool habits = newest active stay.
      booking: bookings[0],
      bookings,
      agent_guidance:
        bookings.length > 1
          ? `Guest has ${bookings.length} active bookings. Summarize each briefly (package + dates + status). Do not pretend there is only one.`
          : "Read package, dates, status, and totals back exactly.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return jsonResponse(
      { success: false, error: message } satisfies ToolErrorResult,
      500,
    );
  }
});
