export type ToolParameterProperty =
  | {
      type: "string";
      description: string;
      enum?: readonly string[];
    }
  | { type: "boolean"; description: string }
  | { type: "number"; description: string };

export type ToolParameterSchema = {
  type: "object";
  properties: Record<string, ToolParameterProperty>;
  required: readonly string[];
};

export type ToolSchema = {
  name: string;
  description: string;
  parameters: ToolParameterSchema;
};

export const PACKAGE_TYPES = [
  "alpine_escape",
  "summit_luxury",
  "family_adventure",
  "day_pass",
] as const;

export const SKILL_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;
