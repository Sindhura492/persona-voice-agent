export type AlpinePalette = {
  snow: { DEFAULT: string; soft: string };
  mist: { DEFAULT: string; dark: string };
  stone: { DEFAULT: string; soft: string };
  slate: { DEFAULT: string; muted: string };
  graphite: { DEFAULT: string; soft: string };
  charcoal: { DEFAULT: string; muted: string };
  ice: { DEFAULT: string; soft: string; deep: string };
};

export type ThemeTypography = {
  display: string;
  h1: string;
  h2: string;
  h3: string;
  body: string;
  small: string;
  caption: string;
};

export type ThemeSpacing = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
};

export type Theme = {
  colors: AlpinePalette;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
};
