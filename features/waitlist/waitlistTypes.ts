export const WAITLIST_STATUSES = ["waiting", "notified", "expired"] as const;

export type WaitlistStatusValue = (typeof WAITLIST_STATUSES)[number];

export type WaitlistEntry = {
  id: string;
  guest_name: string;
  contact: string;
  requested_date: string;
  lesson_level: string;
  status: WaitlistStatusValue;
  created_at: string;
};

export function parseWaitlistEntry(row: unknown): WaitlistEntry | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }
  const data = row as Record<string, unknown>;
  const status = data.status;
  if (
    typeof data.id !== "string" ||
    typeof data.guest_name !== "string" ||
    typeof data.contact !== "string" ||
    typeof data.requested_date !== "string" ||
    typeof data.lesson_level !== "string" ||
    typeof status !== "string" ||
    typeof data.created_at !== "string"
  ) {
    return null;
  }
  if (!(WAITLIST_STATUSES as readonly string[]).includes(status)) {
    return null;
  }
  return {
    id: data.id,
    guest_name: data.guest_name,
    contact: data.contact,
    requested_date: data.requested_date,
    lesson_level: data.lesson_level,
    status: status as WaitlistStatusValue,
    created_at: data.created_at,
  };
}

export function formatLessonDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
