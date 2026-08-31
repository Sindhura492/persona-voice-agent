# Persona Voice Agent

Voice concierge POC for a boutique alpine ski resort (**Snowveil**). Guests talk to an AI concierge in the browser, type name and email when prompted, and complete booking, loyalty, gear fitting, and support flows in English or German.

**Stack:** Next.js 14 · React · TypeScript · Tailwind CSS · [Retell](https://www.retellai.com/) web voice · [Supabase](https://supabase.com/) (Postgres + Edge Functions + Realtime) · [n8n](https://n8n.io/) (transactional email)

## Features

- **Web voice agent** via Retell with live transcript and GDPR disclosure before the call
- **Typed guest details** form (name + email) synced silently to the live call; no browser TTS
- **Booking workflows:** availability, create, lookup, reschedule, cancel
- **Summit Circle loyalty:** balance lookup, welcome points for new guests, redemption on booking
- **Gear fitting, waitlist, plan/loyalty email brochures** via n8n
- **Safety escalation** for medical, injury, avalanche, or terrain topics
- **Realtime status panels** on the landing page (booking, loyalty, gear, waitlist)
- **QA dashboard** at `/qa` (gated by `QA_ACCESS_KEY`)

## Architecture

```
Browser (Next.js)
  ├── Retell Web SDK ──► voice + tools
  ├── /api/retell/web-call ──► Retell access tokens
  └── /api/retell/sync-guest-details ──► live call variable updates

Supabase Edge Functions ◄── Retell custom tools (booking, loyalty, etc.)
  ├── Postgres (bookings, loyalty, transcripts, …)
  └── Database webhooks ──► n8n ──► Gmail
```

Retell agent prompt and tool wiring: [`docs/AGENT_CONFIG.md`](docs/AGENT_CONFIG.md)

## Quick start

### Prerequisites

- Node.js 20+
- Supabase project with migrations applied
- Retell agent configured with custom tools pointing at your Edge Functions
- n8n webhook for emails (optional for local UI dev)

### Install

```bash
git clone https://github.com/Sindhura492/persona-voice-agent.git
cd persona-voice-agent
npm install
```

### Environment

Copy the example file and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser Supabase client |
| `NEXT_PUBLIC_RETELL_AGENT_ID` | Retell agent ID |
| `NEXT_PUBLIC_RETELL_PUBLIC_KEY` | Retell public key for web calls |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase (never expose to client) |
| `RETELL_API_KEY` | Server-side web call tokens + live call sync |
| `QA_ACCESS_KEY` | Optional gate for `/qa` |

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Allow microphone access when starting a voice session.

### Database and Edge Functions

```bash
supabase link --project-ref <your-project-ref>
supabase db push
supabase functions deploy check-availability --no-verify-jwt
# … deploy remaining functions (see docs/DEPLOYMENT.md)
```

## Project structure

| Path | Description |
| --- | --- |
| `app/` | Next.js App Router pages and API routes |
| `features/voice-agent/` | Retell widget, session hook, tool schemas, guest form |
| `features/booking/`, `loyalty/`, `gear/`, `waitlist/` | Realtime status UI |
| `supabase/functions/` | Edge Functions called by Retell tools |
| `supabase/migrations/` | Database schema and seed data |
| `docs/` | Agent config, deployment, n8n, compliance, QA |

## Documentation

- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Vercel, Supabase, Retell, n8n setup
- [`docs/AGENT_CONFIG.md`](docs/AGENT_CONFIG.md) — System prompt and tool mapping
- [`docs/N8N_WORKFLOW.md`](docs/N8N_WORKFLOW.md) — Email webhooks and templates
- [`docs/n8n-email-code.js`](docs/n8n-email-code.js) — Paste into n8n Code node
- [`docs/COMPLIANCE.md`](docs/COMPLIANCE.md) — GDPR and recording notices
- [`docs/QA_METRICS.md`](docs/QA_METRICS.md) — QA dashboard metrics

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
npm run start    # run production build
npm run lint     # ESLint
```

## License

Private POC. All rights reserved unless otherwise specified.
