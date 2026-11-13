# Kritik Szenen „In This City, You Pay With Time“ (ZeitWelt, 3D, Regie + Design, 13.11.2026)

Prüfer: Regie-Kritiker + Design-Kritiker (zwei Noten). Grundlage: Bundle 21:38 (Stand `ac2db9f`; `c7deac0` ändert nur das
Preisschild im Hook), 57 eigene Standbilder (`--at`, halbe Größe, 2–3 je Szene, Cover 0,1/0,4/0,47/0,6 s, End-Card 101,0/102,0/102,85 s),
1-s-Raster (103 Bilder, 0,2×) für die Tempo-Messung, `out/zeit-kontakt.png`, `out/zeit-welt-cover.png`, `timeline.json`
(21 Szenen, 0,15–100,88 s + End-Card bis 102,88 s). Je 1 Standbild `LuciaGTA6` (Bild 852) und `JasonGTA6` (Bild 632).
Vorgaben: `docs/prompts/knowtoon-videopaket.md` STEP 2/3/5/6, `clip-regeln.md`. Bilder im Scratchpad (`zw/`, nicht im Repo). Code nur gelesen.

## Noten
| Rolle | Note | Kurzgrund |
| --- | --- | --- |
| Regie | **8,0** | Starke Farblogik (Gold nur als Zeit-Sand), Szenen alle ≤ 8 s (max. 6,83 s sweeper), Hook-Push-in, LIFE/SOLD-Infografik und End-Card sauber. Aber: Untertitel kollidieren in der Franklin-Strecke mit Karte und Bildnachweis (84,0 / 85,3 s), mehrere Einstellungen zu dunkel/unlesbar (knock 93–98 s, empty 24,5 s, world-Detail 13,0 s), der Twist „painted on“ (62,6–64,5 s) zeigt das Verb nur halb. |
| Design | **8,5** | Eigenständige Klotzfiguren (keine Noppen, keine C-Hände, Würfelkopf mit runden Kanten, Kugelhände, eigene Kostüme) – nicht LEGO/Minecraft; Nähe zum generischen Roblox-„Blocky“-Typ nur im Grundprinzip. Kein Arm-Display, nichts aus „In Time“. NASA-Foto sichtbar und passend, Bildnachweis vollständig. Aber: Cover ohne Hauptfigur, „REPORT EMPTY JARS“ doppelt (Sticker + Schild), ISS-Video in der Jar-Spiegelung nicht als echte Aufnahme erkennbar. |

Beide < 9 → Nacharbeit nötig. Mit R1–R3 und D1–D2 erwarte ich Regie 9, Design 9.

## Gemessen
- **Szenenlängen** (`timeline.json`): 21 Szenen, 2,81–6,83 s, keine > 8 s ✔ (STEP 3).
- **Einstellungswechsel**: Code-Zählung (`cut(frame, …)` in `zeitwelt1–3.tsx`): 14 Szenen mit 1 Schnitt, 4 mit 2 Schnitten, 3 ohne → **43 Einstellungen in 100,7 s = Ø 2,3 s** → im KnowToon-Ziel 2–4 s (STEP 3) ✔, aber schneller als die Hausregel „eher 3–4 s“ (`clip-regeln.md` Bild & Schnitt 5) – Widerspruch Prompt ↔ Hausregel, Entscheidung beim Nutzer/Drehbuch. 1-s-Raster (Grauwert-Differenz, HUD/Untertitel ausgeblendet): Diff > 40 → 26 Wechsel (Ø 3,7 s), Diff > 30 → 52 (Ø 1,9 s, inkl. Kamerafahrten); in dunklen Szenen sind die Differenzen klein, Schwellen also unsicher – **kein ffmpeg-Wert, das kann ich nicht bestätigen**. Kein Schnitt < 1,5 s im Code (Mindestwerte `Math.max(30…70, …)`).
- **Untertitel** (STEP 5): Variante `word-by-word-yellow` – ein Wort, Großbuchstaben, gelb `#FFD400`, 20-px-Kontur, Unterkante
  y ≈ 1500 (unteres Drittel) ✔; auf Gold-Flächen (Glas 64,5 s „ON“, SOLD-Säule 73,5 s „COUNTS“, Sand 100,0 s „SELL“) nur über die Kontur lesbar, aber lesbar.
  Erstes Wort ab 0,6 s (nach dem Cover) ✔.
