"use client";
import { Eyebrow } from "../ui/eyebrow";

import { Button } from "../ui/button";

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
      <div
        className="w-[88px] h-[88px] flex items-center justify-center rounded-[50%] m-[32px_auto_28px] [&[data-success=true]]:bg-[#e1eee4] [&[data-success=true]]:text-[#488d6e] [&[data-miss=true]]:bg-[#f1e1df] [&[data-miss=true]]:text-[#bd7274] max-[601px]:mt-[25px]"
        data-success={!!last.winnerId}
        data-miss={!last.winnerId}
      >
        {last.winnerId ? (
          <Check size={44} strokeWidth={3} />
        ) : (
          <X size={44} strokeWidth={3} />
        )}
      </div>
      <Eyebrow>{last.expired ? "ČAS VYPRŠAL" : "ŤAH JE ZA NAMI"}</Eyebrow>
      <h1
        className="font-black tracking-[-1.4px] text-[37px] leading-[1.18] mt-[12px] mb-[12px] ml-0 mr-0 max-[601px]:text-[31px]"
        ref={headingRef}
        tabIndex={-1}
      >
        {last.winnerId ? "Máte to!" : "Nabudúce to vyjde."}
      </h1>
      <p className="text-[#8a7b94] m-[20px_auto_25px] text-[20px] leading-[1.4] [overflow-wrap:anywhere] max-[601px]:text-[18px]">
        {last.word.text}
      </p>
      <div
        className="flex justify-center gap-[35px] m-[26px_0_35px] [&_>_div]:flex [&_>_div]:flex-col [&_>_div]:gap-[6px] [&_>_div]:text-[14px] [&_>_div]:font-extrabold [&_>_div]:[overflow-wrap:anywhere] [&_strong]:text-[44px] [&_strong]:font-black [&_small]:text-[14px] max-[601px]:gap-[24px] max-[601px]:[&_strong]:text-[40px]"
        aria-live="polite"
      >
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
      <Button
        className="w-full max-w-[380px] m-[28px_auto_0]"
        data-slot="stage-button"
        onClick={() => dispatch({ type: "next" })}
      >
        {allWinners.length ? "Pozrieť výsledky" : "Ďalší tím"}
        <ArrowRight size={21} />
      </Button>
      {last.winnerId && (
        <Button
          variant="text"
          className="mt-[15px] text-[11px]"
          onClick={() => dispatch({ type: "undo" })}
        >
          <RotateCcw size={15} />
          Opraviť: nebolo to uhádnuté
        </Button>
      )}
    </>
  );
}
