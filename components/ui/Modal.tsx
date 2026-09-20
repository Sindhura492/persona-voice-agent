"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  stickyHeader?: ReactNode;
  stickyFooter?: ReactNode;
};

export function Modal({
  open,
  onClose,
  title,
  children,
  stickyHeader,
  stickyFooter,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-lg"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close"
        className="fixed inset-0 bg-charcoal/70 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-modal-title"
        className="relative z-10 flex h-[min(100dvh,100%)] w-full max-w-xl flex-col overflow-hidden border-stone bg-snow-soft shadow-[0_32px_80px_-24px_rgba(0,0,0,0.45)] sm:h-auto sm:max-h-[min(92svh,52rem)] sm:rounded-sm sm:border"
      >
        <div className="flex shrink-0 items-start justify-between gap-md border-b border-stone-soft px-lg pb-md pt-[max(1rem,env(safe-area-inset-top))] sm:px-xl sm:pt-xl">
          <h2
            id="voice-modal-title"
            className="font-display text-h3 text-charcoal"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 shrink-0 px-sm text-caption uppercase tracking-[0.14em] text-graphite transition-colors hover:text-charcoal"
          >
            Close
          </button>
        </div>

        {stickyHeader ? (
          <div className="shrink-0 border-b border-stone-soft bg-snow-soft px-lg py-md sm:px-xl">
            {stickyHeader}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-lg py-lg sm:px-xl sm:py-xl">
          {children}
        </div>

        {stickyFooter ? (
          <div className="shrink-0 border-t border-stone-soft bg-snow-soft px-lg py-md pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-xl">
            {stickyFooter}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
