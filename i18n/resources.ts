import type { TFunction } from "i18next";
import en from "./locales/en.json";
import sk from "./locales/sk.json";
import { englishPools } from "./words-en";
import {
  activities,
  normalize,
  words,
  type Word,
  type Points,
  type Activity,
  activityInfo,
} from "@/lib/words";
const enWords: Record<string, string> = {};
const skWords: Record<string, string> = {};
for (const activity of activities) {
  for (const points of [3, 4, 5] as Points[]) {
    const source = words.filter(
      (w) => w.activity === activity && w.points === points,
    );
    const translated = englishPools[activity][points].split(/[|\n]/);
    if (source.length !== translated.length)
      throw new Error(`Translation pool mismatch: ${activity}-${points}`);
    source.forEach((word, index) => {
      enWords[normalize(word.text)] = translated[index].trim();
      skWords[normalize(word.text)] = word.text;
    });
  }
}
// Saved turns can contain a prompt from an earlier edition of the database.
enWords[normalize("zvádzanie pri výpadku elektriny")] =
  "seduction during a power outage";
skWords[normalize("zvádzanie pri výpadku elektriny")] =
  "zvádzanie pri výpadku elektriny";
export const resources = {
  en: { translation: en, words: enWords },
  sk: { translation: sk, words: skWords },
};
export function wordText(word: Word | undefined, tr: TFunction) {
  return word
    ? tr(normalize(word.text), { ns: "words", defaultValue: word.text })
    : "";
}
const builtinTeams: Record<string, string> = {
  Purple: "Fialoví",
  Orange: "Oranžoví",
  Men: "Muži",
  Women: "Ženy",
  Fialoví: "Fialoví",
  Oranžoví: "Oranžoví",
  Muži: "Muži",
  Ženy: "Ženy",
};
export function teamName(name: string, tr: TFunction): string {
  if (builtinTeams[name]) return tr(builtinTeams[name]);
  const numbered = /^(?:Tím|Team) (\d+)$/.exec(name);
  return numbered ? tr("teams.number", { number: numbered[1] }) : name;
}
export function localizedActivity(activity: Activity, tr: TFunction) {
  const info = activityInfo[activity];
  return {
    ...info,
    name: tr(info.name),
    short: tr(info.short),
    hint: tr(info.hint),
    instruction: tr(info.instruction),
  };
}
