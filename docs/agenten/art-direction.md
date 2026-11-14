# Rolle: Art Direction (Farben, Grafik, Kostüme, Kulissen)

> Gedächtnis dieser Rolle. **Vor jedem Auftrag lesen, nach jedem Auftrag ergänzen.** Ablauf: [`README.md`](README.md).

## Auftrag
Bau-Kit pro Thema (`src/episode/kit/<thema>.tsx`), Design-System. Prüfer: Design-Kritiker.

## Messlatte (woran der Prüfer die Arbeit bewertet, 1–10)
- Standbild ohne Ton verrät das Thema
- Kontrast auf dem Handy (Köpfe vor dunklem Grund ≥ 4,5 : 1)
- Hauptfigur mit Erkennungsmerkmal in jeder Einstellung
- Farbwelt nach Story-Phase (glory/decline/fall)
- Leistung (Mesh-Zahl) im Blick

## Checkliste (aktueller bester Stand – nur Erprobtes)
- Sonderzeichen (Pfeile, Häkchen) nie in `TextLabel`: Montserrat-Subset hat sie nicht → als Geometrie bauen.
- Erkennungsfarbe der Hauptfigur exklusiv halten (Rom: Gelb nur am Halstuch).
- Accessoires nicht in die Kopfkugel setzen (Kopf reicht bis y 2,05).
- Texturschrift aus `public/fonts` mit `delayRender` laden, nie Systemschrift.
- Gefahr = kaltes Karminrot + gedimmte Szene, nicht Orange.
- Große Bauten: hinter Öffnungen dunkle Wand, sonst wirkt es wie Kulisse.
- Von Recherche/Faktenprüfer: Kostüm-Standardwerte gegen die Bild-Hinweise der Quellen-Datei prüfen. Rom: `Goth` `fur = true` widerspricht „keine Felle als ‚Steinzeit‘-Klischee“ (`quellen-roemisches-reich.md`) → Konflikt in `design-system.md` §2.4 vermerkt, Entscheidung offen (übertragen vom Wissensverwalter 09.11.2026).

## Gelernt (neueste oben; Datum · Clip · Befund · Beleg)
- 14.11.2026 · Bauarbeiter (Cinematic 3D, Horror) · Eigene Figur MILO (`scenes/bauarbeiterSets.tsx`): KLEINER Würfelkopf auf breitem Kastenrumpf liest sich klar anders als Zeit-Welt-Großkopf; Erkennung = gelber Helm + Stirnlampe + Schnurrbart-Klotz, der Doppelgänger nur über Lichtfarbe (Türkis statt Amber) – im Kontaktabzug ohne Ton sofort „gleicher Mann, andere Seite“. Falle: kniend + vorgebeugt + Kopf geneigt zeigt der Kamera nur die Helmkrone (Gesicht weg) → in Kniestellungen nod ≤ 0,2, lean ≤ 0,3. Schild/Uhr am Zaun lagen in vielen Einstellungen im oberen Text-Drittel → Schild nur in den Szenen, die es erzählen (`sign`-Prop). Beleg `out/bauarbeiter-kontakt.png`.
- 13.11.2026 · Zeit-Welt (Cinematic 3D, KnowToon STEP 2) · Eigene Klotzfigur statt Marken-Optik: Kopf als abgerundeter Quader
  BREITER als der Rumpf (Spielzeug-Großkopf), runde Punktaugen mit Glanzpunkt, Fäustlinge, trapezförmiger Rumpf – kein Noppen-Kopf,
  keine C-Hände, kein Pixel-Gesicht. Erkennung: Ida = petrol Hemd + Senf-Schürze + Messing-Lupe am Stirnband; Anton = weiße Buschbrauen
  + runde Brille; Glass Office = Milchglas-Visier statt Gesicht. **Farblogik hält im Kontaktabzug:** Welt kalt blau-grau, Gold nur
  als Sand (emissiv, `toneMapped={false}`), einzige warme Innenräume = Werkstatt/Stube; Twist auf Spotlight-Schwarz; Schluss warm ohne
  Gold (Glas weg). Schlüsselobjekt `TimeJar` in fast jeder Szene. Echte Bilder: NASA-ISS-Foto im Bilderrahmen „OUR WORLD“ + ISS-Video
  als Spiegelung im Glas – echte Welt als Foto im 3D-Raum, nicht als Vollbild. Beleg `out/zeit-kontakt.png`, `out/zeit-welt-cover.png`.
