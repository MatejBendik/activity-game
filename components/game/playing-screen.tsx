"use client";
import { Check, Eye, EyeOff, Users, X } from "lucide-react";
import type { TurnScreenProps } from "./turn-types";
export function PlayingScreen({
  game,
  info,
  remaining,
  dispatch,
  headingRef,
}: TurnScreenProps) {
  return (
    <>
      <div className="playing-top">
        <span className="activity-tag" style={{ color: info.color }}>
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
          <circle className="timer-track" cx="110" cy="110" r="99" />
          <circle
            className="timer-progress"
            cx="110"
            cy="110"
            r="99"
            strokeDasharray={622.04}
            strokeDashoffset={
              622.04 * (1 - remaining / (game.settings.seconds * 1000))
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
        {game.turn.hidden ? "Zadanie je skryté" : game.turn.word?.text}
      </h1>
      <button
        className="text-button hide-button"
        onClick={() => dispatch({ type: "hide" })}
      >
        {game.turn.hidden ? <Eye size={18} /> : <EyeOff size={18} />}
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
      <p className="privacy-note">Odpoveď potvrď ešte pred koncom času.</p>
    </>
  );
}
