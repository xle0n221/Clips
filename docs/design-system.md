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
   **Konflikt (offen, Art Direction):** Fell bei Goten/Vandalen widerspricht den Bild-Hinweisen der
   Recherche („keine Felle als ‚Steinzeit‘-Klischee“, `quellen-roemisches-reich.md` Bildhinweise) und dem
   Faktencheck (`faktencheck-drehbuch-roemisches-reich.md`, „FurCloak“). `Goth` setzt `fur = true` als
   Standard. Bis zur Entscheidung `fur={false}` verwenden; Partei-Signal trägt das Waldgrün-Karo.
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
| Gewölbegang (Kolosseum, `vault`) | `#5E331C` | dunkle Rückwand hinter jedem Bogen und Attika-Fenster: Arkade liest sich auch in der Totale, und weiße Köpfe davor haben gemessen **6 : 1** statt 1,3 : 1 |
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
| Goten: Wolle / Karo / Fell / Haar | `#4F6E5A` / `#2F4A3A` / `#7B5235` / `#C46A2B` | kühles Grün gegen das warme Rom-Ocker = „fremd“ auf einen Blick; Haar/Bart **kupfer**, nicht gelb (Gelb gehört dem Halstuch der Hauptfigur) |
| Zypresse / Pinie / Hügel | `#2F5D3A` / `#5A8A3C` / `#A9BF72` | dunkle senkrechte Akzente in der Skyline (Italien-Signal) |
| Gefahrenlicht (`DANGER`) | `#FF1F3D` | kaltes Karminrot (vorher `#FF3B1F` = orange, wirkte auf warmem Grund wie Lagerfeuer); nur Licht/Glühen, nicht als Objektfarbe |

## 4. Kontrast und Lesbarkeit auf dem Handy
Bildschirm ≈ 6 cm breit, Daumen und UI decken Ränder ab, oft draußen bei Sonne.
1. **Silhouette vor Farbe**: Jede Figur muss als schwarze Fläche erkennbar sein (Test: Bild auf
   Schwarz-Weiß + Weichzeichner). Rom-Figuren unterscheiden sich daher in der **Kopf-Silhouette**:
   Legionär = Helm + Busch-Fächer, Kaiser = Kranz-Zacken + Umhang-Dreieck, Gote = Kappe + Zottelbart mit Spitze (keine Kugel) +
   Zöpfe, Senator = glatter Kopf + Toga-Schärpe.
2. Weißer Kopf `#FAFAFA` auf Sandstein hat rechnerisch nur **1,8 : 1**; im fertigen Bild (Licht,
   Dunst, Grading) gemessen sogar nur **1,1–1,3 : 1** (Pixel Kopf `#E5E3DA` gegen Wand `#E6D8B0`,
   RomeKitTest Bild 7) und auf hellem Himmelsrand 1,2 : 1 – lesbar nur durch die INK-Kontur
   (9,8 : 1). Deshalb: Kontur an Figuren nie abschalten, Köpfe vor die **dunklen Gewölbegänge der
   Arkaden** (gemessen 6,1 : 1, Kopf gegen `#764634`) oder vor das **dunklere Himmelsblau oben**
   (2,8 : 1) setzen. Das Kolosseum ist dafür so gebaut, dass hinter jedem Bogen eine dunkle Wand steht.
3. Akzent gegen Umgebung mindestens **3 : 1** Leuchtdichte (Legionsrot auf Sandstein 3,0 : 1,
   Purpur 4,2 : 1) **oder** deutlicher Farbton-Gegensatz plus Kontur (Helmbusch-Rot vor Blau: nur
   1,5 : 1 Leuchtdichte, aber komplementär und konturiert – geprüft, liest sich).
4. **Kleine Teile ≥ 3 % der Bildbreite** (≈ 32 px bei 1080) in der Einstellung, in der sie wichtig
   sind, sonst ranfahren. Unter ~20 px verschwinden Lorbeerblätter, Schnallen, Münz-Umschrift.
5. **Schrift im Bild** (SPQR, Jahreszahlen, WEST/EAST): Großbuchstaben, ≥ 40 px Höhe im fertigen Bild,
   dunkel auf hell (`#6B5235` auf Marmor) oder weiß mit INK-Rand. Untertitel stehen darüber und
   haben Vorrang. Schrift ist **immer die mitgelieferte Montserrat 900** (`public/fonts`, wie die
   Untertitel), im Kit als `ROME_FONT` per FontFace + `delayRender` geladen – nie eine Systemschrift
   (sieht auf jedem Render-Rechner anders aus).
