import { describe, test, expect } from "bun:test";
import {
  availablePoints,
  COLORS,
  createGame,
  deserialize,
  serialize,
  transition,
  winners,
  type Game,
} from "../lib/game";
import { activities, normalize, words, type Points } from "../lib/words";
const settings = { seconds: 60, target: 40, openRounds: false, sound: false };
const teams = [
  { name: "Fialoví", color: COLORS[0] },
  { name: "Oranžoví", color: COLORS[1] },
];
const newGame = () => createGame(teams, settings, () => 0.5);
function playing(game = newGame(), points: Points = 3) {
  let g = transition(game, { type: "choose", points }, () => 0);
  g = transition(g, { type: "reveal" });
  return transition(g, { type: "start", now: 1000 });
}
const correct = (g: Game, now = 2000) =>
  transition(g, { type: "answer", correct: true, now });
describe("original prompt database", () => {
  test("450 prompts, exactly 50 in each activity/difficulty pool", () => {
    expect(words).toHaveLength(450);
    expect(new Set(words.map((w) => w.id)).size).toBe(450);
    for (const activity of activities)
      for (const points of [3, 4, 5]) {
        const pool = words.filter(
          (w) => w.activity === activity && w.points === points,
        );
        expect(pool).toHaveLength(50);
        expect(new Set(pool.map((w) => normalize(w.text))).size).toBe(50);
      }
    expect(
      words.every((w) => w.text.length > 0 && w.text.trim() === w.text),
    ).toBe(true);
  });
  test("each hard pool includes three-to-five-word prompts", () => {
    for (const a of activities)
      expect(
        words.some(
          (w) =>
            w.activity === a &&
            w.points === 5 &&
            w.text.split(" ").length >= 3 &&
            w.text.split(" ").length <= 5,
        ),
      ).toBe(true);
  });
});
describe("simpler drawing and mime prompts", () => {
  for (const activity of ["kreslenie", "pantomima"] as const) {
    test(`${activity}: four points uses at most two words, mostly single words`, () => {
      const pool = words.filter(
        (w) => w.activity === activity && w.points === 4,
      );
      expect(pool.every((w) => w.text.split(/\s+/).length <= 2)).toBe(true);
      expect(
        pool.filter((w) => w.text.split(/\s+/).length === 1).length,
      ).toBeGreaterThan(25);
    });
    test(`${activity}: five points uses at most four words`, () => {
      const pool = words.filter(
        (w) => w.activity === activity && w.points === 5,
      );
      expect(pool.every((w) => w.text.split(/\s+/).length <= 4)).toBe(true);
    });
  }
});
describe("turn state and fairness", () => {
  test("secret handoff, reveal, immutable difficulty, explicit timer start", () => {
    let g = newGame();
    expect(g.turn.word).toBeUndefined();
    g = transition(g, { type: "choose", points: 5 }, () => 0);
    expect(g.phase).toBe("handoff");
    expect(g.turn.deadline).toBeUndefined();
    const same = transition(g, { type: "choose", points: 3 });
    expect(same).toEqual(g);
    g = transition(g, { type: "reveal" });
    expect(g.phase).toBe("reveal");
    expect(g.turn.deadline).toBeUndefined();
    g = transition(g, { type: "start", now: 1234 });
    expect(g.turn.deadline).toBe(61234);
  });
  test("no repeated normalized text, even across activities", () => {
    const g = newGame();
    const prior = words
      .filter((w) => w.activity === g.turn.activity && w.points === 3)
      .slice(0, 49);
    g.used = prior.map((w) => normalize(w.text));
    const chosen = transition(g, { type: "choose", points: 3 }, () => 0);
    expect(g.used).not.toContain(normalize(chosen.turn.word!.text));
    const exhausted = { ...g, used: words.map((w) => normalize(w.text)) };
    expect(availablePoints(exhausted)).toEqual([]);
    expect(transition(exhausted, { type: "choose", points: 3 })).toEqual(
      exhausted,
    );
  });
  test("team order wraps for six teams", () => {
    let g = createGame(
      COLORS.map((color, i) => ({ color, name: `Team ${i}` })),
      settings,
    );
    for (let i = 0; i < 12; i++) {
      expect(g.teamIndex).toBe(i % 6);
      g = playing(g);
      g = transition(g, { type: "answer", correct: false, now: 2000 });
      g = transition(g, { type: "next" });
    }
  });
});
describe("scoring and strict deadline", () => {
  for (const points of [3, 4, 5] as Points[])
    test(`award exactly ${points} points, once`, () => {
      let g = correct(playing(newGame(), points));
      expect(g.teams[0].score).toBe(points);
      expect(g.history).toHaveLength(1);
      g = correct(g);
      expect(g.teams[0].score).toBe(points);
      expect(g.history).toHaveLength(1);
    });
  test("incorrect and expiry award zero, late success is rejected", () => {
    expect(
      transition(playing(), { type: "answer", correct: false, now: 2000 })
        .teams[0].score,
    ).toBe(0);
    for (const time of [61000, 61001, 90000]) {
      const g = correct(playing(), time);
      expect(g.teams[0].score).toBe(0);
      expect(g.turn.expired).toBe(true);
      expect(g.phase).toBe("result");
    }
    expect(correct(playing(), 60999).teams[0].score).toBe(3);
  });
  test("open round: opponent earns value, performer earns 2", () => {
    let g = playing();
    g.turn.open = true;
    g = correct(g);
    expect(g.phase).toBe("selectWinner");
    expect(g.teams[0].score).toBe(0);
    g = transition(g, { type: "winner", teamId: g.teams[1].id });
    expect(g.teams.map((t) => t.score)).toEqual([2, 3]);
    expect(transition(g, { type: "winner", teamId: g.teams[1].id })).toEqual(g);
  });
  test("open round: own team earns value without extra bonus", () => {
    let g = playing();
    g.turn.open = true;
    g = transition(correct(g), { type: "winner", teamId: g.teams[0].id });
    expect(g.teams.map((t) => t.score)).toEqual([3, 0]);
  });
  test("open round selection can finish after deadline only with recorded timely success", () => {
    let g = playing();
    g.turn.open = true;
    g = correct(g, 60999);
    g = transition(g, { type: "expire", now: 99999 });
    expect(g.phase).toBe("selectWinner");
    g = transition(g, { type: "winner", teamId: g.teams[1].id });
    expect(g.teams[1].score).toBe(3);
  });
  test("open rounds never follow each other", () => {
    let g = playing(
      createGame(teams, { ...settings, openRounds: true }, () => 0),
    );
    expect(g.turn.open).toBe(true);
    g = transition(g, { type: "answer", correct: false, now: 2000 });
    g = transition(g, { type: "next" }, () => 0);
    expect(g.turn.open).toBe(false);
    g = transition(playing(g), { type: "answer", correct: false, now: 2000 });
    g = transition(g, { type: "next" }, () => 0);
    expect(g.turn.open).toBe(true);
  });
  test("correction removes all awards, cannot create points after expiry", () => {
    let g = playing();
    g.turn.open = true;
    g = transition(correct(g), { type: "winner", teamId: g.teams[1].id });
    g = transition(g, { type: "undo" });
    expect(g.teams.map((t) => t.score)).toEqual([0, 0]);
    expect(g.history).toHaveLength(1);
    expect(g.history[0].winnerId).toBeNull();
    expect(transition(g, { type: "undo" })).toEqual(g);
    const expired = correct(playing(), 61000);
    expect(transition(expired, { type: "undo" })).toEqual(expired);
  });
  test("winner checks both awards and supports ties", () => {
    let g = playing();
    g.turn.open = true;
    g.teams[0].score = 38;
    g.teams[1].score = 37;
    g = transition(correct(g), { type: "winner", teamId: g.teams[1].id });
    expect(winners(g)).toHaveLength(2);
    expect(transition(g, { type: "next" }).phase).toBe("finished");
    g.teams[1].score++;
    expect(winners(g).map((t) => t.id)).toEqual([g.teams[1].id]);
  });
});
describe("persistence", () => {
  test("all phases survive roundtrip including score, order, prompt and deadline", () => {
    let g = newGame();
    const snapshots: Game[] = [g];
    g = transition(g, { type: "choose", points: 4 });
    snapshots.push(g);
    g = transition(g, { type: "reveal" });
    snapshots.push(g);
    g = transition(g, { type: "start", now: 1000 });
    snapshots.push(g);
    g = transition(g, { type: "hide" });
    snapshots.push(g);
    g.turn.open = true;
    g = correct(g);
    snapshots.push(g);
    g = transition(g, { type: "winner", teamId: g.teams[1].id });
    snapshots.push(g);
    g = transition(g, { type: "next" });
    snapshots.push(g);
    for (const snapshot of snapshots)
      expect(deserialize(serialize(snapshot))).toEqual(snapshot);
  });
  test("reload never resets the deadline and expires a sleeping tab", () => {
    const g = deserialize(serialize(playing()))!;
    expect(g.turn.deadline).toBe(61000);
    const restored = transition(g, { type: "expire", now: 120000 });
    expect(restored.phase).toBe("result");
    expect(restored.teams[0].score).toBe(0);
  });
  test("invalid saves are rejected without crashing", () => {
    for (const raw of [
      null,
      "",
      "undefined",
      "{",
      "null",
      "{}",
      JSON.stringify({ ...newGame(), version: 3 }),
      JSON.stringify({ ...newGame(), teams: [] }),
      JSON.stringify({ ...newGame(), phase: "playing" }),
    ])
      expect(deserialize(raw)).toBeNull();
  });
});