- 13.11.2026 · Jason GTA 6 (2D-Akte, Schwester zu Lucia) · Eigene Bildwelt bei gleichem Format: Kork-Pinnwand + Polaroids statt
  Schreibtisch, Keys-Mittag (Himmelblau/Türkis/Sand) statt Abendrot, Erkennung über Pink (Hemd) – als Kind pinkes Übergrößen-Shirt,
  Armee olivgrün ohne Abzeichen (`Toon` additiv `outfit: "army" | "jkid"`, `age: "kid"` für Jason; Lucia unverändert geprüft).
  Nebenfiguren Brian (Glatze, grauer Kranz, Hawaii-Hemd) und Cal (Kopfhörer, Fernglas) als `Guy`-Brustbilder in Polaroids.
  Collage-Prinzip für echte Fotos: Cartoon-Figur als Papierausschnitt vor echtem Foto (Brian vor Strandhaus) bzw. echtes Foto
  als Vorbild neben eigener Form (Florida-Satellitenbild ↔ LEONIDA, Keys-Luftbild an der Inselkarte). Beleg `out/jason-kontakt.png`.
- 13.11.2026 · Lucia GTA 6 (2D Comic/Paper-Cut als Akte) · Stilwahl: eigene Figuren statt Spiel-Look – Erkennung über **ein**
  Merkmal (türkises Haarband + Zopf-Band), das auch auf Silhouetten (Überfall, Cabrio) türkis bleibt; Jason pink, gleich groß oder
  kleiner. Farbwelt je Station: Sepia (Rückblende) → Blaugrau (Zelle) → Abendrot (Freiheit) → Rotlicht (Überfall) → Gold (Premiere)
  → Violett (Spielerwahl); im Kontaktabzug ohne Ton unterscheidbar. Markenabstand: kein Schriftzug, kein Logo, Bank nur „BANK“,
  Bundesstaat als eigene Halbinsel-Form, Controller eigener Umriss. Bild-Hinweise Faktenprüfung umgesetzt (Familie als Unschärfe-
  Fleck, Handschuhe unbeschriftet, „2025“, RELEASED · LUCK + DETAILS? UNKNOWN, CRIMINAL COUPLE). Beleg `out/lucia-kontakt.png`.
- 12.11.2026 · UFC (2D Fight-Poster) · **Experiment Oktagon in drei Lagen** (`kit2d/fight.tsx` `Octagon`: Boden + hintere
  Zaunhälfte, Kinder, vorderes Gitter mit Deckkraft 0,4–0,6): Käfig liest sich im Kontaktabzug sofort als MMA, Figur bleibt
  hinter dem Gitter lesbar; Rautenmuster per SVG-`pattern` (30 px, 45°) ohne messbare Mehrkosten (3,2 s/Bild, wie Tyson 3,8 s).
  Neu wiederverwendbar: `FightHall` (Füllgrad der Ränge = „halb leer 1993“ ohne Text), `Clipping`, `PriceTag`, `RuleSheet` mit
  Stempeln, `BigCheck`, `USMap` (Muster-Karte, keine echte Staatenliste), `GoldTower`/`CoinStack`/`CoinPile`, `Pie`, `Scale`,
  `RetroTV`, `NeonSign`, `StreamScreen`, `OctagonWipe`. `Figure` additiv um `gloveColor`, `gloveSide`, `trunksColor`, `skinTone`
  (Tyson unverändert). Fallen: Zeitungs-Schlagzeile breiter als das Papier → Schriftgröße aus Zeichenzahl (`780/len`);
  Leuchtschrift unter der Pill-Zone verschwindet → über y ≈ 600 legen; Firmen nur als `TextBlock`-Schrift (kein Logo).
  Beleg `out/ufc-contactsheet.jpg`.
- 12.11.2026 · Rolls-Royce (2D Sticker/Paper-Cut) · **Experiment Sticker-Kante per Filter** (`feMorphology` dilate 7 +
  weiße Fläche + harter Schatten, `kit2d/luxury.tsx` → `LuxDefs` filter `sticker`): Figuren, Autos, Karten lesen sich im
  Kontaktabzug klar als ausgeschnittene Sticker, auch vor ähnlich hellem Grund; Kosten ≈ 4–6 s/Bild im Kontaktabzug
  (nicht sauber gegen ohne gemessen). Markenrecht: Autos als eigene Seitenansichten (`LuxCar` sedan/suv/coupe/sweptail)
  – Seitenansicht zeigt keinen Grill, keine Emblem-Fläche; Kühlerfigur nur als abstraktes Stoffband (`RibbonOrnament`).
  Erkennungsfarbe Limette exklusiv am Hoodie (HUD-Balken gleiche Farbe = Absicht, gehört zu YOU). Cover: Titel bricht auf
  4 Zeilen um (Overlay-Schrift) und verdeckte das Gesicht → Motiv 180 px tiefer legen. Beleg `out/rolls-royce-cover.png`.
