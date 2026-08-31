import type { GuestDetails } from "./guestDetailsCopy";

function looksLikeEmail(value: string): boolean {
  return value.includes("@");
}

/** Swap fields when the guest typed email into the name box (common mistake). */
export function normalizeGuestDetails(
  guestName: string,
  guestEmail: string,
): GuestDetails {
  const trimmedName = guestName.trim();
  const trimmedEmail = guestEmail.trim();
  const nameIsEmail = looksLikeEmail(trimmedName);
  const emailIsEmail = looksLikeEmail(trimmedEmail);

  if (nameIsEmail && !emailIsEmail) {
    return {
      guestName: trimmedEmail,
      guestEmail: trimmedName.toLowerCase(),
    };
  }

  return {
    guestName: trimmedName,
    guestEmail: trimmedEmail.toLowerCase(),
  };
}

export function canShareGuestDetails(
  guestName: string,
  guestEmail: string,
  requireBoth: boolean,
): boolean {
  const { guestName: name, guestEmail: email } = normalizeGuestDetails(
    guestName,
    guestEmail,
  );

  if (requireBoth) {
    return name.length >= 2 && looksLikeEmail(email);
  }

  return name.length >= 2 || looksLikeEmail(email);
}
