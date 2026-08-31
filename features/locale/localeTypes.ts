export type Locale = "en" | "de";

export const LOCALES = ["en", "de"] as const;

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "de";
}
