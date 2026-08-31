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
    toggleHint:
      "Type here anytime during the call. No need to spell aloud. Tap Share when ready.",
    nameLabel: "Full name",
    namePlaceholder: "Your full name",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    share: "Share with concierge",
    sharing: "Sharing…",
    promptName: "Type your name below, then tap Share.",
    promptEmail: "Type your email below, then tap Share.",
    promptBoth: "Type your name and email below, then tap Share.",
    savedHint: "Sent to concierge. They'll use your typed details.",
    bookingRequired:
      "For your booking we need your full name and email. Please type both below.",
    shareBlockedHint:
      "Enter your full name and a valid email (with @), each in the matching field, then tap Share.",
  },
  de: {
    toggle: "Lieber tippen?",
    toggleHint:
      "Jederzeit während des Gesprächs tippen. Kein Buchstabieren nötig. Dann auf Senden tippen.",
    nameLabel: "Vollständiger Name",
    namePlaceholder: "Ihr vollständiger Name",
    emailLabel: "E-Mail-Adresse",
    emailPlaceholder: "sie@beispiel.de",
    share: "An Concierge senden",
    sharing: "Wird gesendet…",
    promptName: "Name unten eingeben, dann Senden tippen.",
    promptEmail: "E-Mail unten eingeben, dann Senden tippen.",
    promptBoth: "Name und E-Mail unten eingeben, dann Senden tippen.",
    savedHint: "An Concierge gesendet. Ihre eingegebenen Daten werden verwendet.",
    bookingRequired:
      "Für die Buchung benötigen wir Ihren vollständigen Namen und Ihre E-Mail. Bitte beides unten eingeben.",
    shareBlockedHint:
      "Bitte vollständigen Namen und gültige E-Mail (mit @) in die passenden Felder eintragen, dann Senden tippen.",
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
