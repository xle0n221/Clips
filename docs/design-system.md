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

## 9. Themenunabhängige Bausteine (`src/episode/kit/common.tsx`)
Für Info-Einschübe und Pointen in **jedem** Thema (Referenz-Analyse 2, Punkt 4: Fakten als Grafik
zeigen). Gleicher Look (Toon + `<Ink>`), alles aus Props, deterministisch. Prüfkomposition
`CommonKitTest` (8 Einstellungen à 20 Frames, nur Testwerte); Kontaktabzug vom 09.11.2026:
`scratchpad/common-kit/kontaktabzug.jpg` (Session-Scratchpad, nicht im Repo).

**Konventionen:** Vorderseite +z; `position`/`rotation`/`scale` überall; `progress` 0..1 = Aufbau
(Balken wachsen, Zahl zählt, Ring füllt sich – in der Szene per `interpolate` an den Wort-Cue binden);
`appear` 0..1 = Hereinploppen mit Überschwinger; `frame` = Dauerbewegung (Wippen, Puls).
Hilfen: `clamp01`, `easeOutCubic`, `popIn`, `stagger(progress, i, n)`, `formatNumber` (engl. Kommas,
ohne Locale), `formatCompact` („8.1B“), `niceStep`.

| Baustein | Wofür | Wichtigste Props |
| --- | --- | --- |
| `BarChart` | Vergleich weniger Werte (≤ 5) | `values`, `labels`, `unit`, `highlight`, `progress`, `height` |
| `CounterBoard` | eine große Zahl, die hochzählt | `to`, `from`, `title`, `prefix`/`suffix`, `compact`, `dark`, `legs` |
| `PercentRing` | Anteil / Prozent | `value` (0–100), `label`, `color`, `progress` |
| `SizeCompare` | maßstäblicher Größenvergleich mit Lineal | `items` (`label`, `value`, `shape` column/tower/sphere/figure oder `node`), `unit`, `maxHeight` |
| `Timeline` | Jahre/Ereignisse senkrecht (Hochformat) | `events` (`year`, `label`), `at` (Marker), `progress`, `length` |
| `WorldMap` | Ort zeigen (schematische Plattkarte 2 : 1) | `pins` (`lon`, `lat`, `label`, `color`, `labelDy`), `drop`, `width` |
| `Mark` | „?“ / „!“ als 3D-Zeichen | `kind`, `color`, `appear` |
| `Arrow` | Hinweis-Pfeil von A nach B | `from`, `to`, `grow`, `color` |
| `StudioBackdrop` + `StudioLights` + `FloorPlate` | Info-Studio: Verlauf, Rückwand mit Vignette, warmes Key-Light links oben | Farben `top`/`bottom`/`center` |
| `InfoBoard` | Tafel mit Titelleiste und ≤ 3 Zeilen, Kinder vor der Fläche | `title`, `lines`, `dark`, `legs`, `appear` |
| `CashBag`, `Stopwatch`, `LightBulb`, `WarningSign` | Pointen: Geld, Zeitdruck, Idee, Gefahr | `symbol`, `t`/`alarm`, `on`, `wobble` |
| `TextLabel`, `Pill`, `useTextTexture` | beliebiger Text als Fläche/Pille | `text`, `width`, `height`, `bg`, `stroke`, `border` |

**Schrift:** `kit/font.ts` (`KIT_FONT`, `kitFont(px)`, `useKitFont`) – gleiches Muster wie
`ROME_FONT` (Montserrat 900 aus `public/fonts`, FontFace + `delayRender`, Freigabe erst zwei Bilder
nach dem Neuzeichnen). Für neue Themen-Kits diesen Helfer verwenden statt ihn zu kopieren.
`useTextTexture` bemalt bei Textänderung **dieselbe** Canvas neu (hochzählende Zahl = keine neue
Textur pro Frame); zu lange Texte werden per `maxWidth` gestaucht, nie abgeschnitten.

**Kontrast (gemessen):** Text liegt auf **unbeleuchteten** Flächen (`meshBasicMaterial`,
`toneMapped={false}`, Textur in sRGB) – so ist der Kontrast im fertigen Bild der der Palette,
unabhängig von Licht und Stimmung. Rechnerisch: dunkle Schrift `#2B2118` auf Papier `#FFF6E3`
14,7 : 1, weiß auf Tafel `#22303F` 13,4 : 1, dunkel auf Akzent `#FFC928` 10,2 : 1, auf Grau
`#C9CED6` 10,0 : 1. Im Standbild (halbe Größe, nach Grading) gemessen: Zähler-Tafel 15,0 : 1,
Titelleiste 10,8 : 1, Zeitstrahl-Pille 14,7 : 1, Jahr-Pille 9,3 : 1, Ring-Mitte 16,0 : 1.
Werte über Balken/Objekten: weiß mit INK-Rand (wie Untertitel, 18,4 : 1 zur Kontur) – liest sich
auf jedem Hintergrund. Ausnahme: das grüne „$“ auf dem Geldsack hat Füllung/Jute nur 1,3 : 1 und
lebt allein vom INK-Rand (Deko, kein Lese-Text).

