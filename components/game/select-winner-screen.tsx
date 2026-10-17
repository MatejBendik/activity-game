"use client";
import { teamName } from "@/i18n/resources";
import { useTranslation } from "react-i18next";

import { Eyebrow } from "../ui/eyebrow";

import { PrivacyNote } from "../ui/game-notices";
import { Check, ChevronRight } from "lucide-react";
import type { CSSProperties } from "react";
import type { TurnScreenProps } from "./turn-types";
export function SelectWinnerScreen({
  game,
  team,
  dispatch,
  headingRef,
}: TurnScreenProps) {
  const { t: tr } = useTranslation();
  return (
    <>
      <div
        className="w-[88px] h-[88px] flex items-center justify-center rounded-[50%] m-[32px_auto_28px] [&[data-success=true]]:bg-[#e1eee4] [&[data-success=true]]:text-[#488d6e] [&[data-miss=true]]:bg-[#f1e1df] [&[data-miss=true]]:text-[#bd7274] max-[601px]:mt-[25px]"
        data-success="true"
      >
        <Check size={44} strokeWidth={3} />
      </div>
      <Eyebrow>{tr("UHÁDNUTÉ VČAS")}</Eyebrow>
      <h1
        className="font-black tracking-[-1.4px] text-[37px] leading-[1.18] mt-[12px] mb-[12px] ml-0 mr-0 max-[601px]:text-[31px]"
        ref={headingRef}
        tabIndex={-1}
      >
        {tr("Kto to vedel?")}
      </h1>
      <p className="text-[15px] text-[#796c81] leading-[1.7] m-[12px_0_25px] max-[601px]:text-[14px]">
        {tr("Vyber tím, ktorý uhádol ako prvý.")}
      </p>
      <div className="grid gap-[12px] m-[30px_0_15px]">
        {game.teams.map((t) => (
          <button
            className="flex items-center gap-[12px] text-left min-h-[64px] rounded-[14px] [border:1px_solid_var(--color-line)] bg-[#fdfaf5] pt-[12px] pb-[12px] pl-[18px] pr-[18px] text-[16px] font-black [overflow-wrap:anywhere] [&_>_span:last-child]:text-[var(--team)] [&_>_span:last-child]:inline-flex [&_>_span:last-child]:items-center [&_>_span:last-child]:gap-[9px] [&_>_span:last-child]:ml-auto hover:bg-[color-mix(in_srgb,_var(--team)_8%,_var(--color-paper))]"
            key={t.id}
            style={{ "--team": t.color } as CSSProperties}
            onClick={() => dispatch({ type: "winner", teamId: t.id })}
          >
            <span className="inline-block w-[8px] h-[8px] min-w-[8px] rounded-[50%] bg-[var(--team)]" />
            {teamName(t.name, tr)}
            <span>
              +{game.turn.word?.points}
              <ChevronRight size={20} />
            </span>
          </button>
        ))}
      </div>
      <PrivacyNote>
        {tr("game.bonus", { team: teamName(team.name, tr) })}
      </PrivacyNote>
    </>
  );
}
