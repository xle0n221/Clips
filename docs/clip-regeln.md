# Regeln für Clips (verbindlich für jedes neue Video)

Vorgabe des Nutzers (2026-11-08): **Jeder Clip braucht einen roten Faden, darf nicht wirr hin und her
springen und soll angenehm und „süchtig“ machen – man soll nicht wegklicken können.**

Die folgenden Regeln sind daraus und aus der Analyse der zwei Referenzvideos des Nutzers abgeleitet
(Cartoon-Story-Shorts, ~3,6 Wörter/s, 1–3-Wort-Untertitel). Sie sind Handwerksregeln, keine
wissenschaftlich belegten Fakten.

**Namen der Referenzen:** „Referenz 1/2“ in diesem Dokument = erste Runde (5,3 s und 59,5 s, Tabelle
unten). „R1/R2/R3“ = zweite Runde in [`referenz-analyse-2.md`](referenz-analyse-2.md) (46,7 s deutsch,
144 s russisch, 71,1 s englisch). Referenz 2 ≠ R2.
Themenunabhängiger Ablauf und Muster je Themen-Art: [`playbook-themen.md`](playbook-themen.md).

## Story (wichtigster Teil)
1. **Eine zentrale Frage / ein Rätsel** in den ersten 2 Sekunden, das erst am Ende aufgelöst wird
   (Referenz: „They painted the jail cell pink …“ – man will wissen, warum).
2. **Ein Einsatz**: Etwas steht für die Figur auf dem Spiel (Wette, Job, Gefahr, Rekord).
3. **Kausalkette statt Aufzählung**: Jede Szene folgt aus der vorherigen („So …“, „But then …“,
   „Until one night …“). Kein „und noch ein Fakt“.
4. **Eskalation**: Jede Station ist größer/verrückter als die vorige; das Stärkste kommt zuletzt.
5. **Wendepunkt** im letzten Drittel (Referenz: „Until one night, a guard forgets …“).
6. **Auflösung + Pointe**, idealerweise mit **Loop**: Der letzte Satz führt in den ersten.
7. Reaktionen als Atempause und Humor („Wait, what?“, „Nope.“), aber sparsam.

## Themen-Treue (Vorgabe des Nutzers, gilt für jedes Thema)
1. **Alles im Bild passt sofort erkennbar zum Thema**: Figuren, Kostüme, Orte, Requisiten.
   Wikinger → Wikinger mit Bart, Rundschild, Axt, Langschiff, Fjord. Altes Ägypten → Pharao mit
   Kopftuch (Nemes) und Krummstab, Pyramiden, Sphinx, Nil, Hieroglyphen. Weltraum → Astronaut im
   weißen Raumanzug mit Helm, Rakete, Planeten.
2. **Test**: Ein Standbild ohne Ton und ohne Untertitel muss das Thema verraten.
3. **Populäres Bild vs. Fakten**: Wo das „wie alle es sich vorstellen“-Bild historisch falsch ist
   (Beispiel: Hörnerhelme bei Wikingern), Standard = erkennbar **ohne** das falsche Detail.
   Das falsche Klischee nur als bewusster Gag, den der Sprechtext auflöst („Forget the horned helmets …“).
   Solche Fälle vor der Produktion mit Primärquelle prüfen und im Quellen-Dokument vermerken.
4. Die Hauptfigur trägt das **Kostüm des Themas** (nicht dasselbe Outfit in jedem Video).
5. Farbwelt passend zum Thema (Ägypten: Sand/Gold/Türkis; Wikinger: kühles Blau/Grau/Holz).

## Bild & Schnitt
1. **Eine Hauptfigur**, die durchgehend sichtbar handelt; Nebenfiguren mit klarer Rolle.
2. **Wenige, wiedererkennbare Orte**; Ortswechsel immer **motiviert und gezeigt**
   (Reise, Kamerafahrt, Durchblick) – nie unvermittelt.
3. **Durchgehende Bewegungsrichtung** bei Reisen (z. B. immer von links nach rechts / nach außen).
4. **Laufendes Element** über das ganze Video (Zähler, Punktestand, Karte mit Fortschritt),
   damit der Fortschritt sichtbar ist und man das Ende erreichen will.
5. Neue Einstellung etwa alle 2–3 s, aber **innerhalb derselben Handlung** (Nah/Total/Detail),
   nicht als Sprung zu etwas Neuem. Messwerte (ffmpeg `scene` > 0,12, `referenz-analyse-2.md`):
   R3 (englisch) ≈ alle 2,6 s, R2 ≈ alle 3,3 s; Referenz 2: jedes Bild im 2,5-s-Raster eine andere
   Einstellung. Zielwert bleibt 2–3 s; 3,5 s ist die obere Grenze (R2), kein Ziel.
6. Hochformat: Kompositionen **vertikal** aufbauen; alles Wichtige im mittleren Bildbereich,
   unteres Drittel für Untertitel freihalten.

