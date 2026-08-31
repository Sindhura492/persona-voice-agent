export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "rescheduled",
  "cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type Booking = {
  id: string;
  guest_name: string;
  contact: string;
  package_type: string;
  arrival_date: string;
  departure_date: string;
  lift_pass_included: boolean;
  lessons_included: boolean;
  status: BookingStatus;
  created_at: string;
};

const PACKAGE_LABELS: Record<string, string> = {
  alpine_escape: "Alpine Escape",
  summit_luxury: "Summit Luxury Chalet",
  family_adventure: "Family Adventure",
  day_pass: "Day Pass Package",
};

export function parseBooking(row: unknown): Booking | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }
  const data = row as Record<string, unknown>;
  const status = data.status;
  if (
    typeof data.id !== "string" ||
    typeof data.guest_name !== "string" ||
    typeof data.contact !== "string" ||
    typeof data.package_type !== "string" ||
    typeof data.arrival_date !== "string" ||
    typeof data.departure_date !== "string" ||
    typeof data.lift_pass_included !== "boolean" ||
    typeof data.lessons_included !== "boolean" ||
    typeof status !== "string" ||
    typeof data.created_at !== "string"
  ) {
    return null;
  }
  if (!(BOOKING_STATUSES as readonly string[]).includes(status)) {
    return null;
  }
  return {
    id: data.id,
    guest_name: data.guest_name,
    contact: data.contact,
    package_type: data.package_type,
    arrival_date: data.arrival_date,
    departure_date: data.departure_date,
    lift_pass_included: data.lift_pass_included,
    lessons_included: data.lessons_included,
    status: status as BookingStatus,
    created_at: data.created_at,
  };
}

export function formatPackageLabel(packageType: string): string {
  return PACKAGE_LABELS[packageType] ?? packageType.replace(/_/g, " ");
}

export function formatStayDates(arrival: string, departure: string): string {
  const start = new Date(`${arrival}T00:00:00`);
  const end = new Date(`${departure}T00:00:00`);
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const startLabel = start.toLocaleDateString("en-US", opts);
  const endLabel = end.toLocaleDateString("en-US", {
    ...opts,
    year: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}

export function bookingStatusHeadline(status: BookingStatus): string {
  switch (status) {
    case "pending":
      return "Booking received";
    case "confirmed":
      return "Stay confirmed";
    case "rescheduled":
      return "Dates updated";
    case "cancelled":
      return "Booking cancelled";
  }
}
