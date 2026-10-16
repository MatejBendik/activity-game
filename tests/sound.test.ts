import { describe, expect, mock, test } from "bun:test";
import { playCue } from "../lib/sound";

function audioContext() {
  const oscillators: {
    frequency: { value: number };
    start: ReturnType<typeof mock>;
    stop: ReturnType<typeof mock>;
    connect: ReturnType<typeof mock>;
    disconnect: ReturnType<typeof mock>;
    onended: null | (() => void);
    type: string;
  }[] = [];
  const gains: {
    gain: {
      setValueAtTime: ReturnType<typeof mock>;
      linearRampToValueAtTime: ReturnType<typeof mock>;
      exponentialRampToValueAtTime: ReturnType<typeof mock>;
    };
    connect: ReturnType<typeof mock>;
    disconnect: ReturnType<typeof mock>;
  }[] = [];
  const ctx = {
    state: "running",
    currentTime: 10,
    destination: {},
    resume: mock(() => Promise.resolve()),
    createOscillator: () => {
      const node = {
        frequency: { value: 0 },
        start: mock(() => {}),
        stop: mock(() => {}),
        connect: mock(() => {}),
        disconnect: mock(() => {}),
        onended: null as null | (() => void),
        type: "",
      };
      oscillators.push(node);
      return node;
    },
    createGain: () => {
      const node = {
        gain: {
          setValueAtTime: mock(() => {}),
          linearRampToValueAtTime: mock(() => {}),
          exponentialRampToValueAtTime: mock(() => {}),
        },
        connect: mock(() => {}),
        disconnect: mock(() => {}),
      };
      gains.push(node);
      return node;
    },
  };
  return { ctx, context: ctx as unknown as AudioContext, oscillators, gains };
}

describe("game sound cues", () => {
  test("everyone cue plays three ascending bell notes in under one second", async () => {
    const { context, ctx, oscillators, gains } = audioContext();
    await playCue(context, true, "everyone");
    expect(ctx.resume).toHaveBeenCalledTimes(1);
    expect(oscillators).toHaveLength(6);
    expect(
      oscillators.filter((_, i) => i % 2 === 0).map((n) => n.frequency.value),
    ).toEqual([880, 1108.73, 1318.51]);
    expect(oscillators[0].start).toHaveBeenCalledWith(10);
    expect(oscillators[4].start).toHaveBeenCalledWith(10.28);
    expect(oscillators[4].stop).toHaveBeenCalledWith(10.83);
    oscillators[0].onended?.();
    expect(oscillators[0].disconnect).toHaveBeenCalledTimes(1);
    expect(gains[0].disconnect).toHaveBeenCalledTimes(1);
  });
  test("time-up cue stays distinct from the everyone cue", async () => {
    const { context, oscillators } = audioContext();
    await playCue(context, true, "timeUp");
    expect(oscillators.map((n) => n.frequency.value)).toEqual([740, 740, 520]);
  });
  test("muted, absent and closed audio play nothing", async () => {
    const { context, ctx, oscillators } = audioContext();
    await playCue(context, false, "everyone");
    await playCue(null, true, "everyone");
    ctx.state = "closed";
    await playCue(context, true, "everyone");
    expect(ctx.resume).not.toHaveBeenCalled();
    expect(oscillators).toHaveLength(0);
  });
  test("browser audio refusal does not throw or schedule notes", async () => {
    const { context, ctx, oscillators } = audioContext();
    ctx.resume.mockImplementation(() =>
      Promise.reject(new Error("Audio unavailable")),
    );
    await expect(playCue(context, true, "everyone")).resolves.toBeUndefined();
    expect(oscillators).toHaveLength(0);
  });
});
