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
5. **Tempo-Regel für jedes Video (Nutzer 12.11.2026):** Sprechtempo 2,3–2,6 W/s (Ziel 2,4), Einstellungen 3–4 s, sanfte Übergänge; Länge **mindestens 62 s** (Nutzer 12.11.2026: „Mind 62 Sekunden“), ohne Wunschangabe ~62–70 s. Beleg: `docs/trends/benchmark-tempo.md` (31 virale Shorts, 9 mit messbarem Tempo; ruhige Top-Videos 2,2–2,6 W/s, Erzähl-Shorts Median 56 s). Tempo beim ersten Stimmlauf messen; bei Chatterbox **nicht** per `speed` beschleunigen (max. 1,05, Regel „Wie ein echter Geschichtenerzähler“) – Rate zu niedrig → weniger, längere Sätze.
   **Nutzer-Feedback 12.11.2026 (Tyson, Freigabe 2): „Video soll etwas langsamer sein, um es angenehmer zum Schauen zu machen.“** → ruhigeres Bildtempo: Einstellungen eher 3–4 s, Kamerafahrten langsamer, Whip-/Wipe-Übergänge nur an Kapitelgrenzen, keine Schnitte unter 1,5 s; die Werte darunter sind dafür überholt.
   Bisher: Neue Einstellung etwa alle 2–3 s, aber **innerhalb derselben Handlung** (Nah/Total/Detail),
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

## Stilwahl je Video (Vorgabe des Nutzers 11.11.2026)
> „Animationen und Charaktere müssen in den Videos nicht unbedingt genau gleich sein und es muss auch nicht immer 3D sein.
> Es kann auch 2D sein, wenn es zum Video passt. Du musst eigenständig lernen und denken und entscheiden.“

- **Art Direction entscheidet eigenständig** vor dem Szenenbau: 3D-Bau-Kit, 2D (flache Formen, SVG/CSS in Remotion,
  Paper-Cut, Infografik) oder Mischung (z. B. 2D-Karten/Diagramme in 3D-Welt). Kriterium: Was erklärt das Thema am klarsten
  und hält am besten? (Beispiele: Karten/Abläufe/Daten → eher 2D; Räume, Größenvergleiche, Weltall → eher 3D.)
- Figuren dürfen je Video neu gestaltet werden (anderer Look, andere Proportionen); **innerhalb eines Videos** bleibt die
  Hauptfigur wiedererkennbar (roter Faden).
- Im Drehbuch `"style": {"look": "2d|3d|mix", "why": "<1 Satz Begründung>", "characters": "<kurz>"}`; der Design-Kritiker
  bewertet die Wahl mit (Note ≥ 9). Ergebnis + Wirkung in `docs/agenten/art-direction.md` („Gelernt“) eintragen, damit die
  Entscheidung beim nächsten Thema auf Erfahrung beruht.
- Neue 2D-Bausteine als wiederverwendbare Komponenten anlegen (`src/episode/kit2d/`), genau wie das 3D-Kit wächst.
- Unverändert für jeden Stil: Themen-Treue (Standbild ohne Ton verrät das Thema), unteres Drittel frei für Untertitel,
  Schnitt auf Beats, Qualitäts-Tor Note ≥ 9.

## Echte Bilder und Videos – AUFGEHOBEN (Nutzer 14.11.2026: „Lass es mit den echten Bildern. Das frisst Zeit“)
- **Ab 14.11.2026 keine echten Fotos/Videos mehr suchen oder einbauen** – kein Recherche-, Lizenz- oder Einbauaufwand; Szenen zeigen alles gezeichnet/3D. Die folgende alte Regel gilt nicht mehr und bleibt nur als Verlauf stehen.

