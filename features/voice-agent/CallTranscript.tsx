"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "@/features/locale/LocaleProvider";
import { type Locale } from "@/features/locale/localeTypes";
import type { TranscriptTurn } from "./transcriptTypes";

const COPY: Record<
  Locale,
  { title: string; empty: string; you: string; agent: string }
> = {
  en: {
    title: "Live transcript",
    empty: "Transcript appears once you begin.",
    you: "You",
    agent: "Agent",
  },
  de: {
    title: "Live-Transkript",
    empty: "Das Transkript erscheint nach Gesprächsbeginn.",
    you: "Sie",
    agent: "Agent",
  },
};

type CallTranscriptProps = {
  turns: readonly TranscriptTurn[];
  agentLabel: string;
  surface?: "light" | "dark";
};

export function CallTranscript({
  turns,
  agentLabel,
  surface = "light",
}: CallTranscriptProps) {
  const { locale } = useLocale();
  const copy = COPY[locale];
  const isLight = surface === "light";
  const borderClass = isLight ? "border-stone" : "border-white/12";
  const titleClass = isLight ? "text-slate" : "text-white/45";
  const emptyClass = isLight ? "text-graphite" : "text-white/50";
  const roleClass = isLight ? "text-slate" : "text-white/40";
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (turns.length === 0) {
      return;
    }
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  return (
    <aside
      aria-live="polite"
      aria-label={copy.title}
      className={`w-full border-t ${borderClass} pt-lg`}
    >
      <p className={`text-caption uppercase tracking-[0.16em] ${titleClass}`}>
        {copy.title}
      </p>
      {turns.length === 0 ? (
        <p className={`mt-sm text-small leading-relaxed ${emptyClass}`}>
          {copy.empty}
        </p>
      ) : (
        <ul className="mt-sm max-h-56 space-y-md overflow-y-auto pb-md pr-xs">
          {turns.map((turn) => {
            const isUser = turn.role === "user";
            return (
              <li
                key={turn.id}
                className={`flex list-none flex-col ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                <p
                  className={`mb-xs text-caption uppercase tracking-[0.12em] ${roleClass} ${
                    isUser ? "text-right" : "text-left"
                  }`}
                >
                  {isUser ? copy.you : agentLabel || copy.agent}
                </p>
                <div
                  className={`max-w-[88%] rounded-sm px-md py-sm text-small leading-relaxed ${
                    isUser
                      ? "bg-ice-deep text-white"
                      : isLight
                        ? "border border-stone bg-mist text-charcoal"
                        : "border border-white/15 bg-white/10 text-white/90"
                  }`}
                >
                  {turn.content}
                </div>
              </li>
            );
          })}
          <li aria-hidden className="list-none">
            <div ref={scrollAnchorRef} className="h-px w-full" />
          </li>
        </ul>
      )}
    </aside>
  );
}
