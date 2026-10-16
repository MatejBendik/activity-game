"use client";
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
    <header className="app-header">
      <button
        className="brand"
        onClick={() => setView("home")}
        aria-label="Aktivity — úvod"
      >
        <span className="brand-mark">
          a<span>✦</span>
        </span>
        <span>
          aktivity<span className="brand-period">.</span>
        </span>
      </button>
      <div className="header-actions">
        <span className="edition">
          SLOVENSKÁ PÁRTY HRA <span>18+</span>
        </span>
        <button
          className="icon-button"
          aria-label="Pravidlá hry"
          onClick={() => setModal("rules")}
        >
          <CircleHelp size={22} />
        </button>
        {game && (
          <button
            className="icon-button"
            aria-label="Menu hry"
            onClick={() => setModal("menu")}
          >
            <Menu size={23} />
          </button>
        )}
      </div>
    </header>
  );
}
