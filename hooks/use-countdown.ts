"use client";
import { useEffect, useState } from "react";
// Only the timer screen rerenders at 10 Hz. Clock ticks are never persisted.
export function useCountdown(deadline: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const update = () => setNow(Date.now());
    const interval = window.setInterval(update, 100);
    window.addEventListener("pageshow", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      clearInterval(interval);
      window.removeEventListener("pageshow", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [deadline]);
  return Math.max(0, deadline - now);
}
