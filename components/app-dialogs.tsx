"use client";
import { useTranslation } from "react-i18next";

import { Button } from "./ui/button";

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
  const { t: tr } = useTranslation();
  return (
    <>
      {modal === "rules" && (
        <Modal title={tr("Ako sa to hrá")} onClose={() => setModal(null)}>
          <Rules />
        </Modal>
      )}
      {modal === "menu" && game && (
        <Modal title={tr("Vaša partia")} onClose={() => setModal(null)}>
          <TeamScores game={game} compact />
          <p className="text-muted text-center my-4">
            {turnLabel} · {tr("game.target", { count: game.settings.target })}
          </p>
          {game.phase === "playing" && (
            <p className="text-[#8b7c6c] text-[12px] leading-[1.65] bg-[#f0eadd] rounded-[11px] pt-[12px] pb-[12px] pl-[15px] pr-[15px] m-[16px_0_22px]">
              {tr("Časovač stále beží. Menu hru nepozastaví.")}
            </p>
          )}
          <div className="grid gap-[6px] [&_button]:min-h-[56px] [&_button]:flex [&_button]:items-center [&_button]:gap-[12px] [&_button]:text-left [&_button]:text-[14px] [&_button]:p-[10px] [&_button]:rounded-[12px] [&_button]:text-[#776286] [&_button]:font-bold [&_button:hover]:bg-[#ede6f0]">
            <button
              onClick={() =>
                dispatch({ type: "sound", value: !game.settings.sound })
              }
            >
              {game.settings.sound ? (
                <Volume2 size={21} />
              ) : (
                <VolumeX size={21} />
              )}{" "}
              {tr("Zvuk")} {game.settings.sound ? tr("zapnutý") : tr("vypnutý")}
            </button>
            <button onClick={() => setModal("rules")}>
              <CircleHelp size={21} /> {tr("Pravidlá hry")}
            </button>
            <button
              onClick={() => {
                setModal(null);
                setView("home");
              }}
            >
              <Home size={21} /> {tr("Na úvod · hra zostane uložená")}
            </button>
          </div>
        </Modal>
      )}
      {modal === "replace" && (
        <Modal title={tr("Začať novú partiu?")} onClose={() => setModal(null)}>
          <p className="text-muted mb-6">
            {tr(
              "Rozohraná hra zostane uložená, kým v nastaveniach nespustíš novú.",
            )}
          </p>
          <Button className="w-full" onClick={startNew}>
            {tr("Nastaviť novú hru")} <ArrowRight size={20} />
          </Button>
          <Button
            variant="secondary"
            className="w-full mt-3"
            onClick={() => {
              setModal(null);
              setView("game");
            }}
          >
            {tr("Pokračovať v partii")}
          </Button>
        </Modal>
      )}
    </>
  );
}