6. **Untertitel-Zone** (unteres Drittel; laut `Captions.tsx` Unterkante y = 1520 durch `paddingBottom: 400`,
   Schrift 92 px → eine Zeile ≈ y 1420–1520, zwei Zeilen ab ≈ y 1325) frei von Gesichtern und
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
5. **Gefahr = rotes Akzentlicht**: `DangerLight` (pulsierendes Punktlicht `DANGER #FF1F3D` + Glühen; das frühere
   Orange `#FF3B1F` ist ersetzt, `rome.tsx` `export const DANGER`) von
   der Seite, bei gleichzeitig gedimmtem Key-Light (Stärke ≤ 1,6) und dunklerem Himmel. Höchstens
   ein Gefahrenlicht pro Bild. Für Spannung im Dunkeln: Lichtkegel (`Beam` aus `fx.tsx`) statt Fläche.
6. Tageszeit erzählt: gleiche Bauten, anderes Licht → Fortschritt ohne Worte. Fertig als Preset
   `romeMood(phase)` bzw. `<RomeAtmosphere phase=… />` (Himmel, Sonne, Wolken, Dunst, Key- und
   Fülllicht) plus CSS-Grading `mood.grade` fürs Endbild:
   | Phase | Himmel oben → unten | Key-Light | Aufhellung | Dunst | Einsatz |
   | --- | --- | --- | --- | --- | --- |
   | `glory` | `#3E9FDB` → `#CBEAF6` | `#FFF1D8`, 2,5, hoch links | `#CFEFFF`/`#C9965A` 1,0 | `#DCEFF5` 22–110 | Blütezeit, Augustus, Kolosseum |
   | `decline` | `#D9874A` → `#F7D9A8` | `#FFC98A`, 2,2, flach von links | `#F5D2A8`/`#9C6A3A` 0,85 | `#F2CFA0` 28–150 | Krisen, Thron-Auktion 193, Teilung 395 |
   | `fall` | `#2E2552` → `#C8553D` | `#FF9A5C`, 1,3, tief von rechts hinten | `#5F6AA8`/`#2A1712` 0,75 | `#5A3A4E` 14–75 | Plünderung 410/455, 476 – nur hier `DangerLight` |
   Gefahr wirkt nur bedrohlich auf **kühlem, gedimmtem** Rest-Licht (`fall`): rotes Licht auf warmem
   Mittag sieht nach Lagerfeuer aus. Gefahrenlicht als seitliches Streiflicht 3–5 Einheiten neben
   den Figuren, Stärke 0,6–0,9 – näher färbt es die Figur ganz rot (Partei-Farben gehen verloren).

## 6. Figuren, Silhouetten, Erkennungsmerkmal (Referenz-Analyse 2, Punkt 7)
- **Eine Hauptfigur mit einem Erkennungsmerkmal, in jeder Einstellung gleich.** Für Rom:
  Legionär mit **Querbusch** (Fächer, frontal breit) und **gelbem Halstuch** (`Legionary hero`,
  `Focale #FFC928`). Gelb kommt sonst nur als Gold an Dingen vor, nie an anderen Figuren
  (deshalb Goten-Haar kupfer). Andere Legionäre: Längsbusch, kein Halstuch.
  Das Halstuch sitzt als dicker Wulst **auf den Schultern** mit Knoten und zwei Zipfeln über dem
  Panzer: am Hals (innerhalb des Kopfumrisses) verdeckt es der Kopf frontal. Gegen das helle Eisen
  ist der Leuchtdichte-Kontrast fast 1 : 1 – es trägt sich über Farbton, Größe und dicke Kontur.
- **Nicht belegt, nur Stil:** Helmbusch und Querbusch sind laut Faktencheck nicht belegt (der
  Galea-Beleg war überdehnt, ein Querbusch-Beleg fehlt). Beides ist reine Stil-Entscheidung für die
  Silhouette und wird im Sprechtext **nicht** behauptet (kein „centurions wore…“).
- **Keine Hörnerhelme** bei Goten/Germanen (historisch falsch, siehe clip-regeln Themen-Treue 3):
  Standard ist Kappe mit Pelzrand, Zöpfe, Vollbart, Rundschild, Speer.
