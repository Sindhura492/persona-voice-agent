import type { ToolSchema } from "./toolSchemaTypes";
import { PACKAGE_TYPES, SKILL_LEVELS } from "./toolSchemaTypes";

export const sendPlanDetailsTool: ToolSchema = {
  name: "send_plan_details",
  description:
    "Email plans, EUR pricing, and optional availability. If the guest is enrolled in Summit Circle, the email includes their points and redemption options. Call lookup_loyalty_balance first when email is known.",
  parameters: {
    type: "object",
    properties: {
      contact: {
        type: "string",
        description: "Guest email address (required).",
      },
      guest_name: {
        type: "string",
        description: "Guest name if known.",
      },
      package_type: {
        type: "string",
        description: "Optional package to highlight.",
        enum: PACKAGE_TYPES,
      },
      arrival_date: {
        type: "string",
        description: "Optional arrival YYYY-MM-DD for availability snapshot.",
      },
      departure_date: {
        type: "string",
        description: "Optional departure YYYY-MM-DD for availability snapshot.",
      },
      lift_pass_included: {
        type: "boolean",
        description: "Price lift pass in availability snapshot. Default true.",
      },
      lessons_included: {
        type: "boolean",
        description: "Price lessons in availability snapshot. Default false.",
      },
      include_availability: {
        type: "boolean",
        description:
          "If true and dates are set, include availability snapshot in the email.",
      },
    },
    required: ["contact"],
  },
};

export const sendLoyaltyDetailsTool: ToolSchema = {
  name: "send_loyalty_details",
  description:
    "Email Summit Circle balance, redemption tiers, available discounts, and how points can be used. Use when the guest wants loyalty/discount details in writing, before or after redemption.",
  parameters: {
    type: "object",
    properties: {
      contact: {
        type: "string",
        description: "Guest email address (required).",
      },
      guest_name: {
        type: "string",
        description: "Guest name if known.",
      },
      include_redemption_guide: {
        type: "boolean",
        description:
          "Include full redemption tier guide and discount examples. Default true.",
      },
    },
    required: ["contact"],
  },
};

export const lookupLoyaltyBalanceTool: ToolSchema = {
  name: "lookup_loyalty_balance",
  description:
    "Look up Summit Circle points and redemption options. Call as soon as an email is known, before proposing packages or plans. Proactively announce balance and best redemption; mention 200 welcome points for new guests.",
  parameters: {
    type: "object",
    properties: {
      contact: { type: "string", description: "Email or phone on file." },
    },
    required: ["contact"],
  },
};

export const redeemLoyaltyPointsTool: ToolSchema = {
  name: "redeem_loyalty_points",
  description:
    "Redeem Summit Circle points when balance is sufficient. Sends a confirmation email with discount applied and remaining balance. Confirm redemption amount with the guest first.",
  parameters: {
    type: "object",
    properties: {
      contact: { type: "string", description: "Account contact." },
      points: { type: "number", description: "Whole points to redeem." },
    },
    required: ["contact", "points"],
  },
};

export const joinWaitlistTool: ToolSchema = {
  name: "join_waitlist",
  description: "Add guest to lesson waitlist when slots are full.",
  parameters: {
    type: "object",
    properties: {
      guest_name: { type: "string", description: "Guest name." },
      contact: { type: "string", description: "Email or phone." },
      requested_date: { type: "string", description: "Lesson date YYYY-MM-DD." },
      lesson_level: {
        type: "string",
        description: "Lesson level.",
        enum: SKILL_LEVELS,
      },
    },
    required: ["guest_name", "contact", "requested_date", "lesson_level"],
  },
};

export const logEscalationTool: ToolSchema = {
  name: "log_escalation",
  description:
    "Escalate to human specialist. Required for medical, injury, or avalanche/terrain safety topics.",
  parameters: {
    type: "object",
    properties: {
      reason: { type: "string", description: "Why escalating." },
      transcript_snippet: {
        type: "string",
        description: "Caller words triggering escalation.",
      },
      booking_id: { type: "string", description: "Related booking UUID if known." },
    },
    required: ["reason"],
  },
};
