// Browser-based synthesizer sound system utilizing AudioContext API
// Designed to keep with the sleek cybersecurity hacker/terminal style theme

let audioCtx: AudioContext | null = null;
let isSoundEnabled = (() => {
  const saved = localStorage.getItem('cyber_audio_enabled');
  return saved === null ? 'true' : saved; // Default to true for high fidelity experience, or false, let's set 'true'
})();

export function setSystemAudioEnabled(enabled: boolean) {
  isSoundEnabled = enabled ? 'true' : 'false';
  localStorage.setItem('cyber_audio_enabled', isSoundEnabled);
}

export function getSystemAudioEnabled(): boolean {
  return isSoundEnabled === 'true';
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    // Lazy initialisation to comply with user interaction autoplay policies
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  // Resume if suspended (browser security restriction state)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Play terminal beep sound for user click interaction
export function playClickSound() {
  if (isSoundEnabled !== 'true') return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Simple terminal click: short frequency decay
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  } catch (error) {
    // Silent fail in case of context restrictions
  }
}

// Play cool microscopic hover hover sound
export function playHoverSound() {
  if (isSoundEnabled !== 'true') return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Very soft digital tick/shimmer
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800, ctx.currentTime);
    osc.frequency.setValueAtTime(2200, ctx.currentTime + 0.005);

    gain.gain.setValueAtTime(0.008, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.015);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.02);
  } catch (error) {
    // Silent fail
  }
}

// Play awesome retro hacker terminal boot-up sound sequence
export function playBootAudioSequence() {
  if (isSoundEnabled !== 'true') return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const playTone = (freq: number, start: number, duration: number, volume: number, type: 'sine' | 'square' | 'triangle' = 'sine') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      
      gain.gain.setValueAtTime(volume, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Staggered boot tones
    playTone(150, 0, 0.15, 0.06, 'triangle');
    playTone(300, 0.08, 0.15, 0.05, 'triangle');
    playTone(601, 0.16, 0.18, 0.04, 'sine');
    playTone(1202, 0.24, 0.35, 0.03, 'sine');
    
    // Add a final ambient synth swell
    setTimeout(() => {
      if (isSoundEnabled !== 'true') return;
      playTone(880, 0, 0.5, 0.02, 'sine');
      playTone(1320, 0.05, 0.6, 0.015, 'sine');
    }, 400);

  } catch (error) {
    // Silent fail
  }
}

// Play defensive alert beep (optional security notifications)
export function playAlertSecSound() {
  if (isSoundEnabled !== 'true') return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch (error) {
    // Silent fail
  }
}
