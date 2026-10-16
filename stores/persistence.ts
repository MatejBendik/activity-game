import type { PersistStorage, StorageValue } from "zustand/middleware";
import { deserialize, STORAGE_KEY, type Game } from "../lib/game";
import { defaults, draftSchema, type Draft } from "../lib/setup";

export const STORE_KEY = "aktivity.store.v1";
export const LEGACY_DRAFT_KEY = "aktivity.setup.v1";
export type PersistedGame = { game: Game | null; draft: Draft };
export type SyncStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const saveWarning =
  "Prehliadač nedovolil uložiť hru. Pred obnovením stránky povoľ lokálne úložisko.";

export function parsePersisted(
  raw: string | null,
): StorageValue<PersistedGame> | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (value.version !== 1 || !value.state || !("game" in value.state))
      return null;
    const game =
      value.state.game === null
        ? null
        : deserialize(JSON.stringify(value.state.game));
    if (value.state.game !== null && !game) return null;
    const draft = draftSchema.safeParse(value.state.draft);
    return {
      version: 1,
      state: {
        game,
        draft: draft.success ? draft.data : structuredClone(defaults),
      },
    };
  } catch {
    return null;
  }
}

// Keep a synchronous backup and import the pre-Zustand raw game without altering it.
export function gameStorage(
  getStorage: () => SyncStorage,
  report: (message: string) => void,
): PersistStorage<PersistedGame> {
  return {
    getItem(name) {
      try {
        const storage = getStorage();
        const main = storage.getItem(name);
        const backup = storage.getItem(`${name}.backup`);
        const current = parsePersisted(main) ?? parsePersisted(backup);
        if (current) return current;
        // If a newer save exists but is damaged, never silently load stale legacy scores.
        if (main || backup) {
          report("Uloženú partiu sa nepodarilo načítať. Môžeš začať novú hru.");
          return null;
        }
        const legacy = storage.getItem(STORAGE_KEY);
        const legacyBackup = storage.getItem(`${STORAGE_KEY}.backup`);
        const game = deserialize(legacy) ?? deserialize(legacyBackup);
        const draftRaw = storage.getItem(LEGACY_DRAFT_KEY);
        let draft = structuredClone(defaults);
        try {
          const parsed = draftSchema.safeParse(
            draftRaw ? JSON.parse(draftRaw) : null,
          );
          if (parsed.success) draft = parsed.data;
        } catch {
          /* Preserve the game even with a corrupt settings draft. */
        }
        if (!game && (legacy || legacyBackup))
          report("Uloženú partiu sa nepodarilo načítať. Môžeš začať novú hru.");
        return { version: 1, state: { game, draft } };
      } catch {
        report(
          "Lokálne úložisko je nedostupné. Ukladanie hry môže byť obmedzené.",
        );
        return null;
      }
    },
    setItem(name, value) {
      try {
        const storage = getStorage();
        const raw = JSON.stringify(value);
        storage.setItem(name, raw);
        storage.setItem(`${name}.backup`, raw);
        report("");
      } catch {
        report(saveWarning);
      }
    },
    removeItem(name) {
      try {
        const storage = getStorage();
        storage.removeItem(name);
        storage.removeItem(`${name}.backup`);
      } catch {
        report(saveWarning);
      }
    },
  };
}