- **HUD-Kontrast** (weiß gegen Platte, 50 Standbilder): min. **14,6 : 1**, Median 20,5 : 1 ✔. Wert „EMPTY · 20 YEARS“ schrumpft auf ≈ 52 px (`maxWidth`) – klein, aber lesbar.
- **Cover 0–0,5 s** (Bilder 3/12/14): Titel „YOU PAY WITH TIME“ gelb, 3 Zeilen, oberes Drittel, Unterzeile „bread = 12 minutes of your life“, kein Untertitel ✔; Motiv Glas + Sand + Brot + Preisschild. Cover-PNG weicht von Bild 3 meines Bundles um 5,0 Grauwerte ab (neues Preisschild aus `c7deac0`) – passt zum neuen Stand.
- **End-Card** (STEP 6): 100,88–102,88 s = **2,0 s** ✔, dunkler Grund, Suchleiste tippt „KnowToon“, Cursor, „Follow for the next strange world.“, Knopf FOLLOW → FOLLOWING ✔. 101,0 s: Überblendung, das Glas schimmert noch durch (gewollt).
- **Echte Bilder** (`bildnachweise-zeit-welt.md`): B1 ISS-Foto Stadtlichter 79,8–87,5 s groß im Rahmen, Ken-Burns, Nachweis „OUR WORLD · NASA PHOTO FROM SPACE“ ✔ passend (Übergang Fiktion → unsere Welt). V1 ISS-Video als Spiegelung im Glas 98,5–100,9 s: nur weiße Pünktchen, ohne Erklärung nicht als echte Aufnahme erkennbar (D3).
- **Andere Clips**: `Captions.tsx` neue Variante nur bei `captionStyle` gesetzt, `FilmLook` nur bei `cfg.filmLook` (nur `zeitwelt.ts`), End-Card nur bei `timeline.endCard`. Standbild Lucia 28,4 s: Pixel-Differenz **0,0** zu meinem Standbild aus der Jason-Prüfung (gleiche weiße Untertitel mit Akzentwort, HUD-Platte); Jason 21,1 s: weiße Untertitel „drug runners…“, HUD wie Runde 2, kein Film-Korn ✔ → **unverändert**.

