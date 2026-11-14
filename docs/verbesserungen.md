# Lernprotokoll: Befunde der Prüfer je Clip

Format: Datum · Clip · Rolle · Befund (Ort, Problem) · Folge (Regel/Kit-Änderung/Commit).
Was zweimal auftritt, wird zur Regel in `docs/clip-regeln.md` oder zur Kit-Korrektur (siehe `docs/agenten-team.md`).

## Sonnensystem (v2, 08.11.2026)
- Endabnahme · ~9 s Tafel links angeschnitten, ~66 s Milo halb außerhalb, ~75 s langer Sticker angeschnitten → Commit be84199 (fitText für Sticker, Kameras korrigiert), Regeln in `clip-regeln.md` ergänzt.
- Selbstkritik · Story wirkt wie eine Liste statt Kausalkette; Kostüm (oranger Anzug) passt nicht zum Raumfahrt-Thema → Regeln „roter Faden“ und „Themen-Treue“ in `clip-regeln.md`.

## Overlays (Design-Kritik, 08.11.2026)
Geprüft: `src/episode/overlays/{Hud,Choice,Pill,Overlays,style,OverlayDemo,Captions,Effects,fonts}`,
`Episode.tsx`, `types.ts`, `make_episode.py` (`split_words`, `emph`), `docs/schnittstelle.md`. Prüfbilder:
`OverlayDemo` alle 200 Frames (halbe Größe), Schlüsselbilder in voller Größe, neue Komposition
`OverlayEdgeCases` (Randfälle), `SolarSystem` Frames 0/40/300/1330/2297 gegen die Bilder des Erstellers.
Maßstab: Abstände/Größen in px bei 1080×1920. Handy-Näherung: 1080 px ≈ 68 mm Bildbreite (6-Zoll-Gerät),
also 1 px ≈ 0,063 mm. Kontrast nach WCAG-Formel (relative Leuchtdichte), selbst gerechnet.

Behoben:
- `Choice.tsx`, Ausblenden: `opacity` + `transform` auf der ganzen Ebene erzeugten beim Rendern
  (Chromium/swangle) Geisterkopien der Karte B oberhalb des Titels und dunkle, fleckige Schrift
  (Prüfbild OverlayDemo Frame 197–199 und 136–139). → Ausblenden nur noch über Skalierung je Element
  (wie Sticker/Pills), keine Gruppen-Deckkraft. Status: behoben, Bild geprüft.
- `fonts.ts`/`Choice`/`Hud`/`Pill`/`Sticker`, Messung vor dem Laden der Schrift: `measureText` (in
  `fitText`) merkt sich jedes Ergebnis. Die erste Messung lief mit der Ersatzschrift, die Breiten blieben
  für den ganzen Render-Tab zu schmal. Folge: Mauszeiger auf dem Wortende („WALL▶S“), Sticker-Schrift in
  Einzelbildern zu groß. → Neuer Hook `useCaptionFontReady()`: Die Bausteine messen erst nach dem Laden,
  der Frame wartet per `delayRender`. Status: behoben. Hinweis: Standbilder des Sonnensystems zeigen die
  Sticker jetzt etwas kleiner (z. B. „150,000,000 KM“ bei Frame 1330). Das ist die korrekt gemessene
  Größe. Das fertige Video in `public/episodes/` ist nicht neu gerendert und nicht angefasst.
- `Choice.tsx`, Mauszeiger verdeckt das Wortende (bekannter Punkt des Erstellers): Die Spitze steht jetzt
  26 px rechts vom gemessenen Textende (max. Kartenrand − 86 px). Rechts im Text sind 40 px für den Zeiger
  reserviert, beim Pendeln ohne `pick` steht er rechts vom längeren Text. Status: behoben. Offen, aber
  vertretbar: Der Klick-Kreis (16 Frames) streift kurz das Wortende.
- `Choice.tsx`, 4 Karten + Hinweis: Der Hinweis „COMMENT A, B, C OR D“ lag auf den Untertiteln
  (Unterkante ≈ 1430 > Untertitel-Oberkante ≈ 1420). → Kartenhöhe 124 px bei 4 Karten, Abstand 24 px,
  Block endet spätestens bei y = 1380. Hinweis-Schrift per `fitText` (max. 62 px). Status: behoben.
