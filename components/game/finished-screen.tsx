"use client";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Illustration } from "../illustration";
import { createGame } from "@/lib/game";
import type { TurnScreenProps } from "./turn-types";
export function FinishedScreen({
  game,
  allWinners,
  startNew,
  apply,
  headingRef,
}: TurnScreenProps) {
  return (
    <>
      <Illustration activity="trophy" className="trophy-art" />
      <span className="eyebrow">
        {allWinners.length > 1 ? "SPOLOČNÉ VÍŤAZSTVO" : "MÁME VÍŤAZA"}
      </span>
      <h1
        className="winner-title"
        style={{ color: allWinners[0]?.color }}
        ref={headingRef}
        tabIndex={-1}
      >
        {allWinners.map((t) => t.name).join(" a ")}
      </h1>
      <p className="stage-description">Tak toto bola jazda. Dáme ešte jednu?</p>
      <ol className="ranking">
        {[...game.teams]
          .sort((a, b) => b.score - a.score)
          .map((t, i, arr) => (
            <li key={t.id}>
              <span>{arr.findIndex((v) => v.score === t.score) + 1}.</span>
              <span className="team-dot" style={{ background: t.color }} />
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
  );
}
