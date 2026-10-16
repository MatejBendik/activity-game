"use client";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Plus,
  Trophy,
  Users,
  Volume2,
  X,
} from "lucide-react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import type { Game } from "@/lib/game";
import { COLORS } from "@/lib/game";
import type { Draft } from "@/lib/setup";
export function SetupScreen({
  game,
  setView,
  setDraft,
  draft,
  setPreset,
  headingRef,
  formError,
  startGame,
}: {
  game: Game | null;
  setView: (v: "game" | "home") => void;
  draft: Draft;
  setDraft: Dispatch<SetStateAction<Draft>>;
  setPreset: (preset: Draft["preset"]) => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
  formError: string;
  startGame: () => void;
}) {
  return (
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
          <span className="muted text-sm">{draft.teams.length} / 6</span>
        </div>
        <div className="space-y-3">
          {draft.teams.map((t, i) => (
            <div className="team-editor" key={i}>
              <div className="team-editor-main">
                <span className="team-number" style={{ background: t.color }}>
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
              <div className="color-picker" aria-label={`Farba tímu ${i + 1}`}>
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
                      {c === t.color && <Check size={13} strokeWidth={3} />}
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
  );
}
