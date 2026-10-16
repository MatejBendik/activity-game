import {
  activities,
  normalize,
  words,
  type Activity,
  type Points,
  type Word,
} from "./words";
export const STORAGE_KEY = "aktivity.game.v1";
export const COLORS = [
  "#8154c9",
  "#e88744",
  "#31866e",
  "#d95779",
  "#4088b6",
  "#b18b23",
];
export type Team = { id: string; name: string; color: string; score: number };
export type Settings = {
  seconds: number;
  target: number;
  openRounds: boolean;
  sound: boolean;
};
export type Phase =
  | "choose"
  | "handoff"
  | "reveal"
  | "playing"
  | "selectWinner"
  | "result"
  | "finished";
export type Turn = {
  activity: Activity;
  open: boolean;
  word?: Word;
  deadline?: number;
  hidden: boolean;
  successAt?: number;
  expired?: boolean;
};
export type Result = {
  teamId: string;
  winnerId: string | null;
  word: Word;
  open: boolean;
  awards: Record<string, number>;
  expired: boolean;
};
export type Game = {
  version: 1;
  teams: Team[];
  settings: Settings;
  teamIndex: number;
  turnNumber: number;
  phase: Phase;
  turn: Turn;
  bag: Activity[];
  used: string[];
  history: Result[];
};
export type Action =
  | { type: "choose"; points: Points }
  | { type: "reveal" }
  | { type: "start"; now: number }
  | { type: "hide" }
  | { type: "answer"; correct: boolean; now: number }
  | { type: "winner"; teamId: string }
  | { type: "expire"; now: number }
  | { type: "next" }
  | { type: "undo" }
  | { type: "sound"; value: boolean };
