import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { createGameI18n } from "../i18n/instance";
import {
  resources,
  localizedActivity,
  teamName,
  wordText,
} from "../i18n/resources";
import { words, normalize, activities } from "../lib/words";
import {
  createGame,
  transition,
  serialize,
  COLORS,
  winners,
} from "../lib/game";
import { GameProvider } from "../stores/game-provider";
import { GameScreen } from "../components/game/game-screen";
import { HomeScreen } from "../components/screens/home-screen";
import { SetupScreen } from "../components/screens/setup-screen";
import { Rules } from "../components/game-ui";
import { AppHeader } from "../components/app-header";
import { AppDialogs } from "../components/app-dialogs";
import type { ReactNode } from "react";
const settings = { seconds: 60, target: 30, sound: true, openRounds: true };
const initial = () =>
  createGame(
    [
      { name: "Muži", color: COLORS[0] },
      { name: "Ženy", color: COLORS[1] },
    ],
    settings,
    () => 0.5,
  );
const ref = { current: null };
const noop = () => {};

describe("SK / EN localization", () => {
  test("both UI catalogs have identical keys, nonempty text and matching interpolation", () => {
    expect(Object.keys(resources.en.translation).sort()).toEqual(
      Object.keys(resources.sk.translation).sort(),
    );
    for (const [key, text] of Object.entries(resources.en.translation)) {
      expect(text.trim().length).toBeGreaterThan(0);
      const sk =
        resources.sk.translation[key as keyof typeof resources.sk.translation];
      expect(text.match(/{{\w+}}/g)?.sort() ?? []).toEqual(
        sk.match(/{{\w+}}/g)?.sort() ?? [],
      );
    }
  });
  test("all 450 prompts have explicit translations in both languages, 50 per pool", () => {
    const en = createGameI18n("en"),
      sk = createGameI18n("sk");
    expect(words).toHaveLength(450);
    for (const word of words) {
      const key = normalize(word.text);
      expect(Object.hasOwn(resources.en.words, key)).toBe(true);
      expect(Object.hasOwn(resources.sk.words, key)).toBe(true);
      expect(wordText(word, en.t)).toBe(resources.en.words[key]);
      expect(wordText(word, sk.t)).toBe(word.text);
    }
    for (const activity of activities)
      for (const points of [3, 4, 5])
        expect(
          words.filter((w) => w.activity === activity && w.points === points),
        ).toHaveLength(50);
  });
  test("Slovak plurals, colon keys and interpolation work without falling back", () => {
    const sk = createGameI18n("sk"),
      en = createGameI18n("en");
    expect(
      [1, 2, 3, 4, 5, 0].map((count) => sk.t("pointsUnit", { count })),
    ).toEqual(["bod", "body", "body", "body", "bodov", "bodov"]);
    expect(en.t("points", { count: 1 })).toBe("1 point");
    expect(en.t("points", { count: 5 })).toBe("5 points");
    expect(en.t("Hádajú všetci:")).toBe("Everyone guesses:");
    expect(en.t("game.turn", { turn: 3, round: 2 })).toBe("Turn 3 · Round 2");
    expect(en.t("game.bonus", { team: "Men" })).toContain(
      "team Men earns 2 points",
    );
  });
  test("language changes preserve canonical prompts, used words, scores, history and deadlines", async () => {
    let game = transition(initial(), { type: "choose", points: 5 }, () => 0);
    game = transition(game, { type: "reveal" });
    game = transition(game, { type: "start", now: 1000 });
    const before = serialize(game),
      i18n = createGameI18n("en");
    const english = wordText(game.turn.word, i18n.t);
    await i18n.changeLanguage("sk");
    expect(wordText(game.turn.word, i18n.t)).toBe(game.turn.word!.text);
    expect(english).not.toBe(game.turn.word!.text);
    expect(serialize(game)).toBe(before);
    expect(game.turn.deadline).toBe(61000);
    expect(game.turn.hidden).toBe(true);
    expect(teamName("Muži", i18n.t)).toBe("Muži");
    await i18n.changeLanguage("en");
    expect(teamName("Muži", i18n.t)).toBe("Men");
    expect(teamName("My friends", i18n.t)).toBe("My friends");
    expect(teamName("Tím 3", i18n.t)).toBe("Team 3");
    expect(localizedActivity("pantomima", i18n.t).short).toBe("Act");
  });
  test("provider-local instances never leak a language to another request", async () => {
    const a = createGameI18n(),
      b = createGameI18n();
    await a.changeLanguage("sk");
    expect(a.language).toBe("sk");
    expect(b.language).toBe("en");
  });
  test("all screens render in both languages, with no missing translation lookups", () => {
    for (const language of ["en", "sk"] as const) {
      const i18n = createGameI18n(language);
      const missing: string[] = [];
      i18n.on("missingKey", (_languages, _namespace, key) => missing.push(key));
      void i18n.init({ ...i18n.options, saveMissing: true });
      const render = (child: ReactNode) =>
        renderToStaticMarkup(
          <I18nextProvider i18n={i18n}>
            <GameProvider>{child}</GameProvider>
          </I18nextProvider>,
        );
      expect(
        render(
          <HomeScreen
            game={null}
            setView={noop}
            setModal={noop}
            newButton={noop}
            headingRef={ref}
          />,
        ),
      ).toContain(language === "en" ? "Small game." : "Malá hra.");
      expect(render(<SetupScreen headingRef={ref} />)).toContain(
        language === "en" ? "Who’s playing?" : "Kto je v hre?",
      );
      render(<Rules />);
      render(<AppHeader game={initial()} setView={noop} setModal={noop} />);
      for (const modal of ["rules", "menu", "replace"] as const)
        render(
          <AppDialogs
            game={initial()}
            modal={modal}
            setModal={noop}
            setView={noop}
            dispatch={noop}
            startNew={noop}
            turnLabel=""
          />,
        );
      let game = initial();
      game = { ...game, turn: { ...game.turn, open: true } };
      const screen = () =>
        render(
          <GameScreen
            game={game}
            headingRef={ref}
            turnLabel=""
            setModal={noop}
          />,
        );
      screen();
      game = transition(game, { type: "choose", points: 4 }, () => 0);
      screen();
      game = transition(game, { type: "reveal" });
      screen();
      game = transition(game, { type: "start", now: Date.now() });
      screen();
      game = transition(game, {
        type: "answer",
        correct: true,
        now: Date.now(),
      });
      if (game.phase === "selectWinner") {
        screen();
        game = transition(game, { type: "winner", teamId: game.teams[1].id });
      }
      screen();
      game = {
        ...game,
        teams: game.teams.map((team, index) => ({
          ...team,
          score: index ? 30 : 0,
        })),
        phase: "finished",
      };
      screen();
      expect(winners(game)).toHaveLength(1);
      expect(missing).toEqual([]);
    }
  });
});
