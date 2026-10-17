"use client";
import { teamName } from "@/i18n/resources";
import { useTranslation } from "react-i18next";

import { Button } from "../ui/button";

import { OpenRoundNotice } from "../ui/game-notices";
import { PrivacyNote } from "../ui/game-notices";
import { Eye, ShieldCheck } from "lucide-react";
import { Illustration } from "../illustration";
import type { TurnScreenProps } from "./turn-types";
export function HandoffScreen({
  game,
  team,
  info,
  dispatch,
  headingRef,
}: TurnScreenProps) {
  const { t: tr } = useTranslation();
  return (
    <>
      <div className="flex flex-col items-center gap-[14px] [&_[data-slot=open-banner]]:m-0">
        <span
          className="max-w-full text-[clamp(30px,_6vw,_38px)] font-black leading-[1.2] tracking-[-0.8px] [overflow-wrap:anywhere]"
          style={{ color: team.color }}
        >
          {teamName(team.name, tr)}
        </span>
        {game.turn.open && (
          <OpenRoundNotice>{tr("Hádajú všetci!")}</OpenRoundNotice>
        )}
      </div>
      <Illustration
        activity={game.turn.activity}
        className="w-[290px] m-[16px_auto_15px] max-[601px]:w-[260px] max-[601px]:mt-[20px] max-[601px]:mb-[20px] max-[601px]:ml-auto max-[601px]:mr-auto"
      />
      <h1
        className="flex flex-wrap items-baseline justify-center gap-x-[10px] gap-y-[2px] text-[clamp(26px,_5vw,_34px)] font-black leading-[1.25] tracking-[-0.8px] m-[8px_0_18px]"
        ref={headingRef}
        tabIndex={-1}
      >
        <span style={{ color: info.color }}>{info.short}</span>
        <span className="whitespace-nowrap">
          · {game.turn.word?.points}{" "}
          {tr("pointsUnit", { count: game.turn.word?.points ?? 0 })}
        </span>
      </h1>
      <p className="text-[15px] text-[#796c81] leading-[1.7] m-[12px_0_25px] max-[601px]:text-[14px]">
        <strong>{tr("Teraz iba ty.")}</strong>
        <br /> {tr("Odovzdajte mobil predvádzajúcemu.")} <br />{" "}
        {tr("Ostatní, oči preč!")}
      </p>
      <Button
        className="w-full max-w-[380px] m-[28px_auto_0]"
        data-slot="stage-button"
        onClick={() => dispatch({ type: "reveal" })}
      >
        <Eye size={21} /> {tr("Ukázať moje zadanie")}
      </Button>
      <PrivacyNote>
        <ShieldCheck size={15} /> {tr("Čas sa ešte nespustí.")}
      </PrivacyNote>
    </>
  );
}