**Lesbarkeit/Platz (aus den Prüfbildern):**
1. Schrift ≥ 40 px im fertigen Bild: Pillen-Höhe ≥ 0,54 Einheiten bei Kamera-Abstand 12–14
   (0,44 ergab nur ≈ 34 px). Lineal-Zahlen 0,5.
2. Nichts unter y = 0 beschriften: Beschriftungen sitzen auf der **Vorderseite eines Sockels**
   (`BarChart`, `SizeCompare`), sonst verschwinden sie im Boden (erste Prüfrunde).
3. Breite im Hochformat: sichtbare Bildbreite ≈ 0,41 × Kamera-Abstand (fov 42). `WorldMap` 4,0
   breit braucht Abstand ≥ 12,5; `SizeCompare` mit 3 Objekten + Lineal ≥ 16; `BarChart` mit 4 Balken ≥ 14.
4. Blickziel `look` etwa 1,2–1,8 Einheiten **unter** der Grafik-Mitte setzen, dann liegt die Grafik
   im oberen Zwei-Drittel und die Untertitel-Zone (ab y ≈ 1300 px) bleibt frei.
5. Lange Zahlen ab ~9 Zeichen mit `compact` („8.1B“) – sonst staucht `maxWidth` die Ziffern.
6. Nadeln, deren Abstand auf der Karte kleiner ist als die Pillenbreite (≈ 1,2–1,5 Einheiten),
   mit `labelDy` versetzen – NYC und Paris liegen bei Kartenbreite 4,6 nur 0,97 auseinander,
   ihre Pillen überlappten (Prüfbild 2. Runde).
7. `WorldMap` ist **schematisch** (grobe Kontinente) – nie als Grenz- oder Detailkarte ausgeben;
   Inhalte aller Grafiken (Zahlen, Jahre, Orte) nur mit Freigabe des Faktenprüfers.

## 10. Bewegung & Übergänge (`kit/motion.tsx`, `kit/transitions.tsx`)
Top 8 aus `animation-techniken.md` + Zusatz aus `referenz-analyse-3.md` („Übertragbar“ 1–4) als
themenunabhängige Bausteine. Alles reine Funktion von `frame` (kein `useFrame`, kein Zustand).
Alle Erweiterungen alter Bausteine sind optional: ohne sie rendern Rom und Sonnensystem
**pixelgleich** (Pixel-Diff 0 an 3 + 2 Standbildern, 09.11.2026). Prüfkomposition `MotionKitTest`
(8 Einstellungen, 360 Frames, jede Technik einmal, zwischen den Einstellungen je ein anderer Übergang).

**Übergänge** – in der Episode per `timeline.json`: `scenes[i].transition` (Übergang IN Szene i) oder
`transition` für alle; ohne Feld = alter Weiß-Blitz. Typ `TransitionSpec`:

| `kind` | Wirkung | Props | Wann |
| --- | --- | --- | --- |
| `whip` | Reißschwenk: A dreht weg, B dreht aus Gegenrichtung ein, waagrechte Unschärfe (SVG-Filter) + Speed-Streifen | `dir` ±1, `frames` (6) | Ort-/Zeitsprung, Tempo |
| `wipe` | Form wächst bildfüllend (INK-Rand), Schnitt, Form öffnet sich als Loch | `shape` circle/star/hex/diamond/burst, `color`, `at` [x,y], `frames` (8) | Kapitelwechsel, Themen-Form |
| `zoom` | Zoom-Through: Kamera fährt rein, Farb-Iris schließt, B fährt zurück | `color`, `at`, `frames` (8) | „hinein in …“ |
| `match` | harter Schnitt + 4 Bilder Zoom-Stoß; Bildstelle selbst mit `aimAt` gleich legen | `frames` (4) | Match Cut, Reaktions-Großaufnahme |
| `tint` | alter Blitz in Akzentfarbe | `color` | Pointe/Schock |
| `flash` / `cut` | alter Weiß-Blitz / harter Schnitt | – | – |

Bausteine dafür (für eigene Kompositionen): `transitionAt(frame, cuts, specs)`, `rigOf` →
`CameraRigContext` (Kamera-Zusatz yaw/push/roll/fov, wirkt auf jeden `Shot`), `canvasFxOf`,
`WhipBlurDefs`, `TransitionOverlay`, `SpeedStreaks` (DOM-Speed-Lines, auch einzeln).

