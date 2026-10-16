"use client";
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
    <main className="home-view enter">
      <div className="eyebrow">
        <span /> Jeden mobil. Celá partia.
      </div>
      <h1 className="hero-title" ref={headingRef} tabIndex={-1}>
        Malá hra.
        <br />
        <span>Veľké zážitky.</span>
        <svg viewBox="0 0 350 15" aria-hidden="true">
          <path d="M5 9Q150-3 344 7" />
        </svg>
      </h1>
      <p className="hero-description">
        Opisuj, kresli, predvádzaj.
        <br className="mobile-break" /> A hlavne sa spolu dobre bavte.
      </p>
      <Illustration activity="party" className="hero-art" />
      <div className="home-cta">
        {game && game.phase !== "finished" && (
          <button className="button primary" onClick={() => setView("game")}>
            <Play size={20} fill="currentColor" />
            Pokračovať v hre
            <ArrowRight size={21} />
          </button>
        )}
        <button
          className={`button ${game && game.phase !== "finished" ? "secondary" : "primary"}`}
          onClick={newButton}
        >
          {game && game.phase !== "finished" ? "Nová hra" : "Poďme sa hrať"}
          <ArrowRight size={21} />
        </button>
      </div>
      <div className="home-facts">
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
      <div className="activity-preview">
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
      <button className="text-button how-to" onClick={() => setModal("rules")}>
        Ako sa to hrá?
        <ChevronRight size={16} />
      </button>
    </main>
  );
}
