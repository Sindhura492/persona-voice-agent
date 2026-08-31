const SESSION_SCOPE_BUFFER_MS = 5_000;

export function isRowFromSession(
  row: unknown,
  sessionScopedAt: number | null,
): boolean {
  if (sessionScopedAt === null) {
    return false;
  }

  if (typeof row !== "object" || row === null) {
    return false;
  }

  const createdAt = (row as Record<string, unknown>).created_at;
  if (typeof createdAt !== "string") {
    return true;
  }

  const createdMs = Date.parse(createdAt);
  if (Number.isNaN(createdMs)) {
    return true;
  }

  return createdMs >= sessionScopedAt - SESSION_SCOPE_BUFFER_MS;
}
