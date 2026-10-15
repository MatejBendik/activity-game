export const activities = ["opis", "kreslenie", "pantomima"] as const;
export type Activity = (typeof activities)[number];
export type Points = 3 | 4 | 5;
export type Word = {
  id: string;
  text: string;
  activity: Activity;
  points: Points;
};
export const activityInfo = {
  opis: {
    name: "Slovný opis",
    short: "Opis",
    instruction: "Opíš slovo. Nepouži jeho koreň ani preklad.",
    hint: "Povedz to po svojom.",
    color: "#8758c8",
  },
  kreslenie: {
    name: "Kreslenie",
    short: "Kreslenie",
    instruction: "Kresli na papier. Bez textu a bez rozprávania.",
    hint: "Jeden obrázok povie viac.",
    color: "#db793b",
  },
  pantomima: {
    name: "Pantomíma",
    short: "Pantomíma",
    instruction: "Predveď zadanie telom. Bez slov a zvukov.",
    hint: "Nechaj hovoriť svoje telo.",
    color: "#2d8a70",
  },
};
// Original Slovak prompts, curated independently for each activity and difficulty.
const pools: Record<Activity, Record<Points, string>> = {
  opis: {
    3: `zubná kefka|chladnička|slnečník|letenka|zmrzlina|vankúš|kľúčenka|výťah|kaderník|vodopád
pizza|hasič|knižnica|diamant|poštár|narodeniny|kufor|dovolenka|snehuliak|mikrovlnka
piráti|šampanské|káva|upír|medové týždne|sused|semafor|polícia|grilovačka|tajomstvo
Harry Potter|Shrek|Titanic|James Bond|Spider-Man|Popoluška|Darth Vader|Mr. Bean|Mikuláš|Santa Claus
rozlúčka so slobodou|prvé rande|podprsenka|kondóm|striptíz|svokra|pyžamo|červené víno|karaoke|kocovina`,
    4: `výpadok elektriny|stratená batožina|svedomie|žiarlivosť|slepé rande|milostný trojuholník|tichá domácnosť|manželská poradňa|platonická láska|výhovorka
alibi|hypotéka|inflácia|výpovedná lehota|predmanželská zmluva|odpočúvanie|dvojitý agent|čierny pasažier|cestovná horúčka|záchranná brzda
Leonardo DiCaprio|Jennifer Aniston|Dwayne Johnson|Taylor Swift|Freddie Mercury|Michael Jackson|Elvis Presley|Jack Sparrow|Homer Simpson|Forrest Gump
zakázané ovocie|ranná opica|falošný úsmev|trápne ticho|nedostatok spánku|syndróm vyhorenia|druhá šanca|kríza stredného veku|tajný ctiteľ|firemný večierok
láska na diaľku|úniková miestnosť|spolujazda|rodinné dedičstvo|virtuálna realita|červený koberec|vianočný zhon|skúška odvahy|dvojzmysel|afrodiziakum`,
    5: `hľadať ihlu v kope sena|robiť z komára somára|nosiť drevo do lesa|mať maslo na hlave|kúpiť mačku vo vreci|hádzať perly sviniam|mať obe ruky ľavé|liať olej do ohňa|chodiť okolo horúcej kaše|zabiť dve muchy jednou ranou
ranné výčitky po firemnom večierku|omylom odoslaná milostná správa|svokra na neohlásenej návšteve|bývalý partner na vlastnej svadbe|rande naslepo s vlastným šéfom|pokazený výťah plný susedov|rodinná hádka pri vianočnom stole|stratený pas pred odletom|tajný vzťah na pracovisku|svadobná noc bez elektriny
pasívne agresívna poznámka|strach z verejného vystupovania|neopätovaná láska z detstva|paradox cestovania v čase|efekt snehovej gule|kolektívna strata krátkodobej pamäti|ilúzia slobodnej vôle|dohoda o mlčanlivosti|syndróm podvodníka|morálna dilema
keď neprší aspoň kvapká|ticho pred búrkou|posledná kvapka trpezlivosti|víťazstvo s horkou príchuťou|príliš veľa kuchárov|pravda vyšla na povrch|v správnom čase na nesprávnom mieste|kostlivec v rodinnej skrini|dôvera na tenkom ľade|sľuby sa sľubujú
návrat do budúcnosti|vlk z Wall Street|Pán prsteňov|večný život bez spomienok|čas sú peniaze|láska prechádza cez žalúdok|účel svätí prostriedky|zakázaná láska dvoch nepriateľov|pomsta chutí najlepšie studená|cesta do pekla dobrými úmyslami`,
  },
  kreslenie: {
    3: `dom|mačka|pes|slnko|mesiac|strom|auto|bicykel|loď|lietadlo
vlak|raketa|srdce|koruna|kľúč|hodiny|okuliare|topánka|dáždnik|gitara
bubon|kaktus|banán|jablko|mrkva|ananás|hamburger|torta|hríb|vajce
ryba|žralok|motýľ|had|slon|žirafa|pavúk|tučniak|zajac|prasa
snehová vločka|hrad|most|stan|sopka|duch|robot|snehuliak na lyžiach|snehová guľa|pivový pohár`,
    4: `svadba|dopravná zápcha|vesmírna stanica|zábavný park|potápač|baletka|zubár|detektív|morská panna|čarodejnica
záchranný čln|maják|veterný mlyn|šikmá veža|lietajúci koberec|poklad na ostrove|satelit|ponorka|lanovka|vodný skúter
rozbité srdce|milostný list|romantická večera|prázdna peňaženka|svadobná kytica|tajný milenec|ráno po párty|bozk pod imelom|nočný klub|izba novomanželov
Batman|Superman|SpongeBob|Olaf|Simba|Yoda|Pinocchio|Aladin|Grinch|Mickey Mouse
bazén na streche|klietka pre vtáky|požiar v kuchyni|pes u veterinára|žena na kolobežke|mačka vo vani|santa v komíne|muž na mesiaci|vianočné trhy|trezor v banke`,
    5: `slon v porceláne|vlk v ovčom rúchu|hlava v oblakoch|čas letí ako voda|láska na prvý pohľad|peniaze nerastú na stromoch|jablko nepadá ďaleko od stromu|ryba smrdí od hlavy|stena má uši|tretie koleso na voze
svadba na opustenom ostrove|pes venčí svojho majiteľa|mačka kradne rybu rybárovi|žralok na nafukovacom kolese|snehuliak na letnej dovolenke|mimozemšťan nakupuje v supermarkete|upír na zubnej prehliadke|princezná opravuje pokazené auto|robot varí romantickú večeru|dinosaurus čaká na autobus
rande uprostred dopravnej zápchy|svokra sleduje novomanželov ďalekohľadom|striptér na rodinnej oslave|milenci ukrytí v skrini|rozvodová hádka o psa|ženích uteká zo svadby|nevesta chytá svadobnú kyticu|záletník uteká cez balkón|bozk cez zavreté okno|policajt na rozlúčke so slobodou
potopená loď plná pokladov|dve tváre jedného človeka|cesta okolo sveta balónom|hasič zachraňuje draka z ohňa|veľryba v malom bazéne|medveď kradne med včelám|pirát hľadá stratenú protézu|astronaut griluje na mesiaci|čarodejník stratil čarovnú paličku|lietadlo pristáva na diaľnici
útek z prísne stráženého väzenia|časovaná bomba v darčeku|strom rastúci cez dom|rebrík vedúci do neba|loď vo fľaši|búrka v pohári vody|človek medzi dvoma ohňami|slepá ulička plná áut|slnko schované za dáždnikom|krokodílie slzy`,
  },
  pantomima: {
    3: `čistenie zubov|varenie polievky|jazda na bicykli|plávanie|lyžovanie|korčuľovanie|beh|skákanie cez švihadlo|zdvíhanie činiek|hranie futbalu
hranie tenisu|hranie golfu|bowling|rybárčenie|venčenie psa|umývanie okien|vysávanie|žehlenie|pranie bielizne|umývanie riadu
čítanie knihy|písanie na počítači|telefonovanie|fotografovanie|šoférovanie|lietajúci vták|spánok|zobúdzanie|kýchanie|štikútanie
opitý človek|bozkávanie|flirtovanie|nanášanie rúžu|obliekanie nohavíc|chôdza na podpätkoch|holenie|česanie|sprchovanie|opaľovanie
gitarista|bubeník|dirigent|čašník|boxer|kovboj|zombie|gorila|kura|žaba`,
    4: `chôdza proti vetru|čakanie na meškajúci autobus|otváranie zaseknutej fľaše|stavanie stanu|výmena pneumatiky|vŕtanie do steny|chytanie komára|sťahovanie chladničky|skladanie nábytku|pečenie palaciniek
pôrod|žiadosť o ruku|žonglovanie|chôdza po lane|jazda na koni|skok padákom|potápanie s prístrojom|horolezectvo|tanec pri tyči|striptíz s hanblivosťou
Jackie Chan|Charlie Chaplin|Cristiano Ronaldo|Usain Bolt|Michael Phelps|Marilyn Monroe|Indiana Jones|Rocky Balboa|Terminátor|Streda Addamsová
žuvačka prilepená na topánke|zabuchnuté dvere|hľadanie okuliarov na hlave|horúci piesok na pláži|stúpanie po pohyblivých schodoch|strach z pavúka|skúšanie tesných šiat|nasadzovanie kontaktných šošoviek|odtrhnutý gombík|zaseknutý zips
prvé stretnutie so svokrou|tajný odchod z rande|ranné hľadanie oblečenia|tanec po priveľa drinkoch|kontrola dychu pred bozkom|masáž chrbta|žehlenie košele na tele|pokus o zvádzanie|schovávanie darčeka|oslava výhry v lotérii`,
    5: `človek sa učí lietať|čašník na rozbúrenej lodi|zlodej v dome plnom lega|opitý kúzelník pred publikom|žonglér na klzkom ľade|astronaut hľadá stratenú rukavicu|potápačovi došiel pod vodou vzduch|upír sa bojí injekcie|superhrdina stratil svoje schopnosti|baletka s nohou v sadre
predstieraný orgazmus|milenecká hádka cez zatvorené okno|rande s veľmi nudným človekom|útek pred žiarlivým manželom|zvádzanie pri výpadku elektriny|bozkávanie počas jazdy autobusom|obliekanie podprsenky jednou rukou|svokra prekazila romantickú chvíľu|striptíz v príliš tesnom oblečení|príchod domov po tajnej párty
operácia počas silného zemetrasenia|varenie s neviditeľnými surovinami|rybár vytiahol obrovskú čižmu|fotograf naháňa neposlušnú žirafu|kaderník strihá spiaceho zákazníka|zubár sa bojí vlastného pacienta|pes učí človeka aportovať|robot prvýkrát ochutnáva citrón|snehuliak sa topí na slnku|pirát tancuje s drevenou nohou
nosiť vodu v deravom vedre|chytať vlastný tieň|potichu kráčať cez vŕzgajúcu podlahu|zápasiť s neposlušným dáždnikom|hrať tenis bez rakety|predstierať prácu pred šéfom|skrývať zívanie počas porady|kradnúť koláč zo zamknutej skrine|pokúšať sa zastaviť kýchnutie|hľadať telefón počas telefonovania
rodič prebaľuje veľmi živé dieťa|človek uviaznutý v točivých dverách|tajný agent prezlečený za upratovačku|modelka na rozbitom móle|žonglovanie s horúcimi zemiakmi|strážiť spiaceho draka|uhýbať neviditeľným laserovým lúčom|naháňať parochňu vo vetre|hrať šach sám so sebou|niesť obrovskú neviditeľnú skriňu`,
  },
};
export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("sk")
    .replace(/[^a-z0-9]/g, "");
export const words: Word[] = activities.flatMap((activity) =>
  ([3, 4, 5] as Points[]).flatMap((points) =>
    pools[activity][points]
      .split(/[|\n]/)
      .map((text, i) => ({
        id: `${activity}-${points}-${i + 1}`,
        text: text.trim(),
        activity,
        points,
      })),
  ),
);