- `Choice.tsx`, lange Optionen: „Raise an enormous army of mercenaries“ schrumpfte auf ≈ 22 px (auf dem
  Handy ≈ 1 mm Großbuchstaben, unlesbar). → Unter 40 px wird zweizeilig gesetzt (ausgeglichene
  Wortteilung). Status: behoben. Empfehlung im Drehbuch: Optionen ≤ ~18 Zeichen.
- `Choice.tsx`, lange Frage: Sie brach zweizeilig um und lag auf Karte A. → Einzeilig per `fitText`
  (max. 72 px, Reserve fürs Federn). Status: behoben.
- `Hud.tsx`, langer Serien-Titel lief links und rechts aus dem Bild. → `fitText` (max. 38 px). Status: behoben.
- `Hud.tsx`, 2 Zähler + große Werte: Die Kästen wuchsen mit dem Inhalt und überlappten
  („1453 A$1000000“), der Balken wurde gequetscht und „−100%“ überdeckte „EMPIRE“. → Feste Breite
  (1 Zähler 340 px, 2 Zähler je 250 px). Schriftgröße passt zum breitesten Wert des ganzen Videos und
  springt deshalb nicht. Tausenderpunkte ab 10.000 („$1,000,000“), Jahreszahlen ohne. Status: behoben.
  Rest: Bei 2 Zählern + 2 Balken sind die Zahlen nur ≈ 40 px groß. → Empfehlung in `schnittstelle.md`.
- `Hud.tsx`, Nachfedern: Der Zähler skalierte bis 1,2 und ragte über den Kastenrand (Frame 40, „409 AD“),
  der Balken pumpte bis 1,08 fast an den Bildrand (x ≈ 1062). → max. 1,12 bzw. 1,04. Status: behoben.
- `Episode.tsx`/`Hud.tsx`, Sticker unter dem HUD: Mit 2 Balken ist das HUD ≈ 455 px hoch, der Sticker
  (fest bei 430) lag darauf. → `hudBottom(spec)` statt fester 400. Status: behoben (Standardfall unverändert 430).
- `Pill.tsx`, Breite am Rand nur geschätzt (bekannter Punkt): Der Zipfel stand neben der Pill („ODOACER“
  bei x = 0,97). → Breite gemessen (`measureText`), Verschiebung höchstens so weit, dass der Zipfel unter
  der Pill bleibt, x auf 0,04–0,96 begrenzt. Status: behoben.
- Neue Prüf-Komposition `OverlayEdgeCases` (in `OverlayDemo.tsx`, Eintrag in `Root.tsx`): Balken 0/1,
  2 Zähler + 2 Balken, 4 und 3 Karten mit langen Texten, Pills am Rand, langer Sticker. Damit lassen sich
  die Randfälle künftig per Standbild prüfen.

Geprüft, in Ordnung:
- Determinismus: Alle Bewegungen kommen aus `useCurrentFrame()`, `trackAt` und `spring`. Keine
  Zufallswerte, kein Zustand zwischen Frames.
- Rückwärtskompatibilität: Ohne `hud`/`choice`/`label`/`emph` zeichnen `EpisodeOverlays` nichts.
  Die Standbilder des Sonnensystems sind gleich, abgesehen von Render-Rauschen (≈ 60 Einzelpixel, wie
  zwischen den beiden Vorher-Läufen des Erstellers) und der korrigierten Sticker-Messung (siehe oben).
- `make_episode.py` `split_words`: `*Western Empire*` markiert beide Wörter, Sternchen werden nicht
  vorgelesen, und der Abgleich der Wörter bleibt gleich.
- Kontrast (WCAG): Dunkle Schrift auf Akzentgelb 13,1:1. Zähler-Etikett `#B9B4E0` auf `#1E1B33` 8,5:1.
  Graue Karte `#5C566B` auf `#CFCAD8` 4,4:1 (für 50–60 px fett ausreichend, Mindestwert für große Schrift
  3:1). Weiße Schrift auf Rot `#FF3B30` 3,6:1 bzw. auf Pill-Rot `#FF5A5A` 3,1:1, beide gerade über 3:1.
  Hinweis und Untertitel haben zusätzlich eine schwarze Kontur. Weiße Buchstaben auf hellen
  Kreis-Plaketten (Blau 2,0:1, Grün 1,7:1) sind nur durch die 9-px-Kontur lesbar. Das genügt (Prüfbild),
  ist aber knapp.
