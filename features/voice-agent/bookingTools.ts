import type { ToolSchema } from "./toolSchemaTypes";
import { PACKAGE_TYPES, SKILL_LEVELS } from "./toolSchemaTypes";

export const lookupBookingTool: ToolSchema = {
  name: "lookup_booking",
  description:
    "Look up the guest's current active booking by contact email/phone. After a cancel-and-rebook, use contact only; do not pass an old cancelled booking_id.",
  parameters: {
    type: "object",
    properties: {
      booking_id: { type: "string", description: "Booking UUID." },
      contact: { type: "string", description: "Guest email or phone." },
    },
    required: [],
  },
};

export const checkAvailabilityTool: ToolSchema = {
  name: "check_availability",
  description:
    "Check mocked package availability and EUR pricing. Resolve relative dates to YYYY-MM-DD before calling.",
  parameters: {
    type: "object",
    properties: {
      package_type: {
        type: "string",
        description: "Stay package slug.",
        enum: PACKAGE_TYPES,
      },
      arrival_date: { type: "string", description: "Arrival YYYY-MM-DD." },
      departure_date: { type: "string", description: "Departure YYYY-MM-DD." },
      lift_pass_included: {
        type: "boolean",
        description: "Include lift pass pricing.",
      },
      lessons_included: {
        type: "boolean",
        description: "Include lesson pricing.",
      },
    },
    required: [
      "package_type",
      "arrival_date",
      "departure_date",
      "lift_pass_included",
      "lessons_included",
    ],
  },
};

export const createBookingTool: ToolSchema = {
  name: "create_booking",
  description:
    "Create a pending booking after availability looks good. Before calling, read back guest name, email, package, dates, extras, and any points to redeem; wait for explicit confirmation. Pass loyalty_points_redeemed when applying Summit Circle discount to this booking.",
  parameters: {
    type: "object",
    properties: {
      guest_name: { type: "string", description: "Guest full name." },
      contact: { type: "string", description: "Email or phone." },
      package_type: {
        type: "string",
        description: "Package slug.",
        enum: PACKAGE_TYPES,
      },
      arrival_date: { type: "string", description: "Arrival YYYY-MM-DD." },
      departure_date: { type: "string", description: "Departure YYYY-MM-DD." },
      lift_pass_included: { type: "boolean", description: "Lift pass included." },
      lessons_included: { type: "boolean", description: "Lessons included." },
      loyalty_points_redeemed: {
        type: "number",
        description:
          "Summit Circle points to redeem on this booking (optional). Shows subtotal, discount, and total after in confirmation email.",
      },
    },
    required: [
      "guest_name",
      "contact",
      "package_type",
      "arrival_date",
      "departure_date",
      "lift_pass_included",
      "lessons_included",
    ],
  },
};

export const rescheduleBookingTool: ToolSchema = {
  name: "reschedule_booking",
  description:
    "Move an active booking to new dates. Read back booking, contact, and new dates; wait for confirmation before calling.",
  parameters: {
    type: "object",
    properties: {
      booking_id: { type: "string", description: "Booking UUID." },
      contact: { type: "string", description: "Guest email or phone." },
      arrival_date: { type: "string", description: "New arrival YYYY-MM-DD." },
      departure_date: { type: "string", description: "New departure YYYY-MM-DD." },
    },
    required: ["arrival_date", "departure_date"],
  },
};

export const cancelBookingTool: ToolSchema = {
  name: "cancel_booking",
  description:
    "Cancel an active booking. Read back guest, booking, and reason; wait for confirmation before calling.",
  parameters: {
    type: "object",
    properties: {
      booking_id: { type: "string", description: "Booking UUID." },
      contact: { type: "string", description: "Guest email or phone." },
      reason: {
        type: "string",
        description: "weather waives fees; guest-choice applies EUR 150 fee.",
        enum: ["weather", "guest-choice"],
      },
    },
    required: [],
  },
};

export const submitGearFittingTool: ToolSchema = {
  name: "submit_gear_fitting",
  description:
    "Save boot and ski fitting details for a booking after guest confirmation. Sends a confirmation email automatically. Requires booking_id, height_cm, boot_size (EU), skill_level (beginner, intermediate, advanced); optional notes.",
  parameters: {
    type: "object",
    properties: {
      booking_id: { type: "string", description: "Booking UUID." },
      height_cm: { type: "number", description: "Height 100–230 cm." },
      boot_size: { type: "number", description: "EU boot size 20–50." },
      skill_level: {
        type: "string",
        description: "Ski level.",
        enum: SKILL_LEVELS,
      },
      notes: { type: "string", description: "Optional fitting notes." },
    },
    required: ["booking_id", "height_cm", "boot_size", "skill_level"],
  },
};
