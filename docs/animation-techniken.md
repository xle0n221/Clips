# Animations-Techniken für das nächste Video (Recherche 09.11.2026)

Ziel des Nutzers (`rueckblick-roemisches-reich.md`, „Vorgabe des Nutzers“): anders, besser, optisch
ansprechender – Übergänge, Kamera, Figuren-Bewegung. **Inspiration = Technik.** Keine fremden Figuren,
Marken oder Looks kopieren; alles wird mit unserem Bau-Kit (`src/episode/kit/`, Cel-Shading, `<Ink>`) gebaut.

## Wie belegt ist (bitte lesen)
- Direkter Seitenabruf war in dieser Sitzung gesperrt (`getaddrinfo ENOTFOUND` für remotion.dev und
  wikipedia.org). Alle Belege unten stammen aus **Websuche-Auszügen** der genannten Seiten; die Seite
  selbst wurde nicht geöffnet. Zitate sind deshalb kurz und als „Auszug“ zu lesen. Vor einer
  Übernahme in `clip-regeln.md` bitte mit freigeschaltetem Netz gegenlesen.
- Wikipedia/Fach-Blogs sind Sekundärquellen. Primärquelle der Grundprinzipien ist das Buch
  F. Thomas & O. Johnston, *Disney Animation: The Illusion of Life* (1981) – **nicht selbst gelesen**,
  ich kann den Wortlaut des Buches nicht bestätigen.
- „Stand im Code“ = selbst im Repo nachgesehen (Datei angegeben).

## Stack-Prüfung (selbst nachgesehen)
- Installiert: `remotion`/`@remotion/three` 4.0.541, `@react-three/fiber` 9.2.0, `drei` 10.7.9,
  `three` 0.178.0, `maath`, `@remotion/media-utils` (`package.json`, `ls node_modules`).
- **Nicht installiert:** `@react-three/postprocessing`, `postprocessing`, `@remotion/transitions`
  (`ls node_modules/@react-three` → nur `drei`, `fiber`). Nichts installiert.
- Vorhanden ohne Installation: three-Addons `three/examples/jsm/postprocessing/` (u. a.
  `EffectComposer`, `UnrealBloomPass`, `BokehPass`, `LUTPass`, `RenderTransitionPass`, `OutputPass`)
  und drei-Helfer (`Outlines`, `Trail`, `Sparkles`, `Cloud`, `ContactShadows`, `Float`, `CameraShake`).
  Achtung: `Float`/`CameraShake` laufen über `useFrame` → für uns nicht deterministisch, nicht nehmen.
