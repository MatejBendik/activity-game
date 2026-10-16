"use client";
import { Clock3, Play, Users } from "lucide-react";
import type { TurnScreenProps } from "./turn-types";
export function RevealScreen({
  game,
  info,
  startTimer,
  headingRef,
}: TurnScreenProps) {
  return (
    <>
      <div className="reveal-heading">
        <span className="activity-tag" style={{ color: info.color }}>
          {info.name}
          <span>·</span>
          {game.turn.word?.points}{" "}
          {game.turn.word?.points === 5 ? "bodov" : "body"}
        </span>
        <span className="eyebrow">TVOJE ZADANIE</span>
      </div>
      <h1 className="word reveal-word" ref={headingRef} tabIndex={-1}>
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
  );
}
