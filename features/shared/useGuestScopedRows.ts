"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { normalizeGuestContact } from "./guestContact";
import { isRowFromSession } from "./sessionScope";

type RealtimeEvent = "INSERT" | "UPDATE";

type UseGuestScopedRowsConfig<T extends { id: string }> = {
  guestContact: string | null;
  sessionScopedAt: number | null;
  statusPanelEpoch?: number;
  table: string;
  events: readonly RealtimeEvent[];
  parse: (row: unknown) => T | null;
  channelName: string;
  belongsToGuest: (row: T, normalizedContact: string) => boolean | Promise<boolean>;
};

/** Collects multiple session-scoped rows (e.g. several bookings). */
export function useGuestScopedRows<T extends { id: string }>(
  config: UseGuestScopedRowsConfig<T>,
): T[] {
  const [rows, setRows] = useState<T[]>([]);

  useEffect(() => {
    setRows([]);
  }, [config.statusPanelEpoch]);

  useEffect(() => {
    if (!config.guestContact || config.sessionScopedAt === null) {
      setRows([]);
      return;
    }

    const normalizedContact = normalizeGuestContact(config.guestContact);
    const scopedAt = config.sessionScopedAt;
    let cancelled = false;
    let supabase: ReturnType<typeof createBrowserClient>;

    try {
      supabase = createBrowserClient();
    } catch {
      return;
    }

    const acceptRow = async (candidate: unknown) => {
      if (!isRowFromSession(candidate, scopedAt)) {
        return;
      }
      const parsed = config.parse(candidate);
      if (!parsed) {
        return;
      }
      const matches = await config.belongsToGuest(parsed, normalizedContact);
      if (!cancelled && matches) {
        setRows((current) => {
          const without = current.filter((row) => row.id !== parsed.id);
          return [parsed, ...without];
        });
      }
    };

    const channel = supabase.channel(
      `${config.channelName}-multi-${normalizedContact}-${scopedAt}-${config.statusPanelEpoch ?? 0}`,
    );

    for (const event of config.events) {
      channel.on(
        "postgres_changes",
        { event, schema: "public", table: config.table },
        (payload) => {
          void acceptRow(payload.new);
        },
      );
    }

    channel.subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [
    config.belongsToGuest,
    config.channelName,
    config.events,
    config.guestContact,
    config.parse,
    config.sessionScopedAt,
    config.statusPanelEpoch,
    config.table,
  ]);

  return rows;
}
