"use client";

import { useCallback, useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import { contactsMatch } from "@/features/shared/guestContact";
import { useGuestContact } from "@/features/shared/GuestContactProvider";
import { STATUS_OVERLAY_CLASS } from "@/features/shared/statusOverlay";
import { useGuestScopedRow } from "@/features/shared/useGuestScopedRow";
import {
  parseLoyaltyAccount,
  type LoyaltyAccount,
  type LoyaltySnapshot,
} from "./loyaltyTypes";

function withSnapshot(
  account: LoyaltyAccount,
  previous: number | null,
): LoyaltySnapshot {
  return { ...account, previous_balance: previous };
}

export function LoyaltyStatus() {
  const { guestContact, sessionScopedAt } = useGuestContact();
  const previousBalanceRef = useRef<number | null>(null);

  const parse = useCallback((row: unknown) => {
    const account = parseLoyaltyAccount(row);
    if (!account) {
      return null;
    }
    const snapshot = withSnapshot(account, previousBalanceRef.current);
    previousBalanceRef.current = account.points_balance;
    return snapshot;
  }, []);

  const belongsToGuest = useCallback(
    (account: LoyaltyAccount, contact: string) =>
      contactsMatch(account.contact, contact),
    [],
  );

  const loyalty = useGuestScopedRow<LoyaltySnapshot>({
    guestContact,
    sessionScopedAt,
    table: "loyalty_accounts",
    events: ["INSERT", "UPDATE"],
    parse,
    channelName: "ski-loyalty",
    belongsToGuest,
  });

  if (!loyalty) {
    return null;
  }

  const redeemed =
    loyalty.previous_balance !== null &&
    loyalty.points_balance < loyalty.previous_balance;
  const redeemedAmount =
    redeemed && loyalty.previous_balance !== null
      ? loyalty.previous_balance - loyalty.points_balance
      : 0;

  return (
    <aside aria-live="polite" className={STATUS_OVERLAY_CLASS}>
      <Badge className="font-semibold text-charcoal">
        {redeemed
          ? "Points redeemed"
          : loyalty.previous_balance === null && loyalty.points_balance >= 200
            ? "Welcome bonus"
            : "Summit Circle balance"}
      </Badge>
      <h2 className="mt-xs font-display text-h3 text-charcoal">
        {loyalty.guest_name}
      </h2>
      <p className="mt-sm font-display text-h2 text-charcoal">
        {loyalty.points_balance.toLocaleString()}{" "}
        <span className="text-h3 text-slate">pts</span>
      </p>
      <p className="mt-xs text-caption text-graphite">
        {redeemed
          ? `${redeemedAmount.toLocaleString()} points redeemed. Confirmation emailed.`
          : loyalty.previous_balance === null && loyalty.points_balance >= 200
            ? "200 welcome points added to your Summit Circle account."
            : "Balance updated from your call."}
      </p>
    </aside>
  );
}
