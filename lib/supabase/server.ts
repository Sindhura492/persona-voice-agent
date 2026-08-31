import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

function readServiceRoleKey(): string {
  if (typeof window !== "undefined") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is server-only");
  }

  const value = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!value) {
    throw new Error("Missing required environment variables: SUPABASE_SERVICE_ROLE_KEY");
  }

  return value;
}

export function createServerClient(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("createServerClient is server-only");
  }

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, readServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
