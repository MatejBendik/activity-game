"use client";
import { teamName } from "@/i18n/resources";
import { useTranslation } from "react-i18next";

import { IconButton } from "./ui/button";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { MessageCircle, Pencil, Sparkles, X } from "lucide-react";
import { activities, activityInfo } from "@/lib/words";
import type { Game } from "@/lib/game";
const activityIcons = {
  opis: MessageCircle,
  kreslenie: Pencil,
  pantomima: Sparkles,
};

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const { t: tr } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="border-0 p-[25px] max-w-[480px] w-[calc(100%_-_32px)] max-h-[88svh] rounded-[25px] bg-paper text-ink shadow-[0_20px_100px_#39254b26] m-auto [&::backdrop]:bg-[#30263869] [&::backdrop]:[backdrop-filter:blur(5px)] max-[601px]:p-[22px]"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={title}
    >
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-black">{title}</h2>
        <IconButton label={tr("Zavrieť")} onClick={onClose}>
          <X size={22} />
        </IconButton>
      </div>
      {children}
    </dialog>
  );
}
export function Rules() {
  const { t: tr } = useTranslation();
  return (
    <div className="text-[14px] leading-[1.65] text-[#8b7c93] [&_h3]:text-[#52465e] [&_strong]:text-[#52465e] space-y-5">
      <p>
        {tr(
          "Rozdeľte sa do 2 až 6 tímov. Predvádzajúci si prevezme mobil a vyberie náročnosť. Ostatní sa na zadanie nepozerajú.",
        )}
      </p>
      {activities.map((a) => {
        const Icon = activityIcons[a];
        return (
          <div key={a} className="flex gap-4">
            <span
              className="min-w-[42px] h-[42px] bg-[#eee7e5] rounded-[13px] grid place-items-center"
              style={{ color: activityInfo[a].color }}
            >
              <Icon size={24} />
            </span>
            <div>
              <h3 className="font-extrabold">{tr(activityInfo[a].name)}</h3>
              <p>{tr(activityInfo[a].instruction)}</p>
            </div>
          </div>
        );
      })}
      <p>
        <strong>{tr("3, 4 alebo 5 bodov.")}</strong>{" "}
        {tr(
          "Čím viac bodov, tým väčšia výzva. Jedno zadanie na ťah. Kreslí sa na papier, ktorý si pripravte spolu s perom.",
        )}
      </p>
      <p>
        <strong>{tr("Odpoveď potvrďte pred koncom času.")}</strong>{" "}
        {tr(
          "Zelená fajka znamená uhádnuté, červené X neúspech. Po limite sú body automaticky nulové.",
        )}
      </p>
      <p>
        <strong>{tr("Hádajú všetci:")}</strong>{" "}
        {tr(
          "úspešný tím získa hodnotu zadania. Ak uhádne súper, predvádzajúci tím dostane 2 body navyše. Otvorené ťahy majú 20 % šancu a nejdú dva za sebou.",
        )}
      </p>
      <p>
        {tr(
          "Vyhráva najvyššie skóre po dosiahnutí cieľa. Pri rovnakom najvyššom skóre je víťazstvo spoločné. Pri ďalšom ťahu vymeňte predvádzajúceho.",
        )}
      </p>
      <div className="text-[#8b7c6c] text-[12px] leading-[1.65] bg-[#f0eadd] rounded-[11px] pt-[12px] pb-[12px] pl-[15px] pr-[15px] m-[16px_0_22px]">
        {tr("18+ · Databáza obsahuje aj odvážnejšie témy a dvojzmysly.")}
      </div>
    </div>
  );
}
export function TeamScores({
  game,
  compact = false,
}: {
  game: Game;
  compact?: boolean;
}) {
  const { t: tr } = useTranslation();
  return (
    <div
      className={
        compact
          ? "grid gap-[8px]"
          : "flex justify-center flex-wrap gap-[10px] max-[601px]:gap-[7px]"
      }
      aria-label={tr("Skóre tímov")}
    >
      {game.teams.map((t, i) => (
        <div
          key={t.id}
          className={
            compact
              ? "flex items-center gap-[12px] [border-bottom:1px_solid_var(--color-line)] pt-[13px] pb-[13px] pl-[2px] pr-[2px] text-[14px] [&_>_strong]:ml-auto [&_>_strong]:whitespace-nowrap"
              : "flex items-center gap-[9px] [border:1px_solid_var(--color-line)] rounded-[13px] pt-[12px] pb-[12px] pl-[15px] pr-[15px] text-[13px] bg-[#fcfaf5] min-h-[48px] max-w-full [&[data-active=true]]:bg-[color-mix(in_srgb,_var(--team)_8%,_var(--color-paper))] [&[data-active=true]]:border-[color-mix(in_srgb,_var(--team)_30%,_var(--color-paper))] [&_>_strong]:text-[16px] [&_>_strong]:ml-[8px] [&_>_strong]:whitespace-nowrap max-[601px]:pt-[10px] max-[601px]:pb-[10px] max-[601px]:pl-[11px] max-[601px]:pr-[11px] max-[601px]:gap-[7px] max-[601px]:text-[12px] max-[601px]:rounded-[11px] max-[601px]:[flex:1_1_calc(50%_-_7px)] max-[601px]:[&_>_strong]:ml-auto max-[601px]:[&_>_strong]:text-[16px]"
          }
          data-active={i === game.teamIndex && !compact}
          style={{ "--team": t.color } as CSSProperties}
        >
          <span className="inline-block w-[8px] h-[8px] min-w-[8px] rounded-[50%] bg-[var(--team)]" />
          <span className="font-extrabold [overflow-wrap:anywhere]">
            {teamName(t.name, tr)}
          </span>
          <strong>
            {t.score}
            <span className="text-[#796c81] text-[10px] font-semibold max-[601px]:text-[9px]">
              / {game.settings.target}
            </span>
          </strong>
        </div>
      ))}
    </div>
  );
}