- Determinismus: Remotion-Doku (Auszug, https://www.remotion.dev/docs/three-canvas): *„Instead of using
  React Three Fibers useFrame API, you can (and must) write your animations fully declaratively using
  Remotions useCurrentFrame API.“* und *„During rendering, <ThreeCanvas> overrides the frameloop prop to
  'never'“*. Folge: jede Bewegung = Funktion von `frame` (auch Verzögerungen: Wert bei `frame − k`).
- **Eine** `ThreeCanvas` für alle Szenen (`src/episode/Episode.tsx`, Szenen als `<Sequence layout="none">`).
  Echte Überblendungen (beide Szenen gleichzeitig sichtbar) würden während der Überlappung zwei
  Szenengraphen rendern → teuer. Darum unten Übergänge, die den Schnitt **verstecken** (Blur, Form,
  Dunkelheit) statt zu überblenden.
- Kostenbasis: Rom 56 min Render für 90,1 s × 30 fps = 2 703 Bilder → **≈ 1,24 s/Bild**
  (`rueckblick-roemisches-reich.md`). Die Kosten-Spalte ist **geschätzt**, nicht gemessen:
  „0“ = nur andere Zahlen pro Bild, „gering“ = einige Meshes/DOM-Elemente mehr (< +5 % geschätzt),
  „mittel“ = zusätzliche Szene-Elemente in großer Zahl, „hoch“ = Vollbild-Shaderpässe in 1080×1920 auf
  CPU (swangle) – vor Einsatz mit `npm run contactsheet`/Teil-Render messen.

## Stand im Code (Ausgangslage, selbst gelesen)
- Jeder Szenenwechsel: dieselbe weiße Blitz-Blende `CutFlash` (0,55 → 0 in 5 Bildern) + `whoosh.wav`
  (`Episode.tsx`, `overlays/Effects.tsx`). → Ein einziger Übergangstyp für alle 12 Wechsel.
- Kamera `Shot` (`kit/camera.tsx`): gerade Linie von `from` nach `to`, immer dieselbe Kurve
  `Easing.bezier(0.33,0,0.2,1)`, Sinus-Wackeln, `punch`. Kein Orbit, keine fov-Fahrt.
- Blinzeln `Toonie.tsx` Z. 105: `frame % 95 < 3` → **alle Figuren blinzeln im selben Bild**, streng alle
  3,2 s. Kein Mundsync mit der Stimme (`visualizeAudio`/`useAudioData` nirgends im Code).
- Post: `Grade` = Vignette + Korn (DOM); CSS-Filter `saturate(1.15) contrast(1.05)` auf der Canvas.

## Technik-Tabelle

| Technik | Wirkung (mit Beleg) | Umsetzung bei uns | Kosten | Prio |
|---|---|---|---|---|
| **Whip Pan (Reißschwenk) als Übergang** | StudioBinder (Auszug, https://www.studiobinder.com/blog/swish-pan-whip-pan-definition-film/): Tempo *„can blur imagery and move the viewer through time and space“*; „whip pan match cut“ = *„a whip pan that isn't achieved practically on set“*, also im Schnitt gebaut | Letzte 6 Bilder von Szene A: Kamera-Blickziel schnell seitlich drehen; erste 6 von B: aus derselben Richtung einschwenken. Harter Schnitt in der Mitte, verdeckt durch `SpeedLines` (`kit/fx.tsx`) + CSS `blur()` auf der Canvas (gibt es schon für `punch`). `whoosh.wav` passt bereits | 0 | hoch |
| **Form-/Objekt-Wipe** (Form deckt Bild zu, darunter Schnitt) | Remotion kennt `wipe()`, `clockWipe()`, `iris()` (*„reveals the scene through a circular mask from center“*, Auszug https://www.remotion.dev/docs/transitions/presentations) – Paket bei uns nicht installiert und für eine einzige Canvas nicht direkt nutzbar | DOM-Overlay `ShapeWipe`: Themen-Silhouette (SVG, z. B. Planet, Zahnrad, Blatt – eigene Form, keine fremde) wächst in 8 Bildern über das Bild, Schnitt bei voller Deckung, Form öffnet sich wieder (Iris). Variante „Objekt-Wipe“: ein 3D-Requisit fliegt nah an der Kamera vorbei und verdeckt den Schnitt | 0 (DOM) | hoch |
| **Match Cut** (gleiche Form/Position über den Schnitt) | Videomaker (Auszug, https://www.videomaker.com/how-to/editing/editing-technique/what-are-match-cuts-and-how-are-they-used/): *„a direct transition between two or more similar shots“* | Planung im Drehbuch/Szenen: letzte Form in A (z. B. runde Münze) und erste in B (runder Mond) an dieselbe Bildstelle mit `aim()`; optional 2 Bilder `punch` | 0 | hoch |
| **Zoom-Through** (Kamera fliegt in ein Objekt/Dunkel) | Ich kann keine Primärquelle bestätigen; Technik aus Referenz R3 „Ranfahrten“ abgeleitet (`referenz-analyse-2.md` §8) | `Shot` fährt in Öffnung (Tür, Auge, Bildschirm) bis Schwarz/Farbfläche bildfüllend ist → Schnitt → B beginnt mit Rückfahrt aus gleicher Farbe | 0 | mittel |
| **Licht-Flash** | Stand im Code, kein externer Beleg nötig | `CutFlash` nur noch für Pointen/Schock, eingefärbt (Akzentfarbe statt Weiß), nicht bei jedem Wechsel | 0 | mittel |
| **Dolly-Zoom (Vertigo)** | Wikipedia (Auszug, https://en.wikipedia.org/wiki/Dolly_zoom): Kamera fährt, Brennweite gegenläufig, Motiv bleibt gleich groß; Einsatz u. a. für *„a character's sudden realization“*; Bedingung `Abstand = Breite / (2·tan(fov/2))` | `Shot` um `fovTo` + `dolly` erweitern: Abstand pro Bild aus fov berechnen, damit Kopfbreite konstant bleibt. Für die eine Erkenntnis-Pointe je Clip | 0 | hoch |
| **Orbit (Kreisfahrt)** | Ich kann keine Primärquelle bestätigen (Standard-Kamerabewegung) | `Shot` mit `orbit: {center, radius, fromDeg, toDeg}` → Position auf dem Kreis statt Gerade. Max. ~100° wegen Erkennungsmerkmal (`szenen.md` Gelernt) | 0 | mittel |
| **Parallax / Multiplane** | Wikipedia (Auszug, https://en.wikipedia.org/wiki/Multiplane_camera): Ebenen in verschiedenen Abständen, nähere bewegen sich schneller – erzeugt Tiefe; Disney bis zu sieben Ebenen | 2–3 Vordergrund-Elemente nah an der Kamera (Bildrand, unscharf wirkend durch dunkle Farbe), Kamera seitlich fahren (Truck) statt nur vor/zurück. Untertitel-Zone frei halten | gering | hoch |
| **Antizipation** | Twelve principles (Thomas & Johnston 1981, über Sekundärquellen, Liste https://people.wku.edu/joon.sung/edu/anim/3d/animation/principles.html) – Definition dort im Auszug nicht enthalten; **bei uns gemessen:** Ausholen liest sich im Standbild als Absicht (`szenen.md`, Rom Frames 407/411/416) | Helfer `anticipate(frame, at, back, fwd)` für Arme, Kamera-Ranfahrt (4 Bilder zurück, dann rein) | 0 | hoch |
| **Follow-through & Overlap** | Prinzip Nr. 5 der zwölf (Quelle wie oben; Wortlaut nicht bestätigt) | Anhängsel (Antenne, Halstuch, Mütze, Haare) folgen dem Körper verzögert: Winkel = Körperbewegung bei `frame − 3` plus gedämpfte Nachschwingung `e^(−t)·sin` – rein aus `frame`, deterministisch | gering | hoch |
| **Squash & Stretch** | Ziel *„a sense of weight and flexibility“* (Auszug, Sekundärquellen zur Prinzipienliste, z. B. https://blog.cg-wire.com/12-principles-animation/); **bei uns:** wirkt erst ab Größe ≥ 0,34 (`szenen.md`) | In `Toonie` Volumen-erhaltend skalieren (y·s, x/z·1/√s) bei Sprung, Landung, Pop-in | 0 | mittel |
| **Smear / Bewegungsunschärfe** | Wikipedia (Auszug, https://en.wikipedia.org/wiki/Smear_frame): *„a frame used to simulate motion blur“*, zwischen Keyframes; im 3D oft über Mesh-Verformung oder duplizierte Elemente | Für schnelle Arm-/Objektbewegungen 2–3 halbtransparente Kopien bei `frame−1, −2` (Echo) oder in Bewegungsrichtung gestrecktes Mesh für 1–2 Bilder | gering | mittel |
| **Blinzeln, unregelmäßig** | Ruhe-Blinzelrate ca. 15–20/min, Lidschlag ca. 100–400 ms (Auszüge zu https://en.wikipedia.org/wiki/Blinking; Primärstudien nicht geöffnet – nicht bestätigt) | `seeded(figurId)` für Abstände 2–5 s je Figur, gelegentlich Doppelblinzeln, Blinzeln bei Kopfdrehung; Dauer 3–4 Bilder (= 100–133 ms) | 0 | hoch |
| **Lippen-Sync aus der Stimme** | Remotion-Doku (Auszug, https://www.remotion.dev/docs/visualize-audio): `visualizeAudioWaveform` *„is suitable for visualizing voice“*; `useAudioData` lädt die ganze Datei in den Speicher, für große `.wav` gibt es `useWindowedAudioData()` | Pegel der `voice.wav` je Bild → Mundöffnung von `Toonie` (Mund-Form „o“ ↔ „flat“). Nur die gerade sprechende Figur (Sprecher pro Szene aus dem Drehbuch). Die Pegel→Mund-Zuordnung ist meine Idee, nicht aus der Doku | gering (einmal Audio laden) | hoch |
| **Mimik-Wechsel weich** | Ich kann keine Primärquelle bestätigen | Augenbrauen `brow` und Kopf `look` über 4–6 Bilder interpolieren statt springen; Blick-Wechsel vor Kopfdrehung (Augen führen) | 0 | mittel |
| **Laufzyklus** | Ich kann keine Primärquelle bestätigen | `walk` gibt es (`Toonie.tsx` Z. 107, Sinus). Ergänzen: Körper hebt sich 2× pro Zyklus, Arme gegenphasig, Gewicht leicht nach vorn | 0 | niedrig |
| **Rim-Light (Gegenlicht)** | StudioBinder/Artlist (Auszüge, https://www.studiobinder.com/blog/what-is-backlight/): Gegenlicht *„create[s] a contour and add[s] depth … by separating the subject from the background“*, schwächer als das Hauptlicht | Zusätzliches gerichtetes Licht hinter/über der Hauptfigur (Toon-Rampe bricht es in eine harte Kante – passt zum Cel-Stil). Löst Köpfe vor dunklem Grund ohne Hintergrund aufzuhellen | gering (1 Licht, ohne Schatten) | hoch |
| **Farbkorrektur je Akt (Color Script)** | Cooper Hewitt / MoMA (Auszüge, https://www.moma.org/audio/playlist/192/2581): Pixar-Color-Scripts – kleine Farbbilder je Szene; Eggleston nannte es eine Farbkarte, nach der die Lichtabteilung arbeitet | Pro Szene `mood` (wie `romeMood`) → CSS-Filter auf der Canvas (Temperatur via `sepia`/`hue-rotate`, `saturate`) + farbiger Overlay mit `mix-blend-mode`. Vorher Farbband aller Szenen als ein Bild entwerfen | 0 (CSS-Filter existiert schon) | hoch |
| **Atmosphären-Dunst statt Tiefenunschärfe** | Tiefe durch Ebenen-Trennung siehe Parallax/Rim; echte DOF: three `BokehPass` *„for creating depth of field (DOF) effect“* (Auszug, https://threejs.org/docs/pages/BokehPass.html) | `scene.fog` in Hintergrundfarbe (Toon-Material reagiert auf Fog) – Hintergrund blasser, Figur klar. `BokehPass` nur nach Messung | Fog 0 · Bokeh **hoch** | Fog hoch · Bokeh niedrig |
| **Bloom (Glühen)** | three-Doku (Auszug, https://threejs.org/docs/pages/UnrealBloomPass.html): *„a more advanced Bloom but is also more expensive than the basic BloomPass“* | Billig: vorhandenes `Glow` (`kit/fx.tsx`, additive Fläche) nur an leuchtenden Dingen. Echter `UnrealBloomPass` über `EffectComposer` = mehrere Vollbild-Unschärfe-Pässe auf CPU | `Glow` gering · Bloom **hoch** | `Glow` mittel · Bloom niedrig |
| **Schnitt auf Wort/Beat** | Walter Murch, *In the Blink of an Eye*, „Rule of Six“ (Auszug, https://cloud.wikis.utexas.edu/wiki/spaces/rtf318/pages/80022510/Murch+s+Rule+of+Six): Emotion 51 %, Story 23 %, **Rhythmus 10 %**, Blickführung 7 %, 2D-Bildebene 5 %, 3D-Raum 4 % (Buch nicht gelesen) | Einstellungswechsel und Übergangs-Mitte auf Wort-Cues aus `captions.json` legen (Schlüsselwort = neues Bild); Blickführung: wichtiges Element in B dort, wo das Auge in A zuletzt war (= Match Cut) | 0 | hoch |

## Top 8 für das nächste Video

| # | Technik | Begründung | löst Rom-Schwäche |
|---|---|---|---|
| 1 | **Übergangs-Baukasten: Whip Pan + Form-Wipe** | 12 Wechsel mit immer gleichem Weiß-Blitz sind die auffälligste „gleich aussehende“ Stelle; beide verstecken den harten Schnitt, kosten 0, passen zur einen Canvas | Monotone Szenenwechsel (Stand im Code); „anders aussehen“ (Nutzer-Vorgabe) |
| 2 | **Match Cut / Zoom-Through, auf Wort-Cue** | Verbindet Szenen inhaltlich, Blickführung bleibt (Murch: Rhythmus + Blickführung); planbar im Drehbuch | Pills/Figur stehen nach Schnitt an anderer Stelle (`szenen.md` Gelernt) – Match Cut erzwingt gleiche Bildstelle bewusst |
| 3 | **Kamera-Baukasten: Orbit, Dolly-Zoom, Antizipation der Ranfahrt, Easing-Varianten** | `Shot` kennt nur Geraden mit einer Kurve; Orbit/Dolly geben Tiefe und eine Pointe je Clip | Totale/Halbnah-Wechsel wirkten gleichförmig; offenes Experiment „Antizipation für Kamera“ (`szenen.md`) |
| 4 | **Parallax-Vordergrund (Multiplane)** | Billigste Art, 3D-Tiefe sichtbar zu machen; Referenz R3 nutzt Tiefenstaffelung (`referenz-analyse-2.md` §6) | Bilder flach (offenes Experiment „Tiefenunschärfe/Dunst“, `art-direction.md`) |
| 5 | **Follow-through/Overlap + Squash & Stretch an `Toonie`** | Figuren wirken „steif“, weil alles gleichzeitig startet und stoppt; Anhängsel nachschwingen lassen ist deterministisch über `frame − k` | YOU klein/statisch (Rückblick); Bewegung bisher nur an Requisiten belegt |
| 6 | **Lebendiges Gesicht: Lippen-Sync + versetztes Blinzeln + weiche Mimik** | Gesicht ist das, was im Handy-Format zuerst gelesen wird; heute blinzeln alle Figuren im selben Bild und der Mund bewegt sich nicht zur Stimme | YOU im Quiz klein → ein sprechendes Gesicht trägt auch kleiner; mechanisches Blinzeln (`Toonie.tsx` Z. 105) |
| 7 | **Rim-Light + Atmosphären-Dunst (Fog)** | Trennt Figur vom Grund ohne teure Pässe; Gegenlicht ist schwächer als Hauptlicht (Beleg oben) | Gesichter in `fall` kaum lesbar, Gote fast schwarz in Rot (`austausch.md` Art Direction → Design-Kritiker); dunkler Streifen unten in `fired` |
| 8 | **Color Script je Akt** | Farbwelt nach Story-Phase ist schon Messlatte (`art-direction.md`); ein vorab entworfenes Farbband macht den Akt-Wechsel auch ohne Ton sichtbar | Standbild verrät Phase nicht immer; „anders aussehen“ mit 0 Renderkosten |

Bewusst **nicht** in den Top 8: echter Bloom und echte Tiefenunschärfe (Vollbild-Pässe, auf CPU
vermutlich deutlich teurer – nicht gemessen; erst als einzelnes Experiment mit Zeitmessung), Laufzyklus
(kommt nur vor, wenn das Drehbuch Laufen verlangt).

Rom-Schwäche „Bewegung nur im Video prüfbar“ löst keine Technik allein → Prüfung im **bewegten**
Probe-Clip (Rückblick, Punkt 3 der Nutzer-Vorgabe).

## Offen / nicht verifiziert
- Alle externen Zitate nur aus Websuche-Auszügen; Seiten selbst nicht geöffnet (Netz-Sperre).
- Kosten aller Zeilen geschätzt; keine Zeile ist gemessen. Erster Schritt beim Bau: Prüf-Komposition
  mit je Technik 3 s, Renderzeit pro Bild vorher/nachher.
- Ob `fog` mit unserem `Toon`-Material und `<Ink>`-Kontur sauber aussieht: nicht getestet.
- Ob `useWindowedAudioData` mit unserer `voice.wav` im CPU-Render deterministisch bleibt: nicht getestet.
