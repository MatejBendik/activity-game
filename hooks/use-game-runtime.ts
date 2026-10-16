"use client";
import { useEffect } from "react";
import { useGameStoreApi } from "@/stores/game-provider";
import { countdownSecond, playCue, type SoundCue } from "@/lib/sound";

// Audio and the deadline live outside rendering; the store remains serializable.
export function useGameRuntime() {
  const store = useGameStoreApi();
  useEffect(() => {
    let audio: AudioContext | null = null;
    let deadline: number | undefined;
    let previousSecond = 6;
    const prepareAudio = () => {
      try {
        if (
          (!audio || audio.state === "closed") &&
          typeof AudioContext !== "undefined"
        )
          audio = new AudioContext();
        void audio?.resume().catch(() => {});
      } catch {
        /* Audio failure never blocks gameplay. */
      }
    };
    const play = (cue: SoundCue, second = 5) => {
      void playCue(
        audio,
        store.getState().game?.settings.sound ?? false,
        cue,
        second,
      );
    };
    const unlockAudio = () => {
      if (store.getState().game?.settings.sound) prepareAudio();
    };
    const unsubscribe = store.subscribe((state, previous) => {
      const game = state.game;
      if (!state.ready || !previous.ready || !game || game === previous.game)
        return;
      if (
        game.phase === "choose" &&
        game.turn.open &&
        game.turn !== previous.game?.turn &&
        game.settings.sound
      ) {
        prepareAudio();
        play("everyone");
      }
      if (
        game.phase === "playing" &&
        previous.game?.phase === "reveal" &&
        game.settings.sound
      )
        prepareAudio();
      if (
        game.phase === "result" &&
        game.turn.expired &&
        previous.game?.phase === "playing"
      )
        play("timeUp");
    });
    const tick = () => {
      const game = store.getState().game;
      if (game?.phase !== "playing" || !game.turn.deadline) return;
      if (deadline !== game.turn.deadline) {
        deadline = game.turn.deadline;
        previousSecond = 6;
      }
      const now = Date.now();
      if (now >= deadline) {
        store.getState().dispatch({ type: "expire", now });
        return;
      }
      const second = countdownSecond(deadline, now, previousSecond);
      if (second !== null) {
        previousSecond = second;
        if (document.visibilityState === "visible") play("countdown", second);
      }
    };
    const interval = window.setInterval(tick, 100);
    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("pageshow", tick);
    document.addEventListener("visibilitychange", tick);
    return () => {
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("pageshow", tick);
      document.removeEventListener("visibilitychange", tick);
      if (audio && audio.state !== "closed") void audio.close().catch(() => {});
    };
  }, [store]);
}
