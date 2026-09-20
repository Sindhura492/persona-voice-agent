import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { normalizeContact } from "./validateCommon.ts";

export const WELCOME_BONUS_POINTS = 200;
export const PROGRAM_NAME = "Summit Circle";
/** Marketing earn rate: 1 Summit Circle point per EUR 1 of stay subtotal. */
export const EARN_POINTS_PER_EUR = 1;
export const EARN_LIFT_BONUS_POINTS = 25;
export const EARN_LESSONS_BONUS_POINTS = 25;

export type RedemptionTier = {
  points: number;
  discount_eur: number;
  label: string;
  description: string;
};

export const REDEMPTION_TIERS: readonly RedemptionTier[] = [
  {
    points: 200,
    discount_eur: 10,
    label: "EUR 10 resort credit",
    description: "Dining, retail, or spa at Snowveil village",
  },
  {
    points: 500,
    discount_eur: 25,
    label: "EUR 25 lift pass credit",
    description: "Applied to your next lift pass purchase",
  },
  {
    points: 1000,
    discount_eur: 60,
    label: "EUR 60 dining credit",
    description: "Valid at mountain restaurants",
  },
  {
    points: 2000,
    discount_eur: 150,
    label: "EUR 150 room upgrade",
    description: "Subject to availability at check-in",
  },
] as const;

export type LoyaltyAccountRow = {
  id: string;
  guest_name: string;
  contact: string;
  points_balance: number;
  created_at: string;
};

const LOYALTY_COLUMNS = "id, guest_name, contact, points_balance, created_at";

export function discountForPoints(points: number): {
  discount_eur: number;
  tier_label: string | null;
  tier_description: string | null;
} {
  let matched: RedemptionTier | null = null;
  for (const tier of REDEMPTION_TIERS) {
    if (points === tier.points) {
      matched = tier;
      break;
    }
  }

  if (matched) {
    return {
      discount_eur: matched.discount_eur,
      tier_label: matched.label,
      tier_description: matched.description,
    };
  }

  const discount_eur = Math.floor(points / 20);
  return {
    discount_eur,
    tier_label: discount_eur > 0 ? `EUR ${discount_eur} custom credit` : null,
    tier_description:
      discount_eur > 0
        ? "Proportional credit at EUR 1 per 20 points redeemed"
        : null,
  };
}

export function pointsEarnedForBooking(input: {
  estimated_total_eur: number;
  lift_pass_included: boolean;
  lessons_included: boolean;
}): {
  points: number;
  base_points: number;
  lift_bonus: number;
  lessons_bonus: number;
  rule_summary: string;
} {
  const base_points = Math.max(
    0,
    Math.floor(Number(input.estimated_total_eur) || 0) * EARN_POINTS_PER_EUR,
  );
  const lift_bonus = input.lift_pass_included ? EARN_LIFT_BONUS_POINTS : 0;
  const lessons_bonus = input.lessons_included ? EARN_LESSONS_BONUS_POINTS : 0;
  const points = base_points + lift_bonus + lessons_bonus;

  const parts = [`${base_points} pts from stay (1 pt / EUR)`];
  if (lift_bonus > 0) {
    parts.push(`+${lift_bonus} lift bonus`);
  }
  if (lessons_bonus > 0) {
    parts.push(`+${lessons_bonus} lessons bonus`);
  }

  return {
    points,
    base_points,
    lift_bonus,
    lessons_bonus,
    rule_summary: parts.join(" "),
  };
}

export async function awardLoyaltyPoints(
  supabase: SupabaseClient,
  accountId: string,
  points: number,
): Promise<LoyaltyAccountRow | null> {
  if (points <= 0) {
    return null;
  }

  const { data: current, error: readError } = await supabase
    .from("loyalty_accounts")
    .select(LOYALTY_COLUMNS)
    .eq("id", accountId)
    .single();

  if (readError || !current) {
    return null;
  }

  const account = current as LoyaltyAccountRow;
  const { data, error } = await supabase
    .from("loyalty_accounts")
    .update({ points_balance: account.points_balance + points })
    .eq("id", accountId)
    .select(LOYALTY_COLUMNS)
    .single();

  if (error || !data) {
    return null;
  }
  return data as LoyaltyAccountRow;
}

export function availableRedemptions(balance: number): RedemptionTier[] {
  return REDEMPTION_TIERS.filter((tier) => balance >= tier.points);
}

