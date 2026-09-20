# Snowveil Voice Concierge — Design & build case study

**Brand:** Snowveil (fictional boutique alpine ski resort)  
**Live demo:** [snowveil-agent.vercel.app](https://snowveil-agent.vercel.app)  
**Repository:** [github.com/Sindhura492/persona-voice-agent](https://github.com/Sindhura492/persona-voice-agent)

---

## Why this exists

Premium hospitality is heard before it is read. Guests expect to **speak naturally**, be understood in **their language**, and walk away with something **done**: a booking confirmed, gear saved, loyalty recognised, an email in their inbox.

Most voice demos stop at a clever reply. I wanted to build something closer to a **real product**: branded surface, working backend, follow-up automation, privacy boundaries, and a path from first call to go-live on production infrastructure.

Snowveil is that proof: a **web voice concierge** for a boutique ski resort where dialogue, data, and brand experience stay in one continuous flow.

---

## The problem I set out to solve

Guests hitting a resort site today often face one of two bad options:

1. **Static forms** — accurate but cold, no guidance, no sense of service.  
2. **Rigid IVR or menu bots** — “Press 1 for booking” energy that breaks brand trust.

Neither feels like a **concierge**. Neither closes the loop (book → confirm → email → status visible on return).

I designed Snowveil to answer: *What if a guest could talk to the mountain team in their own words, in English or German, complete real tasks during the call, and see proof on screen and in their inbox afterward?*

---

## Who I designed for

### Primary guest — “First-time booker”

- Arrives on the site curious but unsure which package fits.  
- Wants to ask in natural language, not navigate menus.  
- Needs name and email captured **without** awkward spelling on a voice line.  
- Expects a confirmation email and clear next steps.

### Returning guest — “Summit Circle member”

- Already has loyalty points or a prior booking.  
- Expects the agent to **recognise** their status when email is shared.  
- May want to redeem points, reschedule, or add gear fitting in the same call.

### Operations / brand owner (implicit stakeholder)

- Needs the agent to **never improvise** rates, policies, or safety advice.  
- Needs sensitive topics **escalated**, not handled by automation.  
- Needs measurable sessions and transactional emails that match what was said on the call.

---

## User stories I implemented

| As a guest… | I can… | So that… |
| --- | --- | --- |
| …landing on Snowveil | start a voice call from a branded widget | the experience feels on-brand, not embedded SaaS chrome |
| …before speaking | read a short consent notice and allow my microphone | I know the call may be recorded and how my data is used |
| …during the call | type my name and email and tap Share | I never have to spell email aloud; the agent uses exact typed values |
| …booking a stay | ask for availability and confirm a package + dates | a real booking row is created and I receive a “request received” email |
| …already booked | look up, reschedule, or cancel by voice | I manage my stay without calling a phone queue |
| …planning gear | hear FAQ verbally, then save measurements | equipment is staged before arrival and I get a fitting confirmation email |
| …in Summit Circle | hear my balance and redeem points | loyalty feels woven into service, not a separate app |
| …asking about injury or avalanche risk | be handed to a human specialist immediately | I am not given risky automated advice |
| …after the call | see status cards update on the same page | I have visual confirmation without refreshing email only |
| …speaking German | stay in formal Sie-Deutsch for the whole call | the tone matches European hospitality expectations |

---

## Design principles I held throughout

### 1. Voice serves the brand, not the platform

Tone is **warm, attentive, unhurried** — boutique hospitality, not a call center. Copy, layout, colour, and a custom connect sound reinforce Snowveil as a place, not a widget vendor.

### 2. Clarity before cleverness

Every write action (book, cancel, redeem, gear save, waitlist) follows the same rule: **read back all fields → ask explicit confirmation → then call the tool**. Guests always know what will happen before data is saved.

### 3. Multimodal by design

Voice handles **intent and conversation**. The screen handles **precision** (typed name/email, live transcript, status cards). I deliberately separated those jobs instead of forcing speech for everything.

### 4. Privacy is part of the dialog

- Visible notice before the call starts.  
- Spoken GDPR line as the agent’s opening turn.  
- PII typed in a form, not spoken.  
- Status cards scoped to **this browser session** so one guest never sees another’s booking.  
- Health and mountain-safety topics **escalated**, never reasoned about by the model.

### 5. Bilingual without friction

Language is detected from the **first utterance** and locked for the call (English or German with **Sie**). Safety and disclosure lines exist in both languages with identical meaning.

### 6. Fail gracefully in production

Microphone permission is requested before connecting. API errors surface in plain language. Email failures do not block the underlying booking or gear save.

---

## What I made explicit in the experience

These are deliberate “made clear” moments — things a guest or reviewer should never have to guess:

| Moment | What the guest sees or hears |
| --- | --- |
| Before call | Short notice: recording, microphone, optional form now or later |
| Call start | Agent speaks GDPR disclosure, then listens |
| Need for contact | Agent directs to on-screen form; never asks to spell email |
| After Share | Loyalty banner if applicable; transcript shows typed details |
| Before booking | Agent summarises package, dates, extras, points |
| After booking | Status card “Booking received”; email on the way |
| Gear fitting | FAQ spoken; measurements confirmed before save |
| Safety topic | One short line: specialist will join; no medical tips |
| During call | Live transcript bubbles; Listening / Speaking state visible |

---

## Dialog architecture

Single **Retell LLM agent** with a layered prompt (see [`docs/AGENT_CONFIG.md`](AGENT_CONFIG.md)):

```
┌─────────────────────────────────────────┐
│  Safety rule (overrides everything)      │
├─────────────────────────────────────────┤
│  Persona + opening disclosure (EN/DE)   │
├─────────────────────────────────────────┤
│  Confirmation rule (all write tools)    │
├─────────────────────────────────────────┤
│  Workflows: booking, loyalty, gear,      │
│  waitlist, lookup, brochures, escalate  │
└─────────────────────────────────────────┘
```

**12 custom tools** map voice intents to Supabase Edge Functions: availability, booking lifecycle, loyalty, gear, waitlist, brochures, escalation.

Intent is conversational; **execution is structured** — every tool has validated parameters and typed responses the agent reads once.

---

## System architecture

```
Browser (Next.js)
  ├── Retell Web SDK — voice + live transcript
  ├── Guest form — sync to live call variables
  └── Realtime status — booking, loyalty, gear, waitlist

Next.js API (Vercel)
  ├── /api/retell/web-call — server-minted tokens (RETELL_API_KEY)
  └── /api/retell/sync-guest-details — live variable updates

Retell agent ──tools──► Supabase Edge Functions (×12)
                              │
                         Postgres + Realtime
                              │
                    webhooks ──► n8n ──► Gmail (8 email types)
```

| Layer | Choice | Rationale |
| --- | --- | --- |
| Frontend | Next.js 14, TypeScript, Tailwind | Branded, deployable, session-aware UI |
| Voice | Retell Web SDK + LLM agent | Low-latency web voice with tool calling |
| Backend | Supabase Edge Functions | One function per tool; easy to wire in Retell |
| Data | Postgres + Realtime | Persistent records + live status cards |
| Automation | n8n | Transactional email without custom mail server |
| Hosting | Vercel + Supabase Cloud | Production URL for portfolio and testing |

---

## Email & follow-through

Voice should not end at hang-up. I mapped **eight guest-facing emails** plus an internal escalation alert:

- Plan and loyalty brochures (on request)  
- Booking received, confirmed, rescheduled, cancelled  
- Gear fitting confirmed  
- Loyalty redemption confirmed  

Templates live in [`docs/n8n-email-code.js`](n8n-email-code.js); wiring in [`docs/N8N_WORKFLOW.md`](N8N_WORKFLOW.md). Copy uses Snowveil visual language (badge states, EUR pricing rows, loyalty discount lines).

---

## Iteration: what testing changed

This POC was shaped by **real calls and production deploy**, not only local dev:

| Discovery | Design / build response |
| --- | --- |
| Browser TTS repeated guest details aloud | Removed TTS; silent sync via Retell live-call API |
| Mic worked on localhost but not Vercel | Mic preflight + consent copy; per-site permission |
| Status cards leaked other guests’ data | Session-scoped cards only after Share |
| Guests swapped name and email fields | Normalise on share + inline validation hint |
| Generic “connection issue” on deploy | Show actual API error from server |
| Consent modal felt overwhelming | One short pre-call paragraph |
| Retell public key unused in code | Removed; tokens server-side only |
| Gear email path unclear | Verified n8n branch; `emailed` flag on function response |

A gated **QA dashboard** (`/qa`) supports review of session outcomes — see [`docs/QA_METRICS.md`](QA_METRICS.md).

---

## Trust & compliance (POC level)

Documented in [`docs/COMPLIANCE.md`](COMPLIANCE.md):

- What data is collected and why  
- Dual consent (UI + spoken)  
- Retention targets (POC policy, not automated purge)  
- **Privacy-by-design escalation** for health and mountain-safety speech  

Gear fitting collects **measurements**, not medical history; the agent must not solicit injury details.

---

## Outcomes

What a reviewer can do in one session:

1. Open the live site and start a voice call.  
2. Type and share contact details mid-conversation.  
3. Book a package, see a status card, receive email.  
4. Save gear fitting, redeem loyalty, or trigger escalation language.  
5. Switch to German and hear consistent Sie-form service.  
6. Inspect prompts, tools, migrations, and deployment docs in the repo.

---

## Documentation map

| Topic | File |
| --- | --- |
| Agent prompt & tools | [`docs/AGENT_CONFIG.md`](AGENT_CONFIG.md) |
| Deploy & env setup | [`docs/DEPLOYMENT.md`](DEPLOYMENT.md) |
| Email automation | [`docs/N8N_WORKFLOW.md`](N8N_WORKFLOW.md) |
| GDPR & recording | [`docs/COMPLIANCE.md`](COMPLIANCE.md) |
| QA metrics | [`docs/QA_METRICS.md`](QA_METRICS.md) |
| Brand sound | [`docs/BRAND_SOUND.md`](BRAND_SOUND.md) |

---

*Snowveil is a fictional brand. The architecture, integrations, and design decisions reflect a production-shaped conversational voice product built for portfolio demonstration.*
