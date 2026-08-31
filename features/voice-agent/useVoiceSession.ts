"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import {
  CONNECT_SOUND_DURATION_MS,
  playBrandSound,
  primeBrandAudio,
} from "@/lib/audio/brandSound";
import { ensureMicrophoneAccess } from "@/lib/audio/microphoneAccess";
import type { GuestDetails } from "./guestDetailsCopy";
import {
  detectBookingIntent,
  detectGuestDetailFocus,
} from "./detectGuestDetailPrompt";
import type { LoyaltyPreview } from "./LoyaltyPreviewBanner";
import {
  mergeTranscriptTurns,
  parseLiveUtterances,
  type TranscriptTurn,
} from "./transcriptTypes";
import { widgetConfig } from "./widgetConfig";
import { useGuestContact } from "@/features/shared/GuestContactProvider";

const EMPTY_GUEST_DETAILS: GuestDetails = { guestName: "", guestEmail: "" };

export type VoiceSessionState =
  | "idle"
  | "requesting_permission"
  | "connecting"
  | "connected"
  | "speaking"
  | "error";

type WebCallPayload = {
  accessToken: string;
  callId: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseWebCallPayload(value: unknown): WebCallPayload {
  if (!isRecord(value)) {
    throw new Error("Invalid web call response");
  }

  const accessToken =
    typeof value.accessToken === "string"
      ? value.accessToken
      : typeof value.access_token === "string"
        ? value.access_token
        : null;

  if (!accessToken) {
    throw new Error("Missing access token");
  }

  const callId =
    typeof value.callId === "string"
      ? value.callId
      : typeof value.call_id === "string"
        ? value.call_id
        : null;

  return { accessToken, callId };
}

function errorMessage(error: unknown): string {
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Voice session failed";
}

function appendTypedTurn(
  previous: readonly TranscriptTurn[],
  content: string,
): TranscriptTurn[] {
  return [
    ...previous,
    {
      id: `typed-${Date.now()}`,
      role: "user",
      content,
    },
  ];
}

function formatTypedTranscript(details: GuestDetails): string {
  const parts: string[] = [];
  if (details.guestName) {
    parts.push(`Name: ${details.guestName}`);
  }
  if (details.guestEmail) {
    parts.push(`Email: ${details.guestEmail}`);
  }
  return parts.join(" · ");
}

export function useVoiceSession() {
  const { setGuestContact } = useGuestContact();
  const clientRef = useRef<RetellWebClient | null>(null);
  const callIdRef = useRef<string | null>(null);
  const guestDetailsRef = useRef<GuestDetails>(EMPTY_GUEST_DETAILS);
  const brandPlayedRef = useRef(false);
  const pulseTimerRef = useRef<number | null>(null);
  const [state, setState] = useState<VoiceSessionState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [connectPulse, setConnectPulse] = useState(false);
  const [guestDetails, setGuestDetails] =
    useState<GuestDetails>(EMPTY_GUEST_DETAILS);
  const [isSharingDetails, setIsSharingDetails] = useState(false);
  const [loyaltyPreview, setLoyaltyPreview] = useState<LoyaltyPreview | null>(
    null,
  );
  const [bookingIntent, setBookingIntent] = useState(false);
  const [detailFocus, setDetailFocus] = useState<
    ReturnType<typeof detectGuestDetailFocus>
  >(null);

  const clearConnectPulse = useCallback(() => {
    if (pulseTimerRef.current !== null) {
      window.clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = null;
    }
    setConnectPulse(false);
  }, []);

  const triggerConnectFeedback = useCallback(() => {
    if (brandPlayedRef.current) {
      return;
    }

    brandPlayedRef.current = true;
    void playBrandSound();
    setConnectPulse(true);
    pulseTimerRef.current = window.setTimeout(() => {
      setConnectPulse(false);
      pulseTimerRef.current = null;
    }, CONNECT_SOUND_DURATION_MS);
  }, []);

  useEffect(() => {
    guestDetailsRef.current = guestDetails;
  }, [guestDetails]);

  const latestAgentLine = useMemo(() => {
    for (let index = transcript.length - 1; index >= 0; index -= 1) {
      if (transcript[index]?.role === "agent") {
        return transcript[index]?.content ?? "";
      }
    }
    return "";
  }, [transcript]);

  useEffect(() => {
    if (!latestAgentLine) {
      return;
    }
    const focus = detectGuestDetailFocus(latestAgentLine);
    if (focus) {
      setDetailFocus(focus);
    }
    if (detectBookingIntent(latestAgentLine)) {
      setBookingIntent(true);
      setDetailFocus("both");
    }
  }, [latestAgentLine]);

  useEffect(() => {
    const client = new RetellWebClient();
    clientRef.current = client;

    const onCallStarted = () => {
      setError(null);
      setState("connected");
      void client.startAudioPlayback().catch(() => {
        // Browsers that block playback until gesture usually unblock via the CTA click.
      });
    };

    const onAgentStartTalking = () => {
      setState("speaking");
    };

    const onAgentStopTalking = () => {
      setState((current) => (current === "error" ? current : "connected"));
    };

    const onCallEnded = () => {
      setState((current) => (current === "error" ? current : "idle"));
      callIdRef.current = null;
      setDetailFocus(null);
      setBookingIntent(false);
      setLoyaltyPreview(null);
      setIsSharingDetails(false);
      setGuestDetails(EMPTY_GUEST_DETAILS);
      guestDetailsRef.current = EMPTY_GUEST_DETAILS;
    };

    const onUpdate = (update: unknown) => {
      const utterances = parseLiveUtterances(update);
      if (utterances.length === 0) {
        return;
      }
      setTranscript((previous) => mergeTranscriptTurns(previous, utterances));
    };

    const onError = (payload: unknown) => {
      setError(errorMessage(payload));
      setState("error");
      client.stopCall();
    };

    client.on("call_started", onCallStarted);
    client.on("agent_start_talking", onAgentStartTalking);
    client.on("agent_stop_talking", onAgentStopTalking);
    client.on("call_ended", onCallEnded);
    client.on("update", onUpdate);
    client.on("error", onError);

    return () => {
      client.off("call_started", onCallStarted);
      client.off("agent_start_talking", onAgentStartTalking);
      client.off("agent_stop_talking", onAgentStopTalking);
      client.off("call_ended", onCallEnded);
      client.off("update", onUpdate);
      client.off("error", onError);
      client.stopCall();
      clientRef.current = null;
      clearConnectPulse();
    };
  }, [clearConnectPulse, triggerConnectFeedback]);

  const shareGuestDetails = useCallback(
    async (details: GuestDetails) => {
      const normalized: GuestDetails = {
        guestName: details.guestName.trim(),
        guestEmail: details.guestEmail.trim().toLowerCase(),
      };
      setGuestDetails(normalized);
      guestDetailsRef.current = normalized;

      if (normalized.guestEmail.includes("@")) {
        setGuestContact(normalized.guestEmail);
      }

      const transcriptLine = formatTypedTranscript(normalized);
      if (transcriptLine) {
        setTranscript((previous) => appendTypedTurn(previous, transcriptLine));
      }

      if (normalized.guestEmail.includes("@")) {
        try {
          const response = await fetch("/api/loyalty/preview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contact: normalized.guestEmail }),
          });
          if (response.ok) {
            const payload = (await response.json()) as LoyaltyPreview & {
              success?: boolean;
              found?: boolean;
            };
            setLoyaltyPreview({
              found: Boolean(payload.found),
              points_balance: payload.points_balance,
              welcome_bonus_eligible: payload.welcome_bonus_eligible,
              welcome_bonus_points: payload.welcome_bonus_points,
              guest_name: payload.guest_name,
            });
          }
        } catch {
          setLoyaltyPreview(null);
        }
      }

      const client = clientRef.current;
      const isLive =
        state === "connecting" ||
        state === "connected" ||
        state === "speaking";

      if (client && isLive && callIdRef.current) {
        setIsSharingDetails(true);
        try {
          await fetch("/api/retell/sync-guest-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              callId: callIdRef.current,
              guestName: normalized.guestName,
              guestEmail: normalized.guestEmail,
            }),
          });
        } catch {
          // Local transcript + loyalty preview still help the guest.
        } finally {
          setIsSharingDetails(false);
        }
      }
    },
    [state, setGuestContact],
  );

  const startCall = useCallback(async () => {
    const client = clientRef.current;
    if (!client) {
      return;
    }

    setError(null);
    setTranscript([]);
    setLoyaltyPreview(null);
    setBookingIntent(false);
    brandPlayedRef.current = false;
    clearConnectPulse();
    setState("requesting_permission");

    try {
      await ensureMicrophoneAccess();
      await primeBrandAudio();
      setState("connecting");
      triggerConnectFeedback();
      const agentId = widgetConfig.agentId;
      const details = guestDetailsRef.current;
      const response = await fetch(widgetConfig.createWebCallPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          guestName: details.guestName || undefined,
          guestEmail: details.guestEmail || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to start voice session");
      }

      const payload = parseWebCallPayload(await response.json());
      callIdRef.current = payload.callId;
      await client.startCall({ accessToken: payload.accessToken });
    } catch (err) {
      setError(errorMessage(err));
      setState("error");
      client.stopCall();
    }
  }, [clearConnectPulse, triggerConnectFeedback]);

  const isStarting =
    state === "requesting_permission" || state === "connecting";

  const endCall = useCallback(() => {
    clientRef.current?.stopCall();
    callIdRef.current = null;
    brandPlayedRef.current = false;
    clearConnectPulse();
    setState("idle");
    setError(null);
    setDetailFocus(null);
    setBookingIntent(false);
    setLoyaltyPreview(null);
    setIsSharingDetails(false);
    setGuestDetails(EMPTY_GUEST_DETAILS);
    guestDetailsRef.current = EMPTY_GUEST_DETAILS;
  }, [clearConnectPulse]);

  return {
    state,
    error,
    transcript,
    startCall,
    endCall,
    connectPulse,
    guestDetails,
    setGuestDetails,
    detailFocus,
    bookingIntent,
    loyaltyPreview,
    isSharingDetails,
    shareGuestDetails,
    isActive:
      state === "connecting" || state === "connected" || state === "speaking",
    isStarting,
  };
}
