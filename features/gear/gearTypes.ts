export const SKILL_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export type SkillLevel = (typeof SKILL_LEVELS)[number];

export type GearFitting = {
  id: string;
  booking_id: string;
  height_cm: number;
  boot_size: number;
  skill_level: SkillLevel;
  notes: string | null;
  created_at: string;
};

export function parseGearFitting(row: unknown): GearFitting | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }
  const data = row as Record<string, unknown>;
  const skill = data.skill_level;
  if (
    typeof data.id !== "string" ||
    typeof data.booking_id !== "string" ||
    typeof data.height_cm !== "number" ||
    typeof data.boot_size !== "number" ||
    typeof skill !== "string" ||
    typeof data.created_at !== "string"
  ) {
    return null;
  }
  if (!(SKILL_LEVELS as readonly string[]).includes(skill)) {
    return null;
  }
  const notes =
    typeof data.notes === "string" ? data.notes : data.notes === null ? null : null;

  return {
    id: data.id,
    booking_id: data.booking_id,
    height_cm: data.height_cm,
    boot_size: data.boot_size,
    skill_level: skill as SkillLevel,
    notes,
    created_at: data.created_at,
  };
}

export function formatSkillLevel(level: SkillLevel): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}
