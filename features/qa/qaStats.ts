import {
  CONTAINED_OUTCOMES,
  TRANSCRIPT_OUTCOMES,
  type DurationByOutcome,
  type OutcomeCounts,
  type QaAggregateStats,
  type Transcript,
  type TranscriptOutcome,
} from "./qaTypes";

type TranscriptRow = Pick<Transcript, "outcome" | "duration_seconds">;

export function emptyOutcomeCounts(): OutcomeCounts {
  return TRANSCRIPT_OUTCOMES.reduce((counts, outcome) => {
    counts[outcome] = 0;
    return counts;
  }, {} as OutcomeCounts);
}

function emptyDurationByOutcome(): DurationByOutcome {
  return TRANSCRIPT_OUTCOMES.reduce((durations, outcome) => {
    durations[outcome] = null;
    return durations;
  }, {} as DurationByOutcome);
}

function isContained(outcome: TranscriptOutcome): boolean {
  return (CONTAINED_OUTCOMES as readonly string[]).includes(outcome);
}

export function buildQaStats(rows: readonly TranscriptRow[]): QaAggregateStats {
  const countsByOutcome = emptyOutcomeCounts();
  const durationTotals = TRANSCRIPT_OUTCOMES.reduce(
    (totals, outcome) => {
      totals[outcome] = { sum: 0, count: 0 };
      return totals;
    },
    {} as Record<TranscriptOutcome, { sum: number; count: number }>,
  );

  let durationSum = 0;
  let containedCount = 0;

  for (const row of rows) {
    countsByOutcome[row.outcome] += 1;
    durationSum += row.duration_seconds;
    durationTotals[row.outcome].sum += row.duration_seconds;
    durationTotals[row.outcome].count += 1;
    if (isContained(row.outcome)) {
      containedCount += 1;
    }
  }

  const totalCalls = rows.length;
  const averageDurationByOutcome = emptyDurationByOutcome();

  for (const outcome of TRANSCRIPT_OUTCOMES) {
    const bucket = durationTotals[outcome];
    averageDurationByOutcome[outcome] =
      bucket.count > 0 ? Math.round(bucket.sum / bucket.count) : null;
  }

  return {
    totalCalls,
    countsByOutcome,
    averageDurationSeconds:
      totalCalls > 0 ? Math.round(durationSum / totalCalls) : null,
    averageDurationByOutcome,
    containmentRate: totalCalls > 0 ? containedCount / totalCalls : null,
    escalationRate:
      totalCalls > 0 ? countsByOutcome.escalated / totalCalls : null,
    abandonedRate:
      totalCalls > 0 ? countsByOutcome.abandoned / totalCalls : null,
  };
}

export function waitlistConversionRate(stats: QaAggregateStats): number | null {
  const waitlisted = stats.countsByOutcome.waitlisted;
  const booked = stats.countsByOutcome.booked;
  const denominator = waitlisted + booked;
  if (denominator === 0) {
    return null;
  }
  return booked / denominator;
}
