"use client";
import { Check, ChevronRight } from "lucide-react";
import type { CSSProperties } from "react";
import type { TurnScreenProps } from "./turn-types";
export function SelectWinnerScreen({
  game,
  team,
  dispatch,
  headingRef,
}: TurnScreenProps) {
  return (
    <>
      <div className="result-symbol success">
        <Check size={44} strokeWidth={3} />
      </div>
      <span className="eyebrow">UHÁDNUTÉ VČAS</span>
      <h1 className="stage-title" ref={headingRef} tabIndex={-1}>
        Kto to vedel?
      </h1>
      <p className="stage-description">Vyber tím, ktorý uhádol ako prvý.</p>
      <div className="winner-options">
        {game.teams.map((t) => (
          <button
            className="winner-option"
            key={t.id}
            style={{ "--team": t.color } as CSSProperties}
            onClick={() => dispatch({ type: "winner", teamId: t.id })}
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
  );
}
