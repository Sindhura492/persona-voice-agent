import {
  CANCEL_REASONS,
  PACKAGE_TYPES,
  SKILL_LEVELS,
  type CancelReason,
  type PackageType,
  type SkillLevel,
} from "./skiTypes.ts";

export type ValidationSuccess<T> = { ok: true; data: T };
export type ValidationFailure = { ok: false; error: string };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asString(value: unknown): string | null {
  return typeof value === "string" ? value.trim() : null;
}

const SPOKEN_DIGITS: Record<string, string> = {
  zero: "0",
  oh: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
};

/** Normalize spoken or messy STT emails/phones for database lookup. */
export function normalizeContact(raw: string): string {
  let value = raw.trim().toLowerCase();
  if (!value) {
    return value;
  }

  for (const [word, digit] of Object.entries(SPOKEN_DIGITS)) {
    value = value.replace(new RegExp(`\\b${word}\\b`, "gi"), digit);
  }

  value = value
    .replace(/\s+at\s+/gi, "@")
    .replace(/\s+dot\s+/gi, ".")
    .replace(/\(at\)|\[at\]/gi, "@")
    .replace(/\(dot\)|\[dot\]/gi, ".")
    .replace(/\s+/g, "")
    .replace(/\bat\b/gi, "@")
    .replace(/\bdot\b/gi, ".");

  if (value.includes("@")) {
    value = value.replace(/[^a-z0-9@._+-]/g, "");
  }

  return value;
}

export function asContact(value: unknown): string | null {
  const raw = asString(value);
  return raw ? normalizeContact(raw) : null;
}

export function asBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return null;
}

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function extractToolArgs(body: unknown): unknown {
  if (!isRecord(body)) {
    return body;
  }
  if ("args" in body) {
    return body.args;
  }
  if ("parameters" in body) {
    return body.parameters;
  }
  return body;
}

function parseDate(value: string): Date | null {
  if (!DATE_RE.test(value)) {
    return null;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  if (date.toISOString().slice(0, 10) !== value) {
    return null;
  }
  return date;
}

export function validateStayDates(
  arrivalRaw: string,
  departureRaw: string,
): ValidationResult<{ arrival_date: string; departure_date: string }> {
  const arrival = parseDate(arrivalRaw);
  const departure = parseDate(departureRaw);

  if (!arrival) {
    return { ok: false, error: "arrival_date must be YYYY-MM-DD" };
  }
  if (!departure) {
    return { ok: false, error: "departure_date must be YYYY-MM-DD" };
  }
  if (departure <= arrival) {
    return {
      ok: false,
      error: "departure_date must be after arrival_date",
    };
  }

  return {
    ok: true,
    data: { arrival_date: arrivalRaw, departure_date: departureRaw },
  };
}

function normalizePackageType(raw: string): PackageType | null {
  const slug = raw.toLowerCase().replace(/\s+/g, "_");
  if ((PACKAGE_TYPES as readonly string[]).includes(slug)) {
    return slug as PackageType;
  }
  if (slug.includes("summit") || slug.includes("luxury")) {
    return "summit_luxury";
  }
  if (slug.includes("family")) {
    return "family_adventure";
  }
  if (slug.includes("day")) {
    return "day_pass";
  }
  if (slug.includes("alpine") || slug.includes("escape")) {
    return "alpine_escape";
  }
  return null;
}

export function readPackageType(
  input: Record<string, unknown>,
): PackageType | null {
  const raw =
    asString(input.package_type) ?? asString(input.packageType);
  if (!raw) {
    return null;
  }
  return normalizePackageType(raw);
}

export function readSkillLevel(
  input: Record<string, unknown>,
  field = "skill_level",
): SkillLevel | null {
  const camel =
    field === "skill_level" ? "skillLevel" : "lessonLevel";
  const raw = asString(input[field]) ?? asString(input[camel]);
  if (!raw) {
    return null;
  }
  const slug = raw.toLowerCase();
  if ((SKILL_LEVELS as readonly string[]).includes(slug)) {
    return slug as SkillLevel;
  }
  return null;
}

export function readCancelReason(
  input: Record<string, unknown>,
): CancelReason | null {
  const raw = asString(input.reason) ?? asString(input.cancel_reason);
  if (!raw) {
    return null;
  }
  const slug = raw.toLowerCase().replace(/\s+/g, "-");
  if (slug === "weather" || slug.includes("storm") || slug.includes("snow")) {
    return "weather";
  }
  if (
    slug === "guest-choice" ||
    slug === "guest_choice" ||
    slug.includes("guest")
  ) {
    return "guest-choice";
  }
  if ((CANCEL_REASONS as readonly string[]).includes(slug)) {
    return slug as CancelReason;
  }
  return null;
}

export function readBookingLookup(input: Record<string, unknown>): {
  booking_id: string | null;
  contact: string | null;
} {
  const bookingId =
    asString(input.booking_id) ??
    asString(input.bookingId) ??
    asString(input.id);
  const contact = asContact(input.contact) ?? asContact(input.email);

  if (bookingId && UUID_RE.test(bookingId)) {
    return { booking_id: bookingId, contact: contact ?? null };
  }
  return { booking_id: null, contact };
}

export function requireBookingLookup(
  input: Record<string, unknown>,
): ValidationResult<{ booking_id: string | null; contact: string }> {
  const lookup = readBookingLookup(input);
  if (!lookup.booking_id && !lookup.contact) {
    return {
      ok: false,
      error: "booking_id or contact is required",
    };
  }
  if (lookup.contact && lookup.contact.length < 3) {
    return { ok: false, error: "contact must be at least 3 characters" };
  }
  return {
    ok: true,
    data: {
      booking_id: lookup.booking_id,
      contact: lookup.contact ?? "",
    },
  };
}