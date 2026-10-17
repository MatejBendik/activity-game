"use client";
import { wordText } from "@/i18n/resources";
import { useTranslation } from "react-i18next";

import { Button } from "../ui/button";

import { PrivacyNote } from "../ui/game-notices";
import { Check, Eye, EyeOff, Users, X } from "lucide-react";
import { useCountdown } from "@/hooks/use-countdown";
import type { TurnScreenProps } from "./turn-types";
export function PlayingScreen({
  game,
  info,
  dispatch,
  headingRef,
}: TurnScreenProps) {
  const { t: tr } = useTranslation();
  const remaining = useCountdown(game.turn.deadline!);
  return (
    <>
      <div className="flex justify-center gap-[10px]">
        <span
          className="inline-flex items-center justify-center gap-[9px] bg-[#eee7f1] rounded-[10px] pt-[10px] pb-[10px] pl-[16px] pr-[16px] text-[14px] font-extrabold"
          style={{ color: info.color }}
        >
          {info.short} · {game.turn.word?.points} {tr("b.")}
        </span>
        {game.turn.open && (
          <span className="text-[#a57c32] flex items-center gap-[5px] text-[12px] font-extrabold">
            <Users size={15} /> {tr("Všetci")}
          </span>
        )}
      </div>
      <div
        className="w-[215px] h-[215px] m-[25px_auto_22px] relative text-purple [&_svg]:w-full [&_svg]:h-full [&_svg]:[transform:rotate(-90deg)] [&_circle]:fill-none [&_circle]:stroke-[8] [&_>_div]:absolute [&_>_div]:inset-0 [&_>_div]:flex [&_>_div]:flex-col [&_>_div]:items-center [&_>_div]:justify-center [&_strong]:text-[78px] [&_strong]:font-black [&_strong]:leading-[1] [&_strong]:tabular-nums [&_strong]:tracking-[-5px] [&_>_div_>_span]:text-[12px] [&_>_div_>_span]:font-extrabold [&_>_div_>_span]:text-[#796c81] [&_>_div_>_span]:mt-[7px] [&[data-urgent=true]]:text-[#cf666a] [&[data-urgent=true]_[data-slot=timer-track]]:stroke-[#f1ddda] max-[601px]:w-[195px] max-[601px]:h-[195px] max-[601px]:m-[23px_auto_18px] max-[601px]:[&_strong]:text-[70px] [@media(max-height:750px)_and_(max-width:600px)]:w-[160px] [@media(max-height:750px)_and_(max-width:600px)]:h-[160px] [@media(max-height:750px)_and_(max-width:600px)]:m-[17px_auto_12px] [@media(max-height:750px)_and_(max-width:600px)]:[&_strong]:text-[59px]"
        data-urgent={remaining <= 10000}
        role="timer"
        aria-label={tr("game.remaining", {
          count: Math.ceil(remaining / 1000),
        })}
      >
        <svg viewBox="0 0 220 220" aria-hidden="true">
          <circle
            className="timer-track"
            data-slot="timer-track"
            cx="110"
            cy="110"
            r="99"
          />
          <circle
            className="stroke-current [stroke-linecap:round] [transition:stroke-dashoffset_0.1s_linear]"
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
          <span>
            {tr("secondsUnit", { count: Math.ceil(remaining / 1000) })}
          </span>
        </div>
      </div>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-[clamp(27px,_5vw,_42px)] leading-[1.25] font-black tracking-[-1px] [overflow-wrap:anywhere] text-balance min-h-[100px] flex items-center justify-center m-[10px_0_0] [&[data-hidden=true]]:text-[#ad9db5] [&[data-hidden=true]]:text-[24px] max-[601px]:text-[29px] max-[601px]:min-h-[105px] max-[601px]:[&[data-hidden=true]]:text-[23px] [@media(max-height:750px)_and_(max-width:600px)]:min-h-[78px] [@media(max-height:750px)_and_(max-width:600px)]:text-[26px]"
        data-hidden={game.turn.hidden}
      >
        {game.turn.hidden
          ? tr("Zadanie je skryté")
          : wordText(game.turn.word, tr)}
      </h1>
      <Button
        variant="text"
        className="m-[3px_auto_16px] min-h-[48px] min-w-[200px] pt-[12px] pb-[12px] pl-[20px] pr-[20px] [border:1px_solid_#d6c4e8] rounded-[14px] bg-[#eee6f5] text-[#6d459c] shadow-[0_3px_0_#dfd0ec] text-[14px] font-extrabold max-[601px]:mb-[18px] max-[601px]:min-h-[48px] max-[601px]:min-w-[200px] max-[601px]:pt-[12px] max-[601px]:pb-[12px] max-[601px]:pl-[20px] max-[601px]:pr-[20px] max-[601px]:[border:1px_solid_#d6c4e8] max-[601px]:rounded-[14px] max-[601px]:bg-[#eee6f5] max-[601px]:text-[#6d459c] max-[601px]:shadow-[0_3px_0_#dfd0ec] max-[601px]:text-[14px] max-[601px]:font-extrabold hover:bg-[#e4d7ef] hover:text-[#603790] active:shadow-[0_1px_0_#dfd0ec]"
        onClick={() => dispatch({ type: "hide" })}
      >
        {game.turn.hidden ? <Eye size={18} /> : <EyeOff size={18} />}
        {game.turn.hidden ? tr("Zobraziť zadanie") : tr("Skryť zadanie")}
      </Button>
      <div className="grid grid-cols-2 gap-[16px] max-[601px]:gap-[13px]">
        <button
          className="min-h-[90px] rounded-[20px] flex flex-col items-center justify-center gap-[7px] text-[13px] font-extrabold max-[601px]:min-h-[91px] text-[#b84d59] bg-[#f4dfdf] shadow-[0_4px_0_#e9cbcf] hover:bg-[#eed1d3]"
          onClick={() =>
            dispatch({
              type: "answer",
              correct: false,
              now: Date.now(),
            })
          }
        >
          <X size={31} strokeWidth={3} />
          <span>{tr("Neuhádnuté")}</span>
        </button>
        <button
          className="min-h-[90px] rounded-[20px] flex flex-col items-center justify-center gap-[7px] text-[13px] font-extrabold max-[601px]:min-h-[91px] text-[#fff] bg-[#438d73] shadow-[0_4px_0_#2b6e58] hover:bg-[#367e65]"
          onClick={() =>
            dispatch({
              type: "answer",
              correct: true,
              now: Date.now(),
            })
          }
        >
          <Check size={33} strokeWidth={3} />
          <span>{tr("Uhádnuté")}</span>
        </button>
      </div>
      <PrivacyNote>{tr("Odpoveď potvrď ešte pred koncom času.")}</PrivacyNote>
    </>
  );
}
