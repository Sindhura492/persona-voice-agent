import type { AvailabilityQuery } from "../_shared/availability.ts";
import {
  asBoolean,
  isRecord,
  readPackageType,
  validateStayDates,
  type ValidationResult,
} from "../_shared/validateCommon.ts";

export function validateAvailabilityPayload(
  input: unknown,
): ValidationResult<AvailabilityQuery> {
  if (!isRecord(input)) {
    return { ok: false, error: "Payload must be an object" };
  }

  const packageType = readPackageType(input);
  const arrival =
    asString(input.arrival_date) ?? asString(input.arrivalDate);
  const departure =
    asString(input.departure_date) ?? asString(input.departureDate);
  const liftPass =
    asBoolean(input.lift_pass_included) ??
    asBoolean(input.liftPassIncluded) ??
    false;
  const lessons =
    asBoolean(input.lessons_included) ??
    asBoolean(input.lessonsIncluded) ??
    false;

  if (!packageType) {
    return {
      ok: false,
      error:
        "package_type must be alpine_escape, summit_luxury, family_adventure, or day_pass",
    };
  }
  if (!arrival) {
    return { ok: false, error: "arrival_date is required as YYYY-MM-DD" };
  }
  if (!departure) {
    return { ok: false, error: "departure_date is required as YYYY-MM-DD" };
  }

  const dates = validateStayDates(arrival, departure);
  if (!dates.ok) {
    return dates;
  }

  return {
    ok: true,
    data: {
      package_type: packageType,
      arrival_date: dates.data.arrival_date,
      departure_date: dates.data.departure_date,
      lift_pass_included: liftPass,
      lessons_included: lessons,
    },
  };
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value.trim() : null;
}
