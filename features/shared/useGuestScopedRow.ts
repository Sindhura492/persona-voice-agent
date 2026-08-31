"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { normalizeGuestContact } from "./guestContact";
import { isRowFromSession } from "./sessionScope";

type RealtimeEvent = "INSERT" | "UPDATE";

type UseGuestScopedRowConfig<T> = {
  guestContact: string | null;
  sessionScopedAt: number | null;
  table: string;
  events: readonly RealtimeEvent[];
  parse: (row: unknown) => T | null;
  channelName: string;
  belongsToGuest: (row: T, normalizedContact: string) => boolean | Promise<boolean>;
};

export function useGuestScopedRow<T>(config: UseGuestScopedRowConfig<T>): T | null {
  const [row, setRow] = useState<T | null>(null);

  useEffect(() => {
    if (!config.guestContact || config.sessionScopedAt === null) {
      setRow(null);
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
        setRow(parsed);
      }
    };

    const channel = supabase.channel(
      `${config.channelName}-${normalizedContact}-${scopedAt}`,
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
    config.table,
  ]);

  return row;
}
