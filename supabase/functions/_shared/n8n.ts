const DEFAULT_N8N_URL =
  "https://sindhura.app.n8n.cloud/webhook/persona-automation";

export async function postToN8n(payload: Record<string, unknown>): Promise<void> {
  const n8nUrl = Deno.env.get("N8N_WEBHOOK_URL")?.trim() || DEFAULT_N8N_URL;
  const response = await fetch(n8nUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Failed to notify n8n (${response.status}): ${detail.slice(0, 200)}`,
    );
  }
}
