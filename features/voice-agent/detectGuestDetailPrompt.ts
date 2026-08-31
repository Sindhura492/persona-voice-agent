import type { GuestDetailFocus } from "./guestDetailsCopy";

export function detectGuestDetailFocus(agentText: string): GuestDetailFocus {
  const lower = agentText.toLowerCase();

  const wantsBooking =
    /\b(book|booking|reserve|reservation|stay|package|plan your trip)\b/.test(
      lower,
    );
  const wantsEmail =
    /\b(e-?mail|mail address|email address|contact|@)\b/.test(lower);
  const wantsName =
    /\b(your name|full name|what(?:'s| is) your name|may i have your name|call you|who am i speaking)\b/.test(
      lower,
    );

  if (wantsBooking || (wantsEmail && wantsName)) {
    return "both";
  }
  if (wantsEmail) {
    return "email";
  }
  if (wantsName) {
    return "name";
  }
  return null;
}

export function detectBookingIntent(agentText: string): boolean {
  const lower = agentText.toLowerCase();
  return /\b(book|booking|reserve|reservation|make a stay|plan your trip|check availability)\b/.test(
    lower,
  );
}
