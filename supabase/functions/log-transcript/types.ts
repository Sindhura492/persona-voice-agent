export const TRANSCRIPT_OUTCOMES = [
  "booked",
  "rescheduled",
  "cancelled",
  "gear_fitted",
  "loyalty_checked",
  "waitlisted",
  "escalated",
  "abandoned",
] as const;

export type TranscriptOutcome = (typeof TRANSCRIPT_OUTCOMES)[number];

export type LogTranscriptPayload = {
  session_id: string;
  transcript_text: string;
  duration_seconds: number;
  outcome: TranscriptOutcome;
};

export type LogTranscriptResult = {
  success: true;
  transcript_id: string;
  session_id: string;
  outcome: TranscriptOutcome;
};

export type LogTranscriptError = {
  success: false;
  error: string;
};
