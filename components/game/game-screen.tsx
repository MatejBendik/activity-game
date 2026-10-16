"use client";
import { Clock3, Trophy } from "lucide-react";
import { TeamScores } from "../game-ui";
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
export function GameScreen(
  props: TurnScreenProps & {
    turnLabel: string;
    setModal: (modal: "rules") => void;
  },
) {
  const { game, turnLabel, setModal } = props;
  const phase = game.phase;
  return (
    <main className={`game-view ${phase === "playing" ? "is-playing" : ""}`}>
      <TeamScores game={game} />
      <div className="game-meta">
        <span>{turnLabel}</span>
        <span>
          <Trophy size={14} />
          Cieľ {game.settings.target} bodov
        </span>
      </div>
      <div key={`${game.turnNumber}-${phase}`} className="turn-content enter">
        {(() => {
          const Screen = phaseScreens[game.phase];
          return <Screen {...props} />;
        })()}
      </div>
      {phase === "choose" && (
        <div className="game-bottom">
          <Clock3 size={15} />
          {game.settings.seconds} sekúnd na zadanie<span>·</span>
          <button onClick={() => setModal("rules")}>Pravidlá hry</button>
        </div>
      )}
    </main>
  );
}
