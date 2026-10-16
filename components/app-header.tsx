"use client";
import { IconButton } from "./ui/button";

import { CircleHelp, Menu } from "lucide-react";
import type { Game } from "@/lib/game";
export function AppHeader({
  game,
  setView,
  setModal,
}: {
  game: Game | null;
  setView: (view: "home") => void;
  setModal: (m: "rules" | "menu") => void;
}) {
  return (
    <header className="flex items-center justify-between w-full max-w-[1100px] mt-0 mb-0 ml-auto mr-auto h-[108px] shrink-0 max-[601px]:h-[85px] [@media(max-height:750px)_and_(max-width:600px)]:h-[72px]">
      <button
        className="inline-flex items-center gap-[11px] text-[30px] font-black tracking-[-1.4px] max-[601px]:text-[27px] max-[601px]:gap-[9px]"
        onClick={() => setView("home")}
        aria-label="Aktivity — úvod"
      >
        <span className="w-[35px] h-[36px] inline-flex items-center justify-center bg-purple text-[#fffcf4] text-[32px] leading-[1] rounded-[12px_12px_11px_6px] relative [transform:rotate(-8deg)] pb-[5px] [&_>_span]:absolute [&_>_span]:text-[17px] [&_>_span]:text-[#ecb957] [&_>_span]:right-[-8px] [&_>_span]:top-[-9px] max-[601px]:w-[31px] max-[601px]:h-[32px] max-[601px]:text-[29px] max-[601px]:rounded-[10px_10px_10px_5px]">
          a<span>✦</span>
        </span>
        <span>
          aktivity<span className="text-purple">.</span>
        </span>
      </button>
      <div className="flex gap-[10px] items-center max-[601px]:gap-0 max-[601px]:mr-[-9px]">
        <span className="text-[10px] font-extrabold tracking-[1.6px] text-[#8e8593] mr-[15px] [&_span]:ml-[7px] [&_span]:text-[10px] [&_span]:bg-[#ede6dc] [&_span]:rounded-[5px] [&_span]:pt-[4px] [&_span]:pb-[4px] [&_span]:pl-[5px] [&_span]:pr-[5px] [&_span]:tracking-0 max-[601px]:hidden">
          SLOVENSKÁ PÁRTY HRA <span>18+</span>
        </span>
        <IconButton label="Pravidlá hry" onClick={() => setModal("rules")}>
          <CircleHelp size={22} />
        </IconButton>
        {game && (
          <IconButton label="Menu hry" onClick={() => setModal("menu")}>
            <Menu size={23} />
          </IconButton>
        )}
      </div>
    </header>
  );
}
