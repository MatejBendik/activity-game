"use client";
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
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={title}
    >
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-black">{title}</h2>
        <button className="icon-button" aria-label="Zavrieť" onClick={onClose}>
          <X size={22} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Rules() {
  return (
    <div className="rules space-y-5">
      <p>
        Rozdeľte sa do 2 až 6 tímov. Predvádzajúci si prevezme mobil a vyberie
        náročnosť. Ostatní sa na zadanie nepozerajú.
      </p>
      {activities.map((a) => {
        const Icon = activityIcons[a];
        return (
          <div key={a} className="flex gap-4">
            <span
              className="rule-icon"
              style={{ color: activityInfo[a].color }}
            >
              <Icon size={24} />
            </span>
            <div>
              <h3 className="font-extrabold">{activityInfo[a].name}</h3>
              <p>{activityInfo[a].instruction}</p>
            </div>
          </div>
        );
      })}
      <p>
        <strong>3, 4 alebo 5 bodov.</strong> Čím viac bodov, tým väčšia výzva.
        Jedno zadanie na ťah. Kreslí sa na papier, ktorý si pripravte spolu s
        perom.
      </p>
      <p>
        <strong>Odpoveď potvrďte pred koncom času.</strong> Zelená fajka znamená
        uhádnuté, červené X neúspech. Po limite sú body automaticky nulové.
      </p>
      <p>
        <strong>Hádajú všetci:</strong> úspešný tím získa hodnotu zadania. Ak
        uhádne súper, predvádzajúci tím dostane 2 body navyše. Otvorené ťahy
        majú 20 % šancu a nejdú dva za sebou.
      </p>
      <p>
        Vyhráva najvyššie skóre po dosiahnutí cieľa. Pri rovnakom najvyššom
        skóre je víťazstvo spoločné. Pri ďalšom ťahu vymeňte predvádzajúceho.
      </p>
      <div className="adult-note">
        18+ · Databáza obsahuje aj odvážnejšie témy a dvojzmysly.
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
  return (
    <div
      className={compact ? "score-list" : "scoreboard"}
      aria-label="Skóre tímov"
    >
      {game.teams.map((t, i) => (
        <div
          key={t.id}
          className={`${compact ? "score-row" : "score-chip"} ${i === game.teamIndex && !compact ? "active" : ""}`}
          style={{ "--team": t.color } as CSSProperties}
        >
          <span className="team-dot" />
          <span className="team-name">{t.name}</span>
          <strong>
            {t.score}
            <span className="score-target"> / {game.settings.target}</span>
          </strong>
        </div>
      ))}
    </div>
  );
}
