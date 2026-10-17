"use client";
import { useTranslation } from "react-i18next";

import { Clock3, Trophy } from "lucide-react";
import { TeamScores } from "../game-ui";
import { useGameStore } from "@/stores/game-provider";
import { winners, type Game } from "@/lib/game";
import { localizedActivity } from "@/i18n/resources";
import type { RefObject } from "react";
import type { TurnScreenProps } from "./turn-types";
import { ChooseScreen } from "./choose-screen";
import { HandoffScreen } from "./handoff-screen";
import { RevealScreen } from "./reveal-screen";
import { PlayingScreen } from "./playing-screen";
import { SelectWinnerScreen } from "./select-winner-screen";
import { ResultScreen } from "./result-screen";
import { FinishedScreen } from "./finished-screen";
const phaseScreens = {
  choose: ChooseScreen,
  handoff: HandoffScreen,
  reveal: RevealScreen,
  playing: PlayingScreen,
  selectWinner: SelectWinnerScreen,
  result: ResultScreen,
  finished: FinishedScreen,
};
export function GameScreen({
  game,
  headingRef,
  turnLabel,
  setModal,
}: {
  game: Game;
  headingRef: RefObject<HTMLHeadingElement | null>;
  turnLabel: string;
  setModal: (modal: "rules") => void;
}) {
  const { t: tr } = useTranslation();
  const dispatch = useGameStore((s) => s.dispatch);
  const startNew = useGameStore((s) => s.openSetup);
  const replay = useGameStore((s) => s.replay);
  const phase = game.phase;
  const props: TurnScreenProps = {
    game,
    headingRef,
    dispatch,
    startNew,
    replay,
    startTimer: (now) => dispatch({ type: "start", now }),
    team: game.teams[game.teamIndex],
    info: localizedActivity(game.turn.activity, tr),
    last: game.history.at(-1),
    allWinners: winners(game),
  };
  const Screen = phaseScreens[phase];
  return (
    <main className="w-full max-w-[760px] m-[15px_auto_0] max-[601px]:mt-[5px]">
      <TeamScores game={game} />
      <div className="flex items-center justify-between text-[#796c81] text-[14px] m-[19px_0_0] flex-wrap gap-[8px] leading-[1.5] [&_>_span:last-child]:flex [&_>_span:last-child]:items-center [&_>_span:last-child]:gap-[5px] max-[601px]:mt-[15px] max-[601px]:text-[14px] max-[601px]:flex-wrap max-[601px]:gap-[8px] max-[601px]:leading-[1.5]">
        <span>{turnLabel}</span>
        <span>
          <Trophy size={14} />{" "}
          {tr("game.target", { count: game.settings.target })}
        </span>
      </div>
      <div
        key={`${game.turnNumber}-${phase}`}
        className="text-center max-w-[480px] m-[29px_auto_0] pb-[18px] max-[601px]:mt-[28px] [@media(max-height:750px)_and_(max-width:600px)]:mt-[18px] motion-safe:animate-enter"
      >
        <Screen {...props} />
      </div>
      {phase === "choose" && (
        <div className="flex items-center justify-center gap-[7px] text-[14px] text-[#796c81] m-[10px_auto_10px] flex-wrap leading-[1.5] [&_>_span]:mt-0 [&_>_span]:mb-0 [&_>_span]:ml-[6px] [&_>_span]:mr-[6px] [&_button]:min-h-[48px] [&_button]:pt-[8px] [&_button]:pb-[8px] [&_button]:pl-[2px] [&_button]:pr-[2px] [&_button]:text-[#8e7a9e] [&_button]:[text-decoration:underline] [&_button]:[text-underline-offset:3px] max-[601px]:mt-0 max-[601px]:text-[14px] max-[601px]:flex-wrap max-[601px]:leading-[1.5]">
          <Clock3 size={15} />
          {tr("game.duration", { count: game.settings.seconds })}
          <span>·</span>
          <button onClick={() => setModal("rules")}>
            {tr("Pravidlá hry")}
          </button>
        </div>
      )}
    </main>
  );
}
