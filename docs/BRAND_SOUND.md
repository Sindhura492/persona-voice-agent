# Snowveil Brand Sound

## Concept

The Snowveil connect sound is a short, synthesized two-layer signature (~2 seconds) built with the Web Audio API, no audio files.

1. **Swoosh**: Filtered white noise with a sweeping low-pass filter (~0.8s), evoking skis carving through packed snow. The gain envelope fades in and out smoothly to avoid clicks.
2. **Chime**: One soft bell ring with a short decay at the end (intro and call connect).

Together they signal movement through snow, then readiness to speak with the concierge.

## When it plays

The sound plays in two places:

1. **First visit intro** (4 second animation). Three soft snow-carve swishes on each turn, then a quiet icy chime when the skier stops in the center. Tap the overlay if autoplay is blocked.
2. **Voice call connect** (snow swoosh + soft chime at the end).

It does not play on modal open alone or on repeat page visits (intro is skipped after the first session).

### Replay intro for screenshots

Use query params on the home page:

- `?replayIntro=1` replays the full 3s animation
- `?replayIntro=1&introHold=3200` freezes when the skier is centered


## Browser audio policy

Browsers block audio that starts without a user gesture (especially on HTTPS production). The intro sound plays only after you **tap** the intro overlay. The connect sound plays when you tap **Agree & start call**, not when the Retell session finishes connecting.

`primeBrandAudio()` resumes the shared `AudioContext` on each intentional click (open modal, start call, tap intro).

## Proof of concept

This implementation is a browser-synthesized placeholder. A production engagement would replace it with a professionally composed and mastered brand sound, while keeping the same trigger (call connect) and pairing with the visual pulse on the voice widget.
