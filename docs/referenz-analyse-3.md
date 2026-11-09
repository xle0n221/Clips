# Referenz-Analyse 3 – Inspirations-Clips des Nutzers (09.11.2026)

Vorgabe des Nutzers: „Diese Artworks sollen als inspirierend sein und Ähnliches ausarbeiten. ricksclips von
YouTube ebenfalls als große Inspo nehmen.“ Inspiration = **Techniken**, keine Figuren/Marken/Looks kopieren.

Methode: Kontaktabzüge mit ffmpeg (R4 alle 4 s, R5 alle 0,5 s), Schnitte mit `select='gt(scene,0.3)'`.
Bilder: scratchpad `inspo/a-every4s.jpg`, `inspo/b-every05s.jpg` (nicht im Repo).

## R4 – TikTok @storyfading, russisch, 2D-Flat-Vektor, 576×1024, 144,0 s
- 19 harte Schnitte (Schwelle 0,3) in 144 s → Ø ~7,2 s je hartem Bildwechsel; dazwischen Bewegung im Bild
  (Requisiten, Klick-Cursor). Schwelle erfasst weiche Wechsel nicht – Schnittfrequenz daher nur Untergrenze.
- **Dunkle Bühne mit Spotlight/Vignette:** fast schwarzer Hintergrund, Figur im Lichtkegel, kaum Kulisse →
  Figur und Requisit lesen sofort.
- **Held-Requisit groß im Bild** (Flash-Drive, alter PC, Wettschein, Handy) – Objekt erzählt die Szene.
- **Quiz-Mechanik mit Cursor:** Auswahl A–D, Cursor klickt, Häkchen erscheinen nacheinander („alles auf
  einmal“) – Spiel-Gefühl.
- Pill-Titel oben (Thema der Szene), Datums-/Orts-Stempel („15 сентября 2009“), Rangliste als Grafik.
- Untertitel 2 Zeilen, Schlüsselwort farbig (gelb/rot).
- Ende: „Teil 2“-Karte + Cursor klickt „Abonniert“ → Serien-Bindung.

## R5 – @lfverseTales „Your speed doubles every morning“, 2D, 12,4 s (Bildschirmaufnahme, 60 fps)
- **Eskalations-Format:** HUD oben „DAY n · X MPH“ verdoppelt sich je Tag (6 → 24 → 96 → 384 → 768);
  jede Stufe ein Vergleichsobjekt (Bus, Sprinter, Sportwagen, Jet, Schall).
- **Bewegungs-Echos (Afterimages):** 3–5 halbtransparente Nachbilder hinter der Figur bei Tempo,
  plus Speed-Lines – Tempo ohne Kamera-Wackeln lesbar.
- **Seitliche Kamerafahrt mit Parallax:** Figur bleibt im Bild, Hintergrund (Häuser, Bäume, Horizont) zieht
  in Ebenen vorbei; tiefer Horizont, Sonnenuntergangs-Verlauf.
- **Extreme Gesichts-Großaufnahme** für die Reaktion (riesige Augen, offener Mund), Schnitt hart danach.
- Vergleichsobjekt fährt ins Bild und wird überholt (Größe/Tempo als Witz).
- Wort-für-Wort-Untertitel, Großbuchstaben, gelb mit dunkler Kontur.

## Übertragbar auf unsere 3D-Pipeline (Priorität)
1. Bewegungs-Echos + Speed-Lines (Nachbilder = Figur mehrfach mit `frame − k` und Opazität) – günstig.
2. Seitliche Tracking-Fahrt mit Parallax-Ebenen (passt zu Top-8 Nr. 4).
3. Spotlight-Bühne: dunkler Hintergrund + Lichtkegel/Vignette für „Fokus“-Momente (günstig: Licht + Plane).
4. Extreme Reaktions-Großaufnahme mit Augen-Pop (Pupillen/Augen skalieren) als harter Schnitt.
5. Held-Requisit in Großaufnahme pro Szene (Objekt erzählt).
6. Quiz mit Cursor-Klick + nacheinander erscheinenden Häkchen (Overlay; Endkarte „Part 2“).
7. Eskalations-Zähler im HUD als Story-Gerüst für passende Themen.

## ricksclips (YouTube)
Ich kann das nicht bestätigen: Eine Websuche nach „ricksclips YouTube“ fand den Kanal nicht (09.11.2026),
und YouTube-Videos lassen sich in dieser Umgebung nicht direkt laden. Analyse folgt, sobald der Nutzer einen
Link oder eine Bildschirmaufnahme liefert.
