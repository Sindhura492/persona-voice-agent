# n8n notification workflows: ski concierge

Configure **Supabase Database Webhooks** in the Dashboard (not Edge Function code) to POST row events to n8n. Create **two separate workflows**: escalations are time-sensitive and should be wired and tested first if time is limited.

> If Dashboard webhook creation fails with `schema "supabase_functions" does not exist`, use the Supabase CLI or support docs for your project version, or replicate these triggers with `pg_net` / scheduled polling in a later phase.

---

## Priority 1: Escalation alert (internal, urgent)

**Trigger:** `INSERT` on `public.escalations`

**Why first:** Safety-related handoffs must reach staff immediately. Guest-facing booking emails can wait; escalations cannot.

### Suggested n8n flow

1. **Webhook** (POST), production URL
2. **Code**: format urgent internal email/Slack
3. **Gmail / Slack**: on-call mountain team

### Payload shape (Database Webhook)

Supabase sends a JSON body similar to:

```json
{
  "type": "INSERT",
  "table": "escalations",
  "schema": "public",
  "record": {
    "id": "uuid",
    "booking_id": "uuid-or-null",
    "reason": "Caller mentioned prior knee injury",
    "transcript_snippet": "I tore my ACL last season…",
    "status": "open",
    "created_at": "2026-08-28T10:15:00.000Z"
  },
  "old_record": null
}
```

### Fields to use in notifications

| Field | Notes |
| --- | --- |
| `record.reason` | Short escalation summary |
| `record.transcript_snippet` | Caller words, handle as sensitive |
| `record.booking_id` | Link to booking if present |
| `record.created_at` | Time sensitivity |

**Subject line example:** `[URGENT] Snowveil escalation, mountain specialist needed`

---

## Priority 2: Guest booking notifications

**Trigger:** `UPDATE` on `public.bookings`

**Filter:** Fire when `status` becomes `confirmed` or `cancelled` (configure in n8n Switch on `record.status`, or use a Dashboard filter if available).

### Suggested n8n flow

1. **Webhook** (POST)
2. **Switch** on `record.status` → `confirmed` | `cancelled`
3. **Code**: branded HTML email (calm alpine tone)
4. **Gmail**: `to` = `record.contact` when it is an email address

### Payload shape (UPDATE)

```json
{
  "type": "UPDATE",
  "table": "bookings",
  "schema": "public",
  "record": {
    "id": "uuid",
    "guest_name": "Elena Vogt",
    "contact": "elena@example.com",
    "package_type": "alpine_escape",
    "arrival_date": "2026-12-12",
    "departure_date": "2026-12-15",
    "lift_pass_included": true,
    "lessons_included": false,
    "status": "confirmed",
    "created_at": "2026-08-28T09:00:00.000Z"
  },
  "old_record": {
    "id": "uuid",
    "guest_name": "Elena Vogt",
    "contact": "elena@example.com",
    "package_type": "alpine_escape",
    "arrival_date": "2026-12-12",
    "departure_date": "2026-12-15",
    "lift_pass_included": true,
    "lessons_included": false,
    "status": "pending",
    "created_at": "2026-08-28T09:00:00.000Z"
  }
}
```

### Branch copy hints

- **`confirmed`**: arrival/departure dates, package label, lift pass flag
- **`cancelled`**: use a **separate HTML template** with title “Booking cancelled”, red badge, policy block (EUR 150 guest-choice fee, weather waivers, 5–7 day refunds). Do **not** reuse the “Booking request received” template.
- **`rescheduled`**: updated dates with a blue “Rescheduled” badge

**Ready-to-paste Code node:** copy all of `docs/n8n-email-code.js` into your n8n **Code in JavaScript** node. It branches on `plan_brochure`, `loyalty_brochure`, `loyalty_redeemed`, `gear_fitting_confirmed`, `booking_received`, `booking_confirmed`, `booking_cancelled`, `booking_rescheduled`, and `plan_brochure`.

For `rescheduled` status, add a third Switch branch or a separate webhook if you want dedicated emails.

---

## Gear fitting confirmation email

**Trigger:** `submit_gear_fitting` Edge Function posts to the same n8n webhook after a successful insert (no separate Database Webhook needed).

**Event:** `gear_fitting_confirmed` / `GEAR_FITTING_CONFIRMED`

**Payload fields:** `to`, `guestName`, `booking_id`, `arrival_date`, `departure_date`, `package_type`, `height_cm`, `boot_size`, `skill_level`, `notes`

Handled in `docs/n8n-email-code.js`. Guest subject: `Snowveil: gear fitting confirmed`.

---

## Dashboard setup checklist

### Escalations webhook

1. Supabase Dashboard → **Database** → **Webhooks** → **Create hook**
2. Name: `n8n-escalation-insert`
3. Table: `escalations` · Event: **Insert**
4. URL: n8n production webhook
5. Method: POST · Include record: yes
6. Activate n8n workflow

### Bookings webhook

1. Name: `n8n-booking-status-update`
2. Table: `bookings` · Event: **Update**
3. URL: separate n8n production webhook
4. In n8n: ignore updates where `old_record.status === record.status`
5. Branch only `confirmed` and `cancelled`

---

## Testing

| Test | Expect |
| --- | --- |
| Insert row into `escalations` (SQL or `create-escalation` tool) | n8n execution within seconds |
| Update booking `status` to `confirmed` | Guest email branch runs |
| Update booking `status` to `cancelled` | Cancellation branch runs |
| Pending → pending update | No email (Switch filters unchanged status) |

---

## Security notes

- Webhook URLs are secrets, store in n8n, not in the repo
- Escalation payloads may contain health-related snippets, restrict n8n access and email recipients
- Guest emails: validate `record.contact` contains `@` before Gmail send

See also: `docs/QA_METRICS.md` (escalation rate), `docs/COMPLIANCE.md` (data handling).
