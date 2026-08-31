"use client";

import { useLocale } from "@/features/locale/LocaleProvider";
import { LOYALTY_PREVIEW_COPY } from "./guestDetailsCopy";

export type LoyaltyPreview = {
  found: boolean;
  points_balance?: number;
  welcome_bonus_eligible?: boolean;
  welcome_bonus_points?: number;
  guest_name?: string;
};

type LoyaltyPreviewBannerProps = {
  preview: LoyaltyPreview | null;
};

export function LoyaltyPreviewBanner({ preview }: LoyaltyPreviewBannerProps) {
  const { locale } = useLocale();

  if (!preview) {
    return null;
  }

  const copy = LOYALTY_PREVIEW_COPY[locale];

  if (preview.found && typeof preview.points_balance === "number") {
    return (
      <div
        className="w-full rounded-sm border border-ice/40 bg-ice-soft/50 px-md py-sm text-left"
        role="status"
      >
        <p className="text-caption font-semibold uppercase tracking-[0.12em] text-ice-deep">
          {copy.returningTitle}
        </p>
        <p className="mt-xs text-small leading-relaxed text-charcoal">
          {copy.returningBody(preview.points_balance)}
        </p>
      </div>
    );
  }

  if (preview.welcome_bonus_eligible) {
    const points = preview.welcome_bonus_points ?? 200;
    return (
      <div
        className="w-full rounded-sm border border-ice-deep/25 bg-gradient-to-br from-ice-soft/80 to-snow-soft px-md py-sm text-left shadow-sm"
        role="status"
      >
        <p className="text-caption font-semibold uppercase tracking-[0.12em] text-ice-deep">
          {copy.welcomeTitle}
        </p>
        <p className="mt-xs text-small font-medium leading-relaxed text-charcoal">
          {copy.welcomeBody(points)}
        </p>
      </div>
    );
  }

  return null;
}
