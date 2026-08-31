# Deployment: Snowveil ski concierge

## Prerequisites

- Supabase project with CLI access (`supabase login`, `supabase link --project-ref <ref>`)
- Migrations applied in order: `0001_ski_concierge_init.sql` → `0002_realtime_ski_feedback.sql` → `0003_faq_seed.sql` → `0004_transcripts.sql` (run `9999_reset.sql` first only when upgrading from the legacy multi-brand schema)
- Retell agent configured per `docs/AGENT_CONFIG.md`
- Vercel project linked to this repository

## Environment checklist

### Validated in `lib/env.ts` (Vercel + `.env.local`)

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Browser Supabase client |
| `NEXT_PUBLIC_RETELL_AGENT_ID` | Public | Single Snowveil Retell agent id |
| `NEXT_PUBLIC_RETELL_PUBLIC_KEY` | Public | Retell public key for the web widget |

### Server-only (not in `lib/env.ts`)

| Variable | Where | Purpose |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel server only | `lib/supabase/server.ts`, never expose to the client |
| `RETELL_API_KEY` | Vercel server only | `POST /api/retell/web-call` access tokens |
| `QA_ACCESS_KEY` | Vercel server only | Gates `/qa` dashboard (optional in non-prod) |

Edge Functions read `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` automatically on hosted Supabase; no extra secrets needed per function.

Copy `.env.example` to `.env.local` for local dev. Do not commit secrets.

## Deploy Supabase migrations

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Confirm tables exist: `bookings`, `gear_fittings`, `loyalty_accounts`, `waitlist_entries`, `escalations`, `faq_entries`, `transcripts`.

## Deploy Edge Functions

Deploy all twelve functions from the repo root (`--no-verify-jwt` for Retell tool webhooks):

```bash
supabase functions deploy check-availability --no-verify-jwt
supabase functions deploy create-booking --no-verify-jwt
supabase functions deploy lookup-booking --no-verify-jwt
supabase functions deploy reschedule-booking --no-verify-jwt
supabase functions deploy cancel-booking --no-verify-jwt
supabase functions deploy submit-gear-fitting --no-verify-jwt
supabase functions deploy send-plan-details --no-verify-jwt
supabase functions deploy send-loyalty-details --no-verify-jwt
supabase functions deploy lookup-loyalty-balance --no-verify-jwt
supabase functions deploy redeem-loyalty-points --no-verify-jwt
supabase functions deploy join-waitlist --no-verify-jwt
supabase functions deploy create-escalation --no-verify-jwt
supabase functions deploy log-transcript --no-verify-jwt
```

Base URL pattern: `https://<project-ref>.supabase.co/functions/v1/<slug>`.

In Retell, point each custom tool to the matching slug (see `features/voice-agent/widgetConfig.ts` → `TOOL_ENDPOINTS`). Retell tool `log_escalation` maps to `create-escalation`.

## Database Webhooks → n8n

Configure **two** Supabase Database Webhooks (Dashboard → Database → Webhooks). Full payload and n8n branch logic: `docs/N8N_WORKFLOW.md`.

| Hook name | Table | Event | Priority |
| --- | --- | --- | --- |
| `n8n-escalation-insert` | `escalations` | **Insert** | Urgent, wire first |
| `n8n-booking-status-update` | `bookings` | **Update** | Guest emails on `status` → `confirmed` or `cancelled` |

Store n8n production webhook URLs in n8n only, not in the repo.

## Deploy Vercel frontend

1. Import the Git repository (Framework Preset: **Next.js**).
2. Add all environment variables from the checklists above.
3. Deploy production (and preview if desired).
4. In Retell, allow your production domain (and `localhost` for dev) on the public key.
5. Confirm `POST /api/retell/web-call` returns an `accessToken` when `RETELL_API_KEY` is set.

## Post-deploy checks

| Check | Expect |
| --- | --- |
| `GET /api/health` | `200` |
| Landing page | Hero, FAQ preview, four realtime status cards |
| Voice widget | GDPR disclosure visible; session reaches connected |
| `check-availability` tool | JSON success from Edge Function |
| Booking flow | Row in `bookings` with `status = pending`, then `confirmed` after voice confirm |
| Escalation test | `INSERT` into `escalations` fires n8n webhook |
| `/qa?key=<QA_ACCESS_KEY>` | QA summary loads (if key set) |

See also: `docs/QA_METRICS.md`, `docs/COMPLIANCE.md`, `docs/AGENT_CONFIG.md`.