### (alt) Pflicht in jedem Clip (Vorgabe des Nutzers 13.11.2026: „Allgemein in jedem Clip wenn möglich echte Bilder und Videos passend miteinblenden, wenn es möglich ist urheberrechtlich … ab jetzt in jedem Clip“)
- **Jeder Clip** blendet passende echte Fotos **und** Videoclips ein, sofern frei lizenziert oder gemeinfrei. Recherche sucht sie mit (Liste in `docs/bildnachweise-<thema>.md`), Szenen bauen sie ein (z. B. als Foto-Rahmen, Hintergrund, Polaroid, Ken-Burns-Fahrt), Regie-Kritik prüft es. Gibt es nichts Passendes mit freier Lizenz, das in der Freigabe begründen.
- Videoquellen: Wikimedia Commons (WebM/OGV, Lizenz je Datei), NASA/NOAA/NPS-Videos (gemeinfrei). Nur Ausschnitte, die zum Gesagten passen.
- **Erlaubt und erwünscht:** echte Fotos/Videos mit freier Lizenz oder gemeinfrei – Wikimedia Commons (CC0, CC BY, CC BY-SA, Public Domain),
  NASA/NOAA/NPS/USGS (US-Bundesbehörden, gemeinfrei), Museen mit offener Lizenz. Je Bild Lizenz, Urheber und Datei-URL in
  `docs/bildnachweise-<thema>.md` notieren; CC BY/BY-SA-Nachweis in die Video-Beschreibung (`publish.youtube.description`). Freigeschaltet: commons.wikimedia.org, upload.wikimedia.org.
- **Nicht verwenden:** Trailer-Standbilder, Screenshots, Cover-Art, Logos und Figuren von Spielen/Filmen/Marken (z. B. Rockstar/GTA 6) –
  urheberrechtlich geschützt; „hart an der Grenze“ heißt hier: echte Orte und Dinge zeigen, auf die sich das Werk bezieht
  (GTA 6 → echte Fotos von Miami, Florida Keys, Everglades), dazu eigene Figuren. Rockstars Video-Richtlinie erlaubt laut Berichten nur
  **eigene Gameplay-Aufnahmen, nicht kommerziell** (Seite support.rockstargames.com aus dieser Umgebung nicht lesbar – Ich kann den Wortlaut nicht bestätigen).
- Reale Personen: nur Fotos mit freier Lizenz; keine Bearbeitung, die einen falschen Eindruck erweckt.

## Thumbnail im Video (Vorgabe des Nutzers 12.11.2026)
> „ab jetzt für jeden clip ein Thumbnail einarbeiten das zum clip passt, das ich auf den plattformen in den
> schneide einstellungen das eine bild Auswählen kann als ‚thumbnail‘“

