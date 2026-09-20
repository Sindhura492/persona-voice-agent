"use client";

import Image from "next/image";
import { CapabilityStrip } from "@/components/sections/CapabilityStrip";
import { useLocale } from "@/features/locale/LocaleProvider";
import { HERO_STAGE_COPY } from "@/features/locale/siteCopy";
import { WorkflowStatusPanel } from "@/features/shared/WorkflowStatusPanel";
import { GuestContactProvider } from "@/features/shared/GuestContactProvider";
import { VoiceLauncher } from "@/features/voice-agent/VoiceLauncher";
import { HERO_IMAGE } from "@/lib/resortBrand";

export function Hero() {
  const { locale } = useLocale();
  const copy = HERO_STAGE_COPY[locale];

  return (
    <>
      <section
        id="top"
        className="relative flex min-h-[100svh] flex-1 items-stretch overflow-hidden bg-mist lg:min-h-[min(82svh,40rem)]"
      >
        <Image
          src={HERO_IMAGE.src}
          alt={HERO_IMAGE.alt}
          fill
          priority
          sizes="100vw"
          className="hero-image object-cover"
        />
        <div aria-hidden className="hero-scrim" />
        <div aria-hidden className="hero-vignette" />
        <div aria-hidden className="hero-grain" />

        <div className="hero-content relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-end gap-xl px-md pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-24 sm:px-lg md:px-xl lg:flex-row lg:items-end lg:justify-between lg:gap-2xl lg:pb-xl">
          <div className="hero-copy max-w-xl lg:max-w-md lg:pb-0">
            <p className="text-caption font-semibold uppercase tracking-[0.22em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]">
              {copy.eyebrow}
            </p>
            <h1 className="mt-sm font-display text-[1.75rem] font-medium leading-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.75)] sm:text-h1">
              {copy.title}
            </h1>
          </div>

          <div className="hero-panel flex w-full shrink-0 flex-col items-stretch lg:max-w-md lg:items-end">
            <GuestContactProvider>
              <VoiceLauncher />
              <WorkflowStatusPanel />
            </GuestContactProvider>
          </div>
        </div>
      </section>
      <CapabilityStrip />
    </>
  );
}
