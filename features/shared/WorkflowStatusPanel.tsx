"use client";

import { BookingStatus } from "@/features/booking/BookingStatus";
import { GearFittingStatus } from "@/features/gear/GearFittingStatus";
import { LoyaltyStatus } from "@/features/loyalty/LoyaltyStatus";
import { WaitlistStatus } from "@/features/waitlist/WaitlistStatus";
import { useGuestContact } from "./GuestContactProvider";
import { useLocale } from "@/features/locale/LocaleProvider";
import type { Locale } from "@/features/locale/localeTypes";
import {
  StatusCardPresenceProvider,
  useHasStatusCards,
} from "./statusCardPresence";

const CLEAR_LABEL: Record<Locale, string> = {
  en: "Clear all",
  de: "Alles löschen",
};

function StatusPanelBody() {
  const { clearStatusCards } = useGuestContact();
  const { locale } = useLocale();
  const hasCards = useHasStatusCards();

  return (
    <div className="mt-md flex w-full flex-col gap-sm">
      {hasCards ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={clearStatusCards}
            className="rounded-sm border border-stone bg-snow-soft px-md py-sm text-caption font-semibold uppercase tracking-[0.12em] text-charcoal shadow-[0_8px_20px_-8px_rgba(0,0,0,0.45)] transition-colors hover:bg-mist"
          >
            {CLEAR_LABEL[locale]}
          </button>
        </div>
      ) : null}
      <BookingStatus />
      <GearFittingStatus />
      <LoyaltyStatus />
      <WaitlistStatus />
    </div>
  );
}

export function WorkflowStatusPanel() {
  return (
    <StatusCardPresenceProvider>
      <StatusPanelBody />
    </StatusCardPresenceProvider>
  );
}
