import type { RefObject } from "react";
import type { Action, Game } from "@/lib/game";
import { activityInfo } from "@/lib/words";
export type TurnScreenProps = {
  game: Game;
  team: Game["teams"][number];
  info: (typeof activityInfo)[keyof typeof activityInfo];
  last: Game["history"][number] | undefined;
  allWinners: Game["teams"];
  remaining: number;
  dispatch: (action: Action) => void;
  startTimer: (now: number) => void;
  startNew: () => void;
  apply: (game: Game) => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
};
