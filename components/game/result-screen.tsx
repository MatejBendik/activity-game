"use client";
import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import type { TurnScreenProps } from "./turn-types";
export function ResultScreen({
  game,
  team,
  last,
  allWinners,
  dispatch,
  headingRef,
}: TurnScreenProps) {
  if (!last) return null;
  return (
    <>
      <div className={`result-symbol ${last.winnerId ? "success" : "miss"}`}>
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
              <span>{game.teams.find((t) => t.id === id)?.name}</span>
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
  );
}
