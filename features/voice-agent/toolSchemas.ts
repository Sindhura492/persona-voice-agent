import {
  cancelBookingTool,
  checkAvailabilityTool,
  createBookingTool,
  lookupBookingTool,
  rescheduleBookingTool,
  submitGearFittingTool,
} from "./bookingTools";
import {
  joinWaitlistTool,
  logEscalationTool,
  lookupLoyaltyBalanceTool,
  redeemLoyaltyPointsTool,
  sendLoyaltyDetailsTool,
  sendPlanDetailsTool,
} from "./supportTools";

export {
  PACKAGE_TYPES,
  SKILL_LEVELS,
  type ToolParameterProperty,
  type ToolParameterSchema,
  type ToolSchema,
} from "./toolSchemaTypes";

export {
  cancelBookingTool,
  checkAvailabilityTool,
  createBookingTool,
  lookupBookingTool,
  rescheduleBookingTool,
  submitGearFittingTool,
} from "./bookingTools";

export {
  joinWaitlistTool,
  logEscalationTool,
  lookupLoyaltyBalanceTool,
  redeemLoyaltyPointsTool,
  sendLoyaltyDetailsTool,
  sendPlanDetailsTool,
} from "./supportTools";

export const skiVoiceTools = [
  checkAvailabilityTool,
  createBookingTool,
  lookupBookingTool,
  rescheduleBookingTool,
  cancelBookingTool,
  submitGearFittingTool,
  sendPlanDetailsTool,
  sendLoyaltyDetailsTool,
  lookupLoyaltyBalanceTool,
  redeemLoyaltyPointsTool,
  joinWaitlistTool,
  logEscalationTool,
] as const;
