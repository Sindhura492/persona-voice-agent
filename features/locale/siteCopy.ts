import type { Locale } from "./localeTypes";

type HeroStageCopy = {
  eyebrow: string;
  title: string;
};

export type CapabilityItem = {
  label: string;
  description: string;
  icon: "booking" | "gear" | "loyalty" | "safety";
};

type CapabilitySectionCopy = {
  eyebrow: string;
  title: string;
  intro: string;
};

type VoiceEntryCopy = {
  label: string;
  hook: string;
};

export const CAPABILITY_SECTION_COPY: Record<Locale, CapabilitySectionCopy> = {
  en: {
    eyebrow: "Before you call",
    title: "What your concierge can help with",
    intro:
      "Say any of the following in your own words. No menus, no forms.",
  },
  de: {
    eyebrow: "Vor Ihrem Anruf",
    title: "Wobei Ihr Concierge hilft",
    intro:
      "Sagen Sie es in eigenen Worten, ohne Menüs und ohne Formulare.",
  },
};

export const VOICE_ENTRY_COPY: Record<Locale, VoiceEntryCopy> = {
  en: {
    label: "Voice concierge",
    hook: "Ask in your own words. We listen first.",
  },
  de: {
    label: "Sprach-Concierge",
    hook: "Fragen Sie in eigenen Worten, wir hören zuerst zu.",
  },
};

export const HERO_STAGE_COPY: Record<Locale, HeroStageCopy> = {
  en: {
    eyebrow: "Voice concierge",
    title: "Speak with the mountain team",
  },
  de: {
    eyebrow: "Sprach-Concierge",
    title: "Sprechen Sie mit dem Bergteam",
  },
};

export const CAPABILITY_ITEMS: Record<Locale, readonly CapabilityItem[]> = {
  en: [
    {
      label: "Book & Reschedule",
      description: "Plan or change your stay",
      icon: "booking",
    },
    {
      label: "Gear Fitting",
      description: "Get properly fitted before you arrive",
      icon: "gear",
    },
    {
      label: "Lift Pass & Loyalty",
      description: "Check your balance",
      icon: "loyalty",
    },
    {
      label: "Always here for safety questions",
      description: "Anything urgent goes straight to a specialist",
      icon: "safety",
    },
  ],
  de: [
    {
      label: "Buchen & Umbuchen",
      description: "Aufenthalt planen oder ändern",
      icon: "booking",
    },
    {
      label: "Ausrüstungsanprobe",
      description: "Passend ausgestattet vor Anreise",
      icon: "gear",
    },
    {
      label: "Skipass & Treue",
      description: "Kontostand prüfen",
      icon: "loyalty",
    },
    {
      label: "Immer da bei Sicherheitsfragen",
      description: "Dringendes direkt an einen Spezialisten",
      icon: "safety",
    },
  ],
};
