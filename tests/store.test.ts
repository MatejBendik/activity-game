import { describe, expect, test } from "bun:test";
import { createGameStore } from "../stores/game-store";
import {
  STORE_KEY,
  LEGACY_DRAFT_KEY,
  parsePersisted,
  type SyncStorage,
} from "../stores/persistence";
import {
  COLORS,
  createGame,
  serialize,
  STORAGE_KEY,
  transition,
} from "../lib/game";
import { defaults, draftSchema, setupSchema } from "../lib/setup";
function memoryStorage() {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
}
async function hydrate(store: ReturnType<typeof createGameStore>) {
  await store.persist.rehydrate();
  store.getState().completeHydration();
}
const settings = { seconds: 60, target: 40, openRounds: false, sound: false };
function activeGame() {
  let g = createGame(defaults.teams, settings, () => 0.5);
  g = transition(g, { type: "choose", points: 5 }, () => 0);
  g = transition(g, { type: "reveal" });
  return transition(g, { type: "start", now: 1000 });
}
describe("Zustand persistence", () => {
  test("SSR defaults do not read or overwrite storage before hydration", async () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, serialize(activeGame()));
    const store = createGameStore({ storage, now: () => 2000 });
    expect(store.getState().game).toBeNull();
    expect(store.getState().ready).toBe(false);
    store.getState().setModal("rules");
    expect(storage.getItem(STORE_KEY)).toBeNull();
    await hydrate(store);
    expect(store.getState().game?.turn.deadline).toBe(61000);
  });
  test("legacy raw game and unfinished setup migrate with scores, order and deadline intact", async () => {
    const storage = memoryStorage();
    const game = activeGame();
    game.teamIndex = 1;
    game.teams[0].score = 12;
    game.used.push("legacy");
    storage.setItem(STORAGE_KEY, serialize(game));
    const draft = structuredClone(defaults);
    draft.teams[0].name = "";
    storage.setItem(LEGACY_DRAFT_KEY, JSON.stringify(draft));
    const store = createGameStore({ storage, now: () => 2000 });
    await hydrate(store);
    expect(store.getState().game).toEqual(game);
    expect(store.getState().draft.teams[0].name).toBe("");
    expect(store.getState().view).toBe("game");
    expect(parsePersisted(storage.getItem(STORE_KEY))?.state.game).toEqual(
      game,
    );
    expect(storage.getItem(`${STORE_KEY}.backup`)).toBe(
      storage.getItem(STORE_KEY),
    );
    expect(storage.getItem(STORAGE_KEY)).toBe(serialize(game));
  });
  test("legacy backup recovers an invalid primary and corrupt draft does not erase game", async () => {
    const storage = memoryStorage();
    const game = activeGame();
    storage.setItem(STORAGE_KEY, "invalid");
    storage.setItem(`${STORAGE_KEY}.backup`, serialize(game));
    storage.setItem(LEGACY_DRAFT_KEY, "{");
    const store = createGameStore({ storage, now: () => 2000 });
    await hydrate(store);
    expect(store.getState().game).toEqual(game);
    expect(store.getState().draft).toEqual(defaults);
  });
  test("Zustand backup restores a corrupt current primary", async () => {
    const storage = memoryStorage();
    const store = createGameStore({
      storage,
      now: () => 2000,
      random: () => 0.5,
    });
    await hydrate(store);
    store.getState().startGame(defaults);
    const game = store.getState().game;
    storage.setItem(STORE_KEY, "{");
    const restored = createGameStore({ storage, now: () => 2000 });
    await hydrate(restored);
    expect(restored.getState().game).toEqual(game);
  });
  test("an overdue persisted turn expires once without extending time or awarding points", async () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, serialize(activeGame()));
    const store = createGameStore({ storage, now: () => 70000 });
    await hydrate(store);
    expect(store.getState().game?.phase).toBe("result");
    expect(store.getState().game?.turn.deadline).toBe(61000);
    expect(store.getState().game?.history).toHaveLength(1);
    expect(store.getState().game?.teams[0].score).toBe(0);
  });
  test("actions persist immediately, restore hidden state and cannot award points twice", async () => {
    const storage = memoryStorage();
    const store = createGameStore({
      storage,
      now: () => 2000,
      random: () => 0.5,
    });
    await hydrate(store);
    store.getState().startGame({ ...defaults, settings });
    store.getState().dispatch({ type: "choose", points: 5 });
    store.getState().dispatch({ type: "reveal" });
    store.getState().dispatch({ type: "start", now: 1000 });
    expect(
      parsePersisted(storage.getItem(STORE_KEY))?.state.game?.turn.hidden,
    ).toBe(true);
    store.getState().dispatch({ type: "answer", correct: true, now: 2000 });
    store.getState().dispatch({ type: "answer", correct: true, now: 2001 });
    expect(store.getState().game?.teams[0].score).toBe(5);
    const restored = createGameStore({ storage, now: () => 3000 });
    await hydrate(restored);
    expect(restored.getState().game).toEqual(store.getState().game);
  });
  test("stores are isolated between requests and drafts never replace an active game", async () => {
    const a = createGameStore({ storage: memoryStorage() });
    const b = createGameStore({ storage: memoryStorage() });
    await hydrate(a);
    await hydrate(b);
    a.getState().startGame(defaults);
    const game = a.getState().game;
    a.getState().openSetup();
    a.getState().saveDraft({ ...defaults, preset: "versus" });
    expect(a.getState().game).toBe(game);
    expect(b.getState().game).toBeNull();
  });
  test("invalid submission cannot replace an existing game", async () => {
    const store = createGameStore({ storage: memoryStorage() });
    await hydrate(store);
    store.getState().startGame(defaults);
    const game = store.getState().game;
    expect(
      store.getState().startGame({
        ...defaults,
        teams: [
          { name: "", color: COLORS[0] },
          { name: "", color: COLORS[1] },
        ],
      }),
    ).toBe(false);
    expect(store.getState().game).toBe(game);
  });
  test("unavailable storage reports failure without recursion or blocking game actions", async () => {
    const storage: SyncStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {},
    };
    const store = createGameStore({ storage });
    await hydrate(store);
    await Promise.resolve();
    expect(store.getState().storageError).not.toBe("");
    expect(store.getState().startGame(defaults)).toBe(true);
    await Promise.resolve();
    expect(store.getState().game?.phase).toBe("choose");
  });
  test("cross-tab game updates preserve deadline and expire overdue turns", async () => {
    const store = createGameStore({
      storage: memoryStorage(),
      now: () => 90000,
    });
    await hydrate(store);
    store.getState().receiveGame(activeGame(), defaults);
    expect(store.getState().game?.phase).toBe("result");
    expect(store.getState().game?.turn.deadline).toBe(61000);
  });
});
describe("setup Zod validation", () => {
  test("normalizes names at submit while allowing unfinished drafts", () => {
    const draft = structuredClone(defaults);
    draft.teams[0].name = "  Muži  ";
    expect(setupSchema.parse(draft).teams[0].name).toBe("Muži");
    draft.teams[0].name = "";
    expect(draftSchema.safeParse(draft).success).toBe(true);
    expect(setupSchema.safeParse(draft).success).toBe(false);
  });
  test("rejects case-insensitive duplicate names and reports field path", () => {
    const draft = structuredClone(defaults);
    draft.teams[0].name = " Ženy ";
    draft.teams[1].name = "ženy";
    const result = setupSchema.safeParse(draft);
    expect(result.success).toBe(false);
    if (!result.success)
      expect(
        result.error.issues.some((i) => i.path.join(".") === "teams.1.name"),
      ).toBe(true);
  });
  test("validates team count, name length, colors and all settings", () => {
    for (const patch of [
      { teams: defaults.teams.slice(0, 1) },
      { teams: Array.from({ length: 7 }, () => defaults.teams[0]) },
      {
        teams: [{ name: "a".repeat(25), color: COLORS[0] }, defaults.teams[1]],
      },
      { teams: [{ name: "a", color: "red" }, defaults.teams[1]] },
      { settings: { ...settings, seconds: 15 } },
      { settings: { ...settings, target: 1 } },
    ])
      expect(setupSchema.safeParse({ ...defaults, ...patch }).success).toBe(
        false,
      );
  });
});
