# Design-System der Clips

Verbindlich für Art Direction und Szenen. Gilt für jedes Thema; themeneigene Paletten stehen
unten (zuerst Rom). Werte sind Handwerksregeln aus unseren Prüfbildern und den Referenzvideos
(`docs/clip-regeln.md`, `docs/referenz-analyse-2.md`), keine wissenschaftlichen Fakten.
Kontrastwerte = WCAG-Kontrastverhältnis (relative Leuchtdichte), selbst nachgerechnet.

## 1. Grundlook (unverändert seit dem Sonnensystem-Video)
- **Cel-Shading** mit 3 Stufen (`toonGradient`: 90/175/255) – keine weichen Verläufe auf Objekten.
- **Kontur** `<Ink>` in `INK = #141414` an allem, was Figur, Requisite oder Bauwerk ist.
  Stärke über `f`: Figuren 0.05–0.06, kleine Teile 0.08–0.15 (sonst verschwindet die Linie),
  große Bauten 0.015–0.03 (sonst wirken sie klobig). Ohne Kontur nur: Himmel, Wolken, Sonne,
  Leuchteffekte, Wasser.
- Figuren: `Toonie` (weißer Rundkopf `#FAFAFA`, Strichglieder in INK). Kostüme über die
  Steckplätze `head`, `body`, `hands` (siehe `src/episode/kit/Toonie.tsx`), nie durch Umfärben allein.
- Endbild: `saturate(1.15) contrast(1.05)` (Episode.tsx) + `Grade` (Vignette 0 → 38 % Schwarz am Rand,
  Korn 7 %). Paletten unten sind **vor** dieser Anhebung gewählt, deshalb leicht zurückhaltend.

## 2. Allgemeine Farbregeln
1. **60/30/10**: 60 % Umgebungsfarbe (hell, wenig gesättigt), 30 % Bauten/Mittelgrund,
   10 % Akzent (Kostüm der Hauptfigur, Gefahr, Gold). Der Akzent gehört der Handlung, nicht der Kulisse.
2. **Hintergrund heller und weniger gesättigt als Vordergrund**. Figuren tragen die satten Farben,
   Kulissen die hellen, warmen Töne. Dafür: Dunst (`RomeFog`, ab 22 Einheiten) und Pastell-Himmel.
3. **Rot ist doppelt belegt** (Rom/Legion **und** Gefahr). Gefahr deshalb nie nur über rote Objekte,
   sondern über **Licht**: rotes Akzentlicht (`DangerLight`) + dunklere Umgebung.
4. **Eine Farbe pro Partei**, über das ganze Video gleich: Rom/West = Rot `#C62828`,
   Ostrom/Kaiserhaus = Purpur `#7B2D96`, Goten/Barbaren = Waldgrün kariert `#4F6E5A` + Fell `#7B5235`.
   So verrät jedes Standbild ohne Ton, wer zu wem gehört (auch auf der Karte `EmpireMap`).
5. Keine reinen Schwarz-/Weißflächen außer Kontur und Kopf. Schatten warm (`#7A4A2A`-Richtung),
   nie grau: grau wirkt auf dem Handy schmutzig.

## 3. Rom-Palette (`ROME` in `src/episode/kit/rome.tsx`)
| Rolle | Hex | Warum |
| --- | --- | --- |
| Himmel oben / unten | `#3E9FDB` / `#CBEAF6` | klares Mittelmeer-Blau, Komplementär zum Sandstein → Bauten springen heraus; unten hell, damit Silhouetten oben dunkel davor stehen |
| Sonne | `#FFF4C8` (+ Hof `#FFF6D0`, 32/23/14 %) | weiche Sonne wie in der Stil-Anregung, ohne Kontur |
| Dunst | `#DCEFF5` | trennt Ebenen (Tiefe), nimmt Hintergrund zurück |
| Sandstein (Kolosseum) | `#E5B574` | warmes Ocker der Anregung; Hauptton Bauten |
| Sandstein hell (Gesimse, Halbsäulen) | `#F4D7A1` | Licht-Kanten, gliedert die Arkaden |
| Ocker / dunkel | `#C9873F` / `#9A5F2E` | Sockel, Inschriften |
| Bogeninneres | `#A86A3A` | dunkle Bögen = Lesbarkeit „Arkade“ auch klein |
| Boden (Platten) | `#E8C990` | heller als die Bauten, damit Figuren-Beine (INK) klar stehen |
| Marmor / Schatten | `#F6F0E4` / `#DDD3C0` | Tempel, Toga, Stele |
| Dachziegel | `#B4472B`, Rand `#C4562F` | Terrakotta – zweitstärkstes Rom-Signal nach dem Kolosseum |
| Hauswände | `#F4DCAA #EBC085 #F2CDA5 #E0A574 #F7E6C6 #E9B98E` | gestaffelte Putztöne, Abwechslung ohne Buntheit |
| Legion (Tunika, Schild) | `#C62828` | Partei-Farbe Rom |
| Helmbusch | `#E53935` | eine Stufe heller als die Tunika → liest sich vor Himmel |
| Kaiserpurpur | `#7B2D96` (dunkel `#4A1A63`) | Purpur = Kaiser; auf Sandstein 4,2 : 1 |
| Gold | `#F4B731` (dunkel `#B9851C`) | Lorbeer, Thron, Adler, Münze; auf Purpur 4,4 : 1 |
| Eisen / dunkel | `#C8D3DB` / `#8796A1` | Panzer kühl gegen warme Umgebung |
| Messing/Bronze | `#C8873A` | Helm-Rand, Schnallen |
| Leder / Holz | `#8A5A2E` / `#9C6B3C` | Gürtel, Schäfte |
| Pergament | `#F2E2B6` | Schriftrolle, Karte |
| Goten: Wolle / Karo / Fell / Haar | `#4F6E5A` / `#2F4A3A` / `#7B5235` / `#D9A54A` | kühles Grün gegen das warme Rom-Ocker = „fremd“ auf einen Blick |
| Zypresse / Pinie / Hügel | `#2F5D3A` / `#5A8A3C` / `#A9BF72` | dunkle senkrechte Akzente in der Skyline (Italien-Signal) |
| Gefahrenlicht | `#FF3B1F` | nur Licht/Glühen, nicht als Objektfarbe |

