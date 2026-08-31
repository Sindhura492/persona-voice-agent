import type { Locale } from "@/features/locale/localeTypes";

export type GuestDetailFocus = "name" | "email" | "both" | null;

export type GuestDetails = {
  guestName: string;
  guestEmail: string;
};

export const GUEST_DETAILS_COPY: Record<
  Locale,
  {
    toggle: string;
    toggleHint: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    share: string;
    sharing: string;
    promptName: string;
    promptEmail: string;
    promptBoth: string;
    savedHint: string;
    bookingRequired: string;
    shareBlockedHint: string;
  }
> = {
  en: {
    toggle: "Prefer to type?",
    toggleHint: "Optional. Share when ready.",
    nameLabel: "Full name",
    namePlaceholder: "Your full name",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    share: "Share with concierge",
    sharing: "Sharing…",
    promptName: "Your name, then Share.",
    promptEmail: "Your email, then Share.",
    promptBoth: "Name and email, then Share.",
    savedHint: "Shared with concierge.",
    bookingRequired: "Full name and email required.",
    shareBlockedHint: "Use the correct fields and a valid email.",
  },
  de: {
    toggle: "Lieber tippen?",
    toggleHint: "Optional. Dann Senden tippen.",
    nameLabel: "Vollständiger Name",
    namePlaceholder: "Ihr vollständiger Name",
    emailLabel: "E-Mail-Adresse",
    emailPlaceholder: "sie@beispiel.de",
    share: "An Concierge senden",
    sharing: "Wird gesendet…",
    promptName: "Name, dann Senden.",
    promptEmail: "E-Mail, dann Senden.",
    promptBoth: "Name und E-Mail, dann Senden.",
    savedHint: "An Concierge gesendet.",
    bookingRequired: "Name und E-Mail erforderlich.",
    shareBlockedHint: "Richtige Felder und gültige E-Mail verwenden.",
  },
};

export const LOYALTY_PREVIEW_COPY: Record<
  Locale,
  {
    welcomeTitle: string;
    welcomeBody: (points: number) => string;
    returningTitle: string;
    returningBody: (points: number) => string;
  }
> = {
  en: {
    welcomeTitle: "Welcome to Summit Circle",
    welcomeBody: (points) =>
      `Hey, wonderful news! You're new here, and you'll receive ${points} welcome points when we complete your booking today. That's resort credit for dining, lift passes, and more.`,
    returningTitle: "Summit Circle member",
    returningBody: (points) =>
      `You have ${points.toLocaleString()} points on file. The concierge can apply them toward your stay.`,
  },
  de: {
    welcomeTitle: "Willkommen bei Summit Circle",
    welcomeBody: (points) =>
      `Oh, wie schön! Sie sind neu bei uns! Bei Abschluss der Buchung erhalten Sie ${points} Willkommenspunkte für Restaurant, Liftpass und mehr.`,
    returningTitle: "Summit Circle Mitglied",
    returningBody: (points) =>
      `Sie haben ${points.toLocaleString()} Punkte. Der Concierge kann sie für Ihren Aufenthalt einlösen.`,
  },
};
