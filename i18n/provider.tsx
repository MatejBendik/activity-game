"use client";
import { createGameI18n } from "./instance";
import { I18nextProvider } from "react-i18next";
import { useEffect, useState, type ReactNode } from "react";
export const LANGUAGE_KEY = "aktivity.language.v1";
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [i18n] = useState(() => createGameI18n());
  useEffect(() => {
    const update = () => {
      document.documentElement.lang = i18n.language;
      document.title = i18n.t("meta.title");
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute("content", i18n.t("meta.description"));
      try {
        localStorage.setItem(LANGUAGE_KEY, i18n.language);
      } catch {
        /* Language changes remain usable when storage is unavailable. */
      }
    };
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(LANGUAGE_KEY);
    } catch {
      /* Use English by default. */
    }
    i18n.on("languageChanged", update);
    if (saved === "sk" || saved === "en") void i18n.changeLanguage(saved);
    else update();
    return () => {
      i18n.off("languageChanged", update);
    };
  }, [i18n]);
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
