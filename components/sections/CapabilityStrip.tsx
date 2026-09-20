"use client";

import { CapabilityIcon } from "@/components/sections/CapabilityIcon";
import { useLocale } from "@/features/locale/LocaleProvider";
import {
  CAPABILITY_ITEMS,
  CAPABILITY_SECTION_COPY,
} from "@/features/locale/siteCopy";

export function CapabilityStrip() {
  const { locale } = useLocale();
  const items = CAPABILITY_ITEMS[locale];
  const section = CAPABILITY_SECTION_COPY[locale];

  return (
    <section
      aria-labelledby="capabilities-heading"
      className="border-t border-stone bg-gradient-to-b from-mist to-snow px-md py-xl sm:px-lg sm:py-2xl md:px-xl"
    >
      <div className="mx-auto grid max-w-6xl gap-xl lg:grid-cols-[minmax(0,18rem)_1fr] lg:items-start lg:gap-2xl">
        <header className="max-w-sm">
          <p className="text-caption font-semibold uppercase tracking-[0.2em] text-graphite">
            {section.eyebrow}
          </p>
          <h2
            id="capabilities-heading"
            className="mt-sm font-display text-h2 font-medium text-charcoal"
          >
            {section.title}
          </h2>
          <p className="mt-md text-small font-medium leading-relaxed text-charcoal-muted">
            {section.intro}
          </p>
        </header>

        <ul className="grid gap-0 sm:grid-cols-2 sm:gap-x-xl">
          {items.map((item) => (
            <li
              key={item.label}
              className="list-none border-b border-stone-soft py-md last:border-b-0 sm:py-lg sm:[&:nth-last-child(-n+2)]:border-b-0"
            >
              <div className="flex gap-md">
                <CapabilityIcon name={item.icon} />
                <div className="min-w-0">
                  <h3 className="font-sans text-small font-semibold uppercase tracking-[0.06em] leading-snug text-charcoal">
                    {item.label}
                  </h3>
                  <p className="mt-sm text-small leading-relaxed text-charcoal-muted">
                    {item.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
