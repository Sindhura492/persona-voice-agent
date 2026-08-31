# Voice agent QA metrics: ski concierge

## What matters

Voice QA shows whether the agent completes alpine workflows, when guests abandon, and whether **safety escalations** fire when they should.

**Containment rate.** Share of calls that end in a completed workflow without human escalation: `booked`, `rescheduled`, `cancelled`, `gear_fitted`, `loyalty_checked`, or `waitlisted`. High containment with poor transcript quality is still a failure, spot-check calls.

**Escalation rate.** Share tagged `escalated`. This is the **safety-critical** metric for Snowveil. A rising rate after a prompt change may be expected if the safety rule was tightened; a **unusually low** rate can mean the trigger is **not firing** when callers mention injury, medical topics, or avalanche/terrain questions, treat low escalation as a QA concern, not proof that guests are fine.

**Average handle time (AHT).** Mean `duration_seconds` per call and per outcome. This concierge is unhurried; watch for calls exceeding the 4–5 minute cap or ending in seconds (drop-offs).

**Drop-off.** Where guests leave the dialogue. Production systems align turns or tool timestamps to `abandoned` outcomes. This POC only stores the final outcome.

**Waitlist conversion.** `booked ÷ (booked + waitlisted)` from transcript outcomes, a rough proxy for waitlist-to-stay conversion when both outcomes appear in logs.

## What this POC measures

From `transcripts` via Retell post-call webhook → `log-transcript`:

| Field | Use |
| --- | --- |
| `outcome` | `booked`, `rescheduled`, `cancelled`, `gear_fitted`, `loyalty_checked`, `waitlisted`, `escalated`, `abandoned` |
| `duration_seconds` | AHT overall and per outcome on `/qa` |
| `session_id` | Retell `call_id` |

Derived on `/qa`:

- Count by outcome
- Containment, escalation, and abandoned rates
- Highlighted escalation block (count + rate)
- AHT per workflow type

Access `/qa?key=…` with server-only `QA_ACCESS_KEY`. Not linked from public navigation.

## Retell outcome mapping

Set `call.call_analysis.custom_analysis_data.outcome` in Retell post-call analysis to one of the enum values above. If omitted, the webhook infers `escalated` from disconnection reasons containing `escalat` or `transfer`; otherwise defaults to `abandoned`.

## What to add with real volume

- Drop-off by conversation stage (first tool call, last user turn)
- Tool success/failure rates per workflow
- Escalation transcript review queue (paired with `escalations` table)
- Manual scorecards: GDPR opening line, safety rule adherence, bilingual consistency
- n8n delivery health for booking and escalation notifications (see `N8N_WORKFLOW.md`)

Until volume exists, treat `/qa` as wiring proof: outcomes land, durations store, escalation is visible, not a full ops dashboard.
