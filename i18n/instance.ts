import { createInstance } from "i18next";
import { resources } from "./resources";
export function createGameI18n(language: "en" | "sk" = "en") {
  const instance = createInstance();
  void instance.init({
    resources,
    lng: language,
    fallbackLng: "en",
    supportedLngs: ["en", "sk"],
    keySeparator: false,
    nsSeparator: false,
    initAsync: false,
    interpolation: { escapeValue: false },
  });
  return instance;
}
