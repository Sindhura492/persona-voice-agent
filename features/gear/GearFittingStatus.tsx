"use client";

import { useCallback, useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import { contactsMatch } from "@/features/shared/guestContact";
import { useGuestContact } from "@/features/shared/GuestContactProvider";
import { STATUS_OVERLAY_CLASS } from "@/features/shared/statusOverlay";
import { useGuestScopedRow } from "@/features/shared/useGuestScopedRow";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  formatSkillLevel,
  parseGearFitting,
  type GearFitting,
} from "./gearTypes";

export function GearFittingStatus() {
  const { guestContact, sessionScopedAt } = useGuestContact();
  const bookingIdsRef = useRef<Set<string>>(new Set());

  const parse = useCallback((row: unknown) => parseGearFitting(row), []);

  const belongsToGuest = useCallback(
    async (fitting: GearFitting, contact: string): Promise<boolean> => {
      if (bookingIdsRef.current.has(fitting.booking_id)) {
        return true;
      }
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("bookings")
        .select("contact")
        .eq("id", fitting.booking_id)
        .maybeSingle();
      if (data?.contact && contactsMatch(data.contact, contact)) {
        bookingIdsRef.current.add(fitting.booking_id);
        return true;
      }
      return false;
    },
    [],
  );

  const fitting = useGuestScopedRow<GearFitting>({
    guestContact,
    sessionScopedAt,
    table: "gear_fittings",
    events: ["INSERT"],
    parse,
    channelName: "ski-gear-fittings",
    belongsToGuest,
  });

  if (!fitting) {
    return null;
  }

  return (
    <aside aria-live="polite" className={STATUS_OVERLAY_CLASS}>
      <Badge>Gear fitting saved</Badge>
      <h2 className="mt-xs font-display text-h3 text-charcoal">
        Your fitting details
      </h2>
      <dl className="mt-sm grid grid-cols-3 gap-md text-caption text-graphite">
        <div>
          <dt className="text-slate">Height</dt>
          <dd className="text-charcoal">{fitting.height_cm} cm</dd>
        </div>
        <div>
          <dt className="text-slate">Boot</dt>
          <dd className="text-charcoal">EU {fitting.boot_size}</dd>
        </div>
        <div>
          <dt className="text-slate">Level</dt>
          <dd className="text-charcoal">
            {formatSkillLevel(fitting.skill_level)}
          </dd>
        </div>
      </dl>
      {fitting.notes ? (
        <p className="mt-sm text-caption text-graphite">{fitting.notes}</p>
      ) : null}
      <p className="mt-sm border-t border-stone-soft pt-sm text-caption text-slate">
        Equipment staged before your first ski day. Confirmation emailed to your
        booking contact.
      </p>
    </aside>
  );
}
