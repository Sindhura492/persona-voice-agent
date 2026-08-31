export const PACKAGE_TYPES = [
  "alpine_escape",
  "summit_luxury",
  "family_adventure",
  "day_pass",
] as const;

export type PackageType = (typeof PACKAGE_TYPES)[number];

export const SKILL_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export type SkillLevel = (typeof SKILL_LEVELS)[number];

export const CANCEL_REASONS = ["weather", "guest-choice"] as const;

export type CancelReason = (typeof CANCEL_REASONS)[number];

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "rescheduled"
  | "cancelled";

export type BookingRow = {
  id: string;
  guest_name: string;
  contact: string;
  package_type: string;
  arrival_date: string;
  departure_date: string;
  lift_pass_included: boolean;
  lessons_included: boolean;
  status: BookingStatus;
  estimated_total_eur?: number | null;
  final_total_eur?: number | null;
  loyalty_points_redeemed?: number;
  loyalty_discount_eur?: number;
  created_at: string;
};

export type ToolErrorResult = {
  success: false;
  error: string;
};

export type NotFoundResult = {
  success: false;
  found: false;
  message: string;
};