- Kostüm-Teile ragen über den Körper hinaus (Busch, Fächer, Umhang-Dreieck, Fellkragen):
  die Figur muss **auch 15 % bildhoch** (Totale) noch zuzuordnen sein.
- Größenverhältnis: Figur ≈ 4 Einheiten hoch; Kolosseum bei `scale` 1 nur 6,9 hoch × ~15 breit
  (= 1,7 Figuren – wirkt wie eine Mauer, nicht wie ein Weltwunder); Tempel ~6,8 hoch.
  **Monumental**: Kolosseum in Totalen mit `scale` 2,4–3 weit hinten (z −35 … −45), seitlich
  versetzt, damit die Krümmung des Ovals sichtbar bleibt; Kamera tief (y ≈ 2), Blick leicht nach
  oben. Dann überragt es die Figuren 3–4-fach, und die Masten auf der Attika geben Maßstab.
  (Echte Fassade 48,50 m ≈ 28 Toonie-Höhen – Cartoon darf untertreiben, aber nicht auf Figurhöhe.)
  Bauwerke immer hinter den Figuren, Figuren nie kleiner als 1/6 der Bildhöhe, wenn sie sprechen.
- **Sitzen**: `sit={1}` knickt die Beine im Knie (Unterschenkel hängt). Auf dem `Throne` die Figur
  bei `y = THRONE_SIT_Y`, `z` = Thron + 0,3. Die Thronlehne ist breiter und höher als der Kopf
  (Seitenpfosten + Adler), damit sie frontal sichtbar bleibt.

## 7. Info-Grafik-Bausteine (Referenz-Analyse 2, Punkt 4)
- `EmpireMap`: schematische Reichskarte (Ring ums Mittelmeer, West rot / Ost purpur, Italien,
  Griechenland, Stecknadeln für Rom und Konstantinopel). `split` 0..1 = Reichsteilung 395,
  `westFall` 0..1 = Westen wird grau und sinkt ab. Kamera fast senkrecht von oben (y ≈ 15).
  Bewusst **schematisch** – nicht als echte Grenzkarte ausgeben.
- `TimelineStele`: hohe Marmorstele mit Jahreszahlen (oben alt, unten neu), goldener Marker bei
  `at` (Index, Zwischenwerte gleiten) – passt ins Hochformat. Standard = nur freigegebene Jahre
  (`ROME_YEARS`: 27 BC, 193, 395, 410, 455, 476, 1453 AD); eigene Listen nur mit Freigabe des Faktenprüfers.
- Gleicher Look wie die Welt (Toon + INK), dunkler Studio-Hintergrund, ein warmes Licht.

## 8. Rom-Kit in Kürze (`src/episode/kit/rome.tsx`)
Kopf: `LegionaryHelmet`, `LaurelWreath`, `GothCap`, `Braids`, `Beard` · Körper: `Lorica`, `Belt`,
`Toga`, `ImperialCloak`, `FurCloak`, `BarbarianTunic`, `Focale` · Hand: `Scutum`, `Gladius`,
`Scepter`, `RoundShield`, `Spear`, `Scroll` · Figuren: `Legionary`, `Emperor`, `Senator`, `Goth` ·
Welt: `RomeSky`, `SoftSun`, `Cloud`, `Hills`, `Pavement`, `RomeLights`, `RomeFog`, `DangerLight` ·
Kulissen: `Colosseum` (`ruin`), `Temple` (`ruin`), `Column` (`broken`), `Rubble`, `Aqueduct`,
`RomanHouse`, `RomanSkyline`, `Rotunda`, `Cypress`, `UmbrellaPine`, `Throne` · Requisiten:
`SpqrBanner`, `Eagle`, `Scroll`, `Coin` · Info: `EmpireMap`, `TimelineStele` · Stimmung:
`romeMood`, `RomeAtmosphere`, `DANGER` · Konstanten: `THRONE_SIT_Y`, `ROME_YEARS`, `ROME_FONT`.
Kolosseum-Leistung: Bogen-Ring wird nur bei Form-/`ruin`-Änderung neu gebaut (memo); in der Ferne
(kleiner als ~1/3 Bildbreite) `detail="far"` und `segments={24}` – zusammen ≈ 45 % weniger Meshes
(32 Felder voll ≈ 1 060 Meshes inkl. Kontur, far/24 ≈ 580).
Prüfkomposition: `RomeKitTest` (10 Einstellungen à 14 Frames; 8 = `decline`, 9 = `fall`).