## Bewegung & Übergänge (Pflicht ab Clip 3)
Bausteine: `design-system.md` §10. Grundlage: Regie-Kritik des Probe-Clips `MotionKitTest` (09.11.2026,
Noten in `agenten/regie-kritiker.md`). Pflicht in jedem Clip, jeweils mindestens einmal:
1. **Whip** (`transition.kind: "whip"`) für Orts-/Zeitsprünge statt Weiß-Blitz.
2. **Form-Wipe** (`wipe`, Themen-Form) für Kapitel-/Aktwechsel – höchstens 2× je Clip.
3. **Match Cut / Reaktions-Großaufnahme mit Augen-Pop** (`match` + `eyePopAt`, `eyes="wide"`) für die Pointe.
4. **Spotlight-Bühne** (`SpotlightStage`) für den einen „Fokus“-Moment (Enthüllung/Frage).
5. **Versetztes Blinzeln + Mund** (`blinkSeed` je Figur, `talk` aus `talkFromCaptions`) – immer, für alle Sprecher.
6. **Squash/Hop + Follow-through** (`hop`, `drag`) bei jedem Sprung/Stopp der Hauptfigur.
7. **Orbit** (≤ 100°) oder **Tracking + Parallax** (`trackShot` + `Foreground`) als bewegte Einstellung je Akt.
8. **Color Script** (`scenes[i].act`) über den ganzen Clip (Aufstieg → Fall sichtbar in der Farbe).
Nicht Pflicht (schwach oder nur gezielt): Dolly-Zoom (wirkt nur mit viel Hintergrund-Tiefe), Zoom-Through,
Farb-Blitz `tint`, Echo (nur bei schneller Bewegung, `step` so, dass Abstand ≥ ½ Körperbreite), Dunst, Rim-Light
(nur als `<RimLight>`-Hülle um Figuren). Alter Weiß-Blitz (`flash`) nicht mehr als Standard-Übergang.

## Prüfung vor dem Render (Pflicht)
- Drehbuch laut gegen die Story-Regeln prüfen: Gibt es Frage, Einsatz, Kausalkette, Eskalation,
  Wendepunkt, Auflösung? Würde man nach 3 Sekunden weiterschauen?
- Kontaktabzug (3 Bilder pro Szene): Ist jede Einstellung ohne Ton verständlich?
  Ist jeder Ortswechsel nachvollziehbar? Ist nichts außerhalb des Bildes?

## Selbstkritik am ersten Video (Sonnensystem, v1/v2)
Erfüllt die Regeln nur teilweise: Struktur eher Liste (9 Planeten à 5–7 s), Wette schwach
genutzt, kein Einsatz, Ortswechsel teils unvermittelt, kein laufendes Fortschritts-Element.
Themen-Treue: Milo trägt einen orangen Anzug mit Antenne statt eines erkennbaren Raumanzugs mit Helm.

## Sprache & Stimme (Vorgaben des Nutzers)
- Clips sind **auf Englisch**, mit einer **angenehmen Stimme**.
- **Zeitgemäßer, lockerer Slang**, aber so, dass **jede Altersgruppe** sich abgeholt fühlt
  (z. B. „Wait, what?“, „Nope.“, „real talk“, „basically“) – kein Cringe, keine Insider-Wörter.
- Standardstimme: **Lily** = Kokoro `af_heart` (laut `VOICES.md` des Modells einzige englische Stimme mit Note A).
  Das ist der **technische Standard** (`scripts/voices.json` `default`, Dashboard-Vorauswahl). Gemessen
  spricht `af_heart` flach (F0-IQR 3,5 HT, `stimme-casting.md`); das Rom-Video nutzt deshalb die Mischung
  `am_fenrir` 0,6 + `am_puck` 0,4 mit `post: "lively"` (Empfehlung K1). Welche Stimme für **neue** Clips
  Standard sein soll, entscheidet der Nutzer (offen, siehe `agenten/austausch.md`); bis dahin gilt die
  im Dashboard-Feld `voice` gewählte Stimme.
  Alternativen: **Bella** `af_bella` (A-), **Finn** `am_fenrir`, **Max** `am_puck` (C+).
  Zentrale Liste `scripts/voices.json`, Hörproben `assets/stimmproben/` (aus dem Dashboard übernommen).
- **Ziel-Sprechtempo 2,6–3,0 Wörter/s** (Entscheidung des Nutzers 09.11.2026: „Das Video ist zu schnell,
  unnatürlich schnell. Angenehme Sprechgeschwindigkeit; wenn es sein muss, sollen die Videos länger sein oder
  das Thema nicht so extrem ausgeführt werden. Der Zuschauer soll maximal unterhalten werden.“).
  Orientierung: R3-Erzähler 152 / 54,2 s = 2,81 W/s (`stimme-casting.md`). Zu schnell waren: Rom 319 / 90,0 s
  = 3,54 W/s, Sonnensystem 3,26 W/s. Gezählt werden **Skriptwörter** (wie die Untertitel).
  Folgen: Wortbudget ≈ 2,8 × Sekunden (60 s ≈ 170 Wörter, 90 s ≈ 250, 120 s ≈ 335). Passt der Stoff nicht,
  **erst kürzen** (weniger Stationen, dafür jede mit Pointe), dann länger werden – nie schneller sprechen.
  Kokoro-Tempo nie über 1,33 (darüber Sprung um ~10 %, unnatürlich); Tempo mit `npm run calibrate` wählen.
