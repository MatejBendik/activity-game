import { describe, expect, mock, test } from "bun:test";
import { countdownSecond, playCue } from "../lib/sound";

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
    const peaks = gains.map(
      (node) => node.gain.linearRampToValueAtTime.mock.calls[0][0],
    );
    expect(peaks).toEqual([0.2, 0.05, 0.2, 0.05, 0.2, 0.05]);
    // Conservative overlap bound: no clipping even if every note reached peak together.
    expect(peaks.reduce((sum, peak) => sum + peak, 0)).toBeLessThan(1);
    const decay = gains[0].gain.exponentialRampToValueAtTime.mock.calls[0];
    expect(decay[0]).toBe(0.002);
    expect(decay[1]).toBeCloseTo(10.54, 8);
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
    const { context, oscillators, gains } = audioContext();
    await playCue(context, true, "timeUp");
    expect(gains[0].gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      0.2,
      10.01,
    );
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

describe("final five seconds", () => {
  test("one tick for each displayed second, no duplicates or late ticks", () => {
    const deadline = 10000;
    let previous = 6;
    const ticks: number[] = [];
    for (let now = 0; now <= 11000; now += 100) {
      const second = countdownSecond(deadline, now, previous);
      if (second !== null) {
        ticks.push(second);
        previous = second;
      }
    }
    expect(ticks).toEqual([5, 4, 3, 2, 1]);
    expect(countdownSecond(deadline, 4999, 6)).toBeNull();
    expect(countdownSecond(deadline, 10000, 6)).toBeNull();
  });
  test("a delayed timer emits only the current second", () => {
    expect(countdownSecond(10000, 8300, 6)).toBe(2);
    expect(countdownSecond(10000, 8500, 2)).toBeNull();
    expect(countdownSecond(10000, 6000, 2)).toBeNull();
  });
  test("countdown is a short rising tick, distinct from time-up", async () => {
    const { context, oscillators, gains } = audioContext();
    await playCue(context, true, "countdown", 5);
    await playCue(context, true, "countdown", 1);
    expect(oscillators.map((n) => n.frequency.value)).toEqual([880, 1320]);
    for (const node of gains)
      expect(node.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.2,
        10.01,
      );
    expect(oscillators[0].stop).toHaveBeenCalledWith(10.1);
  });
  test("muting also suppresses countdown ticks", async () => {
    const { context, oscillators } = audioContext();
    await playCue(context, false, "countdown", 1);
    expect(oscillators).toHaveLength(0);
  });
});
