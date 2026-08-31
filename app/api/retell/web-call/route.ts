import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createRetellWebCall } from "@/lib/retell/createWebCall";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseAgentId(body: unknown): string | null {
  if (!isRecord(body)) {
    return null;
  }
  const agentId =
    typeof body.agentId === "string"
      ? body.agentId.trim()
      : typeof body.agent_id === "string"
        ? body.agent_id.trim()
        : "";
  return agentId || null;
}

function parseGuestDetails(body: unknown): Record<string, string> {
  if (!isRecord(body)) {
    return {};
  }

  const guestName =
    typeof body.guestName === "string"
      ? body.guestName.trim()
      : typeof body.guest_name === "string"
        ? body.guest_name.trim()
        : "";
  const guestEmail =
    typeof body.guestEmail === "string"
      ? body.guestEmail.trim().toLowerCase()
      : typeof body.guest_email === "string"
        ? body.guest_email.trim().toLowerCase()
        : "";

  const dynamicVariables: Record<string, string> = {};
  if (guestName) {
    dynamicVariables.guest_name = guestName;
  }
  if (guestEmail) {
    dynamicVariables.guest_email = guestEmail;
  }
  return dynamicVariables;
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const agentId = parseAgentId(body) ?? env.NEXT_PUBLIC_RETELL_AGENT_ID;

  if (agentId !== env.NEXT_PUBLIC_RETELL_AGENT_ID) {
    return NextResponse.json({ error: "Unknown agentId" }, { status: 400 });
  }

  const apiKey = process.env.RETELL_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "RETELL_API_KEY is not configured" },
      { status: 500 },
    );
  }

  try {
    const result = await createRetellWebCall(
      agentId,
      apiKey,
      parseGuestDetails(body),
    );
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status >= 400 ? result.status : 502 },
      );
    }

    return NextResponse.json({
      accessToken: result.data.accessToken,
      callId: result.data.callId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
