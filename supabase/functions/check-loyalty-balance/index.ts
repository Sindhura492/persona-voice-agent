import {
  extractToolArgs,
  getServiceClient,
  handleOptions,
  jsonResponse,
} from "../_shared/http.ts";
import type { ToolErrorResult } from "../_shared/skiTypes.ts";
import { validateLoyaltyLookup } from "./validate.ts";

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
    const { data, error } = await supabase
      .from("loyalty_accounts")
      .select("id, guest_name, contact, points_balance, created_at")
      .ilike("contact", parsed.data.contact)
      .maybeSingle();

    if (error) {
      return jsonResponse(
        { success: false, error: error.message } satisfies ToolErrorResult,
        500,
      );
    }

    if (!data) {
      return jsonResponse({
        success: true,
        found: false,
        contact: parsed.data.contact,
        message:
          "No loyalty account found for that contact. Offer to enroll on their next stay.",
      });
    }

    return jsonResponse({
      success: true,
      found: true,
      account_id: data.id,
      guest_name: data.guest_name,
      contact: data.contact,
      points_balance: data.points_balance,
      created_at: data.created_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return jsonResponse(
      { success: false, error: message } satisfies ToolErrorResult,
      500,
    );
  }
});
