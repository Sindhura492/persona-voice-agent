# Compliance: Snowveil ski concierge

POC-level privacy documentation for the boutique alpine voice concierge. Not a substitute for legal review, a DPIA, or production GDPR compliance.

---

## Personal data collected

| Category | Examples | Sensitivity |
| --- | --- | --- |
| Identity & contact | Guest name, email, phone | Standard |
| Booking | Package type, arrival/departure dates, lift pass and lesson flags, booking status | Standard |
| Gear fitting | Height (cm), EU boot size, skill level, optional notes | Standard; notes may contain free text |
| Loyalty | Contact, points balance, redemption amounts | Standard |
| Waitlist | Name, contact, requested date, lesson level | Standard |
| Voice session | Call audio, live transcript, session metadata | Standard; may contain anything spoken |
| **Health / injury (if mentioned)** | Medical conditions, prior injuries, pain, avalanche or terrain safety questions | **Sensitive**: see escalation below |

Gear fitting collects **body measurements**, not medical history. The agent must not prompt for injury or health details.

---

## Purpose

Data is used to:

- Check availability and manage bookings, reschedules, and cancellations
- Record gear fitting measurements and waitlist requests
- Operate the Summit Circle loyalty program
- Review voice-agent quality (containment, handle time, outcomes)
- Escalate safety-sensitive topics to a human specialist

This POC does **not** use guest data for marketing or profiling.

---

## Retention

| Data type | Retention (POC policy) |
| --- | --- |
| Call transcripts & session logs | **30 days**, then delete or anonymize |
| Bookings, gear fittings, waitlist entries | **30 days** after departure or last activity for this demo |
| Loyalty accounts | **24 months** after last stay or account activity (longer where a continuing guest relationship exists) |
| Escalation records | **90 days** for specialist follow-up, then delete or anonymize |

Automated deletion is not enforced in code for this POC; retention must be operated manually or automated before any live-guest launch.

---

## How consent is obtained

Consent is layered:

1. **Visible disclosure**: Before starting a call, the voice widget shows a GDPR notice (EN/DE via the site locale toggle) covering recording, transcription, and health-related data handling. Starting the call after reading this notice constitutes consent for this POC's limited purposes.

2. **Spoken disclosure**: On the agent's opening turn, before collecting name, contact, or booking details, the agent speaks the same GDPR line in the caller's detected language (see `docs/AGENT_CONFIG.md`).

3. **Implied consent to process**: Continuing the conversation after both disclosures allows processing for booking, gear fitting, loyalty, and waitlist workflows only.

The site locale toggle (EN/DE) controls **written** copy only. **Voice** language is detected automatically from the caller's first utterance.

---

## Health, injury, and privacy-by-design

If a caller mentions **any medical condition, injury history, prior injury**, or asks about **avalanche risk, off-piste safety, or terrain conditions**:

- The agent **does not** process, store, or advise on that information.
- The agent **immediately** calls `log_escalation` with a reason and transcript snippet.
- A human mountain specialist takes over.

This is a **privacy-by-design** choice: sensitive health and mountain-safety topics are routed to qualified staff rather than retained or reasoned about by the automated agent. It is not merely a UX preference, it limits automated processing of special-category and high-risk data in this POC.

Escalation records may include the transcript snippet provided to the tool; they are retained per the table above and are accessible only via service-role access (no public RLS).

---

## Scope and limits

This POC demonstrates transparency, purpose limitation, bilingual disclosure, and short retention intent. Production rollout requires formal legal review under the GDPR, EU AI Act where applicable, and Swiss/host-country rules before live guest traffic.

See also: `docs/AGENT_CONFIG.md` (agent behaviour), `features/locale/disclosures.ts` (visible GDPR copy).
