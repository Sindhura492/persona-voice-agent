import {
  buildPlanCatalog,
  mockAvailability,
} from "../_shared/availability.ts";
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
import type { PackageType, ToolErrorResult } from "../_shared/skiTypes.ts";
import { PACKAGE_TYPES } from "../_shared/skiTypes.ts";
import { validateSendPlanDetails } from "./validate.ts";

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

  const parsed = validateSendPlanDetails(extractToolArgs(body));
  if (!parsed.ok) {
    return jsonResponse(
      { success: false, error: parsed.error } satisfies ToolErrorResult,
      400,
    );
  }

  const data = parsed.data;
  const plans = buildPlanCatalog();
  const focusPackage =
    data.package_type ?? ("alpine_escape" as PackageType);

  let availability = null;
  if (
    data.include_availability &&
    data.arrival_date &&
    data.departure_date
  ) {
    availability = mockAvailability({
      package_type: focusPackage,
      arrival_date: data.arrival_date,
      departure_date: data.departure_date,
      lift_pass_included: data.lift_pass_included,
      lessons_included: data.lessons_included,
    });
  }

  try {
    const supabase = getServiceClient();
    const loyaltyAccount = await fetchLoyaltyAccount(supabase, data.contact);
    const loyaltySummary = loyaltyAccount
      ? buildLoyaltySummary(loyaltyAccount.points_balance)
      : null;

    const payload = {
      event: "plan_brochure",
      type: "PLAN_BROCHURE",
      to: data.contact,
      guestName: data.guest_name ?? loyaltyAccount?.guest_name ?? "Guest",
      contact: data.contact,
      focusPackage,
      focusPackageLabel:
        plans.find((plan) => plan.package_type === focusPackage)?.name ??
        focusPackage,
      arrival: data.arrival_date,
      departure: data.departure_date,
      liftPass: data.lift_pass_included,
      lessons: data.lessons_included,
      currency: "EUR",
      plans,
      availability,
      packageTypes: PACKAGE_TYPES,
      loyalty: {
        program: PROGRAM_NAME,
        enrolled: Boolean(loyaltyAccount),
        points_balance: loyaltyAccount?.points_balance ?? 0,
        welcome_bonus_points: WELCOME_BONUS_POINTS,
        welcome_bonus_eligible: !loyaltyAccount,
        redemption_tiers: REDEMPTION_TIERS,
        available_redemptions: loyaltySummary?.available_redemptions ?? [],
        next_tier: loyaltySummary?.next_tier ?? null,
      },
      sentAt: new Date().toISOString(),
    };

    await postToN8n(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "n8n request failed";
    return jsonResponse(
      { success: false, error: message } satisfies ToolErrorResult,
      502,
    );
  }

  return jsonResponse({
    success: true,
    emailed: true,
    contact: data.contact,
    event: "plan_brochure",
    plans_count: plans.length,
    availability_included: Boolean(availability),
    message:
      "Plan and pricing details were emailed. Guest can review offline and book later.",
  });
});
