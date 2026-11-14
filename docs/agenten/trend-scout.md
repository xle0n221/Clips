# Rolle: Trend-Scout (tägliche Trend-Analyse)

> Gedächtnis dieser Rolle. **Vor jedem Auftrag lesen, nach jedem Auftrag ergänzen.** Ablauf: [`README.md`](README.md),
> Auftrag und Regeln: [`../trend-analyse.md`](../trend-analyse.md).

## Auftrag
Täglich belegen, welche Cartoon-/Erklär-Kanäle, Themen und Machart (Animation, Hook, Tempo, Cover) auf YouTube Shorts
und TikTok gerade gut ankommen, und daraus höchstens 5 umsetzbare Erkenntnisse für unsere Clips ableiten.
Ergebnis `docs/trends/<datum>.md` + `docs/trends/aktuell.md`. Prüfer: Retention-Kritiker (Nutzen) + Faktenprüfer (Zahlen, Stichprobe).

## Messlatte (woran der Prüfer die Arbeit bewertet, 1–10)
- Jede Zahl mit URL, Datum, Kennzahl-Art und Quellentyp (Primär/Drittanbieter)
- Erkenntnis ist eine übertragbare **Technik**, keine Kopie fremder Inhalte
- Jede Erkenntnis hat einen konkreten Umsetzungs-Ort (Rolle/Datei) und ist im Clip messbar
- Nichts doppelt: bereits umgesetzte Punkte (Checklisten, `clip-regeln.md`) nicht erneut melden

## Checkliste (aktueller bester Stand – nur Erprobtes)
- Noch keine erprobten Punkte (Rolle angelegt 12.11.2026).

## Gelernt (neueste oben; Datum · Befund · Beleg)
- 14.11.2026 · WebSearch liefert für aktuelle Shorts/TikTok fast nur Vendor-Blogs ohne Einzelclip-Zahlen (8 Suchen, 0 verifizierbare Clip-Aufrufe) – für belastbare Zahlen Apify-Kanalläufe nötig; Themen-Bewertung 5 Kriterien, Interesse bleibt [HYPOTHESE] · `docs/trends/2026-11-14.md`
- 14.11.2026 · **Neue Eingabe** (Nutzer, `docs/prompts/knowtoon-upload-strategie.md` §1, §8): Die 14-Tage-Auswertung liefert die drei stärksten und drei schwächsten Themen-Arten – bei der Themenwahl berücksichtigen; Ziele in Reihenfolge: Bindung > neue Follower aus englischsprachigen Ländern > Aufrufe > Monetarisierung.
- 12.11.2026 · Benchmark Tempo: n=9 Erzähl-Shorts mit Untertiteln, Median 3,43 W/s; ruhige Spitzenreiter (AumSum 40/52 s, 26–42 Mio.) 2,4–2,6 W/s · `docs/trends/benchmark-tempo.md` (Apify 0,175 $)
- 12.11.2026 · Apify-Suche liefert ~50 % Themenfremdes und nur ~30 % TikTok-Treffer mit Untertiteln; YouTube-Untertitel kommen mit dem Lauf (`transcriptionAndSubtitle: ALWAYS_SUBTITLES`), TikTok `downloadSubtitlesOptions: DOWNLOAD_SUBTITLES` (vtt-Links über api.apify.com)

## Nächste Experimente
- Tempo-Benchmark erweitern: gezielt Kanäle per `profiles`/`startUrls` (AumSum, cardboard_cinema, explainedhistory9) statt Suchbegriffe, dazu Schnitte/Minute per ffmpeg, falls Download erlaubt.
- Erster Lauf: messen, welche Quellen ohne Apify überhaupt belastbare Zahlen liefern (Anzahl Zahlen mit URL je Quelle).
- Vergleichen, ob die Referenz-Werte aus `docs/referenz-analyse-4.md` (z. B. W/s, Schnitte) bei aktuell viralen Clips noch gelten.

## Bewertungsverlauf
| Datum | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- |
