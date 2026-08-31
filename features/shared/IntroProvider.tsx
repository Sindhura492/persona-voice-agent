"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { playIntroBrandSound, primeBrandAudio } from "@/lib/audio/brandSound";
import { INTRO_IMAGE } from "@/lib/resortBrand";

const INTRO_MS = 4000;
const STORAGE_KEY = "snowveil-intro-seen";
const DEFAULT_HOLD_MS = 3400;

type IntroProviderProps = {
  children: ReactNode;
};

function readIntroParams(): { forceReplay: boolean; holdMs: number | null } {
  if (typeof window === "undefined") {
    return { forceReplay: false, holdMs: null };
  }

  const params = new URLSearchParams(window.location.search);
  const forceReplay = params.get("replayIntro") === "1";
  const holdRaw = params.get("introHold");

  if (!holdRaw) {
    return { forceReplay, holdMs: null };
  }

  if (holdRaw === "1") {
    return { forceReplay, holdMs: DEFAULT_HOLD_MS };
  }

  const parsed = Number.parseInt(holdRaw, 10);
  return {
    forceReplay,
    holdMs: Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_HOLD_MS,
  };
}

export function IntroProvider({ children }: IntroProviderProps) {
  const [ready, setReady] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const introSoundPlayedRef = useRef(false);
  const dismissTimerRef = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);

  const finishIntro = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setFrozen(false);
    setReady(true);
  };

  const playIntroSound = () => {
    if (introSoundPlayedRef.current) {
      return;
    }

    introSoundPlayedRef.current = true;
    void playIntroBrandSound();
  };

  const dismissIntro = () => {
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    finishIntro();
  };

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const { forceReplay, holdMs } = readIntroParams();

    if (forceReplay) {
      sessionStorage.removeItem(STORAGE_KEY);
    }

    if (reducedMotion || (!forceReplay && sessionStorage.getItem(STORAGE_KEY) === "1")) {
      setReady(true);
      return;
    }

    if (holdMs !== null) {
      holdTimerRef.current = window.setTimeout(() => {
        setFrozen(true);
      }, holdMs);
      return () => {
        if (holdTimerRef.current !== null) {
          window.clearTimeout(holdTimerRef.current);
        }
      };
    }

    dismissTimerRef.current = window.setTimeout(() => {
      finishIntro();
    }, INTRO_MS);

    return () => {
      if (dismissTimerRef.current !== null) {
        window.clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  const handleIntroPointerDown = () => {
    void primeBrandAudio().then(() => {
      playIntroSound();
    });

    if (frozen) {
      dismissIntro();
    }
  };

  return (
    <div className={ready ? "intro-ready" : "intro-playing"}>
      {!ready ? (
        <SkiIntroOverlay frozen={frozen} onInteract={handleIntroPointerDown} />
      ) : null}
      {children}
    </div>
  );
}

type SkiIntroOverlayProps = {
  frozen: boolean;
  onInteract: () => void;
};

function SkiIntroOverlay({ frozen, onInteract }: SkiIntroOverlayProps) {
  return (
    <div
      className={`ski-intro-overlay ski-intro-interactive${
        frozen ? " ski-intro-frozen" : ""
      }`}
      aria-hidden
      onPointerDown={onInteract}
    >
      <div
        className="ski-intro-photo"
        style={{ backgroundImage: `url(${INTRO_IMAGE.src})` }}
      />
      <div className="ski-intro-scrim" />
      <div className="ski-intro-grain" />
      <div className="ski-intro-skier">
        <svg viewBox="0 0 100 72" className="ski-intro-svg" role="presentation">
          <path
            d="M8 62 L42 56 L78 60"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M18 64 L52 58 L88 62"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M52 38 L40 54"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M56 38 L66 55"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M54 24 L52 38"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M52 28 L38 34"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M54 28 L68 20"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="38"
            y1="34"
            x2="32"
            y2="50"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="68"
            y1="20"
            x2="74"
            y2="44"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="55" cy="17" r="5.5" fill="#ffffff" />
          <ellipse cx="55" cy="12.5" rx="6" ry="3.5" fill="#f7f8fa" />
        </svg>
        <div className="ski-intro-skier-bar" aria-hidden />
      </div>
      <div className="ski-intro-brand-wrap">
        <p className="ski-intro-brand font-display">Snowveil</p>
      </div>
      {frozen ? (
        <p className="ski-intro-hold-hint text-caption uppercase tracking-[0.18em] text-white/80">
          Tap to continue
        </p>
      ) : (
        <p className="ski-intro-hold-hint text-caption uppercase tracking-[0.18em] text-white/80">
          Tap for sound
        </p>
      )}
    </div>
  );
}
