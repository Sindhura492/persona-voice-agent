export type LoyaltyAccount = {
  id: string;
  guest_name: string;
  contact: string;
  points_balance: number;
  created_at: string;
};

export type LoyaltySnapshot = LoyaltyAccount & {
  previous_balance: number | null;
};

export function parseLoyaltyAccount(row: unknown): LoyaltyAccount | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }
  const data = row as Record<string, unknown>;
  if (
    typeof data.id !== "string" ||
    typeof data.guest_name !== "string" ||
    typeof data.contact !== "string" ||
    typeof data.points_balance !== "number" ||
    typeof data.created_at !== "string"
  ) {
    return null;
  }
  return {
    id: data.id,
    guest_name: data.guest_name,
    contact: data.contact,
    points_balance: data.points_balance,
    created_at: data.created_at,
  };
}
