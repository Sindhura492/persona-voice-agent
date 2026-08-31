export function normalizeGuestContact(value: string): string {
  return value.trim().toLowerCase();
}

export function contactsMatch(
  rowContact: string,
  guestContact: string,
): boolean {
  return normalizeGuestContact(rowContact) === normalizeGuestContact(guestContact);
}

export function isGuestEmail(value: string): boolean {
  return normalizeGuestContact(value).includes("@");
}
