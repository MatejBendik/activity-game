"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Eye,
  EyeOff,
  Home,
  Menu,
  MessageCircle,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { countdownSecond, playCue } from "@/lib/sound";
import { Illustration } from "./illustration";
import { Modal, Rules, TeamScores } from "./game-ui";
import {
  availablePoints,
  COLORS,
  createGame,
  deserialize,
  serialize,
  STORAGE_KEY,
  transition,
  winners,
  type Action,
  type Game,
  type Settings,
} from "@/lib/game";
import { activities, activityInfo, type Points } from "@/lib/words";

type Draft = {
  teams: { name: string; color: string }[];
  settings: Settings;
  preset: "custom" | "versus";
};
const defaults: Draft = {
  teams: [
    { name: "Fialoví", color: COLORS[0] },
    { name: "Oranžoví", color: COLORS[1] },
  ],
  settings: { seconds: 60, target: 40, openRounds: true, sound: true },
  preset: "custom",
};
const activityIcons = {
  opis: MessageCircle,
  kreslenie: Pencil,
  pantomima: Sparkles,
};
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
  const phase = game?.phase;
  const info = game ? activityInfo[game.turn.activity] : null;
  const last = game?.history.at(-1);
  const remaining = Math.max(0, (game?.turn.deadline ?? now) - now);
  const allWinners = game ? winners(game) : [];
  const turnLabel = game
    ? `Ťah ${game.turnNumber} · ${Math.floor((game.turnNumber - 1) / game.teams.length) + 1}. kolo`
    : "";

  return (
    <div className="app-shell">
      <header className="app-header">
        <button
          className="brand"
          onClick={() => setView("home")}
          aria-label="Aktivity — úvod"
        >
          <span className="brand-mark">
            a<span>✦</span>
          </span>
          <span>
            aktivity<span className="brand-period">.</span>
          </span>
        </button>
        <div className="header-actions">
          <span className="edition">
            SLOVENSKÁ PÁRTY HRA <span>18+</span>
          </span>
          <button
            className="icon-button"
            aria-label="Pravidlá hry"
            onClick={() => setModal("rules")}
          >
            <CircleHelp size={22} />
          </button>
          {game && (
            <button
              className="icon-button"
              aria-label="Menu hry"
              onClick={() => setModal("menu")}
            >
              <Menu size={23} />
            </button>
          )}
        </div>
      </header>
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
            <main className="home-view enter">
              <div className="eyebrow">
                <span /> Jeden mobil. Celá partia.
              </div>
              <h1 className="hero-title" ref={headingRef} tabIndex={-1}>
                Malá hra.
                <br />
                <span>Veľké zážitky.</span>
                <svg viewBox="0 0 350 15" aria-hidden="true">
                  <path d="M5 9Q150-3 344 7" />
                </svg>
              </h1>
              <p className="hero-description">
                Opisuj, kresli, predvádzaj.
                <br className="mobile-break" /> A hlavne sa spolu dobre bavte.
              </p>
              <Illustration activity="party" className="hero-art" />
              <div className="home-cta">
                {game && game.phase !== "finished" && (
                  <button
                    className="button primary"
                    onClick={() => setView("game")}
                  >
                    <Play size={20} fill="currentColor" />
                    Pokračovať v hre
                    <ArrowRight size={21} />
                  </button>
                )}
                <button
                  className={`button ${game && game.phase !== "finished" ? "secondary" : "primary"}`}
                  onClick={newButton}
                >
                  {game && game.phase !== "finished"
                    ? "Nová hra"
                    : "Poďme sa hrať"}
                  <ArrowRight size={21} />
                </button>
              </div>
              <div className="home-facts">
                <span>
                  <Users size={17} />
                  2–6 tímov
                </span>
                <span>
                  <Clock3 size={17} />
                  Vlastné tempo
                </span>
                <span>
                  <ShieldCheck size={17} />
                  Bez registrácie
                </span>
              </div>
              <div className="activity-preview">
                {activities.map((a) => {
                  const Icon = activityIcons[a];
                  return (
                    <span key={a} style={{ color: activityInfo[a].color }}>
                      <Icon size={19} />
                      {activityInfo[a].short}
                    </span>
                  );
                })}
              </div>
              <button
                className="text-button how-to"
                onClick={() => setModal("rules")}
              >
                Ako sa to hrá?
                <ChevronRight size={16} />
              </button>
            </main>
          )}

          {view === "setup" && (
            <main className="setup-view enter">
              <button
                className="text-button back-button"
                onClick={() => setView(game ? "game" : "home")}
              >
                <ArrowLeft size={18} />
                Späť
              </button>
              <div className="section-heading">
                <span className="eyebrow">NAJPRV SI TO NASTAVME</span>
                <h1 ref={headingRef} tabIndex={-1}>
                  Kto je v hre?
                </h1>
                <p>Zavolaj partiu. O zvyšok sa postaráme.</p>
              </div>
              <div className="segmented preset">
                <button
                  aria-pressed={draft.preset === "custom"}
                  className={draft.preset === "custom" ? "selected" : ""}
                  onClick={() => setPreset("custom")}
                >
                  <Users size={18} />
                  Vlastné tímy
                </button>
                <button
                  aria-pressed={draft.preset === "versus"}
                  className={draft.preset === "versus" ? "selected" : ""}
                  onClick={() => setPreset("versus")}
                >
                  Muži proti ženám
                </button>
              </div>
              <section className="setup-section">
                <div className="flex justify-between items-center mb-3">
                  <h2>Vaše tímy</h2>
                  <span className="muted text-sm">
                    {draft.teams.length} / 6
                  </span>
                </div>
                <div className="space-y-3">
                  {draft.teams.map((t, i) => (
                    <div className="team-editor" key={i}>
                      <div className="team-editor-main">
                        <span
                          className="team-number"
                          style={{ background: t.color }}
                        >
                          {i + 1}
                        </span>
                        <label className="sr-only" htmlFor={`team-${i}`}>
                          Názov tímu {i + 1}
                        </label>
                        <input
                          id={`team-${i}`}
                          maxLength={24}
                          value={t.name}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              teams: d.teams.map((v, j) =>
                                j === i ? { ...v, name: e.target.value } : v,
                              ),
                            }))
                          }
                          placeholder={`Tím ${i + 1}`}
                          autoComplete="off"
                        />
                        {draft.teams.length > 2 && (
                          <button
                            aria-label={`Odstrániť tím ${i + 1}`}
                            className="icon-button"
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                teams: d.teams.filter((_, j) => i !== j),
                              }))
                            }
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                      <div
                        className="color-picker"
                        aria-label={`Farba tímu ${i + 1}`}
                      >
                        {COLORS.map((c, ci) => (
                          <button
                            key={c}
                            aria-label={`Farba ${["fialová", "oranžová", "zelená", "ružová", "modrá", "žltá"][ci]}`}
                            aria-pressed={c === t.color}
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                teams: d.teams.map((v, j) =>
                                  i === j ? { ...v, color: c } : v,
                                ),
                              }))
                            }
                          >
                            <span style={{ background: c }}>
                              {c === t.color && (
                                <Check size={13} strokeWidth={3} />
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {draft.teams.length < 6 && (
                  <button
                    className="add-team"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        preset: "custom",
                        teams: [
                          ...d.teams,
                          {
                            name: `Tím ${d.teams.length + 1}`,
                            color: COLORS[d.teams.length],
                          },
                        ],
                      }))
                    }
                  >
                    <Plus size={18} />
                    Pridať tím
                  </button>
                )}
              </section>
              <section className="setup-section">
                <h2>
                  <Clock3 size={19} />
                  Čas na zadanie
                </h2>
                <div className="segmented options">
                  {[30, 60, 90, 120].map((n) => (
                    <button
                      key={n}
                      className={draft.settings.seconds === n ? "selected" : ""}
                      aria-pressed={draft.settings.seconds === n}
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          settings: { ...d.settings, seconds: n },
                        }))
                      }
                    >
                      {n}
                      <span> sek.</span>
                    </button>
                  ))}
                </div>
              </section>
              <section className="setup-section">
                <h2>
                  <Trophy size={19} />
                  Hráme do
                </h2>
                <div className="segmented options">
                  {[30, 40, 50, 60].map((n) => (
                    <button
                      key={n}
                      className={draft.settings.target === n ? "selected" : ""}
                      aria-pressed={draft.settings.target === n}
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          settings: { ...d.settings, target: n },
                        }))
                      }
                    >
                      {n}
                      <span> bodov</span>
                    </button>
                  ))}
                </div>
              </section>
              <section className="setup-section toggle-section">
                <div>
                  <h2>Občas hádajú všetci</h2>
                  <p>Otvorené ťahy prinesú trochu vzrušenia.</p>
                </div>
                <button
                  className={`toggle ${draft.settings.openRounds ? "on" : ""}`}
                  role="switch"
                  aria-checked={draft.settings.openRounds}
                  aria-label="Hádajú všetci"
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      settings: {
                        ...d.settings,
                        openRounds: !d.settings.openRounds,
                      },
                    }))
                  }
                >
                  <span />
                </button>
              </section>
              <section className="toggle-section sound-setting">
                <div className="flex items-center gap-3">
                  <Volume2 size={18} />
                  <span>Zvuky hry</span>
                </div>
                <button
                  className={`toggle ${draft.settings.sound ? "on" : ""}`}
                  role="switch"
                  aria-checked={draft.settings.sound}
                  aria-label="Zvuky hry"
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      settings: { ...d.settings, sound: !d.settings.sound },
                    }))
                  }
                >
                  <span />
                </button>
              </section>
              <p className="adult-note">
                18+ · Aj odvážnejšie zadania. Priprav si papier a pero.
              </p>
              {formError && (
                <p className="form-error" role="alert">
                  {formError}
                </p>
              )}
              <button className="button primary w-full" onClick={startGame}>
                Všetci pripravení? Hráme!
                <ArrowRight size={20} />
              </button>
              {game && game.phase !== "finished" && (
                <p className="muted text-sm text-center mt-3">
                  Spustením novej hry nahradíš rozohranú partiu.
                </p>
              )}
            </main>
          )}

          {view === "game" && game && team && info && (
            <main
              className={`game-view ${phase === "playing" ? "is-playing" : ""}`}
            >
              <TeamScores game={game} />
              <div className="game-meta">
                <span>{turnLabel}</span>
                <span>
                  <Trophy size={14} />
                  Cieľ {game.settings.target} bodov
                </span>
              </div>
              <div
                key={`${game.turnNumber}-${phase}`}
                className="turn-content enter"
              >
                {phase === "choose" && (
                  <>
                    {game.turn.open && (
                      <div className="open-banner">
                        <Users size={17} />
                        Tento ťah hádajú všetci!
                      </div>
                    )}
                    <span className="eyebrow">NA RADE JE TÍM</span>
                    <h1
                      className="team-title"
                      style={{ color: team.color }}
                      ref={headingRef}
                      tabIndex={-1}
                    >
                      {team.name}
                    </h1>
                    <Illustration
                      activity={game.turn.activity}
                      className="turn-art"
                    />
                    <h2 className="activity-title">{info.name}</h2>
                    <p className="activity-hint">{info.hint}</p>
                    <div className="difficulty-area">
                      <p className="difficulty-label">
                        Na koľko bodov si trúfaš?
                      </p>
                      <div className="difficulty-grid">
                        {([3, 4, 5] as Points[]).map((p, i) => (
                          <button
                            key={p}
                            className={`difficulty difficulty-${p}`}
                            disabled={!availablePoints(game).includes(p)}
                            onClick={() =>
                              dispatch({ type: "choose", points: p })
                            }
                          >
                            <span className="difficulty-dots">
                              {Array.from({ length: 3 }, (_, j) => (
                                <i key={j} className={j <= i ? "filled" : ""} />
                              ))}
                            </span>
                            <strong>{p}</strong>
                            <span className="point-label">
                              {p === 5 ? "bodov" : "body"}
                            </span>
                            <span className="difficulty-name">
                              {["Pohoda", "Výzva", "Odvaha"][i]}
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="privacy-note">
                        <EyeOff size={14} />
                        Zadanie uvidíš až po výbere bodov.
                      </p>
                      {availablePoints(game).length === 0 && (
                        <p role="status" className="form-error">
                          Všetky zadania tejto aktivity ste už odohrali. Začnite
                          novú hru.
                        </p>
                      )}
                    </div>
                  </>
                )}
                {phase === "handoff" && (
                  <>
                    <div className="handoff-context">
                      <span
                        className="handoff-team"
                        style={{ color: team.color }}
                      >
                        {team.name}
                      </span>
                      {game.turn.open && (
                        <div className="open-banner">
                          <Users size={17} />
                          Hádajú všetci!
                        </div>
                      )}
                    </div>
                    <Illustration
                      activity={game.turn.activity}
                      className="handoff-art"
                    />
                    <h1 className="handoff-task" ref={headingRef} tabIndex={-1}>
                      <span style={{ color: info.color }}>{info.short}</span>
                      <span className="handoff-points">
                        · {game.turn.word?.points}{" "}
                        {game.turn.word?.points === 5 ? "bodov" : "body"}
                      </span>
                    </h1>
                    <p className="stage-description">
                      <strong>Teraz iba ty.</strong>
                      <br />
                      Odovzdajte mobil predvádzajúcemu.
                      <br />
                      Ostatní, oči preč!
                    </p>
                    <button
                      className="button primary stage-button"
                      onClick={() => dispatch({ type: "reveal" })}
                    >
                      <Eye size={21} />
                      Ukázať moje zadanie
                    </button>
                    <p className="privacy-note">
                      <ShieldCheck size={15} />
                      Čas sa ešte nespustí.
                    </p>
                  </>
                )}
                {phase === "reveal" && (
                  <>
                    <div className="reveal-heading">
                      <span
                        className="activity-tag"
                        style={{ color: info.color }}
                      >
                        {info.name}
                        <span>·</span>
                        {game.turn.word?.points}{" "}
                        {game.turn.word?.points === 5 ? "bodov" : "body"}
                      </span>
                      <span className="eyebrow">TVOJE ZADANIE</span>
                    </div>
                    <h1
                      className="word reveal-word"
                      ref={headingRef}
                      tabIndex={-1}
                    >
                      {game.turn.word?.text}
                    </h1>
                    <p className="instruction">{info.instruction}</p>
                    {game.turn.open && (
                      <div className="open-banner">
                        <Users size={17} />
                        Hádajú všetci!
                      </div>
                    )}
                    <div className="start-area">
                      <span className="timer-hint">
                        <Clock3 size={19} />
                        Máš {game.settings.seconds} sekúnd. Pripravený?
                      </span>
                      <button
                        className="button primary stage-button"
                        onClick={() => startTimer(Date.now())}
                      >
                        <Play size={20} fill="currentColor" />
                        Spustiť čas
                      </button>
                      <p className="privacy-note">
                        Po spustení času sa zadanie automaticky skryje.
                      </p>
                    </div>
                  </>
                )}
                {phase === "playing" && (
                  <>
                    <div className="playing-top">
                      <span
                        className="activity-tag"
                        style={{ color: info.color }}
                      >
                        {info.short} · {game.turn.word?.points} b.
                      </span>
                      {game.turn.open && (
                        <span className="live-open">
                          <Users size={15} />
                          Všetci
                        </span>
                      )}
                    </div>
                    <div
                      className={`timer ${remaining <= 10000 ? "urgent" : ""}`}
                      role="timer"
                      aria-label={`Zostáva ${Math.ceil(remaining / 1000)} sekúnd`}
                    >
                      <svg viewBox="0 0 220 220" aria-hidden="true">
                        <circle
                          className="timer-track"
                          cx="110"
                          cy="110"
                          r="99"
                        />
                        <circle
                          className="timer-progress"
                          cx="110"
                          cy="110"
                          r="99"
                          strokeDasharray={622.04}
                          strokeDashoffset={
                            622.04 *
                            (1 - remaining / (game.settings.seconds * 1000))
                          }
                        />
                      </svg>
                      <div>
                        <strong>{Math.ceil(remaining / 1000)}</strong>
                        <span>sekúnd</span>
                      </div>
                    </div>
                    <h1
                      ref={headingRef}
                      tabIndex={-1}
                      className={`word playing-word ${game.turn.hidden ? "hidden-word" : ""}`}
                    >
                      {game.turn.hidden
                        ? "Zadanie je skryté"
                        : game.turn.word?.text}
                    </h1>
                    <button
                      className="text-button hide-button"
                      onClick={() => dispatch({ type: "hide" })}
                    >
                      {game.turn.hidden ? (
                        <Eye size={18} />
                      ) : (
                        <EyeOff size={18} />
                      )}
                      {game.turn.hidden ? "Zobraziť zadanie" : "Skryť zadanie"}
                    </button>
                    <div className="answer-buttons">
                      <button
                        className="answer incorrect"
                        onClick={() =>
                          dispatch({
                            type: "answer",
                            correct: false,
                            now: Date.now(),
                          })
                        }
                      >
                        <X size={31} strokeWidth={3} />
                        <span>Neuhádnuté</span>
                      </button>
                      <button
                        className="answer correct"
                        onClick={() =>
                          dispatch({
                            type: "answer",
                            correct: true,
                            now: Date.now(),
                          })
                        }
                      >
                        <Check size={33} strokeWidth={3} />
                        <span>Uhádnuté</span>
                      </button>
                    </div>
                    <p className="privacy-note">
                      Odpoveď potvrď ešte pred koncom času.
                    </p>
                  </>
                )}
                {phase === "selectWinner" && (
                  <>
                    <div className="result-symbol success">
                      <Check size={44} strokeWidth={3} />
                    </div>
                    <span className="eyebrow">UHÁDNUTÉ VČAS</span>
                    <h1 className="stage-title" ref={headingRef} tabIndex={-1}>
                      Kto to vedel?
                    </h1>
                    <p className="stage-description">
                      Vyber tím, ktorý uhádol ako prvý.
                    </p>
                    <div className="winner-options">
                      {game.teams.map((t) => (
                        <button
                          className="winner-option"
                          key={t.id}
                          style={{ "--team": t.color } as CSSProperties}
                          onClick={() =>
                            dispatch({ type: "winner", teamId: t.id })
                          }
                        >
                          <span className="team-dot" />
                          {t.name}
                          <span>
                            +{game.turn.word?.points}
                            <ChevronRight size={20} />
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="privacy-note">
                      Ak uhádne súper, {team.name} získajú 2 body.
                    </p>
                  </>
                )}
                {phase === "result" && last && (
                  <>
                    <div
                      className={`result-symbol ${last.winnerId ? "success" : "miss"}`}
                    >
                      {last.winnerId ? (
                        <Check size={44} strokeWidth={3} />
                      ) : (
                        <X size={44} strokeWidth={3} />
                      )}
                    </div>
                    <span className="eyebrow">
                      {last.expired ? "ČAS VYPRŠAL" : "ŤAH JE ZA NAMI"}
                    </span>
                    <h1 className="stage-title" ref={headingRef} tabIndex={-1}>
                      {last.winnerId ? "Máte to!" : "Nabudúce to vyjde."}
                    </h1>
                    <p className="result-word">{last.word.text}</p>
                    <div className="awards" aria-live="polite">
                      {last.winnerId ? (
                        Object.entries(last.awards).map(([id, points]) => (
                          <div
                            key={id}
                            style={{
                              color: game.teams.find((t) => t.id === id)?.color,
                            }}
                          >
                            <span>
                              {game.teams.find((t) => t.id === id)?.name}
                            </span>
                            <strong>
                              +{points}
                              <small> {points === 5 ? "bodov" : "body"}</small>
                            </strong>
                          </div>
                        ))
                      ) : (
                        <div>
                          <span>{team.name}</span>
                          <strong>
                            +0<small> bodov</small>
                          </strong>
                        </div>
                      )}
                    </div>
                    <button
                      className="button primary stage-button"
                      onClick={() => dispatch({ type: "next" })}
                    >
                      {allWinners.length ? "Pozrieť výsledky" : "Ďalší tím"}
                      <ArrowRight size={21} />
                    </button>
                    {last.winnerId && (
                      <button
                        className="text-button correction"
                        onClick={() => dispatch({ type: "undo" })}
                      >
                        <RotateCcw size={15} />
                        Opraviť: nebolo to uhádnuté
                      </button>
                    )}
                  </>
                )}
                {phase === "finished" && (
                  <>
                    <Illustration activity="trophy" className="trophy-art" />
                    <span className="eyebrow">
                      {allWinners.length > 1
                        ? "SPOLOČNÉ VÍŤAZSTVO"
                        : "MÁME VÍŤAZA"}
                    </span>
                    <h1
                      className="winner-title"
                      style={{ color: allWinners[0]?.color }}
                      ref={headingRef}
                      tabIndex={-1}
                    >
                      {allWinners.map((t) => t.name).join(" a ")}
                    </h1>
                    <p className="stage-description">
                      Tak toto bola jazda. Dáme ešte jednu?
                    </p>
                    <ol className="ranking">
                      {[...game.teams]
                        .sort((a, b) => b.score - a.score)
                        .map((t, i, arr) => (
                          <li key={t.id}>
                            <span>
                              {arr.findIndex((v) => v.score === t.score) + 1}.
                            </span>
                            <span
                              className="team-dot"
                              style={{ background: t.color }}
                            />
                            <strong>{t.name}</strong>
                            <b>{t.score} b.</b>
                          </li>
                        ))}
                    </ol>
                    <button
                      className="button primary stage-button"
                      onClick={() => {
                        apply(createGame(game.teams, game.settings));
                      }}
                    >
                      <RotateCcw size={20} />
                      Odveta s rovnakými tímami
                    </button>
                    <button className="text-button mt-4" onClick={startNew}>
                      Nová hra s inými tímami
                      <ArrowRight size={16} />
                    </button>
                  </>
                )}
              </div>
              {phase === "choose" && (
                <div className="game-bottom">
                  <Clock3 size={15} />
                  {game.settings.seconds} sekúnd na zadanie<span>·</span>
                  <button onClick={() => setModal("rules")}>
                    Pravidlá hry
                  </button>
                </div>
              )}
            </main>
          )}
        </>
      )}
      {modal === "rules" && (
        <Modal title="Ako sa to hrá" onClose={() => setModal(null)}>
          <Rules />
        </Modal>
      )}
      {modal === "menu" && game && (
        <Modal title="Vaša partia" onClose={() => setModal(null)}>
          <TeamScores game={game} compact />
          <p className="muted text-center my-4">
            {turnLabel} · cieľ {game.settings.target} bodov
          </p>
          {game.phase === "playing" && (
            <p className="adult-note">
              Časovač stále beží. Menu hru nepozastaví.
            </p>
          )}
          <div className="menu-actions">
            <button
              onClick={() =>
                dispatch({ type: "sound", value: !game.settings.sound })
              }
            >
              {game.settings.sound ? (
                <Volume2 size={21} />
              ) : (
                <VolumeX size={21} />
              )}
              Zvuk {game.settings.sound ? "zapnutý" : "vypnutý"}
            </button>
            <button onClick={() => setModal("rules")}>
              <CircleHelp size={21} />
              Pravidlá hry
            </button>
            <button
              onClick={() => {
                setModal(null);
                setView("home");
              }}
            >
              <Home size={21} />
              Na úvod · hra zostane uložená
            </button>
          </div>
        </Modal>
      )}
      {modal === "replace" && (
        <Modal title="Začať novú partiu?" onClose={() => setModal(null)}>
          <p className="muted mb-6">
            Rozohraná hra zostane uložená, kým v nastaveniach nespustíš novú.
          </p>
          <button className="button primary w-full" onClick={startNew}>
            Nastaviť novú hru
            <ArrowRight size={20} />
          </button>
          <button
            className="button secondary w-full mt-3"
            onClick={() => {
              setModal(null);
              setView("game");
            }}
          >
            Pokračovať v partii
          </button>
        </Modal>
      )}
    </div>
  );
}