export function nextRedemptionTier(balance: number): RedemptionTier | null {
  return REDEMPTION_TIERS.find((tier) => balance < tier.points) ?? null;
}

export function buildLoyaltySummary(balance: number): {
  available_redemptions: RedemptionTier[];
  next_tier: RedemptionTier | null;
  points_to_next_tier: number | null;
} {
  const available_redemptions = availableRedemptions(balance);
  const next_tier = nextRedemptionTier(balance);
  return {
    available_redemptions,
    next_tier,
    points_to_next_tier: next_tier
      ? Math.max(0, next_tier.points - balance)
      : null,
  };
}

export async function fetchLoyaltyAccount(
  supabase: SupabaseClient,
  contact: string,
): Promise<LoyaltyAccountRow | null> {
  const normalized = normalizeContact(contact);
  if (!normalized) {
    return null;
  }

  const candidates = new Set<string>([normalized]);

  if (normalized.includes("@")) {
    const [local, domain] = normalized.split("@", 2);
    if (local && domain) {
      const compactLocal = local.replace(/[._+-]/g, "");
      if (compactLocal !== local) {
        candidates.add(`${compactLocal}@${domain}`);
      }
    }
  }

  for (const candidate of candidates) {
    const { data, error } = await supabase
      .from("loyalty_accounts")
      .select(LOYALTY_COLUMNS)
      .ilike("contact", candidate)
      .maybeSingle();

    if (!error && data) {
      return data as LoyaltyAccountRow;
    }
  }

  return null;
}

export async function guestHasActiveBooking(
  supabase: SupabaseClient,
  contact: string,
): Promise<boolean> {
  const normalized = normalizeContact(contact);
  const { count, error } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .ilike("contact", normalized)
    .neq("status", "cancelled");

  if (error) {
    return false;
  }
  return (count ?? 0) > 0;
}

export async function ensureLoyaltyAccount(
  supabase: SupabaseClient,
  guestName: string,
  contact: string,
): Promise<{
  account: LoyaltyAccountRow;
  welcome_bonus: boolean;
  welcome_points: number;
}> {
  const existing = await fetchLoyaltyAccount(supabase, contact);
  if (existing) {
    return { account: existing, welcome_bonus: false, welcome_points: 0 };
  }

  const { data, error } = await supabase
    .from("loyalty_accounts")
    .insert({
      guest_name: guestName,
      contact: contact.trim(),
      points_balance: WELCOME_BONUS_POINTS,
    })
    .select(LOYALTY_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create loyalty account");
  }

  return {
    account: data as LoyaltyAccountRow,
    welcome_bonus: true,
    welcome_points: WELCOME_BONUS_POINTS,
  };
}

export function buildLoyaltyLookupResponse(
  contact: string,
  account: LoyaltyAccountRow | null,
  hasActiveBooking: boolean,
) {
  if (!account) {
    return {
      success: true,
      found: false,
      contact,
      has_active_booking: hasActiveBooking,
      welcome_bonus_points: WELCOME_BONUS_POINTS,
      welcome_bonus_eligible: true,
      redemption_tiers: REDEMPTION_TIERS,
      message:
        `No ${PROGRAM_NAME} account found for "${contact}". If the guest believes they are enrolled, confirm the email spelling and try again.`,
      agent_guidance:
        "Announce the 200 welcome points for first-time guests. Propose enrollment with their first booking and mention redemption tiers.",
    };
  }

  const summary = buildLoyaltySummary(account.points_balance);

  return {
    success: true,
    found: true,
    account_id: account.id,
    guest_name: account.guest_name,
    contact: account.contact,
    points_balance: account.points_balance,
    has_active_booking: hasActiveBooking,
    program: PROGRAM_NAME,
    redemption_tiers: REDEMPTION_TIERS,
    available_redemptions: summary.available_redemptions,
    next_tier: summary.next_tier,
    points_to_next_tier: summary.points_to_next_tier,
    welcome_bonus_eligible: false,
    created_at: account.created_at,
    agent_guidance:
      "Proactively announce the balance and best available redemption before discussing packages. Offer send_loyalty_details email if they want discounts in writing.",
    message: summary.available_redemptions.length > 0
      ? `Guest has ${account.points_balance} points. Best redemption now: ${summary.available_redemptions[summary.available_redemptions.length - 1]?.label}.`
      : `Guest has ${account.points_balance} points. Next reward at ${summary.next_tier?.points ?? "n/a"} points (${summary.next_tier?.label ?? "max tier reached"}).`,
  };
}
