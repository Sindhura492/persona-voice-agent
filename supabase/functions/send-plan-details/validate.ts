import {
  asBoolean,
  asContact,
  asString,
  isRecord,
  readPackageType,
  validateStayDates,
  type ValidationResult,
} from "../_shared/validateCommon.ts";
import type { PackageType } from "../_shared/skiTypes.ts";

export type SendPlanDetailsPayload = {
  contact: string;
  guest_name: string | null;
  package_type: PackageType | null;
  arrival_date: string | null;
  departure_date: string | null;
  lift_pass_included: boolean;
  lessons_included: boolean;
  include_availability: boolean;
};

export function validateSendPlanDetails(
  input: unknown,
): ValidationResult<SendPlanDetailsPayload> {
  if (!isRecord(input)) {
    return { ok: false, error: "Payload must be an object" };
  }

  const contact = asContact(input.contact) ?? asContact(input.email);
  if (!contact || !contact.includes("@") || contact.length < 5) {
    return {
      ok: false,
      error: "contact must be a valid email address for plan emails",
    };
  }

  const guestName = asString(input.guest_name) ?? asString(input.guestName);
  const packageType = readPackageType(input);
  const arrival =
    asString(input.arrival_date) ?? asString(input.arrivalDate);
  const departure =
    asString(input.departure_date) ?? asString(input.departureDate);
  const liftPass =
    asBoolean(input.lift_pass_included) ??
    asBoolean(input.liftPassIncluded) ??
    true;
  const lessons =
    asBoolean(input.lessons_included) ??
    asBoolean(input.lessonsIncluded) ??
    false;
  const includeAvailability =
    asBoolean(input.include_availability) ??
    asBoolean(input.includeAvailability) ??
    Boolean(arrival && departure);

  if ((arrival && !departure) || (!arrival && departure)) {
    return {
      ok: false,
      error: "Provide both arrival_date and departure_date, or neither",
    };
  }

  if (arrival && departure) {
    const dates = validateStayDates(arrival, departure);
    if (!dates.ok) {
      return dates;
    }
    return {
      ok: true,
      data: {
        contact,
        guest_name: guestName,
        package_type: packageType,
        arrival_date: dates.data.arrival_date,
        departure_date: dates.data.departure_date,
        lift_pass_included: liftPass,
        lessons_included: lessons,
        include_availability: includeAvailability,
      },
    };
  }

  return {
    ok: true,
    data: {
      contact,
      guest_name: guestName,
      package_type: packageType,
      arrival_date: null,
      departure_date: null,
      lift_pass_included: liftPass,
      lessons_included: lessons,
      include_availability: false,
    },
  };
}
