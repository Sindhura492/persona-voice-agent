import {
  buildLoyaltySummary,
  fetchLoyaltyAccount,
  PROGRAM_NAME,
  REDEMPTION_TIERS,
  WELCOME_BONUS_POINTS,
} from "../_shared/loyalty.ts";
import { postToN8n } from "../_shared/n8n.ts";
import {
  extractToolArgs,
  getServiceClient,
  handleOptions,
  jsonResponse,
} from "../_shared/http.ts";
import type { ToolErrorResult } from "../_shared/skiTypes.ts";
import { validateSendLoyaltyDetails } from "./validate.ts";

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

  const parsed = validateSendLoyaltyDetails(extractToolArgs(body));
  if (!parsed.ok) {
    return jsonResponse(
      { success: false, error: parsed.error } satisfies ToolErrorResult,
      400,
    );
  }

  const data = parsed.data;

  try {
    const supabase = getServiceClient();
    const account = await fetchLoyaltyAccount(supabase, data.contact);
    const summary = account
      ? buildLoyaltySummary(account.points_balance)
      : null;

    const payload = {
      event: "loyalty_brochure",
      type: "LOYALTY_BROCHURE",
      to: data.contact,
      guestName: data.guest_name ?? account?.guest_name ?? "Guest",
      contact: data.contact,
      program: PROGRAM_NAME,
      enrolled: Boolean(account),
      points_balance: account?.points_balance ?? 0,
      welcome_bonus_points: WELCOME_BONUS_POINTS,
      welcome_bonus_eligible: !account,
      redemption_tiers: REDEMPTION_TIERS,
      available_redemptions: summary?.available_redemptions ?? [],
      next_tier: summary?.next_tier ?? null,
      points_to_next_tier: summary?.points_to_next_tier ?? null,
      include_redemption_guide: data.include_redemption_guide,
      sentAt: new Date().toISOString(),
    };

    await postToN8n(payload);

    return jsonResponse({
      success: true,
      emailed: true,
      contact: data.contact,
      event: "loyalty_brochure",
      enrolled: Boolean(account),
      points_balance: account?.points_balance ?? 0,
      message: account
        ? "Summit Circle balance and redemption options were emailed."
        : `Welcome bonus (${WELCOME_BONUS_POINTS} points) and redemption guide were emailed.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return jsonResponse(
      { success: false, error: message } satisfies ToolErrorResult,
      500,
    );
  }
});
