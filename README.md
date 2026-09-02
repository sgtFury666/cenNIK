# Cenník

Osobný sledovač cien potravín a drogérie. Zapisuješ ceny z regálu, appka si ich pamätá a pri ďalšom nákupe ti povie, či sa dnešná cena oplatí — a či nie je vedľa na regáli iná značka výhodnejšia.

Jediný HTML súbor. Beží v prehliadači, funguje offline, dáta sú tvoje.

---

## Čo rieši

Letákové agregátory ti ukážu aktuálnu akciu. Nepovedia ti, či je 4,29 € za tvoj šampón dobrá cena, lebo nepoznajú tvoju históriu ani tvoj nákupný kôš. Cenník áno.

- **Je toto teraz dobrá cena?** Porovná cenu s tvojou vlastnou históriou za posledný rok a povie *Ber zásobu / Bežná cena / Počkaj*.
- **Ktorá značka je najvýhodnejšia?** Zoradí všetky značky v rámci artikla podľa ceny za kilo, liter alebo kus.
- **Oplatí sa prémiová značka?** Uvidíš rozdiel v percentách namiesto hádania.
- **Zmenšilo sa balenie?** Keďže sa všetko počíta na jednotkovú cenu, shrinkflation vyskočí sám.

---

## Ako to funguje

### Dátový model

Tri úrovne, bez ktorých sa nedá porovnávať:

| Úroveň | Čo to je | Príklad |
|---|---|---|
| **Artikel** | čo porovnávaš naprieč značkami | Šampón na vlasy |
| **Produkt** | konkrétny SKU so značkou, balením a EAN | Head & Shoulders Classic Clean 400 ml |
| **Zápis ceny** | jedna cena, jeden obchod, jeden dátum | 4,29 € · Lidl · 15. 3. 2026 · akcia |

Ceny sa neprepisujú, iba pribúdajú. História je celý zmysel appky.

### Jednotková cena

Ukladá sa cena a veľkosť balenia, nie „cena za kilo". Prepočet robí appka, inak by ti výsledky rozbili 1,5 l fľaše a 6-packy.

- gramy → €/kg
- mililitre → €/l
- kusy → €/ks

### Verdikt

Aktuálna jednotková cena sa porovná s ostatnými zápismi za posledných 12 mesiacov:

| Percentil | Verdikt |
|---|---|
| ≤ 25 % | **Ber zásobu** |
| 25–60 % | **Bežná cena** |
| > 60 % | **Počkaj** |

Pod tri zápisy appka nehodnotí a povie *Zbieram dáta* — dva porovnávacie body dávajú percentil 0, 50 alebo 100, čo je na rozhodovanie málo. Pri troch až šiestich hlási *slabý signál*.

Zápisy staršie ako rok sa do hodnotenia nerátajú, ale appka to napíše, aby si nehádal, prečo sa počítadlo nehýbe.

Akciové ceny sa označujú zvlášť, takže vieš aj *„bežne stojí X, najlepšia akcia bola Y"*.

---

## Nasadenie

### 1. Repozitár

Vytvor **verejný** repozitár a nahraj doň:

```
index.html
sw.js
```

Verejný musí byť preto, že GitHub Pages zo súkromného repozitára vyžaduje platený plán. Nevadí to — v súbore nie sú žiadne dáta ani prístupové kľúče.

### 2. GitHub Pages

**Settings → Pages → Deploy from a branch → `main` / `(root)` → Save**

O minútu dostaneš adresu `https://tvojmeno.github.io/cennik/`.

### 3. iPhone

Otvor adresu v Safari → **Zdieľať → Pridať na plochu**.

Tento krok nie je kozmetický. Safari maže dáta stránok, ktoré 7 dní nepoužiješ; nainštalovanej web appke nie.

### 4. Počítač

Otvor tú istú adresu a nechaj si ju v záložkách.

> **Adresa sa už nesmie meniť.** Lokálne dáta sú viazané na doménu. Presun appky inam ju uvidí ako prázdnu.

---

## Synchronizácia

Voliteľná. Bez nej appka funguje, len sú dáta v jednom zariadení.

Telefón aj počítač zapisujú nezávisle do vlastnej lokálnej kópie. Pri synchronizácii sa stiahne vzdialená verzia a obe sa **zlúčia po jednotlivých záznamoch** — pri každom vyhrá ten s novším časom zmeny. Žiadne zariadenie neprepíše prácu toho druhého.

Zmazané záznamy zanechávajú značku, takže sa nevrátia z druhého zariadenia späť.

### Nastavenie

1. `github.com/settings/tokens` → **Generate new token (classic)**
2. Zaškrtni **iba `gist`**. Fine-grained tokeny gisty zatiaľ nepodporujú.
3. Expirácia: odporúčam **1 rok**. Kratšia znamená prelepovať token na oboch zariadeniach, čo je presne ten druh údržby, po ktorej sa appka prestane používať.
4. V appke klikni na stavovú bodku v hlavičke → vlož token → **Prepoj zariadenie**

Úložisko si appka vytvorí sama. Na druhom zariadení vlož ten istý token — existujúce úložisko si nájde podľa názvu súboru, nič neprepisuješ ručne.

### Kedy sa synchronizuje

Pri otvorení appky, ~3 sekundy po každom zápise, pri návrate z pozadia, po obnovení siete a raz za 5 minút.

Stavová bodka v hlavičke: **Aktuálne / Sync… / Offline / Chyba**.

### Keď token vyprší

Dáta sa nestratia — úložisko patrí tvojmu účtu, nie tokenu. Synchronizácia sa len zastaví a bodka sčervenie. Vygeneruj nový token, v appke daj **Odpojiť** a vlož ho. Úložisko sa nájde a všetko dobehne.