- 12.11.2026 · Mike Tyson (2D Paper-Cut) · **Experiment Papierschatten per `feDropShadow` (dx 7, dy 9, ohne Unschärfe)**
  auf Figuren/Prospekten statt doppelter Schattenkopie: liest sich im Kontaktabzug klar als ausgeschnittenes Papier,
  Standbild 3,8 s/Bild (halbe CPU, parallele Stimm-Erzeugung; kein sauberer Vergleichswert). Neu `kit2d/boxing.tsx`:
  `Figure` (Kind/Teen/Erwachsen, Silhouette `sil` ohne Gesicht, Handtuch Hals/Kopf), `RingBack`, `Drop` (Prospekt
  fällt mit Nachfedern), `ScoreCard`, `GloveWipe` u. a. Fallen: Nasen-Bogen direkt über flachem Mund las sich als
  Schnurrbart → Nase als Punkt; Handtuch über dem Kopf ohne Stirnkante las sich als weiße Haare → Stoffkante +
  Falten; Prospekt-Schrift („TOKYO 1990“) kollidiert mit HUD/Stickern/Köpfen → Ort nur im Sticker.
  Sticker-Farben #F5F5F5/#B0BEC5 hatten weiße Schrift (unlesbar) → `Effects.tsx` Luminanz-Regel. Beleg `out/tyson-contactsheet.jpg`.
- 09.11.2026 · MotionKitTest 9–12 · **Experiment Flur + Ort-Licht:** `Hallway` mit 3 Punktlichtern à 18 färbte
  weiße Haut braun und überstrahlte die Wände; mit 6 + Fülllicht von vorn (1,4) Gesicht RGB 222/213/196, Wand
  201/150/95 – Trennung über INK-Kontur, nicht über Helligkeit (Kontrast nicht gemessen). Halbschalen-Gewölbe:
  Drehung −π/2 (sonst liegt es im Boden). Kit-Schrift ohne ↑/✓ → Geometrie · `scratchpad/portal/uebersicht2.jpg`.
- 09.11.2026 · MotionKitTest · **Experiment Rim-Light:** Richtungslicht hinten-oben-seitlich (2,2) auf
  Toon-Figur. **Ergebnis:** hellt Figur und Kulisse insgesamt auf, harte Kante kaum sichtbar – Ursache:
  `meshToonMaterial` rechnet Half-Lambert (auch abgewandte Flächen bekommen die unterste Rampenstufe
  ≈ 35 %) · `scratchpad/motion/rim-vorher-nachher.jpg`. → Für Trennung Kopf/Grund besser `SceneFog`
  (Hintergrund verblasst, im Streifen sichtbar) oder dunkle Fläche hinter dem Kopf; echter Rim braucht Fresnel-Shader.
- 09.11.2026 · MotionKitTest · Color Script (`COLOR_SCRIPT`, CSS-Filter + Schleier): glory/decline/fall im
  Bildstreifen unterscheidbar, decline/fall aber nur mäßig verschieden (Hautton grau/rötlich) · `streifen-gesamt.jpg` letzte Zeile.
- 09.11.2026 · MotionKitTest · Spotlight-Bühne liest sich als „Fokus“: Kegel + Bodenkreis klar, Gesicht
  leicht gelblich überstrahlt (Spot 260 cd aus 11 Einheiten) · `streifen-gesamt.jpg` Zeile 5.
