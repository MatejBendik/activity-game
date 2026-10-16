"use client";
import { EyeOff, Users } from "lucide-react";
import { Illustration } from "../illustration";
import { availablePoints } from "@/lib/game";
import type { Points } from "@/lib/words";
import type { TurnScreenProps } from "./turn-types";
export function ChooseScreen({
  game,
  team,
  info,
  dispatch,
  headingRef,
}: TurnScreenProps) {
  return (
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
      <Illustration activity={game.turn.activity} className="turn-art" />
      <h2 className="activity-title">{info.name}</h2>
      <p className="activity-hint">{info.hint}</p>
      <div className="difficulty-area">
        <p className="difficulty-label">Na koľko bodov si trúfaš?</p>
        <div className="difficulty-grid">
          {([3, 4, 5] as Points[]).map((p, i) => (
            <button
              key={p}
              className={`difficulty difficulty-${p}`}
              disabled={!availablePoints(game).includes(p)}
              onClick={() => dispatch({ type: "choose", points: p })}
            >
              <span className="difficulty-dots">
                {Array.from({ length: 3 }, (_, j) => (
                  <i key={j} className={j <= i ? "filled" : ""} />
                ))}
              </span>
              <strong>{p}</strong>
              <span className="point-label">{p === 5 ? "bodov" : "body"}</span>
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
            Všetky zadania tejto aktivity ste už odohrali. Začnite novú hru.
          </p>
        )}
      </div>
    </>
  );
}
