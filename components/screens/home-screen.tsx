"use client";
import { Eyebrow } from "../ui/eyebrow";

import { Button } from "../ui/button";

import {
  MessageCircle,
  Pencil,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Clock3,
  Play,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { RefObject } from "react";
import type { Game } from "@/lib/game";
import { activities, activityInfo } from "@/lib/words";
import { Illustration } from "../illustration";
const activityIcons = {
  opis: MessageCircle,
  kreslenie: Pencil,
  pantomima: Sparkles,
};
export function HomeScreen({
  game,
  setView,
  setModal,
  newButton,
  headingRef,
}: {
  game: Game | null;
  setView: (v: "game") => void;
  setModal: (v: "rules") => void;
  newButton: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <main className="text-center max-w-[800px] w-full m-[28px_auto_10px] [&_>_[data-slot=eyebrow]]:tracking-[0.8px] [&_>_[data-slot=eyebrow]]:text-[12px] [&_>_[data-slot=eyebrow]]:text-[#8b7c91] max-[601px]:mt-[25px] motion-safe:animate-enter">
      <Eyebrow>
        <span /> Jeden mobil. Celá partia.
      </Eyebrow>
      <h1
        className="text-[clamp(48px,_6.3vw,_72px)] font-black leading-[1.06] tracking-[-3.6px] m-[22px_0_24px] relative [&_>_span]:text-purple [&_>_svg]:absolute [&_>_svg]:w-[305px] [&_>_svg]:left-[50%] [&_>_svg]:[transform:translateX(-50%)] [&_>_svg]:bottom-[-13px] [&_>_svg]:h-[13px] [&_>_svg_path]:stroke-[#dfb75b] [&_>_svg_path]:stroke-[5] [&_>_svg_path]:fill-none [&_>_svg_path]:[stroke-linecap:round] max-[601px]:text-[48px] max-[601px]:tracking-[-2.4px] max-[601px]:mt-[20px] max-[601px]:[&_>_svg]:w-[265px] max-[361px]:text-[43px]"
        ref={headingRef}
        tabIndex={-1}
      >
        Malá hra.
        <br />
        <span>Veľké zážitky.</span>
        <svg viewBox="0 0 350 15" aria-hidden="true">
          <path d="M5 9Q150-3 344 7" />
        </svg>
      </h1>
      <p className="text-[#847b89] leading-[1.6] text-[17px] m-[26px_0_0] max-[601px]:text-[15px] max-[601px]:leading-[1.65]">
        Opisuj, kresli, predvádzaj.
        <br className="hidden max-[601px]:[display:initial]" /> A hlavne sa
        spolu dobre bavte.
      </p>
      <Illustration
        activity="party"
        className="w-[310px] h-[213px] m-[4px_auto_12px] motion-safe:animate-float-in max-[601px]:w-[280px] max-[601px]:h-[193px] max-[601px]:mt-[7px] max-[601px]:mb-[15px]"
      />
      <div className="w-[min(100%,_330px)] mt-0 mb-0 ml-auto mr-auto grid gap-[12px]">
        {game && game.phase !== "finished" && (
          <Button onClick={() => setView("game")}>
            <Play size={20} fill="currentColor" />
            Pokračovať v hre
            <ArrowRight size={21} />
          </Button>
        )}
        <Button
          variant={game && game.phase !== "finished" ? "secondary" : "primary"}
          onClick={newButton}
        >
          {game && game.phase !== "finished" ? "Nová hra" : "Poďme sa hrať"}
          <ArrowRight size={21} />
        </Button>
      </div>
      <div className="flex justify-center items-center flex-wrap gap-[22px] m-[27px_0_0] text-[12px] text-[#918694] [&_>_span]:flex [&_>_span]:items-center [&_>_span]:gap-[6px] max-[601px]:gap-[14px] max-[601px]:text-[10px] max-[601px]:mt-[25px] max-[601px]:[&_svg]:w-[14px] max-[361px]:gap-[9px]">
        <span>
          <Users size={17} />
          2–6 tímov
        </span>
        <span>
          <Clock3 size={17} />
          Vlastné tempo
        </span>
        <span>
          <ShieldCheck size={17} />
          Bez registrácie
        </span>
      </div>
      <div className="flex justify-center gap-[40px] m-[40px_auto_0] pt-[26px] [border-top:1px_solid_var(--color-line)] w-fit font-extrabold text-[13px] [&_>_span]:flex [&_>_span]:gap-[8px] [&_>_span]:items-center max-[601px]:text-[12px] max-[601px]:gap-[22px] max-[601px]:mt-[29px] max-[601px]:pt-[24px] max-[601px]:[&_>_span]:gap-[5px] max-[601px]:[&_svg]:w-[17px] max-[361px]:gap-[15px]">
        {activities.map((a) => {
          const Icon = activityIcons[a];
          return (
            <span key={a} style={{ color: activityInfo[a].color }}>
              <Icon size={19} />
              {activityInfo[a].short}
            </span>
          );
        })}
      </div>
      <Button
        variant="text"
        className="mt-[12px]"
        onClick={() => setModal("rules")}
      >
        Ako sa to hrá?
        <ChevronRight size={16} />
      </Button>
    </main>
  );
}
