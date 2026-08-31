import { NextResponse } from "next/server";
import { updateLiveGuestDetails } from "@/lib/retell/updateLiveGuestDetails";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const callId =
    typeof body.callId === "string"
      ? body.callId.trim()
      : typeof body.call_id === "string"
        ? body.call_id.trim()
        : "";
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

  if (!callId) {
    return NextResponse.json({ error: "callId is required" }, { status: 400 });
  }
  if (!guestName && !guestEmail.includes("@")) {
    return NextResponse.json(
      { error: "guestName or guestEmail required" },
      { status: 400 },
    );
  }

  const apiKey = process.env.RETELL_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "RETELL_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const result = await updateLiveGuestDetails(callId, apiKey, {
    guestName,
    guestEmail,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status >= 400 ? result.status : 502 },
    );
  }

  return NextResponse.json({ success: true });
}