## 4. Kontrast und Lesbarkeit auf dem Handy
Bildschirm ≈ 6 cm breit, Daumen und UI decken Ränder ab, oft draußen bei Sonne.
1. **Silhouette vor Farbe**: Jede Figur muss als schwarze Fläche erkennbar sein (Test: Bild auf
   Schwarz-Weiß + Weichzeichner). Rom-Figuren unterscheiden sich daher in der **Kopf-Silhouette**:
   Legionär = Helm + Busch-Fächer, Kaiser = Kranz-Zacken + Umhang-Dreieck, Gote = Kappe + Bart-Kugel +
   Zöpfe, Senator = glatter Kopf + Toga-Schärpe.
2. Weißer Kopf `#FAFAFA` auf Sandstein hat nur **1,8 : 1** und auf hellem Himmelsrand nur 1,2 : 1 –
   lesbar nur durch die INK-Kontur (9,8 : 1 auf Sandstein). Deshalb: Kontur an Figuren nie abschalten,
   Köpfe bevorzugt vor das **dunklere Himmelsblau oben** (2,8 : 1) oder vor Arkaden setzen.
3. Akzent gegen Umgebung mindestens **3 : 1** Leuchtdichte (Legionsrot auf Sandstein 3,0 : 1,
   Purpur 4,2 : 1) **oder** deutlicher Farbton-Gegensatz plus Kontur (Helmbusch-Rot vor Blau: nur
   1,5 : 1 Leuchtdichte, aber komplementär und konturiert – geprüft, liest sich).
4. **Kleine Teile ≥ 3 % der Bildbreite** (≈ 32 px bei 1080) in der Einstellung, in der sie wichtig
   sind, sonst ranfahren. Unter ~20 px verschwinden Lorbeerblätter, Schnallen, Münz-Umschrift.
5. **Schrift im Bild** (SPQR, Jahreszahlen, WEST/EAST): Großbuchstaben, ≥ 40 px Höhe im fertigen Bild,
   dunkel auf hell (`#6B5235` auf Marmor) oder weiß mit INK-Rand. Untertitel stehen darüber und
   haben Vorrang.
6. **Untertitel-Zone** (unteres Drittel, Mitte ~ y 1400–1600 px) frei von Gesichtern und
   Schlüssel-Requisiten. Hintergrund dort ruhig (Boden, keine feinen Muster) – die Untertitel
   (weiß, 16 px INK-Rand) brauchen nichts weiter.
7. Feine Muster (Karo, Fell, Kanneluren) nur mit **≤ 25 % Helligkeitsunterschied**, sonst
   flimmern sie nach der Video-Kompression.

## 5. Licht und Grading (aus Referenz-Analyse 2, Punkt 6)
1. **Ein warmes Key-Light** pro Einstellung: `RomeLights` = Richtungslicht `#FFF1D8`, Stärke 2,5,
   von **links oben vorn** (`[-7, 12, 9]`), harte Schatten. Gleiche Richtung innerhalb einer Szene
   (Schnitt-Kontinuität); Gegenlicht nur als bewusster Effekt.
2. **Aufhellung kühl** von oben (Hemisphäre Himmel `#CFEFFF` / Boden `#C9965A`, 1,0): warmes Licht,
   kühle Schatten-Aufhellung → plastisch ohne Grau.
