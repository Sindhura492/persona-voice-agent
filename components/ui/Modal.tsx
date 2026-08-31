"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function Modal({ open, onClose, title, children }: ModalProps) {
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
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-md sm:p-lg"
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
        className="relative z-10 my-auto w-full max-w-md max-h-[min(92svh,40rem)] overflow-y-auto rounded-sm border border-stone bg-snow-soft px-lg py-lg shadow-[0_32px_80px_-24px_rgba(0,0,0,0.45)] sm:px-xl sm:py-xl"
      >
        <div className="mb-md flex items-start justify-between gap-md sm:mb-lg">
          <h2
            id="voice-modal-title"
            className="font-display text-h3 text-charcoal"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-caption uppercase tracking-[0.14em] text-graphite transition-colors hover:text-charcoal"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
