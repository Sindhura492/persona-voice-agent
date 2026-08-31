export const CONNECT_SOUND_DURATION_MS = 2000;

const CONNECT_SWOOSH_SECONDS = 1.05;
const CONNECT_CHIME_DELAY_SECONDS = 0.92;
const CONNECT_CHIME_SECONDS = 1.08;

let sharedContext: AudioContext | null = null;

function getContext(): AudioContext {
  if (!sharedContext) {
    sharedContext = new AudioContext();
  }
  return sharedContext;
}

export async function primeBrandAudio(): Promise<void> {
  const ctx = getContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
}

function createNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const frameCount = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
  const channel = buffer.getChannelData(0);

  for (let index = 0; index < frameCount; index += 1) {
    channel[index] = Math.random() * 2 - 1;
  }

  return buffer;
}

function scheduleSnowCarve(
  ctx: AudioContext,
  startAt: number,
  durationSeconds: number,
  peakGain: number,
): void {
  const source = ctx.createBufferSource();
  source.buffer = createNoiseBuffer(ctx, durationSeconds);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.5;
  filter.frequency.setValueAtTime(1600, startAt);
  filter.frequency.exponentialRampToValueAtTime(240, startAt + durationSeconds);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.linearRampToValueAtTime(peakGain, startAt + 0.07);
  gain.gain.linearRampToValueAtTime(peakGain * 0.65, startAt + durationSeconds * 0.5);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + durationSeconds);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(startAt);
  source.stop(startAt + durationSeconds);
}

type BellPartial = {
  frequency: number;
  weight: number;
  decayScale: number;
  type: OscillatorType;
};

const BELL_PARTIALS: readonly BellPartial[] = [
  { frequency: 1760, weight: 1, decayScale: 1, type: "sine" },
  { frequency: 2640, weight: 0.45, decayScale: 0.75, type: "sine" },
  { frequency: 3520, weight: 0.28, decayScale: 0.55, type: "triangle" },
];

function scheduleChime(
  ctx: AudioContext,
  startAt: number,
  durationSeconds: number,
  peakGain = 0.09,
): void {
  for (const partial of BELL_PARTIALS) {
    const oscillator = ctx.createOscillator();
    oscillator.type = partial.type;
    oscillator.frequency.setValueAtTime(partial.frequency, startAt);

    const decay = durationSeconds * partial.decayScale;
    const gain = ctx.createGain();
    const level = peakGain * partial.weight;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.linearRampToValueAtTime(level, startAt + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + decay);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + decay + 0.03);
  }
}

export async function playIntroBrandSound(): Promise<void> {
  const ctx = getContext();

  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  if (ctx.state !== "running") {
    return;
  }

  const startAt = ctx.currentTime + 0.02;
  scheduleSnowCarve(ctx, startAt + 1.05, 0.5, 0.09);
  scheduleSnowCarve(ctx, startAt + 1.95, 0.48, 0.075);
  scheduleSnowCarve(ctx, startAt + 2.85, 0.52, 0.06);
  scheduleChime(ctx, startAt + 3.15, 0.85, 0.09);
}

export async function playBrandSound(): Promise<void> {
  const ctx = getContext();

  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  if (ctx.state !== "running") {
    return;
  }

  const startAt = ctx.currentTime + 0.02;
  scheduleSnowCarve(ctx, startAt, CONNECT_SWOOSH_SECONDS, 0.11);
  scheduleChime(
    ctx,
    startAt + CONNECT_CHIME_DELAY_SECONDS,
    CONNECT_CHIME_SECONDS,
    0.09,
  );
}

export const BRAND_SOUND_DURATION_MS = CONNECT_SOUND_DURATION_MS;
