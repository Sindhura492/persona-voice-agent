type CreateWebCallSuccess = {
  accessToken: string;
  callId: string | null;
};

type CreateWebCallFailure = {
  ok: false;
  status: number;
  error: string;
};

type CreateWebCallOk = {
  ok: true;
  data: CreateWebCallSuccess;
};

export type CreateWebCallResult = CreateWebCallOk | CreateWebCallFailure;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function createRetellWebCall(
  agentId: string,
  apiKey: string,
  dynamicVariables?: Record<string, string>,
): Promise<CreateWebCallResult> {
  const payload: Record<string, unknown> = { agent_id: agentId };
  if (dynamicVariables && Object.keys(dynamicVariables).length > 0) {
    payload.retell_llm_dynamic_variables = dynamicVariables;
  }

  const response = await fetch("https://api.retellai.com/v2/create-web-call", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return {
      ok: false,
      status: response.status || 502,
      error: "Invalid Retell response",
    };
  }

  if (!response.ok) {
    const message =
      isRecord(body) && typeof body.message === "string"
        ? body.message
        : "Failed to create web call";
    return { ok: false, status: response.status, error: message };
  }

  if (!isRecord(body) || typeof body.access_token !== "string") {
    return { ok: false, status: 502, error: "Missing access token" };
  }

  return {
    ok: true,
    data: {
      accessToken: body.access_token,
      callId: typeof body.call_id === "string" ? body.call_id : null,
    },
  };
}
