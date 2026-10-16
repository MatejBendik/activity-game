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
Harry Potter|Shrek|Titanic|Spider-Man|Popoluška|Mr. Bean|Mikuláš|budík|župan|fotka
rozlúčka so slobodou|prvé rande|podprsenka|kondóm|striptíz|svokra|pyžamo|červené víno|karaoke|kocovina`,
    4: `výpadok elektriny|stratená batožina|svedomie|žiarlivosť|slepé rande|milostný trojuholník|tichá domácnosť|manželská poradňa|platonická láska|výhovorka
alibi|hypotéka|inflácia|výpovedná lehota|predmanželská zmluva|odpočúvanie|dvojitý agent|čierny pasažier|cestovná horúčka|záchranná brzda
Leonardo DiCaprio|Jennifer Aniston|Dwayne Johnson|Taylor Swift|Freddie Mercury|Michael Jackson|Elvis Presley|Jack Sparrow|Homer Simpson|Forrest Gump
zakázané ovocie|ranná opica|falošný úsmev|trápne ticho|nedostatok spánku|syndróm vyhorenia|druhá šanca|kríza stredného veku|tajný ctiteľ|firemný večierok
láska na diaľku|úniková miestnosť|spolujazda|rodinné dedičstvo|virtuálna realita|červený koberec|vianočný zhon|skúška odvahy|dvojzmysel|afrodiziakum`,
    5: `hľadať ihlu v kope sena|robiť z komára somára|nosiť drevo do lesa|mať maslo na hlave|kúpiť mačku vo vreci|hádzať perly sviniam|mať obe ruky ľavé|liať olej do ohňa|chodiť okolo horúcej kaše|zabiť dve muchy jednou ranou
ranné výčitky po firemnom večierku|omylom odoslaná milostná správa|svokra na neohlásenej návšteve|bývalý partner na vlastnej svadbe|rande naslepo s vlastným šéfom|pokazený výťah plný susedov|rodinná hádka pri vianočnom stole|stratený pas pred odletom|tajný vzťah na pracovisku|svadobná noc bez elektriny
pasívne agresívna poznámka|strach z verejného vystupovania|neopätovaná láska z detstva|paradox cestovania v čase|efekt snehovej gule|kolektívna strata krátkodobej pamäti|ilúzia slobodnej vôle|dohoda o mlčanlivosti|syndróm podvodníka|morálna dilema
keď neprší aspoň kvapká|ticho pred búrkou|posledná kvapka trpezlivosti|víťazstvo s horkou príchuťou|príliš veľa kuchárov|pravda vyšla na povrch|v správnom čase na správnom mieste|kostlivec v rodinnej skrini|dôvera na tenkom ľade|sľuby sa sľubujú
návrat do budúcnosti|vlk z Wall Street|Pán prsteňov|večný život bez spomienok|čas sú peniaze|láska prechádza cez žalúdok|účel svätí prostriedky|zakázaná láska dvoch nepriateľov|pomsta chutí najlepšie studená|cesta do pekla dobrými úmyslami`,
  },
  kreslenie: {
    3: `dom|mačka|pes|slnko|mesiac|strom|auto|bicykel|loď|lietadlo
vlak|raketa|srdce|koruna|kľúč|hodiny|okuliare|topánka|dáždnik|gitara
bubon|kaktus|banán|jablko|mrkva|ananás|hamburger|torta|hríb|vajce
ryba|žralok|motýľ|had|slon|žirafa|pavúk|tučniak|zajac|prasa
snehová vločka|hrad|most|stan|sopka|duch|robot|snehuliak na lyžiach|snehová guľa|pivový pohár`,
    4: `svadba|potápač|baletka|zubár|detektív|čarodejnica|maják|satelit|ponorka|lanovka
Batman|Aladin|Grinch|akordeón|ďalekohľad|kolotoč|fontána|labyrint|kompas|padák
traktor|vrtuľník|sanitka|mikroskop|teplomer|pavučina|včelár|astronaut|kormidlo|skleník
šachovnica|korčule|vodník|jednorožec|ježibaba|kominár|mušľa|chobotnica|pyramída|Mickey Mouse
dopravná zápcha|vesmírna stanica|morská panna|záchranný čln|veterný mlyn|rozbité srdce|milostný list|svadobná kytica|nočný klub|vianočné trhy`,
    5: `snehuliak na pláži|pes v lietadle|mačka hrá klavír|žralok vo vani|slon na bicykli|prasa v balóne|robot varí večeru|dinosaurus v autobuse|upír u zubára|pirát na lyžiach
