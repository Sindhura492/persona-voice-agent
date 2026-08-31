import {
  asString,
  isRecord,
  readSkillLevel,
  validateStayDates,
  type ValidationResult,
} from "../_shared/validateCommon.ts";
import type { SkillLevel } from "../_shared/skiTypes.ts";

export type JoinWaitlistPayload = {
  guest_name: string;
  contact: string;
  requested_date: string;
  lesson_level: SkillLevel;
};

export function validateJoinWaitlist(
  input: unknown,
): ValidationResult<JoinWaitlistPayload> {
  if (!isRecord(input)) {
    return { ok: false, error: "Payload must be an object" };
  }

  const guestName = asString(input.guest_name) ?? asString(input.guestName);
  const contact = asString(input.contact);
  const requestedDate =
    asString(input.requested_date) ?? asString(input.requestedDate);
  const lessonLevel = readSkillLevel(input, "lesson_level") ??
    readSkillLevel(input, "skill_level");

  if (!guestName) {
    return { ok: false, error: "guest_name is required" };
  }
  if (!contact || contact.length < 3) {
    return { ok: false, error: "contact is required" };
  }
  if (!requestedDate) {
    return { ok: false, error: "requested_date is required as YYYY-MM-DD" };
  }

  const parsedDate = validateStayDates(requestedDate, addOneDay(requestedDate));
  if (!parsedDate.ok) {
    return { ok: false, error: "requested_date must be YYYY-MM-DD" };
  }
  if (!lessonLevel) {
    return {
      ok: false,
      error: "lesson_level must be beginner, intermediate, or advanced",
    };
  }

  return {
    ok: true,
    data: {
      guest_name: guestName,
      contact,
      requested_date: requestedDate,
      lesson_level: lessonLevel,
    },
  };
}

function addOneDay(date: string): string {
  const next = new Date(`${date}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}
