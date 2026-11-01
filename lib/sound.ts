export type SoundCue = "timeUp" | "everyone" | "countdown";

// Double the signal level (+6 dB); phone media volume remains the volume control.
// Even all six bell oscillators at peak sum to 0.75, below full scale.
const CUE_VOLUME = 2;

// Small synthesized cues: no downloads, permissions or third-party audio assets.
export function playCue(
  context: AudioContext | null,
  enabled: boolean,
  cue: SoundCue,
  seconds = 5,
): Promise<void> {
  if (!context || !enabled || context.state === "closed")
    return Promise.resolve();

  return (
    context
      .resume()
      .then(() => {
        const notes =
          cue === "everyone"
            ? [880, 1108.73, 1318.51]
            : cue === "countdown"
              ? [880 + (5 - Math.max(1, Math.min(5, seconds))) * 110]
              : [740, 740, 520];
        const length =
          cue === "everyone" ? 0.55 : cue === "countdown" ? 0.1 : 0.18;
        const step = cue === "everyone" ? 0.14 : 0.2;
        notes.forEach((frequency, index) => {
          const start = context.currentTime + index * step;
          // A quiet upper harmonic gives the ascending cue a bell-like timbre.
          const harmonics = cue === "everyone" ? [1, 2.76] : [1];
          harmonics.forEach((harmonic) => {
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.type = "sine";
            oscillator.frequency.value = frequency * harmonic;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(
              (harmonic === 1 ? 0.1 : 0.025) * CUE_VOLUME,
              start + 0.01,
            );
            gain.gain.exponentialRampToValueAtTime(
              0.001 * CUE_VOLUME,
              start + length - 0.01,
            );
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.onended = () => {
              oscillator.disconnect();
              gain.disconnect();
            };
            oscillator.start(start);
            oscillator.stop(start + length);
          });
        });
      })
      // Audio failure must never prevent a turn from starting or ending.
      .catch(() => {})
  );
}

// Match the displayed 5, 4, 3, 2, 1; never repeat or catch up missed ticks in a burst.
export function countdownSecond(
  deadline: number,
  now: number,
  previous: number,
): number | null {
  const remaining = deadline - now;
  if (remaining <= 0 || remaining > 5000) return null;
  const second = Math.ceil(remaining / 1000);
  return second < previous ? second : null;
}
