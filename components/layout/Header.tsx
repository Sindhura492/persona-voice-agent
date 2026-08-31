"use client";

import { useLocale } from "@/features/locale/LocaleProvider";
import { type Locale } from "@/features/locale/localeTypes";
import { RESORT_NAME } from "@/lib/resortBrand";

function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className="header-locale flex items-center gap-sm text-caption uppercase tracking-[0.16em] text-white/80"
      role="group"
      aria-label="Language"
    >
      {(["en", "de"] as const satisfies readonly Locale[]).map((code, index) => (
        <span key={code} className="flex items-center gap-sm">
          {index > 0 ? (
            <span className="text-white/40" aria-hidden>
              /
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => setLocale(code)}
            className={
              locale === code
                ? "font-semibold text-white"
                : "font-medium text-white/75 transition-colors hover:text-white"
            }
            aria-pressed={locale === code}
          >
            {code.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}

export function Header() {
  return (
    <header className="header-bar absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-lg py-md md:px-xl md:py-lg">
        <a
          href="#top"
          className="site-wordmark font-display text-[1.65rem] font-bold leading-none tracking-[0.1em] text-white md:text-[2rem]"
        >
          {RESORT_NAME}
        </a>
        <LocaleToggle />
      </div>
    </header>
  );
}
