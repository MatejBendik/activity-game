"use client";
import { useEffect, useRef } from "react";
import { AppHeader } from "./app-header";
import { AppDialogs } from "./app-dialogs";
import { HomeScreen } from "./screens/home-screen";
import { SetupScreen } from "./screens/setup-screen";
import { GameScreen } from "./game/game-screen";
import { GameProvider, useGameStore } from "@/stores/game-provider";
import { useGameRuntime } from "@/hooks/use-game-runtime";

function GameApp() {
  const game = useGameStore((s) => s.game);
  const ready = useGameStore((s) => s.ready);
  const view = useGameStore((s) => s.view);
  const modal = useGameStore((s) => s.modal);
  const storageError = useGameStore((s) => s.storageError);
  const setView = useGameStore((s) => s.setView);
  const setModal = useGameStore((s) => s.setModal);
  const newButton = useGameStore((s) => s.requestNewGame);
  const startNew = useGameStore((s) => s.openSetup);
  const dispatch = useGameStore((s) => s.dispatch);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useGameRuntime();
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [view, game?.phase, game?.turnNumber]);
  const turnLabel = game
    ? `Ťah ${game.turnNumber} · ${Math.floor((game.turnNumber - 1) / game.teams.length) + 1}. kolo`
    : "";
  return (
    <div className="min-h-[100svh] flex flex-col pt-0 pb-0 pl-[36px] pr-[36px] max-[601px]:pt-0 max-[601px]:pb-0 max-[601px]:pl-[22px] max-[601px]:pr-[22px] max-[361px]:pt-0 max-[361px]:pb-0 max-[361px]:pl-[16px] max-[361px]:pr-[16px]">
      <AppHeader game={game} setView={setView} setModal={setModal} />
      {storageError && (
        <div
          className="text-[13px] rounded-[12px] bg-[#f6e4c9] text-[#945f28] pt-[14px] pb-[14px] pl-[18px] pr-[18px] max-w-[760px] m-[0_auto_16px] w-full"
          role="alert"
        >
          {storageError}
        </div>
      )}
      {!ready ? (
        <main className="min-h-[60svh] flex items-center justify-center gap-[12px] font-extrabold text-[#9b85ac]">
          <span className="w-[10px] h-[10px] rounded-[50%] bg-purple motion-safe:animate-soft-pulse" />
          Pripravujeme hru…
        </main>
      ) : (
        <>
          {view === "home" && (
            <HomeScreen
              game={game}
              setView={setView}
              setModal={setModal}
              newButton={newButton}
              headingRef={headingRef}
            />
          )}
          {view === "setup" && <SetupScreen headingRef={headingRef} />}
          {view === "game" && game && (
            <GameScreen
              game={game}
              headingRef={headingRef}
              turnLabel={turnLabel}
              setModal={setModal}
            />
          )}
        </>
      )}
      <AppDialogs
        game={game}
        modal={modal}
        setModal={setModal}
        setView={setView}
        dispatch={dispatch}
        startNew={startNew}
        turnLabel={turnLabel}
      />
    </div>
  );
}
export default function ActivityGame() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}