- Timing: Karten kommen im Abstand von 6 Frames, der Zeiger fährt 18 Frames, der Klick kommt ≈ 1,3 s
  nach dem Cue-Wort. Der Zähler läuft 26 Frames, der Balken 12, der helle Rest folgt nach 8 + 16 Frames.
  Das ist lebendig, aber nicht hektisch. Einzig das Wippen des Hinweises (sin · 0,3, ≈ 1,4 Hz) liegt am
  oberen Rand.

Offen (Geschmack bzw. Entscheidung für Art Direction/Drehbuch):
- Safe-Areas: Verwendet und geprüft wurden HUD ab y = 150, Untertitel-Unterkante y = 1520,
  Auswahl-Unterkante ≤ 1380 und rechte Knopfspalte ab x ≈ 900–950 zwischen y ≈ 850 und 1650. Das ist
  eine **Annahme** nach gängigen Vorlagen. Ich kann die genauen Werte von TikTok/YouTube Shorts nicht
  aus einer Primärquelle bestätigen. Vor dem Rom-Video mit einem Bildschirmfoto der echten App
  gegenprüfen. Die Demo-Pill „GOTHS“ (x = 0,84) und der rechte Kartenrand (x = 980) reichen in diese Spalte.
- Untertitel in gemischter Schreibung („march into“). Laut `referenz-analyse-2.md` Punkt 3 nutzen die
  Referenzen Großbuchstaben. Eine Umstellung würde den Sonnensystem-Look ändern. → Für Rom als Option
  vorschlagen (z. B. Timeline-Feld `captionsUpper`). Nicht umgesetzt.
- HUD-Etikett „YEAR“ 26 px (Großbuchstaben ≈ 19 px ≈ 1,2 mm auf dem Handy) ist klein, aber als
  Nebenschrift vertretbar. Ziel wären ≥ 30 px.
- Karaoke-Grau (bekannter Punkt): **nicht nötig vor Rom.** Das gibt es nur in R2. Unsere Untertitel
  zeigen 1–3 Wörter und wechseln alle 0,15–0,55 s, dort bringt Grau für kommende Wörter keinen Nutzen.
- Part-2-Baustein (bekannter Punkt): **nicht nötig vor Rom.** Der Serien-Titel im HUD trägt „PART 1“,
  den Schluss decken ein `choice` ohne `pick` („COMMENT A OR B“) und ein Sticker-Cue („PART 2 →“) ab.
  Eine eigene Endkarte erst bauen, wenn das Drehbuch mehr als das verlangt.
- Pills enden hart mit der Szene, auch wenn die Figur im nächsten Schnitt noch zu sehen ist. Bei Bedarf
  den Cue in jeder Szene wiederholen.


## Rom-Kit (Design-Kritik, 08.11.2026)
Prüfbilder: `RomeKitTest` Bilder 7–133 (je Einstellung eins), vorher/nachher per `renderStill`.

