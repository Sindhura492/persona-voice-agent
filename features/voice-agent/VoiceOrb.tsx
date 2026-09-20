"use client";

import type { VoiceSessionState } from "./useVoiceSession";

type VoiceOrbProps = {
  state: VoiceSessionState;
  size?: "sm" | "md" | "lg";
};

export function VoiceOrb({ state, size = "md" }: VoiceOrbProps) {
  const mode =
    state === "speaking"
      ? "speaking"
      : state === "connected" || state === "connecting"
        ? "listening"
        : state === "requesting_permission"
          ? "listening"
          : "idle";

  const sizeClass =
    size === "lg" ? "voice-orb--lg" : size === "sm" ? "voice-orb--sm" : "";

  return (
    <div
      className={`voice-orb voice-orb--${mode} ${sizeClass}`.trim()}
      aria-hidden
    >
      <span className="voice-orb__glow" />
      <span className="voice-orb__spin" />
      <span className="voice-orb__core">
        <span className="voice-orb__wave voice-orb__wave--a" />
        <span className="voice-orb__wave voice-orb__wave--b" />
        <span className="voice-orb__shine" />
      </span>
    </div>
  );
}
