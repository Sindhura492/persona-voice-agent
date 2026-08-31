import { mockAvailability } from "../_shared/availability.ts";
import {
  extractToolArgs,
  handleOptions,
  jsonResponse,
} from "../_shared/http.ts";
import type { ToolErrorResult } from "../_shared/skiTypes.ts";
import { validateAvailabilityPayload } from "./validate.ts";

Deno.serve(async (request: Request): Promise<Response> => {
  const options = handleOptions(request);
  if (options) {
    return options;
  }

  if (request.method !== "POST") {
    return jsonResponse(
      { success: false, error: "Method not allowed" } satisfies ToolErrorResult,
      405,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { success: false, error: "Invalid JSON body" } satisfies ToolErrorResult,
      400,
    );
  }

  const parsed = validateAvailabilityPayload(extractToolArgs(body));
  if (!parsed.ok) {
    return jsonResponse(
      { success: false, error: parsed.error } satisfies ToolErrorResult,
      400,
    );
  }

  return jsonResponse(mockAvailability(parsed.data));
});
