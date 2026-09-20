"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { primeBrandAudio } from "@/lib/audio/brandSound";
import { useLocale } from "@/features/locale/LocaleProvider";
import { VOICE_ENTRY_COPY } from "@/features/locale/siteCopy";
import { type Locale } from "@/features/locale/localeTypes";
import { GuestDetailsForm } from "./GuestDetailsForm";
import { useVoiceSession } from "./useVoiceSession";
import { VoiceOrb } from "./VoiceOrb";
import { VoiceWidget } from "./VoiceWidget";
import { widgetConfig } from "./widgetConfig";
import { voiceStateLabel } from "./voiceLabels";

const MODAL_TITLE: Record<Locale, string> = {
  en: "Before you begin",
  de: "Bevor Sie beginnen",
};

const CALL_TITLE: Record<Locale, string> = {
  en: "Concierge",
  de: "Concierge",
};

const END_LABEL = {
  en: "End conversation",
  de: "Gespräch beenden",
} as const;

const RETURN_LABEL = {
  en: "Return to call",
  de: "Zurück zum Gespräch",
} as const;

export function VoiceLauncher() {
  const { locale } = useLocale();
  const session = useVoiceSession();
  const [open, setOpen] = useState(false);
  const { isActive, isStarting, endCall, startCall, connectPulse } = session;
  const entry = VOICE_ENTRY_COPY[locale];
  const inCall = isActive || isStarting;
  const awaitingConsent = !isActive && !isStarting;

  const closeModal = () => {
    if (isActive) {
      endCall();
    }
    setOpen(false);
  };

  const openModal = () => {
    void primeBrandAudio();
    setOpen(true);
  };

  const primaryLabel = awaitingConsent
    ? widgetConfig.consentCtaLabel[locale]
    : widgetConfig.ctaLabel[locale];

  return (
    <>
      {!open ? (
        <aside className="w-full rounded-sm border border-stone bg-snow-soft p-lg shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)] sm:max-w-md sm:p-xl">
          <div className="flex flex-col items-center gap-sm">
            <VoiceOrb state={session.state} size="md" />
            <p className="text-caption font-semibold uppercase tracking-[0.18em] text-graphite">
              {entry.label}
            </p>
            <p className="text-center font-display text-h3 font-medium leading-snug text-charcoal">
              {entry.hook}
            </p>
            {isActive ? (
              <p className="text-small font-semibold text-ice-deep">
                {voiceStateLabel(session.state, locale)}
              </p>
            ) : null}
          </div>

          <div className="mt-lg flex justify-center">
            <Button
              className="w-full max-w-sm font-medium sm:w-auto sm:min-w-[14rem]"
              onClick={openModal}
            >
              {isActive ? RETURN_LABEL[locale] : widgetConfig.ctaLabel[locale]}
            </Button>
          </div>
        </aside>
      ) : null}

      <Modal
        open={open}
        onClose={closeModal}
        title={inCall ? CALL_TITLE[locale] : MODAL_TITLE[locale]}
        stickyHeader={
          <div className="flex w-full flex-col items-center gap-md">
            <VoiceOrb state={session.state} size="md" />
            <p className="text-center text-small font-semibold text-ice-deep">
              {voiceStateLabel(session.state, locale)}
            </p>
            {inCall ? (
              <GuestDetailsForm
                focus={isActive ? session.detailFocus : null}
                forceOpen
                expanded
                requireBoth={session.bookingIntent}
                guestName={session.guestDetails.guestName}
                guestEmail={session.guestDetails.guestEmail}
                disabled={isStarting || session.isSharingDetails}
                isSharing={session.isSharingDetails}
                onChange={session.setGuestDetails}
                onShare={session.shareGuestDetails}
              />
            ) : null}
          </div>
        }
        stickyFooter={
          <div className="flex justify-center">
            <Button
              variant={isActive ? "outline" : "primary"}
              className={
                isActive
                  ? `w-full font-medium${connectPulse ? " voice-connect-pulse-btn" : ""}`
                  : `w-full font-medium${connectPulse ? " voice-connect-pulse-btn" : ""}`
              }
              disabled={!isActive && isStarting}
              onClick={() => {
                if (isActive) {
                  endCall();
                  setOpen(false);
                  return;
                }
                void startCall();
              }}
            >
              {isActive ? END_LABEL[locale] : primaryLabel}
            </Button>
          </div>
        }
      >
        <VoiceWidget
          session={session}
          surface="light"
          showDisclosure
          hideOrb
          hideGuestForm
          hidePrimaryAction
        />
      </Modal>
    </>
  );
}
