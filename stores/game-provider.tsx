"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useStore } from "zustand";
import { createGameStore, type AppState, type GameStore } from "./game-store";
import { STORE_KEY, parsePersisted } from "./persistence";

const GameContext = createContext<GameStore | null>(null);
export function GameProvider({ children }: { children: ReactNode }) {
  // A provider-local store avoids sharing state across Next.js SSR requests.
  const [store] = useState(() => createGameStore());
  useEffect(() => {
    let cancelled = false;
    void Promise.resolve(store.persist.rehydrate()).then(() => {
      if (!cancelled) store.getState().completeHydration();
    });
    const receive = (event: StorageEvent) => {
      if (event.key !== STORE_KEY) return;
      const saved = parsePersisted(event.newValue);
      if (saved)
        store.getState().receiveGame(saved.state.game, saved.state.draft);
    };
    window.addEventListener("storage", receive);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", receive);
    };
  }, [store]);
  return <GameContext.Provider value={store}>{children}</GameContext.Provider>;
}
export function useGameStoreApi() {
  const store = useContext(GameContext);
  if (!store) throw new Error("GameProvider is required");
  return store;
}
export function useGameStore<T>(selector: (state: AppState) => T) {
  return useStore(useGameStoreApi(), selector);
}
