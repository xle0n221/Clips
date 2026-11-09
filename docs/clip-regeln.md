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
- Standardstimme: **Finn** = `am_fenrir` mit Chatterbox (Nutzer 09.11.2026: „die männliche Stimme ist sehr gut“, „direkt als
  Standardstimme ins Dashboard“) – `scripts/voices.json` `default` und Dashboard-Vorauswahl. Früher Lily = Kokoro `af_heart`. Gemessen
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

## Stimme: lebendig, charakteristisch, mit Druck (Vorgabe des Nutzers, 08.11.2026)
Vorgabe: **„Die Stimmen sollen lebendiger, charakteristischer und mehr Power haben und Betonungen passend zum Clip.“**

**Gemessen** (zwei Referenzvideos des Nutzers vom 08.11.2026 vs. Kokoro, eigenes Skript: Tonhöhe per Autokorrelation,
Wörter/Pausen per Whisper „base“; Werte der Referenzen sind durch die Hintergrundmusik verfälscht und nur Richtwerte):

| Merkmal | Ref. A (deutsch, 46,7 s) | Ref. B (englisch, 71,1 s) | Kokoro Lily roh | Kokoro Finn roh | Lily / Finn mit `voice_fx` |
| --- | --- | --- | --- | --- | --- |
| Tonhöhen-Streuung (Halbtöne, SD) | 5,6 | 5,9 | 2,8 | 3,7 | 4,6 / 4,5 |
| Tonhöhen-Spanne 10–90 % (Halbtöne) | 16,5 | 15,9 | 7,4 | 9,8 | 12,5 / 12,8 |
| Wörter/s | 3,06 | 2,58 | 3,43 | 3,75 | – |
| Pausen ≥ 400 ms pro Minute | 8,1 | 15,6 | 16,1 | 0,0 | – |

Ergebnis: Tempo und Pausen von Kokoro liegen nahe an den Referenzen; die **Satzmelodie ist nur etwa halb so bewegt**.
Daher bearbeitet `scripts/voice_fx.py` die fertige Sprachspur automatisch (in `make_episode.py`, Timing bleibt gleich):
Melodie verstärken (WORLD-Vocoder, pyworld), Akzentwörter mit Tonhöhen-Bogen + Lautstärke betonen, Druck (EQ, Kompressor).
Verständlichkeit geprüft: Whisper erkennt vorher und nachher gleich viele Wörter (59–60 von 65).

**Regeln fürs Drehbuch (Betonung passend zum Clip):**
1. **Sprechweise je Szene** im Feld `delivery`, passend zur Story-Stelle:
   Hook/Rätsel `punch` · Einsatz/Erklärung `normal` · Eskalation/Aufzählung `hype` · vor dem Wendepunkt `tense` ·
   Wendepunkt/Pointe `punch` · ruhige Erklärung `calm`. Werte (Tempo, Melodie) in `DELIVERY` in `scripts/voice_fx.py`;
   eigene Werte als Objekt, z. B. `"delivery": {"speed": 0.9, "expr": 2.4}`.
2. **Akzentwörter** mit Sternchen: `*five hundred years*` – 1–2 pro Satz, das überraschende Wort / die Zahl / der Kontrast.
   Sie werden jetzt **hörbar** betont (und wie bisher in den Untertiteln hervorgehoben). Nicht jedes zweite Wort markieren.
3. **Dramatische Pause** mit ` | ` im Sprechtext (Standard 350 ms, Feld `pauseMs`): vor Pointe, Twist, Auflösung.
4. **Kurze Sätze, klare Satzzeichen**: `?` für echte Fragen, `!` sparsam bei Eskalation; Reaktionen als eigener Satz („Wait, what?“).
5. **Sprechstil des ganzen Videos** im Feld `voicePreset` (Auswahl „Sprechstil“ im Dashboard; früher `voiceStyle` –
   umbenannt, weil `voiceStyle` jetzt das Objekt für Stimmen-Mischung/Nachbearbeitung ist, siehe `docs/stimme-casting.md`).
   Die Stile müssen **klar hörbar verschieden** sein (Rückmeldung des Nutzers: „hören sich in jedem Sprechstil gleich an“).
   Werte in `STYLES` (`scripts/voice_fx.py`); gemessen an den Hörproben (Lily, gleicher Satz):

   | Stil | Tempo | Stimmlage | Melodie | Pausen | Klang | Lily: Dauer / Stimmlage / Melodie-SD |
   | --- | --- | --- | --- | --- | --- | --- |
   | `lebendig` (Standard) | normal | normal | kräftig | 350 ms | Druck | 6,2 s / 212 Hz / 3,9 HT |
   | `spannend` | −14 % | −2 Halbtöne | mittel, starke Akzente | 650 ms | weich, nah | 7,6 s / 185 Hz / 3,8 HT |
   | `witzig` | +12 % | +2 Halbtöne | sehr kräftig | 220 ms | Druck | 5,1 s / 250 Hz / 4,5 HT |
   | `ruhig` | −10 % | −0,7 Halbtöne | flach | 450 ms | weich, nah | 7,0 s / 195 Hz / 3,3 HT |
