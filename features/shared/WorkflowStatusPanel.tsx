"use client";

import { BookingStatus } from "@/features/booking/BookingStatus";
import { GearFittingStatus } from "@/features/gear/GearFittingStatus";
import { LoyaltyStatus } from "@/features/loyalty/LoyaltyStatus";
import { WaitlistStatus } from "@/features/waitlist/WaitlistStatus";

export function WorkflowStatusPanel() {
  return (
    <div className="mt-md flex w-full flex-col gap-sm">
      <BookingStatus />
      <GearFittingStatus />
      <LoyaltyStatus />
      <WaitlistStatus />
    </div>
  );
}
