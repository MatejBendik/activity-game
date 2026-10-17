"use client";
import { wordText } from "@/i18n/resources";
import { useTranslation } from "react-i18next";

import { Eyebrow } from "../ui/eyebrow";

import { Button } from "../ui/button";

import { OpenRoundNotice } from "../ui/game-notices";
import { PrivacyNote } from "../ui/game-notices";
import { Clock3, Play } from "lucide-react";
import type { TurnScreenProps } from "./turn-types";
export function RevealScreen({
  game,
  info,
  startTimer,
  headingRef,
}: TurnScreenProps) {
  const { t: tr } = useTranslation();
  return (
    <>
      <div className="flex flex-col items-center gap-[28px] [&_[data-slot=eyebrow]]:text-[13px]">
        <span
          className="inline-flex items-center justify-center gap-[9px] bg-[#eee7f1] rounded-[10px] pt-[10px] pb-[10px] pl-[16px] pr-[16px] text-[14px] font-extrabold"
          style={{ color: info.color }}
        >
          {info.name}
          <span>·</span>
          {game.turn.word?.points}{" "}
          {tr("pointsUnit", { count: game.turn.word?.points ?? 0 })}
        </span>
        <Eyebrow>{tr("TVOJE ZADANIE")}</Eyebrow>
      </div>
      <h1
        className="text-[clamp(27px,_5vw,_42px)] leading-[1.25] font-black tracking-[-1px] [overflow-wrap:anywhere] text-balance m-[18px_0_24px] pt-0 pb-0 pl-[10px] pr-[10px] min-h-[100px] flex items-center justify-center max-[601px]:mt-[20px] max-[601px]:min-h-[130px] max-[601px]:text-[33px]"
        ref={headingRef}
        tabIndex={-1}
      >
        {wordText(game.turn.word, tr)}
      </h1>
      <p className="max-w-[310px] mt-0 mb-0 ml-auto mr-auto text-[14px] leading-[1.6] text-[#8c7f94] max-[601px]:text-[13px] [&_+_[data-slot=open-banner]]:mt-[24px]">
        {info.instruction}
      </p>
      {game.turn.open && (
        <OpenRoundNotice>{tr("Hádajú všetci!")}</OpenRoundNotice>
      )}
      <div className="mt-[55px] [&_[data-slot=stage-button]]:mt-[15px] max-[601px]:mt-[42px]">
        <span className="inline-flex items-center gap-[7px] text-[#796c81] text-[14px]">
          <Clock3 size={19} />{" "}
          {tr("game.ready", { count: game.settings.seconds })}
        </span>
        <Button
          className="w-full max-w-[380px] m-[28px_auto_0]"
          data-slot="stage-button"
          onClick={() => startTimer(Date.now())}
        >
          <Play size={20} fill="currentColor" /> {tr("Spustiť čas")}
        </Button>
        <PrivacyNote>
          {tr("Po spustení času sa zadanie automaticky skryje.")}
        </PrivacyNote>
      </div>
    </>
  );
}