- **Sprechweise lebendig** (Messung in [`docs/stimme-casting.md`](stimme-casting.md)): Erzählstimme mit
  Tonhöhen-Streuung wie die englische Referenz R3 (F0-Interquartil ≈ 6–7 Halbtöne; flache Stimmen wie
  `am_michael`, `bm_george`, `af_heart` liegen bei 3–4). Lautheitsschwankung mit `voiceStyle.post: "lively"`
  bändigen (Präsenz 2–5 kHz + Kompressor), Pausen kurz halten (R3: kaum Pausen ≥ 0,3 s); Kunstpausen
  vor Pointen mit „…“ (einzige Satzzeichen-Variante mit messbarer Pause: 0,16 s in einer Probe), Tempo-Akzente über `voiceStyle.sceneSpeed` (0,9–1,1).
  Jede neue Stimme/Mischung per Whisper-Gegenprobe auf Verständlichkeit prüfen.
- **Alle Fakten** aus Primärquellen, wörtlich zitiert in `docs/quellen-<thema>.md`; Abweichungen von
  gängigen Angaben werden vermerkt und nicht verwendet.

## Gemessene Merkmale der Referenzvideos des Nutzers

Zweite Referenzrunde (HUD mit Einsatz, Auswahlkarten, Akzentwort-Untertitel, Info-Grafiken, Licht):
[`docs/referenz-analyse-2.md`](referenz-analyse-2.md).

| Merkmal | Referenz 1 (5,3 s) | Referenz 2 (59,5 s) |
| --- | --- | --- |
| Sprechtempo | 18 Wörter / ~5,0 s ≈ 3,6 W/s | 216 Wörter / 59,5 s = 3,63 W/s |
| Untertitel | 1 Wort (selten 2), Wechsel ~0,15–0,55 s | 1–3 kurze Wörter („the first coat“) |
| Untertitel-Stil | weiß, fett, schwarze Kontur + Schatten, unteres Bilddrittel mittig | gleich |
| Einstellungen | ständige leichte Kamerabewegung, Flug innen → Vogelperspektive | in einem Kontaktabzug (1 Bild/2,5 s) jedes Bild eine andere Einstellung |
| Look | 3D-Welt mit harten Schatten; Figuren: großer weißer Rundkopf, schwarze Kontur, Strichglieder, minimale ausdrucksstarke Gesichter, Kostüme | zusätzlich: Farbcodierung (Pink vs. Blaugrau), rote Wut-Adern, glühende Augen, Risse, Trümmer, Lichtstrahlen |
| Story | – | Rätsel → Eskalation → „Wait, what?“ → Folgen → „Until one night …“ → Auflösung mit Twist |

Methode: Whisper.cpp-Transkription mit Wort-Zeitstempeln, ffmpeg-Kontaktabzüge und Szenenerkennung.

## Technische Fallstricke (gelöst – nicht wieder einbauen)
- Kokoro liest „1,000“ als „one zero zero zero“ → Zahlen werden in `scripts/tts.py` (`speakable`)
  für die Sprachausgabe ausgeschrieben; Untertitel behalten die Ziffern.
- Kokoro schwächelt bei sehr kurzen Sätzen → Sätze werden zu Blöcken gebündelt.
- `kokoro-onnx` 0.5.0 übergibt `speed` für die HF-ONNX-Version als int32 → eigener Aufruf in `tts.py`.
- Node `fetch` nutzt den HTTPS-Proxy der Cloud-Umgebung nicht → große Downloads per `curl`.
- drei `<Outlines>` erscheinen beim Remotion-Rendering nicht → eigene Kontur `<Ink>` (Inverted Hull).
- Kamera/Objekte nie per `useEffect` setzen (wirkt erst ein Frame später) → alles aus `useCurrentFrame()`.
- Hochformat 9:16: horizontaler Bildwinkel bei 40–46° vertikal nur ~23–27° → Bahnen, Strahlen und
  Gruppen **vertikal** anordnen; jede Einstellung über ihre ganze Dauer mit Standbildern prüfen.
- Ohne GPU: `--gl=swangle`; Render von ~87 s dauert auf 4 Kernen ca. 40 Min → vorher Prüfbilder.
- Lautheit: `scripts/finalize.sh` normalisiert auf −14 LUFS (vorher gemessen −18,5 LUFS).
- Sticker mit langem Text (z. B. „1 YEAR = 165 YEARS“) liefen bei fester 96-px-Schrift über den
  Bildrand → `Sticker` (`overlays/Effects.tsx`) verkleinert die Schrift per `fitText` auf 620 px
  Textbreite (Reserve für das Überschwingen der Feder beim Hereinploppen). Prüfbild **im ersten
  Frame** des Stickers machen, nicht nur in der Mitte.
- Lange liegende/gekippte Figuren (Uranus-Einstellung): die Körperlänge nach der Drehung
  nachrechnen – Füße landeten bei x ≈ −3,8 außerhalb des ~±2,6 breiten Bildes.
