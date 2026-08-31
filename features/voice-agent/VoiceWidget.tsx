"use client";

import { Button } from "@/components/ui/Button";
import { useLocale } from "@/features/locale/LocaleProvider";
import { CallTranscript } from "./CallTranscript";
import { GuestDetailsForm } from "./GuestDetailsForm";
import { LoyaltyPreviewBanner } from "./LoyaltyPreviewBanner";
import { useVoiceSession } from "./useVoiceSession";
import { voiceStateLabel } from "./voiceLabels";
import { widgetConfig } from "./widgetConfig";

const END_LABEL = {
  en: "End conversation",
  de: "Gespräch beenden",
} as const;

const CONSENT_HEADING = {
  en: "Before you call",
  de: "Vor dem Anruf",
} as const;

type VoiceWidgetProps = {
  session: ReturnType<typeof useVoiceSession>;
  surface?: "light" | "dark";
  showDisclosure?: boolean;
};

export function VoiceWidget({
  session,
  surface = "light",
  showDisclosure = true,
}: VoiceWidgetProps) {
  const { locale } = useLocale();
  const {
    state,
    error,
    transcript,
    startCall,
    endCall,
    isActive,
    isStarting,
    connectPulse,
    detailFocus,
    isSharingDetails,
    shareGuestDetails,
    setGuestDetails,
    bookingIntent,
    loyaltyPreview,
  } = session;
  const isLight = surface === "light";
  const awaitingConsent =
    showDisclosure && !isActive && !isStarting && state === "idle";

  const statusClass = isActive
    ? "font-semibold text-ice-deep"
    : isLight
      ? "font-medium text-charcoal"
      : "font-medium text-white/90";
  const errorClass = isLight ? "font-medium text-charcoal" : "text-white/90";

  const primaryLabel = awaitingConsent
    ? widgetConfig.consentCtaLabel[locale]
    : widgetConfig.ctaLabel[locale];

  return (
    <div
      className={`flex w-full flex-col items-center gap-lg ${
        connectPulse ? "voice-connect-pulse" : ""
      }`}
    >
      {awaitingConsent ? (
        <div className="w-full rounded-sm border border-stone bg-mist px-lg py-md text-left">
          <p className="text-caption font-semibold uppercase tracking-[0.14em] text-charcoal">
            {CONSENT_HEADING[locale]}
          </p>
          <p className="mt-sm text-small leading-relaxed text-charcoal">
            {widgetConfig.preCallDisclosures[locale]}
          </p>
        </div>
      ) : null}

      {!awaitingConsent ? (
        <p className={`text-center text-small ${statusClass}`}>
          {voiceStateLabel(state, locale)}
        </p>
      ) : null}

      {error ? (
        <p className={`text-center text-small ${errorClass}`} role="alert">
          {error}
        </p>
      ) : null}

      <GuestDetailsForm
        key={isActive ? "call-active" : "call-idle"}
        focus={isActive ? detailFocus : null}
        expanded={isActive || awaitingConsent}
        requireBoth={bookingIntent}
        guestName={session.guestDetails.guestName}
        guestEmail={session.guestDetails.guestEmail}
        disabled={isStarting || isSharingDetails}
        isSharing={isSharingDetails}
        onChange={setGuestDetails}
        onShare={shareGuestDetails}
      />

      <LoyaltyPreviewBanner preview={loyaltyPreview} />

      <Button
        variant={isActive ? "outline" : "primary"}
        className={
          isActive
            ? `min-w-[14rem] font-medium ring-2 ring-ice ring-offset-2 ring-offset-snow-soft${
                connectPulse ? " voice-connect-pulse-btn" : ""
              }`
            : `min-w-[14rem] font-medium${
                connectPulse ? " voice-connect-pulse-btn" : ""
              }`
        }
        disabled={!isActive && isStarting}
        onClick={() => {
          if (isActive) {
            endCall();
            return;
          }
          void startCall();
        }}
      >
        {isActive ? END_LABEL[locale] : primaryLabel}
      </Button>

      {isActive ? (
        <CallTranscript
          turns={transcript}
          agentLabel={widgetConfig.conciergeLabel}
          surface={surface}
        />
      ) : null}
    </div>
  );
}