svadba na ostrove|rande pod dáždnikom|milenci v skrini|ženích na úteku|nevesta na motorke|bozk cez okno|striptér na oslave|srdce zo zlata|láska cez internet|svokra za dverami
loď vo fľaši|búrka v pohári|dom na strome|rebrík do neba|poklad pod morom|hrad z piesku|stan na streche|vlak bez koľají|auto pod vodou|lietajúca posteľ
hasič hasí draka|medveď kradne med|čarodejnica na vysávači|astronaut venčí psa|rybár chytá čižmu|krokodíl čistí zuby|žirafa nosí šál|tučniak predáva zmrzlinu|klaun v ponorke|zajac varí mrkvu
pes naháňa poštára|slnko nosí okuliare|mačka chytá motýľa|ovečka skáče plot|mimozemšťan kupuje pizzu|ryba hrá futbal|včela nesie dáždnik|princezná riadi traktor|sova číta knihu|zlodej kradne tortu`,
  },
  pantomima: {
    3: `čistenie zubov|varenie polievky|jazda na bicykli|plávanie|lyžovanie|korčuľovanie|beh|skákanie cez švihadlo|zdvíhanie činiek|hranie futbalu
hranie tenisu|hranie golfu|bowling|rybárčenie|venčenie psa|umývanie okien|vysávanie|žehlenie|pranie bielizne|umývanie riadu
čítanie knihy|písanie na počítači|telefonovanie|fotografovanie|šoférovanie|lietajúci vták|spánok|zobúdzanie|kýchanie|štikútanie
opitý človek|bozkávanie|flirtovanie|nanášanie rúžu|obliekanie nohavíc|chôdza na podpätkoch|holenie|česanie|sprchovanie|opaľovanie
gitarista|bubeník|dirigent|čašník|boxer|kovboj|zombie|gorila|kura|žaba`,
    4: `žonglovanie|horolezectvo|pôrod|krasokorčuľovanie|veslovanie|šermovanie|lukostreľba|surfovanie|šnorchlovanie|potápanie
kosenie|rúbanie|zametanie|maľovanie|štrikovanie|vyšívanie|miesenie|šúpanie|odšťavovanie|dojenie
koketovanie|zvádzanie|žiarlenie|hanbenie|chvastanie|špehovanie|odpočúvanie|dirigovanie|modelkovanie|čarovanie
kŕč|námestníčnosť|zimnica|pálenie záhy|bolesť chrbta|skok padákom|výmena pneumatiky|chytanie komára|pečenie palaciniek|zaseknutý zips
Jackie Chan|Charlie Chaplin|Cristiano Ronaldo|Usain Bolt|Michael Phelps|Marilyn Monroe|Indiana Jones|Rocky Balboa|Terminátor|Streda Addamsová`,
    5: `opitý čašník|slepý fotograf|ospalý boxer|hanblivý striptér|nervózny ženích|žiarlivá partnerka|lenivý upratovač|prekvapený zlodej|premrznutý plavčík|zábudlivý kúzelník
chôdza po ľade|beh v podpätkoch|plávanie proti prúdu|tanec s metlou|varenie bez rúk|skákanie vo vreci|spievanie v sprche|spánok v autobuse|líčenie vo vlaku|jedenie horúcej polievky
hľadanie strateného prsteňa|otváranie zaseknutého dáždnika|naháňanie uleteného klobúka|nosenie ťažkej skrine|vyťahovanie tesných nohavíc|obúvanie malých topánok|chytanie myši rukami|prenášanie horúceho hrnca|tajné jedenie čokolády|schovávanie milostného listu
prvé rande naslepo|bozkávanie cez sklo|útek pred svokrou|predstieraný orgazmus|zvádzanie na diskotéke|masáž šteklivého človeka|rozopínanie zaseknutej podprsenky|tancovanie s partnerom|žiadanie o ruku|odmietnutie nechceného bozku
robot sa učí tancovať|upír pije horúci čaj|kovboj chytá divokého koňa|baletka nesie ťažký kufor|pirát hľadá skrytý poklad|kaderník strihá spiaceho zákazníka|pes si naháňa chvost|rybár vyťahuje veľkú rybu|človek prehltol kyslý citrón|futbalista predstiera zranenie`,
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
    pools[activity][points].split(/[|\n]/).map((text, i) => ({
      id: `${activity}-${points}-${i + 1}`,
      text: text.trim(),
      activity,
      points,
    })),
  ),
);
