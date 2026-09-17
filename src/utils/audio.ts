/**
 * Web Audio API Synthesizer for Emergency Alarm & Beacon Chimes
 * Runs 100% offline with zero external audio assets needed.
 */

let audioCtx: AudioContext | null = null;
let sirenOsc: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let sirenLfo: OscillatorNode | null = null;
let isPlaying = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playEmergencyAlarm(): void {
  try {
    const ctx = getAudioContext();
    if (isPlaying) return;

    // Create carrier oscillator
    sirenOsc = ctx.createOscillator();
    sirenGain = ctx.createGain();

    // Create LFO for siren pitch wobble
    sirenLfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    // Configure frequency sweep (750Hz base, swings +/- 350Hz at 1.5Hz)
    sirenOsc.type = 'sawtooth';
    sirenOsc.frequency.setValueAtTime(800, ctx.currentTime);

    sirenLfo.type = 'sine';
    sirenLfo.frequency.setValueAtTime(1.8, ctx.currentTime);
    lfoGain.gain.setValueAtTime(320, ctx.currentTime);

    sirenLfo.connect(lfoGain);
    lfoGain.connect(sirenOsc.frequency);

    // Master volume ramp
    sirenGain.gain.setValueAtTime(0.01, ctx.currentTime);
    sirenGain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.1);

    sirenOsc.connect(sirenGain);
    sirenGain.connect(ctx.destination);

    sirenLfo.start();
    sirenOsc.start();
    isPlaying = true;
  } catch (err) {
    console.warn('AudioContext playback blocked or not supported:', err);
  }
}

export function stopEmergencyAlarm(): void {
  try {
    if (sirenGain && audioCtx) {
      sirenGain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      setTimeout(() => {
        try {
          sirenOsc?.stop();
          sirenLfo?.stop();
          sirenOsc?.disconnect();
          sirenLfo?.disconnect();
          sirenGain?.disconnect();
        } catch {
          // ignore disconnect errors
        }
        sirenOsc = null;
        sirenLfo = null;
        sirenGain = null;
        isPlaying = false;
      }, 100);
    } else {
      isPlaying = false;
    }
  } catch {
    isPlaying = false;
  }
}

export function isAlarmRunning(): boolean {
  return isPlaying;
}

export function playBeaconChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880.00, now + 0.12); // A5
    osc.frequency.setValueAtTime(1174.66, now + 0.24); // D6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  } catch (err) {
    console.warn('Chime playback error:', err);
  }
}
