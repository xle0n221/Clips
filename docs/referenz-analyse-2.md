# Referenz-Analyse 2: drei Story-Shorts des Nutzers (08.11.2026)

Gemessen mit ffprobe/ffmpeg an den hochgeladenen Dateien (nicht im Repo, Urheberrecht der Ersteller).
Nur Machart übernehmen, keine Figuren, Grafiken oder Texte kopieren.

| Ref | Länge | Format | Bildwechsel (ffmpeg `scene`) | Stil |
| --- | --- | --- | --- | --- |
| R1 „Du entscheidest“ (deutsch, als „AI-generated“ gekennzeichnet) | 46,7 s | 576×1024, 30 fps | > 0,3: 0 · > 0,12: 2 | flache Strichfiguren auf festem dunklem Sternhintergrund; Elemente ploppen ein statt Schnitten |
| R2 „Zeitreise 2009“ (russisch) | 144,0 s | 576×1024, 30 fps | > 0,3: 19 · > 0,12: 44 (≈ alle 3,3 s) | flache 2D-Vektorgrafik, dunkle Vignette, Figur halbnah |
| R3 „Zombie Apocalypse – 30th Floor – Part 1“ (englisch) | 71,1 s | 576×1024, 30 fps | > 0,3: 22 · > 0,12: 27 (≈ alle 2,6 s) | 2,5D mit weichen Verläufen, warmes Lampenlicht, Tiefenunschärfe, rote Dramatik-Lichter |

Ein Schwellwert ist nur ein Näherungsmaß für Schnitte; weiche Übergänge und Einblendungen auf gleichem
Hintergrund (R1) zählen damit kaum. Kontaktabzüge: alle 2 s ein Bild (selbst angesehen).

## Gemeinsame Machart (in allen drei sichtbar)
1. **Durchgehendes Einsatz-Anzeige-Element (HUD) oben**: R1 Balken „Loyalität“ und „Gehalt“ (Zahl ändert
   sich mit der Story: 3.300 € → 4.200 €, Balken wird rot); R3 Serien-Titel + Uhrzeit „Day 1 · 9:42 PM“ +
   Countdown „Water stops in 18:08“. Das ist der sichtbare rote Faden: Der Zuschauer sieht jederzeit,
   was auf dem Spiel steht.
2. **Du-/Hauptfiguren-Story mit Entscheidung**: Auswahlkarten A/B(/C/D) mit Mauszeiger (R1, R2),
   Schluss „Kommentiere A oder B“ / „Would you open the door?“ und **„Part 2“-Cliffhanger** (R1, R3).
3. **Untertitel**: 2–4 Wörter, Großbuchstaben, fett, mittig im unteren Drittel; **Schlüsselwort in
   Akzentfarbe** (gelb/orange/rot). R2 zweizeilig: gesprochene Wörter weiß, kommende grau (Karaoke).
4. **Info-Einschübe im selben Stil**: Gebäudequerschnitt, Pumpen-Schema, Tabelle, Kalenderblatt, Handy-
   und Monitor-Bildschirme, Notizbuch. Fakten werden als Grafik gezeigt, nicht nur gesagt.
5. **Pill-Beschriftungen** an Figuren/Dingen („DU“, „JONAS“, „3002 – LEO“, „KOSCHELJOK + FLESCHKA“).
6. **Licht und Tiefe** (R2, R3): dunkle Ränder (Vignette), ein warmes Hauptlicht, Hintergrund weicher/
   unscharf, rote Licht-Akzente bei Gefahr; ganz dunkle Szenen mit Lichtkegel für Spannung.
7. **Eine Hauptfigur mit Erkennungsmerkmal** (R3: rote Mütze, R2: roter Hoodie), in jeder Einstellung gleich.
8. **Kameraarbeit** (R3): Ranfahrten, Draufsicht/Spirale im Treppenhaus, Halbnah ↔ Totale im Wechsel.

## Folgen für unsere Clips (umzusetzen von Art Direction, Drehbuch, Szenen)
- HUD-Komponente fürs Overlay: Serien-Titel, Jahr/Zeit-Zähler, ein „Einsatz-Balken“ (für Rom z. B.
  „EMPIRE“-Lebensbalken und Jahreszähler 395 → 476), animiert an Cues gebunden.
- Untertitel: Schlüsselwort-Akzentfarbe (Cue `emph`), optional Karaoke-Grau für kommende Wörter.
- Auswahlkarten-Overlay (A/B) + Schluss-Frage an die Zuschauer; Serienlogik „Part 1/2“ wenn das Thema trägt.
- Info-Grafik-Einschübe (Karte, Zeitleiste, Querschnitt) als 3D-Kit-Bausteine im Cel-Stil.
- Pill-Labels als Overlay-Komponente.
- Licht: Vignette + warmes Key-Light + Tiefenstaffelung als Standard im `Grade`/Licht-Setup prüfen.
