import { describe, expect, test } from "bun:test";
import { planActivities } from "../lib/activity-schedule";
import {
  COLORS,
  createGame,
  deserialize,
  serialize,
  transition,
  type Game,
} from "../lib/game";
import { activities, type Activity, type Points } from "../lib/words";

function seeded(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
const settings = { seconds: 60, target: 60, openRounds: false, sound: false };
function newGame(count: number, random = seeded(1)) {
  return createGame(
    COLORS.slice(0, count).map((color, i) => ({
      name: `Team ${i + 1}`,
      color,
    })),
    settings,
    random,
  );
}
function finish(
  game: Game,
  points: Points = 3,
  outcome: "miss" | "correct" | "expire" | "opponent" | "undo" = "miss",
) {
  let next = transition(game, { type: "choose", points }, () => 0);
  expect(next.phase).toBe("handoff");
  next = transition(next, { type: "reveal" });
  next = transition(next, { type: "start", now: 1000 });
  next =
    outcome === "expire"
      ? transition(next, { type: "expire", now: 61000 })
      : transition(next, {
          type: "answer",
          correct: outcome !== "miss",
          now: 2000,
        });
  if (next.phase === "selectWinner")
    next = transition(next, {
      type: "winner",
      teamId:
        next.teams[
          (next.teamIndex + (outcome === "opponent" ? 1 : 0)) %
            next.teams.length
        ].id,
    });
  if (outcome === "undo") next = transition(next, { type: "undo" });
  return next;
}
function assertBlock(
  block: Activity[],
  count: number,
  first: number,
  previous: (Activity | undefined)[],
  global?: Activity,
) {
  const prior = [...previous];
  const assigned = Array.from({ length: count }, () => [] as Activity[]);
  expect(block).toHaveLength(3 * count);
  for (const [i, activity] of block.entries()) {
    const team = (first + i) % count;
    expect(activity).not.toBe(global);
    expect(activity).not.toBe(prior[team]);
    assigned[team].push(activity);
    prior[team] = global = activity;
  }
  for (const perTeam of assigned)
    expect([...perTeam].sort()).toEqual([...activities].sort());
  return prior;
}

describe("per-team activity planning", () => {
  for (let count = 2; count <= 6; count++) {
    test(`${count} teams: many seeded blocks respect fairness and both boundaries`, () => {
      for (let seed = 1; seed <= 20; seed++) {
        const random = seeded(seed);
        let previous: (Activity | undefined)[] = Array(count).fill(undefined);
        let global: Activity | undefined;
        const first = seed % count;
        for (let block = 0; block < 30; block++) {
          const schedule = planActivities(previous, first, global, random);
          const before = [...previous];
          const next = assertBlock(schedule, count, first, previous, global);
          expect(previous).toEqual(before);
          previous = next;
          global = schedule.at(-1);
        }
      }
    });
    test(`${count} teams: every valid prior round and partial first round has a continuation`, () => {
      function rows(row: Activity[]) {
        if (row.length === count) {
          assertBlock(
            planActivities(row, 0, row.at(-1), () => 0.999),
            count,
            0,
            row,
            row.at(-1),
          );
          return;
        }
        for (const a of activities) if (a !== row.at(-1)) rows([...row, a]);
      }
      rows([]);
      for (let played = 1; played < count; played++) {
        const previous = Array.from({ length: count }, (_, i) =>
          i < played ? activities[i % 3] : undefined,
        );
        const global = previous[played - 1];
        assertBlock(
          planActivities(previous, played, global, seeded(played)),
          count,
          played,
          previous,
          global,
        );
      }
    });
    test(`${count} teams: full game transitions and reloads preserve scheduled blocks`, () => {
      const random = seeded(count);
      let game = newGame(count, random);
      const assigned: Activity[] = [];
      const last: (Activity | undefined)[] = Array(count).fill(undefined);
      for (let turn = 0; turn < count * 3 * 6; turn++) {
        expect(game.teamIndex).toBe(turn % count);
        expect(game.turn.activity).not.toBe(assigned.at(-1));
        expect(game.turn.activity).not.toBe(last[game.teamIndex]);
        assigned.push(game.turn.activity);
        last[game.teamIndex] = game.turn.activity;
        const queue = [...game.activityQueue];
        game = finish(game);
        expect(game.activityQueue).toEqual(queue);
        game = deserialize(serialize(game))!;
        expect(game).not.toBeNull();
        const uninterrupted = transition(game, { type: "next" }, () => 0.25);
        const restored = transition(
          deserialize(serialize(game))!,
          { type: "next" },
          () => 0.25,
        );
        expect(restored).toEqual(uninterrupted);
        game = restored;
      }
      for (let start = 0; start < assigned.length; start += count * 3)
        assertBlock(
          assigned.slice(start, start + count * 3),
          count,
          0,
          Array(count).fill(undefined),
        );
    });
  }
  test("backtracks out of the three-team greedy dead end", () => {
    let calls = 0;
    const block = planActivities(
      [undefined, undefined, undefined],
      0,
      undefined,
      () => {
        calls++;
        return 0.999;
      },
    );
    assertBlock(block, 3, 0, [undefined, undefined, undefined]);
    // A successful path needs two shuffle calls per assigned turn; extra calls prove a failed branch was retried.
    expect(calls).toBeGreaterThan(18);
  });
  test("five-team regression: no team is stuck drawing across rounds", () => {
    const game = newGame(5, seeded(55));
    const block = [game.turn.activity, ...game.activityQueue];
    assertBlock(block, 5, 0, Array(5).fill(undefined));
  });
  test("points, results, open rounds and corrections never consume or reroll the queue", () => {
    const base = newGame(5);
    const queue = [...base.activityQueue];
    for (const points of [3, 4, 5] as Points[])
      for (const open of [false, true]) {
        for (const outcome of [
          "miss",
          "correct",
          "expire",
          "opponent",
          "undo",
        ] as const) {
          const result = finish(
            { ...base, turn: { ...base.turn, open } },
            points,
            outcome,
          );
          expect(result.activityQueue).toEqual(queue);
          const next = transition(result, { type: "next" }, () => 0.5);
          expect(next.turn.activity).toBe(queue[0]);
          expect(next.activityQueue).toEqual(queue.slice(1));
          expect(transition(next, { type: "next" })).toBe(next);
        }
      }
  });
  test("invalid saved queues are rejected instead of breaking the rules after reload", () => {
    const game = newGame(5);
    for (const activityQueue of [
      null,
      ["unknown"],
      Array(15).fill("opis"),
      [game.turn.activity],
      ["opis", "opis"],
    ])
      expect(
        deserialize(JSON.stringify({ ...game, activityQueue })),
      ).toBeNull();
    expect(
      deserialize(JSON.stringify({ ...game, activityQueue: [] })),
    ).not.toBeNull();
  });
});
