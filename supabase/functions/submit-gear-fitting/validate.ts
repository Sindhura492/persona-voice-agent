import {
  asNumber,
  asString,
  isRecord,
  readSkillLevel,
  type ValidationResult,
} from "../_shared/validateCommon.ts";
import type { SkillLevel } from "../_shared/skiTypes.ts";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type GearFittingPayload = {
  booking_id: string;
  height_cm: number;
  boot_size: number;
  skill_level: SkillLevel;
  notes: string | null;
};

export function validateGearFitting(
  input: unknown,
): ValidationResult<GearFittingPayload> {
  if (!isRecord(input)) {
    return { ok: false, error: "Payload must be an object" };
  }

  const bookingId =
    asString(input.booking_id) ?? asString(input.bookingId);
  const height = asNumber(input.height_cm) ?? asNumber(input.heightCm);
  const bootSize = asNumber(input.boot_size) ?? asNumber(input.bootSize);
  const skillLevel = readSkillLevel(input);
  const notes = asString(input.notes);

  if (!bookingId || !UUID_RE.test(bookingId)) {
    return { ok: false, error: "booking_id must be a valid UUID" };
  }
  if (height === null || height < 100 || height > 230) {
    return {
      ok: false,
      error: "height_cm must be between 100 and 230",
    };
  }
  if (bootSize === null || bootSize < 20 || bootSize > 50) {
    return {
      ok: false,
      error: "boot_size must be between 20 and 50 (EU sizing)",
    };
  }
  if (!skillLevel) {
    return {
      ok: false,
      error: "skill_level must be beginner, intermediate, or advanced",
    };
  }

  return {
    ok: true,
    data: {
      booking_id: bookingId,
      height_cm: Math.round(height),
      boot_size: Math.round(bootSize * 2) / 2,
      skill_level: skillLevel,
      notes,
    },
  };
}
