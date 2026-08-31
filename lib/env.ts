type PublicEnv = Readonly<{
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_RETELL_AGENT_ID: string;
  NEXT_PUBLIC_RETELL_PUBLIC_KEY: string;
}>;

type Env = PublicEnv;

function missingMessage(keys: readonly string[]): string {
  return `Missing required environment variables: ${keys.join(", ")}`;
}

function readRequiredPublic(name: string, value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(missingMessage([name]));
  }
  return trimmed;
}

function readPublicEnv(): PublicEnv {
  return {
    NEXT_PUBLIC_SUPABASE_URL: readRequiredPublic(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: readRequiredPublic(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
    NEXT_PUBLIC_RETELL_AGENT_ID: readRequiredPublic(
      "NEXT_PUBLIC_RETELL_AGENT_ID",
      process.env.NEXT_PUBLIC_RETELL_AGENT_ID,
    ),
    NEXT_PUBLIC_RETELL_PUBLIC_KEY: readRequiredPublic(
      "NEXT_PUBLIC_RETELL_PUBLIC_KEY",
      process.env.NEXT_PUBLIC_RETELL_PUBLIC_KEY,
    ),
  };
}

let publicEnvCache: PublicEnv | null = null;

function getPublicEnv(): PublicEnv {
  if (!publicEnvCache) {
    publicEnvCache = readPublicEnv();
  }
  return publicEnvCache;
}

export const env: Env = {
  get NEXT_PUBLIC_SUPABASE_URL() {
    return getPublicEnv().NEXT_PUBLIC_SUPABASE_URL;
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return getPublicEnv().NEXT_PUBLIC_SUPABASE_ANON_KEY;
  },
  get NEXT_PUBLIC_RETELL_AGENT_ID() {
    return getPublicEnv().NEXT_PUBLIC_RETELL_AGENT_ID;
  },
  get NEXT_PUBLIC_RETELL_PUBLIC_KEY() {
    return getPublicEnv().NEXT_PUBLIC_RETELL_PUBLIC_KEY;
  },
};
