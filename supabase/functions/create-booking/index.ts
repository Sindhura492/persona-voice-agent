import { mockAvailability } from "../_shared/availability.ts";
import { isBookingRow } from "../_shared/bookingLookup.ts";
import {
  discountForPoints,
  ensureLoyaltyAccount,
  fetchLoyaltyAccount,
  PROGRAM_NAME,
  WELCOME_BONUS_POINTS,
} from "../_shared/loyalty.ts";
import {
  extractToolArgs,
  getServiceClient,
  handleOptions,
  jsonResponse,
} from "../_shared/http.ts";
import type { ToolErrorResult } from "../_shared/skiTypes.ts";
import { validateCreateBooking } from "./validate.ts";

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

  const parsed = validateCreateBooking(extractToolArgs(body));
  if (!parsed.ok) {
    return jsonResponse(
      { success: false, error: parsed.error } satisfies ToolErrorResult,
      400,
    );
  }

  const payload = parsed.data;
  const availability = mockAvailability(payload);
  const requested = availability.packages.find(
    (pkg) => pkg.package_type === payload.package_type,
  );

  if (!requested?.available) {
    return jsonResponse(
      {
        success: false,
        error:
          "Requested package is not available for those dates. Offer alternatives from check_availability.",
      } satisfies ToolErrorResult,
      409,
    );
  }

  try {
    const supabase = getServiceClient();
    const estimatedTotal = requested.total;
    let loyaltyPointsRedeemed = 0;
    let loyaltyDiscountEur = 0;

    try {
      await ensureLoyaltyAccount(
        supabase,
        payload.guest_name,
        payload.contact,
      );
    } catch {
      // Continue; redemption will fail clearly if no account.
    }

    if (payload.loyalty_points_redeemed > 0) {
      const account = await fetchLoyaltyAccount(supabase, payload.contact);
      if (!account) {
        return jsonResponse(
          {
            success: false,
            error: "No loyalty account found for redemption.",
          } satisfies ToolErrorResult,
          404,
        );
      }
      if (account.points_balance < payload.loyalty_points_redeemed) {
        return jsonResponse(
          {
            success: false,
            error: "Insufficient points balance",
            points_balance: account.points_balance,
            points_requested: payload.loyalty_points_redeemed,
          },
          409,
        );
      }

      const discount = discountForPoints(payload.loyalty_points_redeemed);
      loyaltyPointsRedeemed = payload.loyalty_points_redeemed;
      loyaltyDiscountEur = Math.min(discount.discount_eur, estimatedTotal);

      const { error: redeemError } = await supabase
        .from("loyalty_accounts")
        .update({
          points_balance: account.points_balance - loyaltyPointsRedeemed,
        })
        .eq("id", account.id);

      if (redeemError) {
        return jsonResponse(
          {
            success: false,
            error: redeemError.message ?? "Failed to redeem loyalty points",
          } satisfies ToolErrorResult,
          500,
        );
      }
    }

    const finalTotal = Math.max(0, estimatedTotal - loyaltyDiscountEur);

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        guest_name: payload.guest_name,
        contact: payload.contact,
        package_type: payload.package_type,
        arrival_date: payload.arrival_date,
        departure_date: payload.departure_date,
        lift_pass_included: payload.lift_pass_included,
        lessons_included: payload.lessons_included,
        status: "pending",
        estimated_total_eur: estimatedTotal,
        final_total_eur: finalTotal,
        loyalty_points_redeemed: loyaltyPointsRedeemed,
        loyalty_discount_eur: loyaltyDiscountEur,
      })
      .select(
        "id, guest_name, contact, package_type, arrival_date, departure_date, lift_pass_included, lessons_included, status, estimated_total_eur, final_total_eur, loyalty_points_redeemed, loyalty_discount_eur, created_at",
      )
      .single();

    if (error || !isBookingRow(data)) {
      return jsonResponse(
        {
          success: false,
          error: error?.message ?? "Failed to create booking",
        } satisfies ToolErrorResult,
        500,
      );
    }

    let loyaltyEnrollment: {
      welcome_bonus: boolean;
      welcome_points: number;
      points_balance: number;
    } | null = null;

    try {
      const loyalty = await ensureLoyaltyAccount(
        supabase,
        payload.guest_name,
        payload.contact,
      );
      loyaltyEnrollment = {
        welcome_bonus: loyalty.welcome_bonus,
        welcome_points: loyalty.welcome_points,
        points_balance: loyalty.account.points_balance,
      };
    } catch {
      loyaltyEnrollment = null;
    }

    return jsonResponse(
      {
        success: true,
        booking_id: data.id,
        guest_name: data.guest_name,
        contact: data.contact,
        package_type: data.package_type,
        arrival_date: data.arrival_date,
        departure_date: data.departure_date,
        lift_pass_included: data.lift_pass_included,
        lessons_included: data.lessons_included,
        status: data.status,
        estimated_total: estimatedTotal,
        loyalty_discount_eur: loyaltyDiscountEur,
        final_total: finalTotal,
        loyalty_points_redeemed: loyaltyPointsRedeemed,
        currency: requested.currency,
        created_at: data.created_at,
        loyalty_program: PROGRAM_NAME,
        loyalty_enrollment: loyaltyEnrollment,
        welcome_bonus_points: loyaltyEnrollment?.welcome_bonus
          ? WELCOME_BONUS_POINTS
          : 0,
        agent_guidance: loyaltyPointsRedeemed > 0
          ? `Confirm subtotal EUR ${estimatedTotal}, discount EUR ${loyaltyDiscountEur} (${loyaltyPointsRedeemed} pts), and total EUR ${finalTotal}.`
          : loyaltyEnrollment?.welcome_bonus
            ? `Announce ${WELCOME_BONUS_POINTS} welcome ${PROGRAM_NAME} points were added.`
            : `Guest has ${loyaltyEnrollment?.points_balance ?? 0} ${PROGRAM_NAME} points.`,
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
