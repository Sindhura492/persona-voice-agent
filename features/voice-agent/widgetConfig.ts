import { env } from "@/lib/env";
import { PRE_CALL_DISCLOSURES } from "@/features/locale/disclosures";
import { skiVoiceTools } from "./toolSchemas";

export const AGENT_CONFIG_PATH = "docs/AGENT_CONFIG.md" as const;

export const CONCIERGE_LABEL = "Concierge" as const;

export const CTA_LABEL = {
  en: "Talk to concierge",
  de: "Concierge anrufen",
} as const;

export const CONSENT_CTA_LABEL = {
  en: "Start call",
  de: "Anruf starten",
} as const;

/** Retell custom tool → Supabase Edge Function slug. */
export const TOOL_ENDPOINTS = {
  check_availability: "check-availability",
  create_booking: "create-booking",
  lookup_booking: "lookup-booking",
  reschedule_booking: "reschedule-booking",
  cancel_booking: "cancel-booking",
  submit_gear_fitting: "submit-gear-fitting",
  send_plan_details: "send-plan-details",
  send_loyalty_details: "send-loyalty-details",
  lookup_loyalty_balance: "lookup-loyalty-balance",
  redeem_loyalty_points: "redeem-loyalty-points",
  join_waitlist: "join-waitlist",
  log_escalation: "create-escalation",
} as const;

export const widgetConfig = {
  get agentId() {
    return env.NEXT_PUBLIC_RETELL_AGENT_ID;
  },
  createWebCallPath: "/api/retell/web-call",
  systemPromptPath: AGENT_CONFIG_PATH,
  preCallDisclosures: PRE_CALL_DISCLOSURES,
  conciergeLabel: CONCIERGE_LABEL,
  ctaLabel: CTA_LABEL,
  consentCtaLabel: CONSENT_CTA_LABEL,
  toolEndpoints: TOOL_ENDPOINTS,
  tools: skiVoiceTools,
} as const;

export type WidgetConfig = typeof widgetConfig;

export { skiVoiceTools, type ToolSchema } from "./toolSchemas";
