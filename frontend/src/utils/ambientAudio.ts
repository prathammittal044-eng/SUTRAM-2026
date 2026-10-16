/**
 * Ambient Audio synthesizer using Web Audio API for Haven
 * Generates an ethereal, warm, low-frequency meditative sanctuary drone (432Hz harmonic series)
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let oscillators: OscillatorNode[] = [];

export const toggleHavenAudio = (enable: boolean): boolean => {
  try {
    if (!enable) {
      if (masterGain && audioCtx) {
        masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.4);
        setTimeout(() => {
          oscillators.forEach((osc) => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {
              // ignore
            }
          });
          oscillators = [];
        }, 500);
      }
      return false;
    }

    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Master gain
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    masterGain.gain.setTargetAtTime(0.12, audioCtx.currentTime, 0.8);

    // Warm Lowpass Filter
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, audioCtx.currentTime);

    // Subtle Stereo Panning / Reverb Simulation
    filter.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    // Harmonic Frequencies for Calm Sanctuary Atmosphere (Subtle tuning based on 108Hz / 216Hz / 432Hz)
    const freqs = [108, 162, 216, 270, 324, 432];
    oscillators = [];

    freqs.forEach((freq, idx) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // Gentle detuning for lush chorusing
      osc.detune.setValueAtTime((idx - 2.5) * 4, audioCtx.currentTime);

      oscGain.gain.setValueAtTime(0.15 / (idx + 1), audioCtx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(filter);

      osc.start();
      oscillators.push(osc);
    });

    return true;
  } catch (err) {
    console.warn('Audio playback error:', err);
    return false;
  }
};