- 09.11.2026 · Common-Kit · **Experiment:** Text auf unbeleuchteten Flächen (`meshBasicMaterial`, `toneMapped={false}`, Textur sRGB) statt Toon-Fläche. **Ergebnis:** Kontrast im fertigen Bild = Palettenwert (Pille gerechnet 14,7 : 1, gemessen 14,7 : 1; Tafel 13,4 → 15,0 nach Grading), unabhängig vom Licht · `CommonKitTest`, Standbilder `scratchpad/common-kit/s4/`.
- 09.11.2026 · Common-Kit · Beschriftungen unter y = 0 verschwinden im Boden → Beschriftung auf die Vorderseite eines Sockels; Pillen 0,44 hoch ergaben nur ≈ 34 px, ab 0,54 ≥ 40 px (Kamera-Abstand 12–14) · Prüfrunden 1–4.
- 09.11.2026 · Common-Kit · Hochformat-Breite: sichtbar ≈ 0,41 × Kamera-Abstand (fov 42); Weltkarte 4,6 bei Abstand 10,5 lief rechts aus dem Bild, Größenvergleich mit Lineal braucht Abstand 16 · Prüfrunde 1 vs. 3.
- 09.11.2026 · Common-Kit · Lange Zahlen („8,100,000,000“) werden per maxWidth gestaucht → `compact` („8.1B“) · Prüfrunde 1 vs. 2.
- 08.11.2026 · Rom-Kit · 10 Befunde behoben (Kolosseum, Bart, Thron, Halstuch, Gefahrenlicht, Stimmungen) · Kontaktabzug vorher/nachher in `verbesserungen.md`.

## Nächste Experimente (je Clip mindestens eins ausprobieren und messen)
- NEU: Split-Screen links/rechts (zwei `Stage2D` mit CSS-`clipPath`, UFC-Ende) gegen oben/unten testen – oben/unten kollidiert mit Untertitel-Drittel.
- NEU: Papierschatten-Kosten messen: gleiche Szene mit/ohne `filter="url(#paper)"`, s/Bild bei freier CPU.
- NEU: Sitzende Figur frontal (`Figure pose="sit"`) liest sich nur mäßig (Arme verdecken Knie) – Dreiviertel-Ansicht der Beine testen.
- NEU: Fresnel-Rim als Option in `Toon` (onBeforeCompile, nur mit Prop) – Kopf-Kontrast vor dunklem Grund messen, Renderzeit vorher/nachher.
- NEU: Spot-Stärke der `SpotlightStage` so wählen, dass die Hautfarbe nicht kippt (Farbwert Gesicht messen).
- NEU: Color Script im echten Clip: Akte je Szene setzen, Kontaktabzug ohne Ton – Phase erkennbar?
- ERLEDIGT 09.11.2026 (Ergebnis s. Gelernt; Kontrast-Messung in px noch offen): **Rim-Light** hinter/über der Hauptfigur (ohne Schatten) + `scene.fog` in Hintergrundfarbe testen; messen: Kopf-Kontrast vor dunklem Grund (Ziel ≥ 4,5 : 1, Rom-`fall` war Problemfall) und Renderzeit/Bild vorher/nachher.
- NEU: **Color Script** vor dem Bau: Farbband aller Szenen als ein Bild (je Szene `mood` → CSS-Filter + Farb-Overlay); Prüfung: Kontaktabzug ohne Ton, verrät jedes Bild die Phase?
- NEU: **Form-Wipe-Silhouetten** je Thema (eigene SVG-Form, nichts Fremdes) für `ShapeWipe`; Messung: Form in ≤ 8 Bildern bildfüllend, lesbar im Kontaktabzug.
- Common-Kit im echten Clip: Info-Einschub mit `BarChart`/`CounterBoard` auf Wort-Cue binden und im Kontaktabzug prüfen, ob die Zahl ohne Ton verstanden wird (Messung: Schrifthöhe px, Kontrast, Zeit bis Endwert ≤ 0,5 s).
- `rome.tsx` auf den gemeinsamen Schrift-Helfer `kit/font.ts` umstellen (nur mit Auftrag; Pixel-Vergleich vorher/nachher).
- Studio-Hintergrund pro Thema einfärben (z. B. Rom: `top #2A1A12`) und prüfen, ob Info-Einschübe das Thema noch verraten.
- Tiefenunschärfe/Dunst für Hintergrund (wie Referenz R3) testen und Kontrast der Figuren messen.
- Kolosseum-Ruine in `fall` lesbarer machen (Silhouette gegen Himmel).
- Neue Themen-Art (Natur, Körper, Technik …): Palette nach `playbook-themen.md` C2–C6 anlegen und Phasen-Licht wie `romeMood` als Preset bauen (übertragen vom Wissensverwalter 09.11.2026).

## Bewertungsverlauf
| Datum | Clip | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- | --- |
| 08.11.2026 | Rom-Kit | – | Monumentalität und Kontrast schwach → behoben |
| 09.11.2026 | Common-Kit | – (Prüfung Design-Kritiker offen) | Erstausgabe, 4 Prüfrunden selbst |
| 12.11.2026 | Rolls-Royce (2D) v1 | – (Design-Kritiker offen) | Sticker-Look, eigene Autos ohne Markenzeichen |