| Ort | Problem | Maßnahme / Status |
| --- | --- | --- |
| `rome.tsx` `Colosseum`, RomeKitTest Einst. 0 | In der Totale nur 1,7 Figurhöhen hoch, Bögen und Attika-Fenster durchsichtig (Himmel scheint durch) → wirkt wie eine Mauer | Dunkle Gewölbegang-Wand (`ROME.vault #5E331C`) hinter jedem Bogen und Fenster, Masten fürs Sonnensegel auf der Attika (Maßstab); Regel: Totale mit `scale` 2,4–3, z −35…−45, seitlich versetzt, Kamera tief. **Behoben** |
| `rome.tsx` `Colosseum` | Leistung: ~1 000 Meshes, Bogen-Baum bei jedem Frame neu aufgebaut | Bogen-Ring per `useMemo` nur bei Form-/`ruin`-Änderung; `detail="far"` + `segments={24}` ≈ 45 % weniger Meshes. Messung per Einzelbild nicht aussagekräftig (Seitenladezeit dominiert, ±1 s Rauschen). **Behoben, Wirkung im echten Render noch nicht gemessen** |
| `rome.tsx` `Beard`, Einst. 3 | Goten-Bart = grobe gelbe Kugel; Gelb kollidiert mit dem Halstuch der Hauptfigur | Kieferschale + Füllung + Koteletten + 5 Zotteln mit Strähnen-Textur, hängender Schnurrbart; Haar/Bart kupfer `#C46A2B`. **Behoben** |
| `rome.tsx` `Throne`, `Toonie.tsx` `sit`, Einst. 2 | Lehne verschwindet hinter dem Kopf; Sitzbeine steife Stöcke zur Kamera | Lehne 2,9 breit/5,8 hoch, Seitenpfosten mit Knäufen, Adler; `THRONE_SIT_Y`. `sit` knickt jetzt im Knie (bei `sit=0` unverändert – SolarSystem Bilder 0/300/1330 vorher/nachher nur im Render-Rauschen verschieden, 0–126 px, gleiches Bundle zweimal: 94–113 px). **Behoben** |
| `rome.tsx` Texturen (Tempel, Banner, Rolle, Münze, Karte, Stele) | Systemschrift (DejaVu Serif) – je Rechner anders | Montserrat 900 aus `public/fonts` als `ROME_FONT` per FontFace + `delayRender`, Texturen neu gezeichnet, sobald geladen. **Behoben** |
| `rome.tsx` `Focale`, Einst. 1 | Gelbes Halstuch kaum sichtbar: saß bei y 2,47 **im** Kopf (Kopfkugel reicht bis 2,05) – nur die Zipfel ragten heraus | Dicker Wulst auf den Schultern (y 2,3, r 0,6), Knoten + lange Zipfel über dem Panzer, Kontur 0,06–0,08, leichte Eigenleuchtkraft. **Behoben** |
| Kontrast weißer Kopf / Sandstein | Gemessen im Endbild nur 1,1–1,3 : 1 (Kopf `#E5E3DA`, Wand `#E6D8B0`) | Köpfe vor die dunklen Gewölbegänge: gemessen 6,1 : 1 (`#764634`). Wandfläche selbst bleibt hell (Regel „Hintergrund heller“) – trägt nur die INK-Kontur. **Teilweise** (Platzierungsregel in design-system.md §4.2) |
| `DangerLight` | Orange `#FF3B1F` auf warmem Grund = Lagerfeuer | Karmin `DANGER #FF1F3D`, unruhiges Flackern; bedrohlich nur zusammen mit `fall`-Stimmung (kühl, gedimmt). Zu nah färbt es Figuren ganz rot → Abstand 3–5, Stärke 0,6–0,9. **Behoben** |
| Stimmung nach Story-Phase | Keine fertige Abend-/Niedergangs-Variante | `romeMood("glory" \| "decline" \| "fall")` + `<RomeAtmosphere>` + `mood.grade`; Prüfeinstellungen 8 (decline) und 9 (fall). **Behoben** |
| `TimelineStele` | Standardjahre 117 AD/285 AD nicht freigegeben | Standard `ROME_YEARS` = 27 BC, 193, 395, 410, 455, 476, 1453 AD. **Behoben** |
| design-system.md §6 | Querbusch „nach Vegetius“ – laut Faktencheck nicht belegt | Als reine Stil-Entscheidung markiert, nicht im Sprechtext behaupten. **Behoben** |
| Offen | `fall`-Totale: Ruine (`ruin`) im Dunst schwach lesbar; Stele-Kappe in Einst. 7 angeschnitten (nur Prüfkamera); Wirkung von memo/`far` im echten Render messen | **Offen** – Regie/Szenen-Agent |

## 14.11.2026 · „In This City, You Pay With Time“ (erstes KnowToon-Video) – Nutzer: „Das Video ist sehr gut“
Was dieses Video ausmacht (beibehalten für künftige KnowToon-Videos): Video-Paket-Prompt des Nutzers (docs/prompts/knowtoon-videopaket.md) als Grundlage; eigene 3D-Klotzfiguren mit einem Schlüsselobjekt (Sand-Glas) und einer Farblogik (Gold nur als Sand); Stimme Michael, ruhig-unheimliche Grundlaune, 2,64 W/s; gelbe Wort-für-Wort-Untertitel; Basstreffer vor Enthüllungen + Glas-Akzent beim Twist; Ø 2,3 s je Einstellung; echte NASA-Aufnahmen eingebunden; End-Card „KnowToon“. Jede Prüfrolle ≥ 9 nach je einer Nacharbeitsrunde. Technik: Render in Abschnitten (scripts/render_chunks.sh) wegen Container-Neustarts.
