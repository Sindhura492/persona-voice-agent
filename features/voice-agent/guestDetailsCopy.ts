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
  }
> = {
  en: {
    toggle: "Prefer to type?",
    toggleHint: "Use the fields below for your name or email, no spelling aloud.",
    nameLabel: "Full name",
    namePlaceholder: "abc",
    emailLabel: "Email address",
    emailPlaceholder: "abc@gmail.com",
    share: "Share with concierge",
    sharing: "Sharing…",
    promptName: "Type your name below, then tap Share.",
    promptEmail: "Type your email below, then tap Share.",
    promptBoth: "Type your name and email below, then tap Share.",
    savedHint: "Sent to concierge. They'll use your typed details.",
    bookingRequired:
      "For your booking we need your full name and email. Please type both below.",
  },
  de: {
    toggle: "Lieber tippen?",
    toggleHint:
      "Nutzen Sie die Felder für Name oder E-Mail, ohne Buchstabieren.",
    nameLabel: "Vollständiger Name",
    namePlaceholder: "abc",
    emailLabel: "E-Mail-Adresse",
    emailPlaceholder: "abc@gmail.com",
    share: "An Concierge senden",
    sharing: "Wird gesendet…",
    promptName: "Name unten eingeben, dann Senden tippen.",
    promptEmail: "E-Mail unten eingeben, dann Senden tippen.",
    promptBoth: "Name und E-Mail unten eingeben, dann Senden tippen.",
    savedHint: "An Concierge gesendet. Ihre eingegebenen Daten werden verwendet.",
    bookingRequired:
      "Für die Buchung benötigen wir Ihren vollständigen Namen und Ihre E-Mail. Bitte beides unten eingeben.",
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
