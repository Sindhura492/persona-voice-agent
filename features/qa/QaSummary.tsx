import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { createServerClient } from "@/lib/supabase/server";
import {
  OUTCOME_LABELS,
  TRANSCRIPT_OUTCOMES,
  type Transcript,
  type TranscriptOutcome,
} from "./qaTypes";
import { buildQaStats, waitlistConversionRate } from "./qaStats";

function isOutcome(value: string): value is TranscriptOutcome {
  return (TRANSCRIPT_OUTCOMES as readonly string[]).includes(value);
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) {
    return "n/a";
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return `${secs}s`;
  }
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

function formatRate(rate: number | null): string {
  if (rate === null) {
    return "n/a";
  }
  return `${Math.round(rate * 100)}%`;
}

async function loadTranscripts(): Promise<
  Array<Pick<Transcript, "outcome" | "duration_seconds">>
> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("transcripts")
      .select("outcome, duration_seconds");

    if (error || !data) {
      return [];
    }

    const rows: Array<Pick<Transcript, "outcome" | "duration_seconds">> = [];

    for (const item of data) {
      if (
        typeof item !== "object" ||
        item === null ||
        typeof item.outcome !== "string" ||
        typeof item.duration_seconds !== "number" ||
        !isOutcome(item.outcome)
      ) {
        continue;
      }

      rows.push({
        outcome: item.outcome,
        duration_seconds: item.duration_seconds,
      });
    }

    return rows;
  } catch {
    return [];
  }
}

export async function QaSummary() {
  const rows = await loadTranscripts();
  const stats = buildQaStats(rows);
  const waitlistRate = waitlistConversionRate(stats);

  return (
    <section className="mx-auto max-w-5xl px-lg py-3xl md:px-2xl">
      <Badge>Voice QA</Badge>
      <h1 className="mt-md font-display text-h1 text-charcoal">
        Ski concierge quality
      </h1>
      <p className="mt-md max-w-xl text-body text-graphite">
        Aggregate outcomes from logged transcripts. Internal review only.
      </p>

      <div className="mt-2xl grid gap-lg md:grid-cols-3">
        <Card as="article">
          <p className="text-caption uppercase tracking-[0.16em] text-charcoal-muted">
            Total calls
          </p>
          <p className="mt-md font-display text-display text-charcoal">
            {stats.totalCalls}
          </p>
        </Card>
        <Card as="article">
          <p className="text-caption uppercase tracking-[0.16em] text-charcoal-muted">
            Avg handle time
          </p>
          <p className="mt-md font-display text-display text-charcoal">
            {formatDuration(stats.averageDurationSeconds)}
          </p>
        </Card>
        <Card as="article">
          <p className="text-caption uppercase tracking-[0.16em] text-charcoal-muted">
            Containment
          </p>
          <p className="mt-md font-display text-display text-charcoal">
            {formatRate(stats.containmentRate)}
          </p>
        </Card>
      </div>

      <Card
        as="article"
        className="mt-xl border-ice/40 bg-mist py-lg"
      >
        <Badge className="tracking-[0.16em] text-ice-deep">
          Safety metric
        </Badge>
        <div className="mt-md flex flex-col gap-sm md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-h2 text-charcoal">
              {stats.countsByOutcome.escalated}{" "}
              <span className="text-h3 text-charcoal-muted">escalations</span>
            </p>
            <p className="mt-sm text-small text-graphite">
              Escalation rate {formatRate(stats.escalationRate)}. Unusually low
              rates may mean the safety trigger is not firing. Review
              transcripts, not just the headline.
            </p>
          </div>
          <p className="font-display text-display text-charcoal">
            {formatRate(stats.escalationRate)}
          </p>
        </div>
      </Card>

      <ul className="mt-xl grid gap-lg sm:grid-cols-2 lg:grid-cols-4">
        {TRANSCRIPT_OUTCOMES.filter((outcome) => outcome !== "escalated").map(
          (outcome) => (
            <Card as="li" key={outcome} className="list-none bg-mist py-lg">
              <Badge className="tracking-[0.14em]">
                {OUTCOME_LABELS[outcome]}
              </Badge>
              <p className="mt-sm font-display text-h2 text-charcoal">
                {stats.countsByOutcome[outcome]}
              </p>
              <p className="mt-xs text-caption text-charcoal-muted">
                AHT {formatDuration(stats.averageDurationByOutcome[outcome])}
              </p>
            </Card>
          ),
        )}
      </ul>

      <p className="mt-xl text-small text-charcoal-muted">
        Abandoned {formatRate(stats.abandonedRate)} · Waitlist conversion{" "}
        {formatRate(waitlistRate)} (booked ÷ booked + waitlisted). See
        QA_METRICS.md.
      </p>
    </section>
  );
}
