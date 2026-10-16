"use client";
import { Eye, ShieldCheck, Users } from "lucide-react";
import { Illustration } from "../illustration";
import type { TurnScreenProps } from "./turn-types";
export function HandoffScreen({
  game,
  team,
  info,
  dispatch,
  headingRef,
}: TurnScreenProps) {
  return (
    <>
      <div className="handoff-context">
        <span className="handoff-team" style={{ color: team.color }}>
          {team.name}
        </span>
        {game.turn.open && (
          <div className="open-banner">
            <Users size={17} />
            Hádajú všetci!
          </div>
        )}
      </div>
      <Illustration activity={game.turn.activity} className="handoff-art" />
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
  );
}