export function shuffle<T>(items: T[], random = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function drawActivity(
  bag: Activity[],
  previous?: Activity,
  random = Math.random,
) {
  let next = [...bag];
  if (!next.length) {
    next = shuffle([...activities], random);
    if (next[0] === previous) [next[0], next[1]] = [next[1], next[0]];
  }
  return { activity: next[0], bag: next.slice(1) };
}
export function createGame(
  teams: Pick<Team, "name" | "color">[],
  settings: Settings,
  random = Math.random,
): Game {
  const draw = drawActivity([], undefined, random);
  return {
    version: 1,
    teams: teams.map((t, i) => ({ ...t, id: `team-${i}`, score: 0 })),
    settings,
    teamIndex: 0,
    turnNumber: 1,
    phase: "choose",
    turn: {
      activity: draw.activity,
      open: settings.openRounds && random() < 0.2,
      hidden: false,
    },
    bag: draw.bag,
    used: [],
    history: [],
  };
}
export function winners(game: Game) {
  const max = Math.max(...game.teams.map((t) => t.score));
  return max >= game.settings.target
    ? game.teams.filter((t) => t.score === max)
    : [];
}
function resolve(game: Game, winnerId: string | null, expired = false): Game {
  const word = game.turn.word;
  if (!word) return game;
  const awards: Record<string, number> = {};
  if (winnerId) {
    awards[winnerId] = word.points;
    if (game.turn.open && winnerId !== game.teams[game.teamIndex].id)
      awards[game.teams[game.teamIndex].id] = 2;
  }
  const result: Result = {
    teamId: game.teams[game.teamIndex].id,
    winnerId,
    word,
    open: game.turn.open,
    awards,
    expired,
  };
  return {
    ...game,
    phase: "result",
    teams: game.teams.map((t) => ({
      ...t,
      score: t.score + (awards[t.id] ?? 0),
    })),
    history: [...game.history, result],
    turn: { ...game.turn, expired },
  };
}
export function transition(
  game: Game,
  action: Action,
  random = Math.random,
): Game {
  switch (action.type) {
    case "choose": {
      if (game.phase !== "choose") return game;
      const pool = words.filter(
        (w) =>
          w.activity === game.turn.activity &&
          w.points === action.points &&
          !game.used.includes(normalize(w.text)),
      );
      if (!pool.length) return game;
      const word = pool[Math.floor(random() * pool.length)];
      return {
        ...game,
        phase: "handoff",
        turn: { ...game.turn, word },
        used: [...game.used, normalize(word.text)],
      };
    }
    case "reveal":
      return game.phase === "handoff" ? { ...game, phase: "reveal" } : game;
    case "start":
      return game.phase === "reveal"
        ? {
            ...game,
            phase: "playing",
            turn: {
              ...game.turn,
              deadline: action.now + game.settings.seconds * 1000,
              hidden: true,
            },
          }
        : game;
    case "hide":
      return game.phase === "playing"
        ? { ...game, turn: { ...game.turn, hidden: !game.turn.hidden } }
        : game;
    case "answer": {
      if (game.phase !== "playing" || !game.turn.deadline) return game;
      if (action.now >= game.turn.deadline) return resolve(game, null, true);
      if (!action.correct) return resolve(game, null);
      if (game.turn.open)
        return {
          ...game,
          phase: "selectWinner",
          turn: { ...game.turn, successAt: action.now },
        };
      return resolve(game, game.teams[game.teamIndex].id);
    }
    case "winner":
      return game.phase === "selectWinner" &&
        game.teams.some((t) => t.id === action.teamId) &&
        game.turn.successAt !== undefined &&
        game.turn.successAt < (game.turn.deadline ?? 0)
        ? resolve(game, action.teamId)
        : game;
    case "expire":
      return game.phase === "playing" &&
        action.now >= (game.turn.deadline ?? Infinity)
        ? resolve(game, null, true)
        : game;
    case "next": {
      if (game.phase !== "result") return game;
      if (winners(game).length) return { ...game, phase: "finished" };
      const draw = drawActivity(game.bag, game.turn.activity, random);
      return {
        ...game,
        phase: "choose",
        teamIndex: (game.teamIndex + 1) % game.teams.length,
        turnNumber: game.turnNumber + 1,
        bag: draw.bag,
        turn: {
          activity: draw.activity,
          open: game.settings.openRounds && !game.turn.open && random() < 0.2,
          hidden: false,
        },
      };
    }
    // A correction is only available immediately after a successful answer recorded in time.
    case "undo": {
      const last = game.history.at(-1);
      if (game.phase !== "result" || !last?.winnerId || game.turn.expired)
        return game;
      return {
        ...game,
        teams: game.teams.map((t) => ({
          ...t,
          score: t.score - (last.awards[t.id] ?? 0),
        })),
        history: game.history
          .slice(0, -1)
          .concat({ ...last, winnerId: null, awards: {} }),
      };
    }
    case "sound":
      return { ...game, settings: { ...game.settings, sound: action.value } };
  }
}
export function availablePoints(game: Game) {
  return ([3, 4, 5] as Points[]).filter((p) =>
    words.some(
      (w) =>
        w.activity === game.turn.activity &&
        w.points === p &&
        !game.used.includes(normalize(w.text)),
    ),
  );
}
export function serialize(game: Game) {
  return JSON.stringify(game);
}
// A saved turn owns its prompt snapshot: editing the live pool must not erase a game.
function isWordSnapshot(value: unknown): value is Word {
  if (!value || typeof value !== "object") return false;
  const word = value as Partial<Word>;
  return (
    typeof word.id === "string" &&
    typeof word.text === "string" &&
    word.text.trim().length > 0 &&
    word.text.length <= 200 &&
    activities.includes(word.activity as Activity) &&
    [3, 4, 5].includes(word.points ?? 0) &&
    new RegExp(`^${word.activity}-${word.points}-[1-9]\\d*$`).test(word.id)
  );
}
export function deserialize(raw: string | null): Game | null {
  if (!raw) return null;
  try {
    const g = JSON.parse(raw) as Game;
    if (
      g.version !== 1 ||
      !Array.isArray(g.teams) ||
      g.teams.length < 2 ||
      g.teams.length > 6 ||
      !g.teams.every(
        (t) =>
          typeof t.id === "string" &&
          typeof t.name === "string" &&
          COLORS.includes(t.color) &&
          Number.isInteger(t.score) &&
          t.score >= 0,
      ) ||
      new Set(g.teams.map((t) => t.id)).size !== g.teams.length
    )
      return null;
    if (
      !g.settings ||
      ![30, 60, 90, 120].includes(g.settings.seconds) ||
      ![30, 40, 50, 60].includes(g.settings.target) ||
      typeof g.settings.openRounds !== "boolean" ||
      typeof g.settings.sound !== "boolean"
    )
      return null;
    if (
      !Number.isInteger(g.teamIndex) ||
      !g.teams[g.teamIndex] ||
      !Number.isInteger(g.turnNumber) ||
      g.turnNumber < 1 ||
      ![
        "choose",
        "handoff",
        "reveal",
        "playing",
        "selectWinner",
        "result",
        "finished",
      ].includes(g.phase)
    )
      return null;
    if (
      !g.turn ||
      !activities.includes(g.turn.activity) ||
      typeof g.turn.hidden !== "boolean" ||
      typeof g.turn.open !== "boolean" ||
      !Array.isArray(g.bag) ||
      !g.bag.every((a) => activities.includes(a)) ||
      !Array.isArray(g.used) ||
      !g.used.every((w) => typeof w === "string") ||
      !Array.isArray(g.history)
    )
      return null;
    if (
      g.phase !== "choose" &&
      (!isWordSnapshot(g.turn.word) || g.turn.word.activity !== g.turn.activity)
    )
      return null;
    if (
      ["playing", "selectWinner"].includes(g.phase) &&
      (!Number.isFinite(g.turn.deadline) || (g.turn.deadline ?? 0) <= 0)
    )
      return null;
    if (
      g.phase === "selectWinner" &&
      (!Number.isFinite(g.turn.successAt) ||
        g.turn.successAt! >= g.turn.deadline!)
    )
      return null;
    if (["result", "finished"].includes(g.phase) && !g.history.length)
      return null;
    if (
      !g.history.every(
        (r) =>
          r &&
          g.teams.some((t) => t.id === r.teamId) &&
          (r.winnerId === null || g.teams.some((t) => t.id === r.winnerId)) &&
          isWordSnapshot(r.word) &&
          typeof r.open === "boolean" &&
          typeof r.expired === "boolean" &&
          r.awards &&
          Object.entries(r.awards).every(
            ([id, p]) =>
              g.teams.some((t) => t.id === id) &&
              Number.isInteger(p) &&
              p >= 0 &&
              p <= 5,
          ),
      )
    )
      return null;
    return g;
  } catch {
    return null;
  }
}
