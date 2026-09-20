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

function sameUtterance(
  existing: { role: TranscriptRole; content: string },
  incoming: { role: TranscriptRole; content: string },
): boolean {
  if (existing.role !== incoming.role) {
    return false;
  }
  if (existing.content === incoming.content) {
    return true;
  }
  // Live partial → final for the same turn.
  return (
    incoming.content.startsWith(existing.content) ||
    existing.content.startsWith(incoming.content)
  );
}

function toTurns(
  incoming: ReadonlyArray<{ role: TranscriptRole; content: string }>,
  idOffset = 0,
): TranscriptTurn[] {
  return incoming.map((turn, index) => ({
    id: `t-${idOffset + index}`,
    role: turn.role,
    content: turn.content,
  }));
}

/**
 * Merge Retell's rolling transcript window into the full local history.
 * Finds the longest overlap between the end of `previous` and the start of
 * `incoming`, then replaces that suffix with the fresh window (no duplicates).
 */
export function mergeTranscriptTurns(
  previous: readonly TranscriptTurn[],
  incoming: ReadonlyArray<{ role: TranscriptRole; content: string }>,
): TranscriptTurn[] {
  if (incoming.length === 0) {
    return [...previous];
  }

  if (previous.length === 0) {
    return toTurns(incoming);
  }

  const maxOverlap = Math.min(previous.length, incoming.length);
  let overlap = 0;

  for (let len = maxOverlap; len > 0; len -= 1) {
    let matches = true;
    for (let i = 0; i < len; i += 1) {
      const existing = previous[previous.length - len + i];
      const next = incoming[i];
      if (!existing || !next || !sameUtterance(existing, next)) {
        matches = false;
        break;
      }
    }
    if (matches) {
      overlap = len;
      break;
    }
  }

  if (overlap === 0) {
    // No overlap: only append genuinely new turns (avoid replaying the window).
    const next = [...previous];
    for (const turn of incoming) {
      const last = next[next.length - 1];
      if (last && sameUtterance(last, turn)) {
        next[next.length - 1] = { ...last, content: turn.content };
        continue;
      }
      // Skip if this utterance already exists near the end (stale window).
      const recent = next.slice(-incoming.length);
      if (recent.some((item) => sameUtterance(item, turn))) {
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

  const head = previous.slice(0, previous.length - overlap);
  const rebuilt = incoming.map((turn, index) => ({
    id: previous[previous.length - overlap + index]?.id ?? `t-${head.length + index}`,
    role: turn.role,
    content: turn.content,
  }));
  return [...head, ...rebuilt];
}
