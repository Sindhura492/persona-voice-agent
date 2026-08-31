"use client";

import { useEffect, useId, useState } from "react";
import { useLocale } from "@/features/locale/LocaleProvider";
import { Button } from "@/components/ui/Button";
import {
  GUEST_DETAILS_COPY,
  type GuestDetailFocus,
  type GuestDetails,
} from "./guestDetailsCopy";
import {
  canShareGuestDetails,
  normalizeGuestDetails,
} from "./normalizeGuestDetails";

type GuestDetailsFormProps = {
  focus: GuestDetailFocus;
  guestName: string;
  guestEmail: string;
  expanded?: boolean;
  requireBoth?: boolean;
  disabled?: boolean;
  isSharing?: boolean;
  onChange: (details: GuestDetails) => void;
  onShare: (details: GuestDetails) => void | Promise<void>;
};

export function GuestDetailsForm({
  focus,
  guestName,
  guestEmail,
  expanded = false,
  requireBoth = false,
  disabled = false,
  isSharing = false,
  onChange,
  onShare,
}: GuestDetailsFormProps) {
  const { locale } = useLocale();
  const copy = GUEST_DETAILS_COPY[locale];
  const [open, setOpen] = useState(expanded);
  const [sharedHint, setSharedHint] = useState(false);
  const nameId = useId();
  const emailId = useId();

  useEffect(() => {
    if (expanded || focus) {
      setOpen(true);
    }
  }, [expanded, focus]);

  const showName = requireBoth || focus === "name" || focus === "both" || !focus;
  const showEmail =
    requireBoth || focus === "email" || focus === "both" || !focus;

  const prompt = requireBoth
    ? copy.bookingRequired
    : focus === "both"
      ? copy.promptBoth
      : focus === "email"
        ? copy.promptEmail
        : focus === "name"
          ? copy.promptName
          : copy.toggleHint;

  const canShare = canShareGuestDetails(guestName, guestEmail, requireBoth);

  const hasTypedSomething =
    guestName.trim().length > 0 || guestEmail.trim().length > 0;
  const showShareHint = hasTypedSomething && !canShare && !disabled && !isSharing;

  const updateDetails = (next: Partial<GuestDetails>) => {
    onChange({
      guestName: next.guestName ?? guestName,
      guestEmail: next.guestEmail ?? guestEmail,
    });
  };

  const handleShare = async () => {
    if (!canShare || disabled || isSharing) {
      return;
    }
    const details = normalizeGuestDetails(guestName, guestEmail);
    await onShare(details);
    setSharedHint(true);
    window.setTimeout(() => setSharedHint(false), 4000);
  };

  const nameHighlight =
    focus === "name" || focus === "both" || requireBoth
      ? "border-ice-deep ring-2 ring-ice/40"
      : "border-stone";
  const emailHighlight =
    focus === "email" || focus === "both" || requireBoth
      ? "border-ice-deep ring-2 ring-ice/40"
      : "border-stone";

  return (
    <div
      className={`w-full rounded-sm border bg-mist/60 px-md py-md text-left ${
        requireBoth || focus ? "border-ice-deep/40" : "border-stone"
      }`}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-sm text-left"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="text-caption font-semibold uppercase tracking-[0.14em] text-charcoal">
          {requireBoth ? copy.bookingRequired.split(".")[0].trim() : copy.toggle}
        </span>
        <span className="text-caption text-slate" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>

      {open ? (
        <div className="mt-md space-y-md">
          <p className="text-small leading-relaxed text-graphite">{prompt}</p>

          {showName ? (
            <div>
              <label
                htmlFor={nameId}
                className="mb-xs block text-caption font-medium text-charcoal"
              >
                {copy.nameLabel}
                {requireBoth ? (
                  <span className="text-ice-deep"> *</span>
                ) : null}
              </label>
              <input
                id={nameId}
                type="text"
                autoComplete="name"
                disabled={disabled || isSharing}
                value={guestName}
                onChange={(event) =>
                  updateDetails({ guestName: event.target.value })
                }
                placeholder={copy.namePlaceholder}
                className={`w-full rounded-sm bg-snow-soft px-md py-sm text-small text-charcoal outline-none focus:ring-2 focus:ring-ice-deep disabled:opacity-60 ${nameHighlight}`}
              />
            </div>
          ) : null}

          {showEmail ? (
            <div>
              <label
                htmlFor={emailId}
                className="mb-xs block text-caption font-medium text-charcoal"
              >
                {copy.emailLabel}
                {requireBoth ? (
                  <span className="text-ice-deep"> *</span>
                ) : null}
              </label>
              <input
                id={emailId}
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                disabled={disabled || isSharing}
                value={guestEmail}
                onChange={(event) =>
                  updateDetails({ guestEmail: event.target.value })
                }
                placeholder={copy.emailPlaceholder}
                className={`w-full rounded-sm bg-snow-soft px-md py-sm text-small text-charcoal outline-none focus:ring-2 focus:ring-ice-deep disabled:opacity-60 ${emailHighlight}`}
              />
            </div>
          ) : null}

          <Button
            type="button"
            variant={canShare && !disabled && !isSharing ? "primary" : "outline"}
            className="w-full font-medium"
            disabled={!canShare || disabled || isSharing}
            onClick={() => void handleShare()}
          >
            {isSharing ? copy.sharing : copy.share}
          </Button>

          {showShareHint ? (
            <p className="text-caption leading-relaxed text-graphite" role="status">
              {copy.shareBlockedHint}
            </p>
          ) : null}

          {sharedHint ? (
            <p className="text-caption text-ice-deep">{copy.savedHint}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
