import { type Locale } from "@/features/locale/localeTypes";
import { type VoiceSessionState } from "./useVoiceSession";
import { widgetConfig } from "./widgetConfig";

const IDLE_LABEL: Record<Locale, string> = {
  en: "Ready when you are",
  de: "Wir sind bereit",
};

const REQUESTING_MIC_LABEL: Record<Locale, string> = {
  en: "Allow microphone access in your browser prompt…",
  de: "Bitte Mikrofonzugriff im Browser-Dialog erlauben…",
};

const CONNECTING_LABEL: Record<Locale, string> = {
  en: "Connecting…",
  de: "Verbindung wird hergestellt…",
};

const LISTENING_LABEL: Record<Locale, string> = {
  en: "Listening",
  de: "Wir hören zu",
};

const ERROR_LABEL: Record<Locale, string> = {
  en: "Connection issue",
  de: "Verbindungsproblem",
};

const SPEAKING_SUFFIX: Record<Locale, string> = {
  en: "speaking",
  de: "spricht",
};

export function voiceStateLabel(
  sessionState: VoiceSessionState,
  locale: Locale,
): string {
  switch (sessionState) {
    case "idle":
      return IDLE_LABEL[locale];
    case "requesting_permission":
      return REQUESTING_MIC_LABEL[locale];
    case "connecting":
      return CONNECTING_LABEL[locale];
    case "connected":
      return LISTENING_LABEL[locale];
    case "speaking":
      return `${widgetConfig.conciergeLabel} ${SPEAKING_SUFFIX[locale]}`;
    case "error":
      return ERROR_LABEL[locale];
  }
}
