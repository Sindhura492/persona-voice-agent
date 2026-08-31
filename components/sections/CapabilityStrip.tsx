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
      className="border-t border-stone bg-gradient-to-b from-mist to-snow px-lg py-2xl md:px-xl"
    >
      <div className="mx-auto max-w-6xl">
        <header className="max-w-2xl">
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

        <ul className="mt-xl grid gap-md sm:grid-cols-2 lg:grid-cols-4 lg:gap-lg">
          {items.map((item) => (
            <li
              key={item.label}
              className="list-none border border-stone-soft bg-snow-soft px-lg py-lg shadow-[0_1px_0_rgba(26,28,31,0.04)]"
            >
              <CapabilityIcon name={item.icon} />
              <h3 className="mt-md font-sans text-small font-semibold uppercase tracking-[0.06em] leading-snug text-charcoal">
                {item.label}
              </h3>
              <p className="mt-sm text-small leading-relaxed text-charcoal-muted">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
