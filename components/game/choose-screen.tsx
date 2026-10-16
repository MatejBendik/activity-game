"use client";
import { Eyebrow } from "../ui/eyebrow";

import { OpenRoundNotice } from "../ui/game-notices";
import { PrivacyNote } from "../ui/game-notices";
import { EyeOff } from "lucide-react";
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
        <OpenRoundNotice>Tento ťah hádajú všetci!</OpenRoundNotice>
      )}
      <Eyebrow>NA RADE JE TÍM</Eyebrow>
      <h1
        className="text-[clamp(36px,_5vw,_49px)] font-black tracking-[-1.8px] leading-[1.18] m-[6px_0_0] [overflow-wrap:anywhere] max-[601px]:text-[39px] max-[361px]:text-[35px]"
        style={{ color: team.color }}
        ref={headingRef}
        tabIndex={-1}
      >
        {team.name}
      </h1>
      <Illustration
        activity={game.turn.activity}
        className="w-[280px] h-[193px] m-[2px_auto_0] max-[601px]:w-[250px] max-[601px]:h-[172px] max-[601px]:mt-[8px] [@media(max-height:750px)_and_(max-width:600px)]:w-[215px] [@media(max-height:750px)_and_(max-width:600px)]:h-[148px] [@media(max-height:750px)_and_(max-width:600px)]:mt-0"
      />
      <h2 className="text-[29px] font-black tracking-[-0.8px] mt-[-1px] max-[601px]:text-[27px]">
        {info.name}
      </h2>
      <p className="text-[14px] text-[#796c81] m-[5px_0_0] max-[601px]:text-[12px]">
        {info.hint}
      </p>
      <div className="mt-[32px] max-[601px]:mt-[28px] [@media(max-height:750px)_and_(max-width:600px)]:mt-[21px]">
        <p className="text-[14px] font-extrabold text-[#7e728b] mb-[15px] max-[601px]:text-[13px] max-[601px]:mb-[14px]">
          Na koľko bodov si trúfaš?
        </p>
        <div className="grid grid-cols-3 gap-[13px] max-[601px]:gap-[11px]">
          {([3, 4, 5] as Points[]).map((p, i) => (
            <button
              key={p}
              className={`relative rounded-[21px] p-[17px_7px_16px] border-[1.5px] border-solid flex flex-col items-center min-w-0 shadow-[0_5px_0_var(--shade)] hover:[transform:translateY(-4px)] hover:shadow-[0_8px_0_var(--shade)] [&_strong]:text-[52px] [&_strong]:font-black [&_strong]:leading-[1.08] [&_strong]:m-[9px_0_0] [&_strong]:tracking-[-2px] max-[601px]:rounded-[18px] max-[601px]:pt-[15px] max-[601px]:pb-[15px] max-[601px]:[&_strong]:text-[46px] ${difficultyStyles[p]}`}
              disabled={!availablePoints(game).includes(p)}
              onClick={() => dispatch({ type: "choose", points: p })}
            >
              <span className="flex gap-[4px] [&_i]:w-[5px] [&_i]:h-[5px] [&_i]:rounded-[50%] [&_i]:bg-current [&_i]:opacity-[0.2] [&_i[data-filled=true]]:opacity-[1]">
                {Array.from({ length: 3 }, (_, j) => (
                  <i key={j} data-filled={j <= i} />
                ))}
              </span>
              <strong>{p}</strong>
              <span className="text-[14px] font-extrabold">
                {p === 5 ? "bodov" : "body"}
              </span>
              <span className="text-[13px] font-bold mt-[12px] opacity-[0.8] max-[601px]:text-[13px] max-[601px]:mt-[10px]">
                {["Pohoda", "Výzva", "Odvaha"][i]}
              </span>
            </button>
          ))}
        </div>
        <PrivacyNote>
          <EyeOff size={14} />
          Zadanie uvidíš až po výbere bodov.
        </PrivacyNote>
        {availablePoints(game).length === 0 && (
          <p
            role="status"
            className="text-[#b1464e] text-[13px] mt-[10px] mb-[10px] ml-0 mr-0"
          >
            Všetky zadania tejto aktivity ste už odohrali. Začnite novú hru.
          </p>
        )}
      </div>
    </>
  );
}

const difficultyStyles = {
  3: "bg-[#f0e8f7] border-[#d7c5e8] text-[#8051b7] [--shade:#dfcfee]",
  4: "bg-[#f8ebd5] border-[#ead4ad] text-[#946421] [--shade:#edddbd]",
  5: "bg-[#e3efe7] border-[#c1d9cb] text-[#2d735b] [--shade:#cbded1]",
};
