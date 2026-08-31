import {
  buildLoyaltyLookupResponse,
  fetchLoyaltyAccount,
  guestHasActiveBooking,
} from "../_shared/loyalty.ts";
import {
  extractToolArgs,
  getServiceClient,
  handleOptions,
  jsonResponse,
} from "../_shared/http.ts";
import type { ToolErrorResult } from "../_shared/skiTypes.ts";
import { validateLoyaltyLookup } from "../check-loyalty-balance/validate.ts";

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

  const parsed = validateLoyaltyLookup(extractToolArgs(body));
  if (!parsed.ok) {
    return jsonResponse(
      { success: false, error: parsed.error } satisfies ToolErrorResult,
      400,
    );
  }

  try {
    const supabase = getServiceClient();
    const contact = parsed.data.contact;
    const account = await fetchLoyaltyAccount(supabase, contact);
    const hasActiveBooking = await guestHasActiveBooking(supabase, contact);

    return jsonResponse(
      buildLoyaltyLookupResponse(contact, account, hasActiveBooking),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return jsonResponse(
      { success: false, error: message } satisfies ToolErrorResult,
      500,
    );
  }
});
