# Aktivity

Slovenská spoločenská hra pre 2–6 tímov na jednom spoločnom mobile. Opis, kreslenie na papier a pantomíma, vlastné zadania za 3/4/5 bodov a príležitostné otvorené ťahy. Obsah je určený dospelým (18+).

## Lokálny vývoj

Požiadavky: Bun 1.2.22 alebo novší a Node.js 20.9 alebo novší.

```sh
bun install
bun run dev
```

Otvorte http://localhost:3000. Ak už port používa iný projekt:

```sh
bun run dev --port 3001
```

## Kontroly a produkcia

```sh
bun test
bun run typecheck
bun run lint
bun run build
bun run start
```

Používame Next.js 16 App Router, TypeScript, Tailwind CSS 4 cez oficiálny PostCSS plugin a lokálne balené fonty Nunito. `bun.lock` je jediný lockfile. Žiadne premenné prostredia ani externé služby nie sú potrebné.

Na Verceli importujte tento GitHub repozitár, vyberte framework **Next.js**, inštaláciu `bun install --frozen-lockfile` a build `bun run build`. Koreň projektu je koreň repozitára. Nezadávajte vlastný Output Directory.

Oficiálne podklady: [Next.js setup](https://nextjs.org/docs/app/getting-started/installation), [Tailwind s Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs), [Bun a Next.js](https://bun.sh/guides/ecosystem/nextjs).

## Hra

- Predvolené nastavenie: 60 sekúnd, cieľ 40 bodov, otvorené ťahy zapnuté.
- Aktivity sa miešajú v trojiciach bez rovnakých susedných aktivít na hranici trojíc.
- Bodová hodnota sa vyberá pred súkromným odhalením. Náročnosť sa potom nemení.
- Čas sa spúšťa výslovne a zadanie sa pri spustení automaticky skryje. Tlačidlom „Zobraziť zadanie“ sa dá pripomenúť. Zelená fajka vpravo je úspech, červené X vľavo neúspech.
- Úspech musí byť potvrdený **pred** absolútnym časom konca; klik presne na hranici je už neskoro. Po uplynutí času je výsledok automaticky nula, bez možnosti dodatočného pripísania bodov.
- Pri otvorenom ťahu včasná fajka zaznamená úspech a zastaví odpočítavanie. Výber úspešného tímu môže nasledovať neskôr: správny tím dostane hodnotu zadania a pri úspechu súpera dostane predvádzajúci tím 2 body. Krátke zacinkanie zaznie už pri zobrazení banneru na začiatku otvoreného ťahu. Pri spustení času sa neopakuje. Prepínač „Zvuky hry“ ovláda túto zvučku, tiknutia počas posledných piatich sekúnd aj koniec času. Obnovenie stránky zvučku neopakuje. Dva otvorené ťahy nejdú za sebou; každý ostatný vhodný ťah má 20 % šancu.
- Omylom potvrdený úspech možno na obrazovke výsledku odvolať; odstránia sa aj bonusové body. Neúspech nemožno spätne zmeniť na úspech.
- Víťazstvo sa overí po všetkých bodoch z ťahu. Vyššie skóre vyhrá; pri zhode najvyšších skóre nad cieľom je víťazstvo spoločné.

## Ukladanie

Stav spravuje provider-local Zustand store s middleware `persist`, explicitnou hydratáciou po mountnutí a selektormi. Každá herná zmena sa synchronizovane zapisuje do `localStorage` pred vykreslením nového stavu. Ukladá sa celý stav: tímy, poradie, skóre, aktivita, zadanie, použité slová, výsledky, fáza, skrytie aj absolútny čas konca. Záložná kópia pomáha pri poškodení hlavného záznamu. Nový záznam `aktivity.store.v1` obsahuje partiu aj rozpracované nastavenia; `.backup` je jeho synchronizovaná záloha. Pri prvom načítaní sa automaticky importujú pôvodné záznamy `aktivity.game.v1`, jeho záloha a `aktivity.setup.v1`. Pôvodné záznamy zostávajú nedotknuté. Poškodený nový záznam sa obnovuje zo svojej novej zálohy; nikdy sa potichu nevracia na staré skóre z legacy dát.

Obnovenie aj návrat na adresu hry automaticky otvoria poslednú partiu. Žiadne interné prechody nevytvárajú nové URL ani históriu navigácie. Zatvorenie stránky alebo odchod späť z prehliadača stav nemaže. Pri návrate po uplynutí limitu sa ťah vyhodnotí ako neúspešný. Menu ani prepnutie aplikácie čas nepozastavujú.

Úložisko patrí konkrétnemu prehliadaču a webovej adrese. Vymazanie údajov stránky či anonymného profilu môže hru odstrániť. Pri nedostupnom úložisku sa zobrazí upozornenie. Aktívna partia sa nahradí až pri spustení novej hry, nie otvorením nastavení.

## Štruktúra

- `lib/game.ts`: samostatné typy a prechody herného stavu, validácia uloženia, bodovanie.
- `lib/words.ts`: 450 vlastných slovenských zadaní; presne 50 pre každú aktivitu a bodovú hodnotu.
- `stores/`: Zustand store, SSR-safe provider, validované ukladanie a migrácia starých dát.
- `lib/setup.ts`: zdieľané Zod schémy pre rozpracovaný a odoslaný formulár.
- `components/screens/`: úvod a nastavenie hry cez React Hook Form, Zod resolver, `useFieldArray`, `Controller` a odber zmien rozpracovaného formulára.
- `components/game/`: samostatné obrazovky jednotlivých fáz partie.
- `components/ui/`: spoločné tlačidlá, prepínače, segmentované voľby, validačné chyby a herné oznamy. Tailwind triedy sa skladajú cez `clsx` a `tailwind-merge`.
- `hooks/`: samostatný runtime časovača/zvukov a lokálne odpočítavanie, ktoré neprepisuje úložisko pri každom tiknutí.
- `app/globals.css`: iba vstup Tailwindu, téma a animácie; žiadne vlastné CSS selektory rozhrania.
- `tests/`: pravidlá, čas, zvuky, obsah, Zod validácia, migrácia starého úložiska, zálohy, SSR izolácia a obnova stavov.

Bodová náročnosť je redakčný odhad, nezávislý pre jednotlivé aktivity. Automatické testy kontrolujú počty, jedinečnosť v zásobníkoch a neopakovanie normalizovaného textu počas partie. Jemné vyváženie zadaní si vyžiada aj hranie s reálnou skupinou.

Refaktoring vychádza z oficiálnych dokumentácií: [Zustand pre Next.js](https://zustand.docs.pmnd.rs/learn/guides/nextjs), [Zustand persist](https://zustand.docs.pmnd.rs/reference/middlewares/persist), [React Hook Form Zod resolver](https://github.com/react-hook-form/resolvers#zod) a [Zod](https://zod.dev/).