- Grund: Bei Shorts lässt sich kein eigenes Bild hochladen, nur ein **Bild aus dem Video** wählen („Select a frame
  … to use as your thumbnail“, https://support.google.com/youtube/answer/10343433). TikTok-App: „Select cover“, den
  Rahmen auf die gewünschte Stelle ziehen (https://support.tiktok.com/en/using-tiktok/creating-videos/making-a-post).
- Jeder Clip bekommt deshalb **ein eigens gestaltetes Cover-Bild als echte Bilder im Video**: die ersten **0,5 s
  (Bilder 0–14 bei 30 fps)** zeigen das Hook-Motiv mit großem Titel (2–5 Wörter, Akzentgelb, mittig im sicheren
  Bereich, nicht im unteren Drittel), ohne Untertitel. Danach geht der Hook ohne Schnitt weiter (Stimme läuft ab 0,15 s).
- Inhalt: Hauptfigur + Kernbild des Themas + Neugier-Frage (passt zum Titel, kein Clickbait, der nicht eingelöst wird).
  Lesbar auch als kleines Vorschaubild (Kontrast, max. 5 Wörter).
- Drehbuch-Feld `"cover": {"text": "...", "frames": 15}`; zusätzlich Standbild `out/<id>-cover.png` (für
  Kontaktabzug/Freigabe 2 und für TikTok-Web, wo ein Bild gewählt werden kann).
- In `publish` steht `thumbnail: "Bild bei 0:00 (erste 0,5 s) wählen"`, damit der Nutzer die Stelle findet.
- Ich kann nicht bestätigen, wie bildgenau der Schieberegler der YouTube-App ist; deshalb 0,5 s statt eines Einzelbilds.

## Musik je Thema (Vorgaben des Nutzers 12.11.2026)
> „Die hintergrund musik soll passend sein und zeitgemäss … Bei düsteren themen einen trendigen zeitgemässen sound
> und bei anderen themen eben entsprechende.“ – „ab jetzt in allen videos nicht immer die selbe musik sondern passend
> zum thema und zeitgemässe melodien, eben ähnlich was momentan im trend ist“ – „ich will das du alles machst, trendige
> musik musst du dich von insperieren lassen bzw, es soll zum thema passen“ – „Es kann gerne rap & r&b lastig sein
> eben das was angenehm zu hören ist“

- **Claude macht die Musik komplett selbst** (`scripts/music.py`, nur numpy/ffmpeg, lizenzfrei). Nie fremde Melodien
  oder Beats kopieren – übernommen werden nur Stilmerkmale (Tempo, Instrumente, Groove). Eine Fassung **ohne Musik**
  gibt es nicht (vom Nutzer abgelehnt).
- **Grundcharakter:** moderne Rap-/R&B-Produktion, angenehm hörbar – warme Rhodes/E-Piano/Gitarre mit Neo-Soul-Akkorden
  (maj7, m9, m11, 9, 13), weicher 808 mit Glide, knackige, nicht aggressive Drums, Swing auf den Hi-Hats, Hat-Rolls
  sparsam, keine harte Verzerrung.
- **Preset wählen** im Drehbuch: `"music": {"mood": "<preset>", "why": "<Begründung: Thema + Musik-Trend>"}`.
  Optional `"bpm"` (sonst Standard ± Seed-Nuance) und `"seed"` (sonst die Episoden-ID).

  | Preset | Thema-Art | Sound | Zähl-BPM | Grundtonart |
  | --- | --- | --- | --- | --- |
  | `dark` | düster, Tragik, Verbrechen, Krieg, Abstürze | dunkles Moll-R&B/Trap, Rhodes-Flächen, Bell-Motiv, 808-Glide, Clap auf 3 | 140 (half-time 70) | f-Moll |
  | `hype` | Sport, Rekorde, Wettkampf, Aufstieg | treibender Rap-Beat, Gitarren-/Rhodes-Stabs, hüpfender 808, Ghost-Snares | 148 (half-time 74) | g-Moll |
  | `funny` | kurios, Tiere, Alltag, „wusstest du“ | bouncy R&B-Pop, Offbeat-Stabs, runder Bass, Snaps | 100 | F-Dur |
  | `epic` (`cinematic`) | Geschichte, Weltall, große Ereignisse | cineastischer Rap-Beat, Klavier + Streicherfläche, Boom-Bap, Taikos | 88 | d-Moll |
  | `chill` | Wissenschaft, Natur, ruhige Erklärstücke | R&B/Lo-fi, verschleppte Rhodes, Gitarre, Knistern | 82 | Es-Dur |
  | `upbeat` | nur alte Drehbücher ohne `music` (Rückfall) | alter Loop C–G–Am–F | 104 | C-Dur |

- **Trends einbeziehen:** vor der Wahl `docs/trends/aktuell.md` lesen (Abschnitt Sound/Musik der täglichen Analyse,
  `docs/trend-analyse.md`). Passt ein belegter Musik-Trend zum Thema, Preset/BPM danach wählen und im `why` mit Quelle
  nennen; fehlt ein Beleg, steht dort „Trend nicht belegt, Wahl nach Thema“.
- **Nie zweimal gleich:** der Seed aus der Episoden-ID wählt Tonart (±2 Halbtöne), Akkordfolge aus der Preset-Bank,
  Motiv und Tempo-Nuance (±3 %). `make_episode.py` druckt die Wahl („Musik: dark, 139.8 BPM, G minor, …“) – diese
  Zeile ins Freigabe-Paket. Klingt ein neues Video zu nah an einem früheren, anderen `seed` setzen.
- **Aufbau:** Akkord ab 0 s, Drums spätestens nach 2 s; Abschnitte à 4 Takte (A · B mit Motiv · A2 mit Variation ·
  Breakdown) → Variation alle 4–8 Takte. Stimmband **1–4 kHz bleibt frei** (Senke −7 dB), Lautheit wie der alte Loop
  (≈ −19 LUFS, `volume={0.13}` in `Episode.tsx`).
- **Hörprobe:** die Musik-Hörprobe (20 s, `out/musik-proben/` bzw. Anfang von `music.wav`) **zusammen mit der
  Stimm-Hörprobe** zur Freigabe 1 vorlegen. Claude kann nicht hören, nur messen (LUFS, Bandanteile) – das Urteil
  „passt / angenehm“ trifft der Nutzer.

## Laune des Erzählers je Thema + Standardstimme (Vorgaben des Nutzers 13.11.2026)
- **Standardstimme:** `am_michael` (Chatterbox, Klangvorlage `assets/stimmvorlagen/am_michael.wav`), vom Nutzer aus 8 Casting-Proben gewählt
  („Diese Stimme als Standard für jedes Video“). Dashboard-Vorgabe ist Michael; nur eine im Dashboard gewählte Stimme weicht davon ab.
- **Laune je Thema:** „Bei jedem Clip musst du je nach Thema entscheiden, in was für einer Laune er spricht.“ Vor der Vertonung legt das
  Drehbuch die **Grundlaune** fest: Feld `narratorMood` = `{ "mood": "…", "why": "1 Satz zum Thema" }`, z. B.
  düster-ernst (Krieg, Tragödie), neugierig-staunend (Wissenschaft, Weltall), verschmitzt-ironisch (Kurioses, Satire),
  warm-nachdenklich (Lebensgeschichten), angespannt-flüsternd (Mystery/Horror), locker-cool (Games, Popkultur), sachlich-ruhig (heikle Nachrichten, reale Vorwürfe).
- **Sprechart PFLICHT bei JEDEM Clip, automatisch zugewiesen** (Nutzer 14.11.2026, Großschreibung des Nutzers: „WICHTIG: achte bei jedem Clip auf die Sprechart. Bei jedem Thema muss eine passende Sprechart sein und automatisch von dir zugewiesen sein. BEI JEDEM CLIP“):
  Das Drehbuch legt **ohne Rückfrage** fest: `voicePreset` (lebendig · spannend · witzig · ruhig) passend zum Thema – das Dashboard-Standardfeld „lebendig“ wird dabei **überschrieben**, wenn es nicht passt –,
  `narratorMood` (Grundlaune + Begründung) und je Szene `delivery`/`emotion` (calm, warm, serious, sad, awe, tense, ironic, playful, indignant, excited, triumphant, angry, dramatic).
  Zuordnung (Ausgangspunkt): Horror/Mystery → spannend + tense/serious, Flüstern in der Spannung · Wissen/Weltall → lebendig + awe/warm · Kurioses/Satire → witzig + ironic/playful ·
  Lebensgeschichte/Tragödie → ruhig + warm/sad · Geschichte/Krieg → spannend + serious/dramatic · Games/Popkultur → lebendig + playful/excited · heikle Nachrichten → ruhig + serious.
  Prüfung: Retention-Kritiker benotet „Sprechart passt zum Thema“ (Teil der Mindestnote 9); die Hörprobe nennt Sprechart + Laune und die earshot-Messwerte.
- Die Grundlaune bestimmt `voicePreset`, die Szenen-`delivery`/`emotion` (exaggeration, Tempo, Pausen) und die Musikstimmung; Szenen
  dürfen davon für Spannung/Wendung abweichen, kehren aber zur Grundlaune zurück. Der Retention-Kritiker prüft, ob Laune und Thema zusammenpassen;
  die Hörprobe nennt die gewählte Laune.

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
- **Ziel-Sprechtempo 2,3–2,6 Wörter/s** (Entscheidung des Nutzers 09.11.2026: „Das Video ist zu schnell,
  unnatürlich schnell. Angenehme Sprechgeschwindigkeit; wenn es sein muss, sollen die Videos länger sein oder
  das Thema nicht so extrem ausgeführt werden. Der Zuschauer soll maximal unterhalten werden.“).
  Orientierung: R3-Erzähler 152 / 54,2 s = 2,81 W/s (`stimme-casting.md`). Zu schnell waren: Rom 319 / 90,0 s
  = 3,54 W/s, Sonnensystem 3,26 W/s. Gezählt werden **Skriptwörter** (wie die Untertitel).
  Folgen: Wortbudget ≈ 2,4 × Sekunden (60 s ≈ 145 Wörter, 90 s ≈ 215, 120 s ≈ 290; seit 12.11.2026 ruhiger). Passt der Stoff nicht,
  **erst kürzen** (weniger Stationen, dafür jede mit Pointe), dann länger werden – nie schneller sprechen.
  Kokoro-Tempo nie über 1,33 (darüber Sprung um ~10 %, unnatürlich); Tempo mit `npm run calibrate` wählen.

## Wie ein echter Geschichtenerzähler (Vorgabe des Nutzers, 12.11.2026 abends – gilt für jedes Video, geht den Stimm-Regeln darunter vor)
> „In der Hörprobe sind die Pausen zwischen den Wörtern und den Sätzen noch unnatürlich. Sie müssen natürlicher klingen
> bzw. wie ein normaler Mensch. Sie sind noch so extrem schnell. Der rattert alles durch. Bessere Aussprache. Wenn ein Satz
> endet, muss es sich auch danach anhören. Es muss sich menschlicher anhören und zum Satzende muss es ebenfalls leiser
> werden. Wie ein echter Geschichtenerzähler.“

**Ursache (gemessen an Tyson/UFC/Rolls-Royce vor der Änderung, `scripts/stimm_messung.py`):** Chatterbox-Spur global mit
ffmpeg `atempo` beschleunigt (`speed` 1,02 / 1,22 / 1,11), Pausen nach Satzende Median 355 / 235 / 210 ms (10 % unter
120 ms), Komma 60 / 65 / 100 ms, Szenenwechsel 130–140 ms; Satzanfang/-ende bei −40 dBFS + 30 ms abgeschnitten (bis
6 harte Kanten je Video); Satzende im Mittel nur −1,5 bis −1,9 dB leiser (UFC/Rolls), Satzende fallend nur 62–75 %.

**Regeln (Standard in `make_episode.py` + `NARRATOR`/`EMOTIONS` in `scripts/voice_fx.py`):**
- **Nicht beschleunigen:** Drehbuch-`speed` 1,0; `make_episode.py` begrenzt Chatterbox auf höchstens **1,05**. Wird das
  Video länger, ist das richtig (≥ 62 s). Fällt die Gesamtrate unter 2,3 W/s: **melden, nicht schneller machen** – Abhilfe sind
  weniger, längere Sätze (weniger Pausen je Wort), nicht schnelleres Sprechen.
- **Pausen (gemessene Stille):** Satzende **450–640 ms** je Emotion (Tabelle unten; Frage +60 ms), „ | “ = Satzpause +
  250 ms, Komma **160–240 ms**, Doppelpunkt/Gedankenstrich +80 ms, **Szenenwechsel ≈ 0,85–1,0 s** (Ausklang + 600 ms).
  Gebündelte Kurzsätze („Brooklyn. Dad leaves.“) bekommen innen dieselbe Satzpause. Innere Stillen werden nur verlängert,
  nie unter den Sollwert gekürzt (nur > 0,9 s → 0,7 s).
- **Satzende hörbar:** letzte ~0,45 s jedes Satzes weich um **1–3 dB** abgesenkt (Emotion; Frage halb), Ausklang nie
  kappen: 180 ms nach dem letzten Laut (Satzpegel −45 dB) behalten und weich ausblenden, 10 ms Einblendung am Anfang.
- **Fallende Satzmelodie erhalten:** exaggeration höchstens **0,70**, cfg 0,40–0,50 (hohe exaggeration 0,85–0,95 ging
  mit flacheren Satzenden einher, s. `docs/agenten/stimme.md`). Keine Tonhöhen-Bearbeitung.
- **Aussprache-Prüfung je Satz:** faster-whisper small.en hört jeden Satz; fehlt oder kommt ein Wort hinzu, bis zu 3
  Aufnahmen (neuer Seed), die beste gewinnt (`out/cb-cache/qc.json`). Rest-Abweichungen druckt `make_episode.py`.
  Zahlen bleiben Ziffern im Skript (`speakable`/`years` sprechen sie aus); Problemwörter umformulieren ohne Faktenänderung
  (z. B. „ex-boxer“ → „former boxer“, so steht es auch in der Quelle).
- **Messen vor jeder Freigabe:** `.venv/bin/python scripts/stimm_messung.py <id>` → W/s gesamt, Satzrate (W/s und Silben/s
  ohne Pausen), Pausen Satz/Komma/Szene, Pegelabfall und Tonhöhe am Satzende, harte Kanten, Whisper-Treffer (Schreibweise
  und gesprochene Form). Ziel: Whisper gesprochen ≥ 98 %, 0 harte Kanten, Satzende im Mittel ≥ 3 dB leiser. Dazu earshot
  (`measure`) für LUFS.
- **Ergebnis der Umstellung** (Tyson/UFC/Rolls, Einzelwerte `docs/agenten/stimme.md`): Satzpause 210–355 → 390–520 ms,
  Komma 60–100 → 200–240 ms, Szene 130–140 → 755–845 ms, Satzende −1,5…−3,9 → −3,0…−4,5 dB, Whisper gesprochen
  96,7–98,2 → 97,8–99,5 %. Gesamtrate fiel auf 1,75–2,06 W/s (Dauer 93–111 s); nicht beschleunigen – höhere Rate nur über weniger, längere Sätze (weniger Pausen je Wort), Entscheidung Nutzer/Orchestrator.

## Stimme wie ein Synchronsprecher (Vorgabe des Nutzers, 12.11.2026 – gilt für jedes Video, geht den älteren Stimm-Regeln vor)
> „Dazu sollen die Stimmen lebensecht klingen und so klingen wie echte Menschen. Es heißt, das, was gesagt wird,
> thematisch soll auch so emotional ausgedrückt werden. Als würde ein Skript ein Synchronsprecher sprechen.“
- Jede Szene bekommt eine **Emotion passend zum Inhalt** (z. B. traurig/leise bei Tod, ungläubig bei Twist, ironisch bei
  Satire, triumphierend bei Erfolg, ernst bei Skandal) – im Drehbuch je Szene (`delivery` + Emotion), nicht ein Ton für alles.
- Lebensecht: natürliche Atmung/Pausen, wechselnde Tonhöhe und Lautstärke, Betonung auf Sinnwörtern; kein Leiern, kein
  gleichförmiges Vorlesen. Tempo-Regel 2,3–2,6 W/s bleibt.
- Prüfen vor Freigabe: Hörprobe mit mindestens zwei kontrastierenden Szenen (z. B. ruhig + dramatisch); Claude misst
  Tonhöhen- und Lautstärke-Spannweite je Szene, das Urteil „klingt echt“ trifft der Nutzer.
- **Umsetzung (seit 12.11.2026):** Drehbuch-Feld **`emotion` je Szene** (Pflicht bei `"engine": "chatterbox"`). Gesetzt →
  `make_episode.py` erzeugt die Szene **Satz für Satz** (Sätze < 4 Wörter werden angehängt), mit festem Seed je Satz
  (gleicher Text = gleiche Aufnahme), setzt eigene Atempausen und ersetzt `exaggeration`/`cfg` aus `voicePreset`/`delivery`.
  Werte in `EMOTIONS` (`scripts/voice_fx.py`), auch als Objekt überschreibbar (`"emotion": {"exag": 0.7, "gap_ms": 300}`).
  Belegte Chatterbox-Regler (Quellcode chatterbox-tts 0.1.7, `ChatterboxTTS.generate`): `exaggeration`, `cfg_weight`,
  `temperature` (dazu `repetition_penalty`, `min_p`, `top_p`, ungenutzt). README „Original Chatterbox Tips“
  (https://huggingface.co/ResembleAI/chatterbox): „Higher `exaggeration` tends to speed up speech; reducing `cfg_weight`
  helps compensate with slower, more deliberate pacing.“

  | `emotion` | wofür | exag | cfg | temp | Satzpause | Komma | Satzende leiser | Lautstärke |
  | --- | --- | --- | --- | --- | --- | --- | --- | --- |
  | `calm` | ruhige Erklärung | 0,40 | 0,50 | 0,75 | 500 ms | 190 ms | −2 dB | −0,5 dB |
  | `warm` | Hoffnung, Zuwendung | 0,45 | 0,45 | 0,80 | 480 ms | 190 ms | −2 dB | 0 |
  | `serious` | ernst, Skandal, Urteil | 0,45 | 0,45 | 0,75 | 540 ms | 210 ms | −2 dB | −0,5 dB |
  | `sad` | Tod, Verlust | 0,35 | 0,40 | 0,70 | 640 ms | 240 ms | −3 dB | −2 dB |
  | `awe` | Ehrfurcht, Rekord | 0,55 | 0,40 | 0,80 | 580 ms | 220 ms | −2,5 dB | 0 |
  | `tense` | Spannung vor Wendepunkt | 0,50 | 0,40 | 0,80 | 560 ms | 220 ms | −2,5 dB | −1 dB |
  | `ironic` | Satire, trockene Pointe | 0,60 | 0,40 | 0,85 | 470 ms | 180 ms | −1,5 dB | 0 |
  | `playful` | verschmitzt, Witz | 0,65 | 0,40 | 0,85 | 450 ms | 170 ms | −1,5 dB | +0,5 dB |
  | `indignant` (`angry`) | Empörung | 0,70 | 0,40 | 0,80 | 470 ms | 180 ms | −1,5 dB | +1,5 dB |
  | `excited` | Aufbruch, Eskalation | 0,70 | 0,40 | 0,85 | 450 ms | 160 ms | −1 dB | +1 dB |
  | `triumphant` | Erfolg, große Zahl | 0,70 | 0,40 | 0,80 | 500 ms | 190 ms | −1,5 dB | +2 dB |

  Stand 12.11.2026 abends (Abschnitt „Wie ein echter Geschichtenerzähler“): kein Tempo-Faktor mehr (alle 1,0), Pausen
  sind gemessene Stille. Frage +60 ms Pause und nur halbe Absenkung; Doppelpunkt/Gedankenstrich +80 ms auf die Komma-Pause.
  Keine Tonhöhen-Bearbeitung (Regel 09.11.2026 gilt weiter).
  Startwerte, nur gemessen (A/B in `docs/agenten/stimme.md`); Hörurteil des Nutzers einholen und Tabelle danach anpassen.
  Nicht übernommen: Chatterbox-Turbo (MIT, https://huggingface.co/ResembleAI/chatterbox-turbo) kennt Tags wie `[laugh]`,
  `[chuckle]`, ignoriert aber laut Quellcode `exaggeration`/`cfg` („CFG, min_p and exaggeration are not supported by Turbo
  version and will be ignored.“) – also weniger Emotions-Steuerung; nicht installiert, nicht getestet.

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
- Offen: Tempo-Ziel (2,3–2,6 nach Rom-Rückmeldung vs. 3,8 Vorbild) – vom Nutzer nicht entschieden; die gelobte Probe hat 3,05.

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
