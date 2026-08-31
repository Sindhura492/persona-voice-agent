"use client";

import { useCallback } from "react";
import { Badge } from "@/components/ui/Badge";
import { contactsMatch } from "@/features/shared/guestContact";
import { useGuestContact } from "@/features/shared/GuestContactProvider";
import { STATUS_OVERLAY_CLASS } from "@/features/shared/statusOverlay";
import { useGuestScopedRow } from "@/features/shared/useGuestScopedRow";
import {
  formatLessonDate,
  parseWaitlistEntry,
  type WaitlistEntry,
} from "./waitlistTypes";

function formatLevel(level: string): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function WaitlistStatus() {
  const { guestContact, sessionScopedAt } = useGuestContact();

  const parse = useCallback((row: unknown) => parseWaitlistEntry(row), []);

  const belongsToGuest = useCallback(
    (entry: WaitlistEntry, contact: string) =>
      contactsMatch(entry.contact, contact),
    [],
  );

  const entry = useGuestScopedRow<WaitlistEntry>({
    guestContact,
    sessionScopedAt,
    table: "waitlist_entries",
    events: ["INSERT"],
    parse,
    channelName: "ski-waitlist",
    belongsToGuest,
  });

  if (!entry) {
    return null;
  }

  return (
    <aside aria-live="polite" className={STATUS_OVERLAY_CLASS}>
      <Badge>On the waitlist</Badge>
      <h2 className="mt-xs font-display text-h3 text-charcoal">
        {entry.guest_name}
      </h2>
      <dl className="mt-sm grid grid-cols-3 gap-md text-caption text-graphite">
        <div>
          <dt className="text-slate">Date</dt>
          <dd className="text-charcoal">
            {formatLessonDate(entry.requested_date)}
          </dd>
        </div>
        <div>
          <dt className="text-slate">Level</dt>
          <dd className="text-charcoal">{formatLevel(entry.lesson_level)}</dd>
        </div>
        <div>
          <dt className="text-slate">Status</dt>
          <dd className="capitalize text-charcoal">{entry.status}</dd>
        </div>
      </dl>
      <p className="mt-sm border-t border-stone-soft pt-sm text-caption text-slate">
        We will reach out if a spot opens.
      </p>
    </aside>
  );
}
