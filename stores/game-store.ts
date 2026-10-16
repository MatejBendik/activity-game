import { createStore } from "zustand/vanilla";
import { persist } from "zustand/middleware";
import { createGame, transition, type Action, type Game } from "../lib/game";
import { defaults, draftSchema, setupSchema, type Draft } from "../lib/setup";
import {
  gameStorage,
  STORE_KEY,
  type PersistedGame,
  type SyncStorage,
} from "./persistence";

export type View = "home" | "setup" | "game";
export type ModalName = "rules" | "menu" | "replace" | null;
export type AppState = PersistedGame & {
  ready: boolean;
  view: View;
  modal: ModalName;
  storageError: string;
  setView: (view: View) => void;
  setModal: (modal: ModalName) => void;
  requestNewGame: () => void;
  openSetup: () => void;
  saveDraft: (draft: Draft) => void;
  startGame: (draft: Draft) => boolean;
  replay: () => void;
  dispatch: (action: Action) => void;
  completeHydration: () => void;
  receiveGame: (game: Game | null, draft: Draft) => void;
};
export function createGameStore(
  options: {
    storage?: SyncStorage;
    now?: () => number;
    random?: () => number;
  } = {},
) {
  const now = options.now ?? Date.now;
  const random = options.random ?? Math.random;
  let reportError: (message: string) => void = () => {};
  const adapter = gameStorage(
    () => options.storage ?? window.localStorage,
    (message) => reportError(message),
  );
  let canWrite = () => false;
  const storage = {
    ...adapter,
    setItem: (...args: Parameters<typeof adapter.setItem>) => {
      if (canWrite()) return adapter.setItem(...args);
    },
  };
  const store = createStore<AppState>()(
    persist(
      (set, get) => ({
        game: null,
        draft: structuredClone(defaults),
        ready: false,
        view: "home",
        modal: null,
        storageError: "",
        setView: (view) => set({ view }),
        setModal: (modal) => set({ modal }),
        requestNewGame: () =>
          get().game && get().game?.phase !== "finished"
            ? set({ modal: "replace" })
            : get().openSetup(),
        openSetup: () => set({ view: "setup", modal: null }),
        saveDraft: (draft) => {
          const parsed = draftSchema.safeParse(draft);
          if (parsed.success) set({ draft: parsed.data });
        },
        startGame: (draft) => {
          const parsed = setupSchema.safeParse(draft);
          if (!parsed.success) return false;
          set({
            game: createGame(parsed.data.teams, parsed.data.settings, random),
            draft: parsed.data,
            view: "game",
            modal: null,
          });
          return true;
        },
        replay: () => {
          const game = get().game;
          if (game)
            set({
              game: createGame(game.teams, game.settings, random),
              view: "game",
              modal: null,
            });
        },
        dispatch: (action) => {
          const game = get().game;
          if (!game) return;
          const next = transition(game, action, random);
          if (next !== game) set({ game: next });
        },
        completeHydration: () => {
          const game = get().game;
          set({
            game: game
              ? transition(game, { type: "expire", now: now() })
              : null,
            ready: true,
            view: game ? "game" : "home",
          });
        },
        receiveGame: (game, draft) =>
          set({
            game: game
              ? transition(game, { type: "expire", now: now() })
              : null,
            draft,
            view: game ? "game" : "home",
          }),
      }),
      {
        name: STORE_KEY,
        version: 1,
        storage,
        skipHydration: true,
        partialize: ({ game, draft }) => ({ game, draft }),
        // Persisted data passes through the validating storage adapter, including legacy import.
        merge: (saved, current) => ({
          ...current,
          ...(saved as PersistedGame),
        }),
      },
    ),
  );
  canWrite = () => store.getState().ready;
  reportError = (message) => {
    // Reporting a failed persist must not recursively attempt another synchronous write.
    queueMicrotask(() => {
      if (
        !message &&
        store.getState().storageError.includes("nepodarilo načítať")
      )
        return;
      if (store.getState().storageError !== message)
        store.setState({ storageError: message });
    });
  };
  return store;
}
export type GameStore = ReturnType<typeof createGameStore>;
