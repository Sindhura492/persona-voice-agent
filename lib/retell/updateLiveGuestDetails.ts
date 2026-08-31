type UpdateLiveCallResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

export async function updateLiveGuestDetails(
  callId: string,
  apiKey: string,
  details: { guestName: string; guestEmail: string },
): Promise<UpdateLiveCallResult> {
  const response = await fetch(
    `https://api.retellai.com/v2/update-live-call/${callId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields_to_override: {
          override_dynamic_variables: {
            guest_name: details.guestName,
            guest_email: details.guestEmail,
          },
        },
        call_control: {
          additional_context: `The guest typed their details in the on-screen form and tapped Share. Use exactly guest_name="${details.guestName}" and guest_email="${details.guestEmail}" in all tool calls. Do not ask them to spell aloud.`,
          trigger_response: true,
        },
      }),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    return {
      ok: false,
      status: response.status,
      error: detail.slice(0, 200) || "Failed to sync guest details",
    };
  }

  return { ok: true };
}