## Befunde
| # | Szene / s | Problem | Vorschlag | Prio |
| --- | --- | --- | --- | --- |
| R1 | franklin 83,9–84,5 s, literal 85,3–86,0 s | **Text auf Text**: Untertitel „THIS“ liegt auf der Karte „ADVICE TO A YOUNG TRADESMAN · B. FRANKLIN · 1748“; „THAT“ liegt auf dem Bildnachweis „OUR WORLD · NASA PHOTO FROM SPACE“. Karte ragt 85–88 s angeschnitten unten ins Bild. | Karte über y 1300 (z. B. rechts oben neben den Rahmen) oder Untertitel-Zone freistellen; Nachweis-Zeile an die Rahmen-Oberkante oder klein unten rechts außerhalb y 1380–1520. | **P1** |
| R2 | knock 93,4–98,0 s | Fast nur Schwarz: 93,4 s ein dunkelblauer Ring ohne Tür (Türklopfer nicht erkennbar), 95,5/97,6 s schwarze Silhouetten mit weißen Rechtecken (wirken wie Fernseher/Roboter) – „Glass Office“ und das Foto von Antons Glas nicht lesbar. | Klopfer an sichtbarer Holztür mit Kaltlicht-Kante (Rim), Messing statt Blau; Agenten im Gegenlicht mit Mattglas-Visier **beleuchtet** (Fill-Licht 20–30 %), das Foto in der Hand groß ins Licht. | **P1** |
| R3 | painted 62,6–64,5 s | Twist-Verb „painted on“ nur halb lesbar: riesiges gelbes Glas, eine Kugel (Fingerkuppe?) und ein gelber Streifen – dass Farbe **abgekratzt** wird, sieht man nicht. | Makro mit erkennbarem Finger (Klotzhand mit Fingernagel/Spachtel), Farbsplitter fallen, klares Glas dahinter mit Hintergrund-Struktur (Lampe) sichtbar; 0,8 s halten. | **P1** |
| D1 | Cover 0–0,5 s | Keine Hauptfigur im Thumbnail (Regel „Thumbnail im Video“: Hauptfigur + Kernbild + Frage). Brot liest sich klein als orange Wurst. | Ida (Gesicht von unten im Sand-Schein, wie 3,0 s) unten rechts ins Cover, Glas links, Preisschild bleibt. | **P2** |
| D2 | empty 20,9–22,6 s | „REPORT EMPTY JARS“ doppelt: Sticker über dem Schild, das dasselbe sagt (Lucia-Fehler D4 wiederholt); Schild 19,3–21,0 s sehr kontrastarm (grau auf grau), 22,6 s rechts angeschnitten („GLASS OFFIC“). | Sticker weglassen oder anders („DON'T RUN OUT“); Schild heller/beleuchtet, ganz im Bild. | P2 |
| D3 | question 98,5–100,9 s | ISS-Video (V1) als Spiegelung nur weiße Pünktchen – als echte Aufnahme nicht erkennbar; zählt schwach für die Pflicht „echte Videos“. | Spiegelung größer/heller (Stadtlichter-Cluster erkennbar) oder V1 kurz als eigenes Bild im Rahmen neben B1 (franklin), dort mit Nachweis. | P2 |
| R4 | empty 24,5 s, thread 32,0 s, world 13,0 s | Einstellungen zu dunkel oder ohne klares Motiv: umgekipptes Glas fast schwarz; Glas auf dem Nachttisch klein; Gürtel-Detail 13,0 s = Glas vor schwarzem Fleck + orange Kugel (Gürtel/Passant unlesbar). | Mehr Fill-Licht/Rim; Detail 13,0 s mit sichtbarem Gürtel, Ledertasche, Hand. | P2 |
| R5 | twenty 67,2 s | Ida von hinten als dunkle Masse im Vordergrund, Anton rechts angeschnitten. | Kamera 10–15° drehen, Anton ganz ins Bild. | P3 |
| D4 | rent 42,8–45,0 s | „RENT +1 WEEK“-Zettel links angeschnitten, Sticker dazu doppelt (wie D2). | Zettel ganz ins Bild, Sticker weg. | P3 |
| D5 | Figuren allgemein | Würfelkopf + Rechteck-Rumpf + Punktaugen = Grundtyp „Blocky Avatar“ (Roblox-nah im Prinzip, keine Kopie). Unterscheidung schon da (Kugelhände, runde Kanten, Haarkappen, Brille, Schürze, Lupe). | Beibehalten; nie Logo-/Kopfnoppe, keine Roblox-Standardgesichter (Smiley mit Augenbrauen-Strich) einführen. | info |

## Bestanden
- (a) Originalität: keine Noppen, keine C-Hände, keine Pixel-Texturen, keine Markenzeichen; kein Arm-/Handgelenk-Display, keine Leuchtziffern, keine „Timekeeper“-Uniformen nachgebaut (graue Mäntel mit Mattglas-Visier, eigene Idee), Zeit als Sand im Glas am Gürtel.
- (b) Thumbnail in Bild 0–14 (nur D1).
- (c) Untertitel gelb, ein Wort, unteres Drittel, außer R1 frei.
- (d) End-Card letzte 2,0 s mit Suchleiste „KnowToon“ und Aufruf.
- (e) NASA-Foto sichtbar und passend (D3 für das Video).
- (f) Lucia/Jason unverändert.
- Farblogik STEP 2 konsequent (kaltes Blaugrau, Gold nur als Sand; LIFE grau / SOLD gold), Film-Korn/Vignette dezent, Regen/Staub-Partikel.

## Runde 2 (Nacharbeit, Commit 9d66bd1, 13.11.2026)

Grundlage: neues Bundle aus `9d66bd1`, 24 eigene Standbilder an den Befund-Stellen (Cover 0,1/0,4/0,47 s, 13,0, 20,9, 22,6, 24,5, 32,0,
43,9, 45,0, 62,6/63,5/64,5, 83,9/84,3, 85,3/86,0, 87,5, 93,4/95,5/97,6, 98,5/99,5/100,5 s) + 3 Bewegungs-Dreier (je 3 Frames in Folge:
stakes 5,0 s Kranfahrt, ida 30,5 s, home 57,5 s Tracking). `out/zeit-kontakt.png` nicht verwendet (älter als die letzte Änderung). Code nur gelesen.

### Noten
| Rolle | Runde 1 | Runde 2 | Kurzgrund |
| --- | --- | --- | --- |
| Regie | 8,0 | **9,0** | Twist lesbar (Spachtel kratzt, Farbsplitter fallen, klares Glas 64,5 s), knock lesbar (Messing-Klopfer an Holztür, beleuchtete Agenten mit Mattglas-Visier und Foto von Antons Glas), keine Untertitel mehr auf Karte/Nachweis, dunkle Stellen aufgehellt. Bewegung ruhig. |
| Design | 8,5 | **9,0** | Ida im Cover, Doppel-Sticker weg, Glass-Office-Schild lesbar, ISS-Stadtlichter füllen das Glas. Rest klein (Sticker 1748 über Nachweis, s. u.). |

Beide ≥ 9 → aus Regie-/Design-Sicht freigabefähig.

### Status
| # | Status | Beleg |
| --- | --- | --- |
| R1 Text auf Text | erledigt | 83,9 s Karte rechts im Rahmen (über y 1300), „THIS“ frei; 85,3 s Nachweis über dem Rahmen, „THAT“ frei |
| R2 knock dunkel | erledigt | 93,4 s Messing-Klopfer auf Holztür; 95,5/97,6 s Agenten beleuchtet, Foto mit Glas lesbar |
| R3 Twist | erledigt | 62,6–64,5 s Spachtel, Splitter, klare Glas-Hälfte |
| D1 Cover ohne Figur | erledigt | Bild 3/12/14: Ida rechts hinter dem Preisschild, Augen offen |
| D2 Doppel-Sticker | erledigt | 20,9/22,6 s nur Schild, lesbar |
| D3 ISS-Video | erledigt (Rest) | 98,5–99,5 s Stadtlichter bildfüllend im Glas; als weiße Flecken auf Bernstein eher „Lichter“ als eindeutig „Erde von oben“ – reicht, B1 trägt die Pflicht |
| R4 dunkle Stellen | erledigt | 13,0 s Passant mit Glas am Gürtel erkennbar; 24,5 / 32,0 s aufgehellt |
| D4 RENT-Zettel | erledigt | 43,9 / 45,0 s ganz im Bild, kein Sticker |
| R5 twenty | nicht nachgeprüft | P3 |

### Bewegung (3 Frames in Folge)
- stakes 5,0 s: langsame Kranfahrt über den Platz, ~2–3 px/Frame (halbe Größe), Figuren gleiten gleichmäßig ✔.
- ida 30,5 s: fast stehend, nur Atmen/Kopfnicken ✔.
- home 57,5 s: Tracking mit Vordergrund-Säule, Parallax lesbar, kein Ruckeln ✔.

### Rest-Befunde (kein Muss für 9)
| # | Szene / s | Problem | Vorschlag | Prio |
| --- | --- | --- | --- | --- |
| N1 | franklin 84,3 s | Sticker „1748“ liegt über der Nachweis-Zeile „OUR WORLD · NASA PHOTO FROM SPACE“ (nur „OUR WORLD · N… PACE“ lesbar). | Sticker unter die Zeile oder an die Karte setzen. | P3 |
| N2 | literal 86,0 s, empty 22,6 s | Nachweis-Zeile rechts oben angeschnitten („…SPACE“); Schild „GLASS OFFICE“ berührt den rechten Rand. | 30–40 px nach innen. | P3 |
