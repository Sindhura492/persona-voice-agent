import type {
  AlpinePalette,
  Theme,
  ThemeSpacing,
  ThemeTypography,
} from "./themeTypes";

const typography: ThemeTypography = {
  display: "2.75rem",
  h1: "2rem",
  h2: "1.5rem",
  h3: "1.25rem",
  body: "1rem",
  small: "0.875rem",
  caption: "0.75rem",
};

const spacing: ThemeSpacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
  "2xl": "2rem",
  "3xl": "2.5rem",
};

export const alpineColors: AlpinePalette = {
  snow: {
    DEFAULT: "#F7F8FA",
    soft: "#FFFFFF",
  },
  mist: {
    DEFAULT: "#ECEEF1",
    dark: "#E2E5EA",
  },
  stone: {
    DEFAULT: "#D4D8DE",
    soft: "#E0E4EA",
  },
  slate: {
    DEFAULT: "#8B919C",
    muted: "#A8ADB6",
  },
  graphite: {
    DEFAULT: "#5C6370",
    soft: "#787F8C",
  },
  charcoal: {
    DEFAULT: "#1A1C1F",
    muted: "#3A3F47",
  },
  ice: {
    DEFAULT: "#5B7A8C",
    soft: "#7596A8",
    deep: "#456575",
  },
};

export const theme: Theme = {
  colors: alpineColors,
  typography,
  spacing,
};

export function alpineColorsToCssVars(
  colors: AlpinePalette,
): Record<string, string> {
  return {
    "--color-snow": colors.snow.DEFAULT,
    "--color-snow-soft": colors.snow.soft,
    "--color-mist": colors.mist.DEFAULT,
    "--color-mist-dark": colors.mist.dark,
    "--color-stone": colors.stone.DEFAULT,
    "--color-stone-soft": colors.stone.soft,
    "--color-slate": colors.slate.DEFAULT,
    "--color-slate-muted": colors.slate.muted,
    "--color-graphite": colors.graphite.DEFAULT,
    "--color-graphite-soft": colors.graphite.soft,
    "--color-charcoal": colors.charcoal.DEFAULT,
    "--color-charcoal-muted": colors.charcoal.muted,
    "--color-ice": colors.ice.DEFAULT,
    "--color-ice-soft": colors.ice.soft,
    "--color-ice-deep": colors.ice.deep,
  };
}

export type {
  AlpinePalette,
  Theme,
  ThemeSpacing,
  ThemeTypography,
} from "./themeTypes";
