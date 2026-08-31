import {
  discountForPoints,
  fetchLoyaltyAccount,
  PROGRAM_NAME,
} from "../_shared/loyalty.ts";
import { postToN8n } from "../_shared/n8n.ts";
import {
  extractToolArgs,
  getServiceClient,
  handleOptions,
  jsonResponse,
} from "../_shared/http.ts";
import type { ToolErrorResult } from "../_shared/skiTypes.ts";
import { validateRedeemPoints } from "./validate.ts";

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

  const parsed = validateRedeemPoints(extractToolArgs(body));
  if (!parsed.ok) {
    return jsonResponse(
      { success: false, error: parsed.error } satisfies ToolErrorResult,
      400,
    );
  }

  try {
    const supabase = getServiceClient();
    const account = await fetchLoyaltyAccount(supabase, parsed.data.contact);

    if (!account) {
      return jsonResponse(
        {
          success: false,
          found: false,
          message: "No loyalty account found for that contact.",
        },
        404,
      );
    }

    if (account.points_balance < parsed.data.points) {
      return jsonResponse(
        {
          success: false,
          error: "Insufficient points balance",
          points_balance: account.points_balance,
          points_requested: parsed.data.points,
        },
        409,
      );
    }

    const previousBalance = account.points_balance;
    const newBalance = previousBalance - parsed.data.points;
    const discount = discountForPoints(parsed.data.points);

    const { data, error } = await supabase
      .from("loyalty_accounts")
      .update({ points_balance: newBalance })
      .eq("id", account.id)
      .select("id, guest_name, contact, points_balance")
      .single();

    if (error || !data) {
      return jsonResponse(
        {
          success: false,
          error: error?.message ?? "Failed to redeem points",
        } satisfies ToolErrorResult,
        500,
      );
    }

    if (data.contact.includes("@")) {
      try {
        await postToN8n({
          event: "loyalty_redeemed",
          type: "LOYALTY_REDEEMED",
          to: data.contact,
          guestName: data.guest_name,
          contact: data.contact,
          program: PROGRAM_NAME,
          points_redeemed: parsed.data.points,
          previous_balance: previousBalance,
          points_balance: data.points_balance,
          discount_eur: discount.discount_eur,
          discount_label: discount.tier_label,
          discount_description: discount.tier_description,
          sentAt: new Date().toISOString(),
        });
      } catch {
        // Redemption succeeded even if email notification fails.
      }
    }

    return jsonResponse({
      success: true,
      account_id: data.id,
      guest_name: data.guest_name,
      contact: data.contact,
      points_redeemed: parsed.data.points,
      previous_balance: previousBalance,
      points_balance: data.points_balance,
      discount_eur: discount.discount_eur,
      discount_label: discount.tier_label,
      discount_description: discount.tier_description,
      emailed: data.contact.includes("@"),
      agent_guidance:
        "Confirm the discount applied and remaining balance. Mention the redemption confirmation email if emailed.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return jsonResponse(
      { success: false, error: message } satisfies ToolErrorResult,
      500,
    );
  }
});
