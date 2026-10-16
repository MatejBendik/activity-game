"use client";

import { useEffect, useRef, useState } from "react";
import { countdownSecond, playCue } from "@/lib/sound";
import {
  COLORS,
  createGame,
  deserialize,
  serialize,
  STORAGE_KEY,
  transition,
  winners,
  type Action,
  type Game,
} from "@/lib/game";
import { activityInfo } from "@/lib/words";

import { AppHeader } from "./app-header";
import { AppDialogs } from "./app-dialogs";
import { HomeScreen } from "./screens/home-screen";
import { SetupScreen } from "./screens/setup-screen";
import { GameScreen } from "./game/game-screen";
import { defaults, type Draft } from "@/lib/setup";
const draftKey = "aktivity.setup.v1";
const backupKey = `${STORAGE_KEY}.backup`;

export default function ActivityGame() {
  const [ready, setReady] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const gameRef = useRef<Game | null>(null);
  const [view, setView] = useState<"home" | "setup" | "game">("home");
  const [draft, setDraft] = useState<Draft>(defaults);
  const [modal, setModal] = useState<"rules" | "menu" | "replace" | null>(null);
  const [storageError, setStorageError] = useState("");
  const [now, setNow] = useState(0);
  const [formError, setFormError] = useState("");
  const audio = useRef<AudioContext | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const persist = (next: Game) => {
    try {
      const raw = serialize(next);
      localStorage.setItem(STORAGE_KEY, raw);
      localStorage.setItem(backupKey, raw);
      setStorageError("");
    } catch {
      setStorageError(
        "Prehliadač nedovolil uložiť hru. Pred obnovením stránky povoľ lokálne úložisko.",
      );
    }
  };
  const prepareAudio = () => {
    try {
      if (
        (!audio.current || audio.current.state === "closed") &&
        typeof AudioContext !== "undefined"
      )
        audio.current = new AudioContext();
      void audio.current?.resume().catch(() => {});
    } catch {
      // Audio availability never blocks a game action.
    }
    return audio.current;
  };
  const apply = (next: Game) => {
    // New-round actions run in a user gesture, so mobile browsers can unlock audio.
    const announceEveryone =
      next.phase === "choose" &&
      next.turn.open &&
      next.turn !== gameRef.current?.turn;
    persist(next);
    gameRef.current = next;
    setGame(next);
    if (announceEveryone && next.settings.sound)
      void playCue(prepareAudio(), true, "everyone");
  };
  const dispatch = (action: Action) => {
    const current = gameRef.current;
    if (current) {
      const next = transition(current, action);
      if (next !== current) apply(next);
    }
  };
  const beep = () => {
    void playCue(
      audio.current,
      gameRef.current?.settings.sound ?? false,
      "timeUp",
    );
  };
  useEffect(() => {
    let cancelled = false;
    const initialize = () => {
      if (cancelled) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        let saved = deserialize(raw);
        if (!saved) saved = deserialize(localStorage.getItem(backupKey));
        if (saved) {
          saved = transition(saved, { type: "expire", now: Date.now() });
          gameRef.current = saved;
          setGame(saved);
          setView("game");
          localStorage.setItem(STORAGE_KEY, serialize(saved));
          localStorage.setItem(backupKey, serialize(saved));
        } else if (raw)
          setStorageError(
            "Uloženú partiu sa nepodarilo načítať. Môžeš začať novú hru.",
          );
        const setup = JSON.parse(
          localStorage.getItem(draftKey) ?? "null",
        ) as Draft | null;
        if (
          setup &&
          setup.teams?.length >= 2 &&
          setup.teams.length <= 6 &&
          setup.teams.every(
            (t) => typeof t.name === "string" && COLORS.includes(t.color),
          ) &&
          [30, 60, 90, 120].includes(setup.settings?.seconds) &&
          [30, 40, 50, 60].includes(setup.settings.target) &&
          typeof setup.settings.openRounds === "boolean" &&
          typeof setup.settings.sound === "boolean" &&
          ["custom", "versus"].includes(setup.preset)
        )
          setDraft(setup);
      } catch {
        setStorageError(
          "Lokálne úložisko je nedostupné alebo poškodené. Ukladanie môže byť obmedzené.",
        );
      }
      setNow(Date.now());
      setReady(true);
    };
    queueMicrotask(initialize);
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        const updated = deserialize(event.newValue);
        if (updated) {
          const next = transition(updated, { type: "expire", now: Date.now() });
          gameRef.current = next;
          setGame(next);
          setView("game");
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(draftKey, JSON.stringify(draft));
      } catch {
        queueMicrotask(() =>
          setStorageError("Nastavenia sa nepodarilo uložiť do prehliadača."),
        );
      }
    }
  }, [draft, ready]);
  useEffect(() => {
    if (game?.phase !== "playing") return;
    let lastCountdownSecond = 6;
    const tick = () => {
      const timestamp = Date.now();
      setNow(timestamp);
      const current = gameRef.current;
      if (
        current?.phase === "playing" &&
        timestamp >= (current.turn.deadline ?? Infinity)
      ) {
        const next = transition(current, { type: "expire", now: timestamp });
        beep();
        persist(next);
        gameRef.current = next;
        setGame(next);
      } else if (current?.phase === "playing" && current.turn.deadline) {
        const second = countdownSecond(
          current.turn.deadline,
          timestamp,
          lastCountdownSecond,
        );
        if (second !== null) {
          lastCountdownSecond = second;
          if (document.visibilityState === "visible")
            void playCue(
              audio.current,
              current.settings.sound,
              "countdown",
              second,
            );
        }
      }
    };
    const id = window.setInterval(tick, 100);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("pageshow", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("pageshow", tick);
    };
    // The active deadline is immutable. Read current sound and game state from refs.
  }, [game?.phase, game?.turn.deadline]);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [view, game?.phase, game?.turnNumber]);
  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );

  const startNew = () => {
    setModal(null);
    setView("setup");
  };
  const newButton = () => {
    if (game && game.phase !== "finished") setModal("replace");
    else startNew();
  };
  const startGame = () => {
    const teams = draft.teams.map((t) => ({ ...t, name: t.name.trim() }));
    if (teams.some((t) => !t.name))
      return setFormError("Doplň názov každého tímu.");
    if (
      new Set(teams.map((t) => t.name.toLocaleLowerCase("sk"))).size !==
      teams.length
    )
      return setFormError("Každý tím potrebuje iný názov.");
    setFormError("");
    apply(createGame(teams, draft.settings));
    setView("game");
  };
  const startTimer = (time: number) => {
    const current = gameRef.current;
    if (current?.phase !== "reveal") return;
    if (current.settings.sound) prepareAudio();
    setNow(time);
    dispatch({ type: "start", now: time });
  };
  const setPreset = (preset: Draft["preset"]) =>
    setDraft((d) => ({
      ...d,
      preset,
      teams:
        preset === "versus"
          ? [
              { name: "Muži", color: COLORS[0] },
              { name: "Ženy", color: COLORS[3] },
            ]
          : defaults.teams,
    }));
  const team = game?.teams[game.teamIndex];
  const info = game ? activityInfo[game.turn.activity] : null;
  const last = game?.history.at(-1);
  const remaining = Math.max(0, (game?.turn.deadline ?? now) - now);
  const allWinners = game ? winners(game) : [];
  const turnLabel = game
    ? `Ťah ${game.turnNumber} · ${Math.floor((game.turnNumber - 1) / game.teams.length) + 1}. kolo`
    : "";

  return (
    <div className="app-shell">
      <AppHeader game={game} setView={setView} setModal={setModal} />
      {storageError && (
        <div className="storage-warning" role="alert">
          {storageError}
        </div>
      )}
      {!ready ? (
        <main className="loading">
          <span className="loading-dot" />
          Pripravujeme hru…
        </main>
      ) : (
        <>
          {view === "home" && (
            <HomeScreen
              game={game}
              setView={setView}
              setModal={setModal}
              newButton={newButton}
              headingRef={headingRef}
            />
          )}
          {view === "setup" && (
            <SetupScreen
              game={game}
              setView={setView}
              draft={draft}
              setDraft={setDraft}
              setPreset={setPreset}
              formError={formError}
              startGame={startGame}
              headingRef={headingRef}
            />
          )}
          {view === "game" && game && team && info && (
            <GameScreen
              game={game}
              team={team}
              info={info}
              last={last}
              allWinners={allWinners}
              remaining={remaining}
              dispatch={dispatch}
              startTimer={startTimer}
              startNew={startNew}
              apply={apply}
              headingRef={headingRef}
              turnLabel={turnLabel}
              setModal={setModal}
            />
          )}
        </>
      )}
      <AppDialogs
        game={game}
        modal={modal}
        setModal={setModal}
        setView={setView}
        dispatch={dispatch}
        startNew={startNew}
        turnLabel={turnLabel}
      />
    </div>
  );
}
