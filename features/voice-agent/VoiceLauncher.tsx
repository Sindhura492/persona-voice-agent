"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { primeBrandAudio } from "@/lib/audio/brandSound";
import { useLocale } from "@/features/locale/LocaleProvider";
import { VOICE_ENTRY_COPY } from "@/features/locale/siteCopy";
import { type Locale } from "@/features/locale/localeTypes";
import { useVoiceSession } from "./useVoiceSession";
import { VoiceWidget } from "./VoiceWidget";
import { widgetConfig } from "./widgetConfig";
import { voiceStateLabel } from "./voiceLabels";

const MODAL_TITLE: Record<Locale, string> = {
  en: "Before you begin",
  de: "Bevor Sie beginnen",
};

const RETURN_LABEL = {
  en: "Return to call",
  de: "Zurück zum Gespräch",
} as const;

export function VoiceLauncher() {
  const { locale } = useLocale();
  const session = useVoiceSession();
  const [open, setOpen] = useState(false);
  const { isActive, endCall } = session;
  const entry = VOICE_ENTRY_COPY[locale];

  const closeModal = () => {
    if (isActive) {
      endCall();
    }
    setOpen(false);
  };

  const openModal = () => {
    void primeBrandAudio();
    setOpen(true);
  };

  return (
    <>
      {!open ? (
        <aside className="w-full max-w-sm rounded-sm border border-stone bg-snow-soft p-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)]">
          <p className="text-caption font-semibold uppercase tracking-[0.18em] text-graphite">
            {entry.label}
          </p>
          <p className="mt-md font-display text-h3 font-medium leading-snug text-charcoal">
            {entry.hook}
          </p>
          {isActive ? (
            <p className="mt-sm text-small font-semibold text-ice-deep">
              {voiceStateLabel(session.state, locale)}
            </p>
          ) : null}
          <div className="mt-lg flex justify-center">
            <Button className="min-w-[14rem] font-medium" onClick={openModal}>
              {isActive ? RETURN_LABEL[locale] : widgetConfig.ctaLabel[locale]}
            </Button>
          </div>
        </aside>
      ) : null}

      <Modal open={open} onClose={closeModal} title={MODAL_TITLE[locale]}>
        <VoiceWidget session={session} surface="light" showDisclosure />
      </Modal>
    </>
  );
}
