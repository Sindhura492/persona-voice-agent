import type { Config } from "tailwindcss";
import { theme } from "./lib/theme";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        snow: {
          DEFAULT: "var(--color-snow)",
          soft: "var(--color-snow-soft)",
        },
        mist: {
          DEFAULT: "var(--color-mist)",
          dark: "var(--color-mist-dark)",
        },
        stone: {
          DEFAULT: "var(--color-stone)",
          soft: "var(--color-stone-soft)",
        },
        slate: {
          DEFAULT: "var(--color-slate)",
          muted: "var(--color-slate-muted)",
        },
        graphite: {
          DEFAULT: "var(--color-graphite)",
          soft: "var(--color-graphite-soft)",
        },
        charcoal: {
          DEFAULT: "var(--color-charcoal)",
          muted: "var(--color-charcoal-muted)",
        },
        ice: {
          DEFAULT: "var(--color-ice)",
          soft: "var(--color-ice-soft)",
          deep: "var(--color-ice-deep)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Helvetica Neue", "sans-serif"],
      },
      fontSize: {
        display: theme.typography.display,
        h1: theme.typography.h1,
        h2: theme.typography.h2,
        h3: theme.typography.h3,
        body: theme.typography.body,
        small: theme.typography.small,
        caption: theme.typography.caption,
      },
      spacing: {
        xs: theme.spacing.xs,
        sm: theme.spacing.sm,
        md: theme.spacing.md,
        lg: theme.spacing.lg,
        xl: theme.spacing.xl,
        "2xl": theme.spacing["2xl"],
        "3xl": theme.spacing["3xl"],
      },
    },
  },
  plugins: [],
};

export default config;
