import {
  discountForPoints,
  fetchLoyaltyAccount,
  PROGRAM_NAME,
} from "../_shared/loyalty.ts";
import { findActiveBooking, isBookingRow } from "../_shared/bookingLookup.ts";
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
    const discountApplied = discount.discount_eur > 0;

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

    let updatedBooking: Record<string, unknown> | null = null;
    let billEmailed = false;

    // Prefer explicit booking_id; otherwise attach discount to latest active stay for this contact.
    if (discountApplied) {
      const booking = await findActiveBooking(supabase, {
        booking_id: parsed.data.booking_id,
        contact: parsed.data.contact,
      });

      if (booking) {
        const estimated =
          typeof booking.estimated_total_eur === "number"
            ? booking.estimated_total_eur
            : Number(booking.estimated_total_eur ?? 0);
        const appliedDiscount = Math.min(
          discount.discount_eur,
          estimated || discount.discount_eur,
        );
        const finalTotal = Math.max(0, (estimated || 0) - appliedDiscount);

        const { data: bookingRow, error: bookingError } = await supabase
          .from("bookings")
          .update({
            loyalty_points_redeemed: parsed.data.points,
            loyalty_discount_eur: appliedDiscount,
            final_total_eur: finalTotal,
            estimated_total_eur: estimated || null,
          })
          .eq("id", booking.id)
          .select(
            "id, guest_name, contact, package_type, arrival_date, departure_date, lift_pass_included, lessons_included, status, estimated_total_eur, final_total_eur, loyalty_points_redeemed, loyalty_discount_eur, created_at",
          )
          .single();

        if (!bookingError && isBookingRow(bookingRow)) {
          updatedBooking = bookingRow as unknown as Record<string, unknown>;
        }
      }
    }

    if (discountApplied && data.contact.includes("@")) {
      try {
        if (updatedBooking) {
          await postToN8n({
            event: "booking_bill_updated",
            type: "BOOKING_BILL_UPDATED",
            to: data.contact,
            guestName: data.guest_name,
            contact: data.contact,
            record: updatedBooking,
            points_redeemed: parsed.data.points,
            discount_eur: discount.discount_eur,
            discount_label: discount.tier_label,
            points_balance: data.points_balance,
            sentAt: new Date().toISOString(),
          });
          billEmailed = true;
        } else {
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
          billEmailed = true;
        }
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
      discount_applied: discountApplied,
      discount_label: discount.tier_label,
      discount_description: discount.tier_description,
      booking_id: updatedBooking?.id ?? parsed.data.booking_id,
      booking_updated: Boolean(updatedBooking),
      final_total_eur: updatedBooking?.final_total_eur ?? null,
      emailed: billEmailed,
      agent_guidance: discountApplied
        ? updatedBooking
          ? `Confirm discount EUR ${discount.discount_eur} on the booking and new total EUR ${updatedBooking.final_total_eur}. An updated bill email was sent.`
          : "No active booking found to attach the discount. Confirm remaining balance and redemption email only; do not claim the booking total changed."
        : "Points were deducted but no EUR discount applied (below minimum tier). Do not promise a new bill email.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return jsonResponse(
      { success: false, error: message } satisfies ToolErrorResult,
      500,
    );
  }
});
