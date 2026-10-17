"use client";
import { teamName } from "@/i18n/resources";
import { useTranslation } from "react-i18next";

import { Eyebrow } from "../ui/eyebrow";

import { Button } from "../ui/button";

import { ArrowRight, RotateCcw } from "lucide-react";
import { Illustration } from "../illustration";
import type { TurnScreenProps } from "./turn-types";
export function FinishedScreen({
  game,
  allWinners,
  startNew,
  replay,
  headingRef,
}: TurnScreenProps) {
  const { t: tr } = useTranslation();
  return (
    <>
      <Illustration
        activity="trophy"
        className="w-[280px] m-[-15px_auto_5px] max-[601px]:w-[245px]"
      />
      <Eyebrow>
        {allWinners.length > 1 ? tr("SPOLOČNÉ VÍŤAZSTVO") : tr("MÁME VÍŤAZA")}
      </Eyebrow>
      <h1
        className="text-[42px] leading-[1.2] font-black tracking-[-1.6px] m-[10px_0_0] [overflow-wrap:anywhere] max-[601px]:text-[37px]"
        style={{ color: allWinners[0]?.color }}
        ref={headingRef}
        tabIndex={-1}
      >
        {allWinners.map((t) => teamName(t.name, tr)).join(tr("game.and"))}
      </h1>
      <p className="text-[15px] text-[#796c81] leading-[1.7] m-[12px_0_25px] max-[601px]:text-[14px]">
        {tr("Tak toto bola jazda. Dáme ešte jednu?")}
      </p>
      <ol className="p-0 list-none m-[20px_0_30px] [&_li]:flex [&_li]:items-center [&_li]:gap-[12px] [&_li]:[border-bottom:1px_solid_var(--color-line)] [&_li]:pt-[15px] [&_li]:pb-[15px] [&_li]:pl-[4px] [&_li]:pr-[4px] [&_li]:text-[14px] [&_li_>_span:first-child]:text-[#796c81] [&_li_>_span:first-child]:min-w-[18px] [&_li_>_strong]:[overflow-wrap:anywhere] [&_li_>_b]:ml-auto [&_li_>_b]:min-w-fit">
        {[...game.teams]
          .sort((a, b) => b.score - a.score)
          .map((t, i, arr) => (
            <li key={t.id}>
              <span>{arr.findIndex((v) => v.score === t.score) + 1}.</span>
              <span
                className="inline-block w-[8px] h-[8px] min-w-[8px] rounded-[50%] bg-[var(--team)]"
                style={{ background: t.color }}
              />
              <strong>{teamName(t.name, tr)}</strong>
              <b>
                {t.score} {tr("b.")}
              </b>
            </li>
          ))}
      </ol>
      <Button
        className="w-full max-w-[380px] m-[28px_auto_0]"
        data-slot="stage-button"
        onClick={replay}
      >
        <RotateCcw size={20} /> {tr("Odveta s rovnakými tímami")}
      </Button>
      <Button variant="text" className="mt-4" onClick={startNew}>
        {tr("Nová hra s inými tímami")} <ArrowRight size={16} />
      </Button>
    </>
  );
}
