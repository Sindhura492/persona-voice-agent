import type { Locale } from "./localeTypes";

type HeroStageCopy = {
  eyebrow: string;
  title: string;
};

export type CapabilityItem = {
  label: string;
  description: string;
  icon: "booking" | "gear" | "loyalty" | "safety" | "plans" | "waitlist";
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
    eyebrow: "Try saying",
    title: "Things you can ask",
    intro:
      "Speak naturally — here are ideas to get started. No menus, no forms.",
  },
  de: {
    eyebrow: "Zum Beispiel",
    title: "Das können Sie fragen",
    intro:
      "Sprechen Sie frei — hier ein paar Einstiege. Keine Menüs, keine Formulare.",
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
      label: "Book a stay",
      description: "“I’d like a day pass for November 4th with a lift pass.”",
      icon: "booking",
    },
    {
      label: "Check or change a booking",
      description: "“What’s on my booking?” · “Can I reschedule or cancel?”",
      icon: "booking",
    },
    {
      label: "Plans & pricing by email",
      description: "“Email me your packages and rates.”",
      icon: "plans",
    },
    {
      label: "Gear fitting",
      description: "“Save my height, boot size, and skill level for rental.”",
      icon: "gear",
    },
    {
      label: "Loyalty points",
      description: "“How many Summit Circle points do I have?”",
      icon: "loyalty",
    },
    {
      label: "Lesson waitlist",
      description: "“Put me on the waitlist for ski school.”",
      icon: "waitlist",
    },
    {
      label: "Safety & mountain help",
      description: "Anything urgent is handed straight to a specialist.",
      icon: "safety",
    },
  ],
  de: [
    {
      label: "Aufenthalt buchen",
      description: "„Ich möchte einen Tagespass für den 4. November mit Skipass.“",
      icon: "booking",
    },
    {
      label: "Buchung prüfen oder ändern",
      description:
        "„Was steht in meiner Buchung?“ · „Kann ich umbuchen oder stornieren?“",
      icon: "booking",
    },
    {
      label: "Angebote & Preise per E-Mail",
      description: "„Schicken Sie mir bitte Ihre Pakete und Preise.“",
      icon: "plans",
    },
    {
      label: "Ausrüstungsanprobe",
      description:
        "„Speichern Sie Größe, Schuhgröße und Können für die Leihe.“",
      icon: "gear",
    },
    {
      label: "Treuepunkte",
      description: "„Wie viele Summit-Circle-Punkte habe ich?“",
      icon: "loyalty",
    },
    {
      label: "Warteliste Skischule",
      description: "„Setzen Sie mich auf die Warteliste für den Kurs.“",
      icon: "waitlist",
    },
    {
      label: "Sicherheit & Berghilfe",
      description: "Dringendes geht direkt an einen Spezialisten.",
      icon: "safety",
    },
  ],
};