**Kamera** – `Shot` (neue optionale Props): `orbit {center, radius, fromDeg, toDeg, height, heightTo}`
(≤ 100°, Erkennungsmerkmal), `fovTo` + `dollyZoom` (Vertigo, Bildhöhe am Blickziel konstant),
`anticipate` (Anteil der Strecke, z. B. 0,12) + `anticipateFrames` (5), `span [start, ende]` (Fahrt
nur zwischen diesen Frames, z. B. Ranfahrt auf den Wort-Cue), `ease` smooth/linear/in/out/inOut/snap.
`shotPose(props)` liefert pos/target/fov ohne Rendern. `aimAt(p, H, {xf, yf, dir, fov})` (wie `aim()`,
freies fov) und `screenOf(p, pos, look, fov)` (Bildstelle eines Punkts) für Match Cuts.
`trackShot(subject, H, travel)` = seitliche Tracking-Fahrt, liefert `shot` (für `<Shot>`) und `start`
(für `<Foreground>`).

**Parallax** – `<Foreground pos look fov items>`: Elemente (leaf/rock/post/blob, dunkel, INK) werden im
Kamerabild von Frame 0 platziert (`xf`, `yf`, `depth`, `size`) und bleiben in der Welt stehen.
Gemessen in `MotionKitTest` Einstellung 7: depth 2,4–3 mit Fahrt 7 = Elemente schwarze Flächen, nach
3–4 Bildern durch → **depth 4,5–5,5, size 0,4–0,45, Fahrt 3, xf über 0…(1 + Fahrt/Bildbreite)
verteilen** (Bildbreite ≈ 0,41 × depth bei fov 40).

**Figur** – `Toonie` (neue optionale Props): `blinkSeed` (eigener Takt 2–5 s, 15 % doppelt; statt alle
gleichzeitig `frame % 95`), `talk` 0..1 (offener Mund; aus `talkFromCaptions(captions, ms)` = Wort-Rhythmus
je Silbe, keine Lautanalyse), `squash` (volumen-erhaltend ab Fußpunkt; `hop(frame, at, height, air)`
liefert y + squash mit Ducken/Strecken/Landung), `drag` (Follow-through für Antenne/Krawatte/Kappe/
Arme/Kopf; Wert aus `followThrough(signal, frame)` = gedämpfte Nachschwingung auf die Körperbewegung),
`eyePop` (Augen-Skalierung; `eyePopAt(frame, at)` 1 → 2 → 1,6 für die Reaktions-Großaufnahme, mit
`eyes="wide"`). `anticipate(frame, at, from, back, to)` für Arme/Requisiten.
`<Echo frame render={(f) => <Toonie frame={f} …/>} count step color strength>` = Nachbilder bei
`frame − k·step` als flache, transparente Silhouetten (GhostContext in `toon.tsx`; kostet je Kopie einen
Figuren-Satz Meshes).

**Licht/Farbe** – `<RimLight from color intensity>` (Richtungslicht ohne Schatten), `<SceneFog color
near far>` (`scene.fog`, Toon + Kontur reagieren), `<SpotlightStage center on color beam radius>`
(dunkler Raum, Spot-Licht, Bodenkreis, sichtbarer Kegel), Color Script `COLOR_SCRIPT` mit Akten
`hook/rise/glory/tension/decline/fall/aftermath/neutral` (CSS-Filter + Farbschleier `GradeTint`);
in der Episode per `timeline.json` `scenes[i].act`.

**Messwerte (09.11.2026, halbe Größe, swangle, 4 Kerne, inkl. Start):** `MotionKitTest` 360 Bilder
230 s bzw. 192 s (2. Lauf) = 0,64 bzw. 0,53 s/Bild; Rom Frames 0–359 gleich gerendert 303 s = 0,84 s/Bild. Die Szenen sind
verschieden – das zeigt nur, dass die Bausteine keinen großen Aufschlag haben, keine Kosten je Technik.
**Rim-Light-Befund:** Mit `meshToonMaterial` (Half-Lambert-Rampe) hellt Gegenlicht Figur und Kulisse
insgesamt auf; eine harte helle Kante entsteht kaum (Ausschnitt `rim-vorher-nachher.jpg`). **Behoben
(Regie-Kritiker 09.11.2026):** `<RimLight>{figuren}</RimLight>` legt per `RimContext` (toon.tsx) eine
Fresnel-Kante ins Toon-Material der Kinder (`side` Bildrichtung, `width` 0,4, `strength` 1), ohne
Aufhellung; ohne Kinder bleibt das alte Richtungslicht. Ohne Kontext unverändert (Rom/Sonne Diff 0).
**Parallax-Schutz:** `Foreground` schiebt Elemente (außer `post`) aus dem Untertitel-Band
`captionBand` (Standard y 0,62–0,86) – nach unten, sodass nur die Oberkante ins Bild ragt.
**Echo:** Abstand je Nachbild = Tempo × `step` ≥ ½ Körperbreite, sonst liest es sich als Leuchten
(Probe: `step` 2 → Schein, `step` 4 → erkennbare Nachbilder).