3. **Tiefenstaffelung**: Vordergrund (Figuren, satt) – Mittelgrund (Bauten, 10–25 Einheiten) –
   Hintergrund (Skyline, Hügel, 30–70, im Dunst). `RomeFog` 22 → 110. Unschärfe bauen wir nicht
   (teuer im Render); der Dunst übernimmt das „weicher/tiefer“.
4. **Dunkle Ränder**: immer `Grade` (Vignette). Bei Innen-/Info-Einstellungen dunkler
   Studio-Hintergrund `#2A1A12` und Tischplatte – Licht nur auf dem Objekt.
5. **Gefahr = rotes Akzentlicht**: `DangerLight` (pulsierendes Punktlicht `#FF3B1F` + Glühen) von
   der Seite, bei gleichzeitig gedimmtem Key-Light (Stärke ≤ 1,6) und dunklerem Himmel. Höchstens
   ein Gefahrenlicht pro Bild. Für Spannung im Dunkeln: Lichtkegel (`Beam` aus `fx.tsx`) statt Fläche.
6. Tageszeit erzählt: Blütezeit = Mittag (Palette oben); Niedergang = später Nachmittag
   (Himmel `#E9A15B` → `#F7D9A8`, Key-Light `#FFC98A` flach von der Seite); Plünderung 410/476 =
   Abend + Gefahrenlicht. Gleiche Bauten, anderes Licht → Fortschritt ohne Worte.

## 6. Figuren, Silhouetten, Erkennungsmerkmal (Referenz-Analyse 2, Punkt 7)
- **Eine Hauptfigur mit einem Erkennungsmerkmal, in jeder Einstellung gleich.** Für Rom:
  Legionär mit **Querbusch** (Fächer, frontal breit) und **gelbem Halstuch** (`Legionary hero`,
  `Focale #FFC928`). Gelb kommt sonst nur als Gold an Dingen vor, nie an anderen Figuren.
  Andere Legionäre: Längsbusch, kein Halstuch.
  (Querbusch als Centurio-Kennzeichen: nach Vegetius – vom Faktenprüfer zu bestätigen; bis dahin
  im Sprechtext nicht behaupten.)
- **Keine Hörnerhelme** bei Goten/Germanen (historisch falsch, siehe clip-regeln Themen-Treue 3):
  Standard ist Kappe mit Pelzrand, Zöpfe, Vollbart, Rundschild, Speer.
- Kostüm-Teile ragen über den Körper hinaus (Busch, Fächer, Umhang-Dreieck, Fellkragen):
  die Figur muss **auch 15 % bildhoch** (Totale) noch zuzuordnen sein.
- Größenverhältnis: Figur ≈ 4 Einheiten hoch; Kolosseum 6,9 hoch × ~15 breit; Tempel ~6,8 hoch.
  Bauwerke immer hinter den Figuren, Figuren nie kleiner als 1/6 der Bildhöhe, wenn sie sprechen.

## 7. Info-Grafik-Bausteine (Referenz-Analyse 2, Punkt 4)
- `EmpireMap`: schematische Reichskarte (Ring ums Mittelmeer, West rot / Ost purpur, Italien,
  Griechenland, Stecknadeln für Rom und Konstantinopel). `split` 0..1 = Reichsteilung 395,
  `westFall` 0..1 = Westen wird grau und sinkt ab. Kamera fast senkrecht von oben (y ≈ 15).
  Bewusst **schematisch** – nicht als echte Grenzkarte ausgeben.
- `TimelineStele`: hohe Marmorstele mit Jahreszahlen (oben alt, unten neu), goldener Marker bei
  `at` (Index, Zwischenwerte gleiten) – passt ins Hochformat.
- Gleicher Look wie die Welt (Toon + INK), dunkler Studio-Hintergrund, ein warmes Licht.

## 8. Rom-Kit in Kürze (`src/episode/kit/rome.tsx`)
Kopf: `LegionaryHelmet`, `LaurelWreath`, `GothCap`, `Braids`, `Beard` · Körper: `Lorica`, `Belt`,
`Toga`, `ImperialCloak`, `FurCloak`, `BarbarianTunic`, `Focale` · Hand: `Scutum`, `Gladius`,
`Scepter`, `RoundShield`, `Spear`, `Scroll` · Figuren: `Legionary`, `Emperor`, `Senator`, `Goth` ·
Welt: `RomeSky`, `SoftSun`, `Cloud`, `Hills`, `Pavement`, `RomeLights`, `RomeFog`, `DangerLight` ·
Kulissen: `Colosseum` (`ruin`), `Temple` (`ruin`), `Column` (`broken`), `Rubble`, `Aqueduct`,
`RomanHouse`, `RomanSkyline`, `Rotunda`, `Cypress`, `UmbrellaPine`, `Throne` · Requisiten:
`SpqrBanner`, `Eagle`, `Scroll`, `Coin` · Info: `EmpireMap`, `TimelineStele`.
Prüfkomposition: `RomeKitTest` (8 Einstellungen à 14 Frames).