describe("saved prompt compatibility", () => {
  test("a prompt changed or removed from the pool preserves an active saved turn", () => {
    const g = playing();
    g.turn.word = {
      id: "pantomima-5-50",
      activity: "pantomima",
      points: 5,
      text: "niesť obrovskú neviditeľnú skriňu",
    };
    g.turn.activity = "pantomima";
    g.activityQueue = [];
    expect(deserialize(serialize(g))).toEqual(g);
    expect(deserialize(serialize(g))?.turn.deadline).toBe(61000);
  });
  test("history with retired prompts preserves scores and team order", () => {
    const g = correct(playing());
    g.history[0].word = {
      id: "kreslenie-4-50",
      activity: "kreslenie",
      points: 4,
      text: "trezor v banke",
    };
    g.turn = { ...g.turn, activity: "kreslenie", word: g.history[0].word };
    g.activityQueue = [];
    expect(deserialize(serialize(g))).toEqual(g);
    const next = transition(g, { type: "next" });
    expect(deserialize(serialize(next))).toEqual(next);
  });
  test("invalid saved prompt shapes remain rejected", () => {
    for (const invalid of [
      { text: "" },
      { id: "invalid" },
      { points: 99 },
      { activity: "invalid" },
    ]) {
      const g = playing();
      g.turn.word = { ...g.turn.word!, ...invalid } as NonNullable<
        Game["turn"]["word"]
      >;
      expect(deserialize(serialize(g))).toBeNull();
    }
  });
});

describe("private timer start", () => {
  test("starting every kind of turn hides its prompt automatically", () => {
    for (const open of [true, false]) {
      const base = newGame();
      base.turn.open = open;
      const g = playing(base);
      expect(g.turn.hidden).toBe(true);
      expect(deserialize(serialize(g))?.turn.hidden).toBe(true);
      const visible = transition(g, { type: "hide" });
      expect(visible.turn.hidden).toBe(false);
      expect(visible.turn.deadline).toBe(g.turn.deadline);
      expect(transition(visible, { type: "hide" }).turn.hidden).toBe(true);
    }
  });
});