---

## Dávkový import

**Dáta → Import → Dávkovo z textu.** Súbor alebo text vlepený priamo do poľa.

Povinné sú len `artikel` a `cena`. Ostatné stĺpce môžeš vynechať.

| Stĺpec | Poznámka |
|---|---|
| `artikel` | **povinný** — spojí konkurenčné značky |
| `cena` | **povinný** — čiarka aj bodka |
| `kategoria` | Potraviny, Drogéria… |
| `znacka` | |
| `variant` | |
| `balenie` | číslo |
| `jednotka` | `g`, `ml`, `ks` |
| `obchod` | |
| `datum` | `15.3.2026`, `20.3.26` aj `2026-03-15`; prázdne = dnes |
| `akcia` | `ano` / `1` / `x` |
| `ean` | slúži aj na napojenie na existujúci produkt |
| `poznamka` | |

Stĺpce oddeľ **bodkočiarkou** alebo tabulátorom. Čiarka sa bije s desatinnou čiarkou v cenách — appka ju berie až vtedy, keď nič iné nenájde.

```csv
artikel;kategoria;znacka;variant;balenie;jednotka;cena;obchod;datum;akcia
Mlieko polotučné;Potraviny;Rajo;1,5 %;1000;ml;1,19;Lidl;15.3.2026;
Mlieko polotučné;Potraviny;Pilos;1,5 %;1000;ml;0,95;Lidl;15.3.2026;ano
```

**Nič sa nezapíše bez náhľadu.** Uvidíš, koľko cien pribudne, čo je nové, čo sa napojí na existujúce, a zoznam chybných riadkov s číslami. Neplatné dátumy ako `31.4.` sa zachytia.

Každý import dostane časovú značku a v **Dáta → Dávkové importy** sa dá celý vrátiť späť aj s artiklami a produktmi, ktoré vytvoril. Ručne zapísaných cien sa to nedotkne.

---

## Export

| Formát | Na čo |
|---|---|
| **JSON** | úplná kópia vrátane fotiek a záznamov o zmazaní; dá sa načítať späť |
| **Excel** | tri hárky s dopočítanou jednotkovou cenou, len na čítanie |

Excel potrebuje pri prvom exporte internet — knižnica sa doťahuje z CDN a potom zostáva v cache.

Zálohuj JSON raz za čas. Odstránenie appky z plochy zmaže lokálne dáta; ak zároveň nemáš funkčnú synchronizáciu, sú preč.

---

## Aktualizácia appky

1. Zvýš `APP_VERSION` v `index.html`
2. Nahraj súbor do repozitára
3. Appke naskočí pruh **Nová verzia X · beží Y** s tlačidlom *Aktualizovať*

Súbor `sw.js` meniť netreba.

Ak na zvýšenie čísla zabudneš, súbor sa nahrá, ale appka o zmene nebude vedieť. Verziu, ktorá práve beží, nájdeš v **Dáta → Verzia appky**.

GitHub Pages rozposiela nový súbor asi desať minút. Appka to vie a po pokuse o aktualizáciu na ten čas stíchne, aby neotravovala dokola.

---

## Súkromie

**Kód je verejný, dáta nie.** V repozitári je len appka. Kto si otvorí tvoju adresu, dostane prázdnu appku s vlastným prázdnym úložiskom.

**Token** sa ukladá výlučne v prehliadači zariadenia a nikdy sa nedostane do repozitára. Oprávnenie `gist` mu nedáva prístup k ničomu inému na účte.

**Jedna vec sa oplatí vedieť:** gist, ktorý appka vytvorí, je „secret" — to na GitHube znamená *neuvedený*, nie *súkromný*. Nenájde ho vyhľadávanie ani tvoj profil, ale kto by poznal jeho adresu, prečíta ho aj bez tokenu. Adresa je 32 náhodných znakov, takže sa uhádnuť nedá, ale nie je to zámok. Na zápis token potrebný je.

Ak by ti to prekážalo, dáta sa dajú presunúť do privátneho repozitára — tam bez tokenu neprejde ani čítanie.

---

## Známe obmedzenia

- **Hodiny zariadení.** Zlučovanie sa opiera o časy zmien. Výrazne posunuté hodiny by mohli prehrať súboj o ten istý záznam.
- **Naozaj súčasný zápis.** Uloženie tej istej veci na oboch zariadeniach v tej istej sekunde môže jeden zápis stratiť. Pri jednom používateľovi teoretické.
- **Nie je to živý zápis.** Zmena na počítači sa v telefóne objaví do pár sekúnd, nie okamžite.
- **Fotky** sa ukladajú ako base64 v tom istom JSON-e, ktorý sa synchronizuje. Zmenšujú sa na 240 px (~10 kB), ale pri stovkách produktov to narastie.
- **Zlúčenie dvoch artiklov** do jedného zatiaľ nie je. Dá sa len premenovať alebo zmazať.

---

## Súbory

```
index.html   celá aplikácia — UI, logika, synchronizácia
sw.js        service worker — offline cache
README.md
```

Bez build kroku, bez závislostí. Knižnica na Excel sa doťahuje z CDN až vtedy, keď exportuješ.

---

## Technicky

- Vanilla JavaScript, žiadny framework
- IndexedDB ako úložisko, s núdzovým režimom v pamäti
- Service worker: cache-first, aktualizácia na pozadí
- Synchronizácia: GitHub Gist API, zlučovanie po záznamoch s časom zmeny a značkami zmazania
- PWA: pridanie na plochu, samostatné okno, offline
