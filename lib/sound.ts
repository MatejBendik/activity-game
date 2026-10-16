export type SoundCue = "timeUp" | "everyone";

// Small synthesized cues: no downloads, permissions or third-party audio assets.
export function playCue(
  context: AudioContext | null,
  enabled: boolean,
  cue: SoundCue,
): Promise<void> {
  if (!context || !enabled || context.state === "closed")
    return Promise.resolve();

  return (
    context
      .resume()
      .then(() => {
        const notes =
          cue === "everyone" ? [880, 1108.73, 1318.51] : [740, 740, 520];
        const length = cue === "everyone" ? 0.55 : 0.18;
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
              harmonic === 1 ? 0.1 : 0.025,
              start + 0.01,
            );
            gain.gain.exponentialRampToValueAtTime(
              0.001,
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
