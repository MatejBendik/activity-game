"use client";
import { ArrowRight, CircleHelp, Home, Volume2, VolumeX } from "lucide-react";
import { Modal, Rules, TeamScores } from "./game-ui";
import type { Action, Game } from "@/lib/game";
export type ModalName = "rules" | "menu" | "replace" | null;
export function AppDialogs({
  game,
  modal,
  setModal,
  setView,
  dispatch,
  startNew,
  turnLabel,
}: {
  game: Game | null;
  modal: ModalName;
  setModal: (m: ModalName) => void;
  setView: (v: "home" | "game") => void;
  dispatch: (a: Action) => void;
  startNew: () => void;
  turnLabel: string;
}) {
  return (
    <>
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
    </>
  );
}
