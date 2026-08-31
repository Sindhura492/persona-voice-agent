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

export type Transcript = {
  id: string;
  session_id: string;
  transcript_text: string;
  duration_seconds: number;
  outcome: TranscriptOutcome;
  created_at: string;
};

export type OutcomeCounts = Record<TranscriptOutcome, number>;

export type DurationByOutcome = Record<TranscriptOutcome, number | null>;

export type QaAggregateStats = {
  totalCalls: number;
  countsByOutcome: OutcomeCounts;
  averageDurationSeconds: number | null;
  averageDurationByOutcome: DurationByOutcome;
  containmentRate: number | null;
  escalationRate: number | null;
  abandonedRate: number | null;
};

export const CONTAINED_OUTCOMES = [
  "booked",
  "rescheduled",
  "cancelled",
  "gear_fitted",
  "loyalty_checked",
  "waitlisted",
] as const satisfies readonly TranscriptOutcome[];

export const OUTCOME_LABELS: Record<TranscriptOutcome, string> = {
  booked: "Booked",
  rescheduled: "Rescheduled",
  cancelled: "Cancelled",
  gear_fitted: "Gear fitted",
  loyalty_checked: "Loyalty",
  waitlisted: "Waitlisted",
  escalated: "Escalated",
  abandoned: "Abandoned",
};
