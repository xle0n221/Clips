# Regeln für Clips (verbindlich für jedes neue Video)

Vorgabe des Nutzers (2026-11-08): **Jeder Clip braucht einen roten Faden, darf nicht wirr hin und her
springen und soll angenehm und „süchtig“ machen – man soll nicht wegklicken können.**

Die folgenden Regeln sind daraus und aus der Analyse der zwei Referenzvideos des Nutzers abgeleitet
(Cartoon-Story-Shorts, ~3,6 Wörter/s, 1–3-Wort-Untertitel). Sie sind Handwerksregeln, keine
wissenschaftlich belegten Fakten.

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
   nicht als Sprung zu etwas Neuem.
6. Hochformat: Kompositionen **vertikal** aufbauen; alles Wichtige im mittleren Bildbereich,
   unteres Drittel für Untertitel freihalten.

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
  Alternativen: **Bella** `af_bella` (A-), **Finn** `am_fenrir`, **Max** `am_puck` (C+).
  Zentrale Liste `scripts/voices.json`, Hörproben `assets/stimmproben/` (aus dem Dashboard übernommen).
- Ziel-Sprechtempo **3,3–3,6 Wörter/s** (gemessen in Referenz 2: 216 Wörter / 59,5 s = 3,63).
- **Alle Fakten** aus Primärquellen, wörtlich zitiert in `docs/quellen-<thema>.md`; Abweichungen von
  gängigen Angaben werden vermerkt und nicht verwendet.

## Gemessene Merkmale der Referenzvideos des Nutzers
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
