export type TranscriptRole = "agent" | "user";

export type TranscriptTurn = {
  id: string;
  role: TranscriptRole;
  content: string;
};

function isTranscriptRole(value: unknown): value is TranscriptRole {
  return value === "agent" || value === "user";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Parse Retell update.transcript */
export function parseLiveUtterances(
  update: unknown,
): ReadonlyArray<{ role: TranscriptRole; content: string }> {
  if (!isRecord(update) || !Array.isArray(update.transcript)) {
    return [];
  }

  const turns: Array<{ role: TranscriptRole; content: string }> = [];
  for (const entry of update.transcript) {
    if (!isRecord(entry) || !isTranscriptRole(entry.role)) {
      continue;
    }
    if (typeof entry.content !== "string") {
      continue;
    }
    const content = entry.content.trim();
    if (!content) {
      continue;
    }
    turns.push({ role: entry.role, content });
  }
  return turns;
}

function aligns(
  existing: TranscriptTurn,
  incoming: { role: TranscriptRole; content: string },
): boolean {
  if (existing.role !== incoming.role) {
    return false;
  }
  return (
    existing.content === incoming.content ||
    incoming.content.startsWith(existing.content) ||
    existing.content.startsWith(incoming.content)
  );
}

/** Merge rolling last-5 window into full transcript. */
export function mergeTranscriptTurns(
  previous: readonly TranscriptTurn[],
  incoming: ReadonlyArray<{ role: TranscriptRole; content: string }>,
): TranscriptTurn[] {
  if (incoming.length === 0) {
    return [...previous];
  }

  if (previous.length === 0) {
    return incoming.map((turn, index) => ({
      id: `t-${index}`,
      role: turn.role,
      content: turn.content,
    }));
  }

  let startIdx = -1;
  const searchFrom = Math.max(0, previous.length - incoming.length - 1);
  for (let i = searchFrom; i < previous.length; i++) {
    if (aligns(previous[i], incoming[0])) {
      startIdx = i;
      break;
    }
  }

  if (startIdx === -1) {
    const next = [...previous];
    for (const turn of incoming) {
      const last = next[next.length - 1];
      if (last && last.role === turn.role) {
        next[next.length - 1] = { ...last, content: turn.content };
        continue;
      }
      next.push({
        id: `t-${next.length}`,
        role: turn.role,
        content: turn.content,
      });
    }
    return next;
  }

  const head = previous.slice(0, startIdx);
  const rebuilt = incoming.map((turn, index) => ({
    id: previous[startIdx + index]?.id ?? `t-${head.length + index}`,
    role: turn.role,
    content: turn.content,
  }));
  return [...head, ...rebuilt];
}