6. Prüfen: Hörprobe der Szene mit Hook und Pointe anhören.

**Stand 09.11.2026 (Rückmeldung des Nutzers: „Stimmen hören sich unnatürlich an … sollen sich anhören wie echte Voice-Actor“):**
- Die Tonhöhen-Bearbeitung (WORLD-Vocoder, `liven`) ist **aus** (`VOCODER_DEFAULT = False`); die Tabelle oben beschreibt den
  früheren Zustand. In `make_episode.py` wirken vom Sprechstil nur noch Tempo, Pausen und die Lautstärke der Akzentwörter.
- In Prüfung: anderes Sprachmodell **Chatterbox** (MIT, https://huggingface.co/ResembleAI/chatterbox/blob/main/README.md; jede Ausgabe mit
  PerTh-Wasserzeichen von Resemble AI). Gemessen auf 4 CPU-Kernen: ~3,5× Echtzeit (29–32 s für 8–9,5 s Audio), Whisper „base“ 27/29 Wörter.
  Mit Kokoro-Stimmen als Klangvorlage keine messbar bewegtere Melodie (SD 3,0–3,2 HT).
- **Entscheidung des Nutzers 09.11.2026 nach den Hörproben: „Ja passt“ → Chatterbox ist die Sprachausgabe für neue Videos.**
  Drehbuch-Feld `"engine": "chatterbox"` (ohne das Feld bleibt Kokoro, z. B. Sonnensystem unverändert). Stimme = Dashboard-Auswahl
  (Klangvorlage `assets/stimmvorlagen/<id>.wav`), Stil = `voicePreset` → `exaggeration`/`cfg` in `STYLES`, Szenen-`delivery` als Zuschlag.
  Tempo der Chatterbox-Hörproben (19 Wörter, Dauer per ffprobe): Lily 2,59–3,07, Finn 2,73–3,17 W/s – fast alle im Ziel 2,6–3,0;
  Chatterbox hat keinen Tempo-Regler, nur „witzig“/„lebendig“ liegen knapp darüber.
  Einrichtung einmalig `bash scripts/setup_chatterbox.sh` (eigene Umgebung `.venv-cb`, PyTorch aus PyPI, Modell ~3,0 GB).

**Stand 09.11.2026 abends – Sprechweise nach Vorbild ricksclip3000 (Nutzer: „die männliche Stimme ist sehr gut“):**
- **Standardstimme: Finn (`am_fenrir`) mit Chatterbox**, `exaggeration` 0,6, `cfg` 0,4 (Prüfer Stimme: Finn 7/10, Lily 6/10 –
  Lily ließ zwei Fragen fallen und zerteilte einen Satz; `docs/agenten/stimme.md`).
- **Gemessen am Vorbild** (R7 „Brain in a jar“, 57,0 s, faster-whisper small.en, 215 Wörter): 3,80 W/s, ohne Pausen 4,0 W/s;
  Pause nach Komma Median 0,21 s, nach Punkt 0,22 s (P25 0,16, P75 0,26), längste 0,40 s; Median 7 Wörter je Satz;
  **keine dramatischen Pausen**. Tonhöhe wegen Musik nicht messbar.
- **Daraus für Drehbuch und Stimme:** kurze Sätze (Median ~7 Wörter), Frage als Hook, „Well,“ als Wende, trockene Pointe am
  Satzende; **keine „…“- und kaum „ | “-Pausen** (Kokoro-Pausen „natürlich“ mit 0,32–0,55 s fand der Nutzer „sehr unnatürlich“);
  Zahlen ausschreiben („one ninety-three“). Chatterbox-Pausen > 0,3 s kürzt `make_episode.py` automatisch auf 0,25 s
  (`maxPauseMs`, 0 = aus). Probe Finn danach 115 Wörter / 37,8 s = 3,05 W/s.
- Offen: Tempo-Ziel (2,6–3,0 nach Rom-Rückmeldung vs. 3,8 Vorbild) – vom Nutzer nicht entschieden; die gelobte Probe hat 3,05.

**Grenze:** Kokoro-82M hat keine Steuerung für Emotionen; `voice_fx` verstärkt nur die vorhandene Melodie und kann
keinen echten Schauspieler ersetzen. Für mehr Charakter wäre ein anderes Sprachmodell nötig (nicht getestet).
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
