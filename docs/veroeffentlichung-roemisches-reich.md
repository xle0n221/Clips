# Veröffentlichung – „You bought Rome. Worst job ever.“ (Rom-Video)

Rolle Veröffentlichung, 09.11.2026. Maschinenlesbar: `out/rome-publish.json` (Format Dashboard-Feld `publish`,
siehe `dashboard/README.md`). **Noch nicht im Dashboard** – das schreibt der Orchestrator nach der Endabnahme.

Grundlagen: `episodes/roman-empire.json` (v2), `public/episodes/roman-empire/timeline.json` (durationMs 90011 → ca. 90 s,
Sprache endet bei 89,4 s), Freigabeliste `docs/faktencheck-roemisches-reich.md`, `docs/faktencheck-drehbuch-roemisches-reich.md`,
Hashtags aus dem Dashboard `hashtags/current` (Version 4, Stand 08.11.2026, nur gelesen).

## YouTube Shorts

**Titel A (empfohlen, 44 Zeichen):** You bought the Roman Empire. Worst job ever.

**Titel B (60 Zeichen):** Rome's throne went to the highest bidder. He lasted 66 days.

Warum A zuerst: A wird von der ersten Sprech-Sekunde sofort eingelöst („the Roman Empire got *auctioned* off“, Wort „auctioned“
bei 0,92–1,41 s, Sticker „EMPIRE FOR SALE“ bei 0,92 s). B verspricht „66 days“, das kommt erst bei 19,3 s (Sticker „66 DAYS“).
Beide unter 70 Zeichen, also voraussichtlich ganz sichtbar (Drittanbieter-Schätzung 60–70, siehe `dashboard/README.md`).

**Beschreibung:**
> In 193 AD, Rome's throne was auctioned off for a winning bid of 25,000 sesterces per soldier, and the winner lasted 66 days. Every respawn as emperor gets worse: a legendary rooster named Rome, a kid emperor fired with a pension, and an East that still called itself Roman until 1453. So when did Rome fall? Comment A (476) or B (1453)!
>
> Sources: Cassius Dio, Historia Augusta, Procopius, Gibbon, Excerpta Valesiana, Jordanes, World History Encyclopedia.

**Hashtags:** #RomanEmpire #history #AncientRome #Shorts (die ersten drei sind die Kandidaten über dem Titel; welche YouTube zeigt,
entscheidet YouTube laut Hilfe-Seite).

## TikTok

**Caption (116 Zeichen):** Someone actually bought the Roman Empire at an auction… and lasted 66 days. When did Rome fall: A (476) or B (1453)?

**Hashtags (4 von max. 5):** #history #romanempire #ancientrome #historytok

## Hashtag-Herleitung
- `hashtags/current` enthält nur die Kombis „Weltraum-Thema“ und „Anderes Wissens-Thema“ (#science, #ScienceShorts, #STEM, #physics …).
  Diese passen nicht zum Inhalt; YouTube verbietet Hashtags ohne Bezug (Regel in `dashboard/README.md`). Darum wurden **alle** Tags
  durch themenspezifische ersetzt (Abweichung von der Vorgabe „1–2 Tags ersetzen“, begründet).
- Struktur nach Regel: 1 breites Thema (#history), 2–3 themenspezifische (#romanempire, #ancientrome, #historytok).
- Anzahl: TikTok 4 (Dashboard-Notiz: revid.ai fand die höchsten Median-Aufrufe bei 3–4 Hashtags, Drittanbieter); YouTube 4 inkl.
  #Shorts (Dashboard-Notiz Metricool: Hashtags auf YouTube sparsam).
- **Ich kann nicht bestätigen**, dass diese Tags Reichweite bringen: Für Geschichts-Hashtags liegen im Dashboard keine Kennzahlen vor,
  und die Plattformen veröffentlichen keine. Vor dem Posten in Creator Search Insights / YouTube-Suche gegenprüfen.

## Faktenprüfung der Texte (jede Aussage → Freigabeliste `docs/faktencheck-roemisches-reich.md`)

| Aussage im Text | Freigabe-Nr. | Quelle laut Liste |
| --- | --- | --- |
| Throne auctioned off in 193 / „bought the Roman Empire at an auction“ / „went to the highest bidder“ | 2, 9 | Dio 74.11 („both the City and its entire empire were auctioned off“) |
| Winning bid 25,000 sesterces per soldier | 9 | Dio 74.11.4–5 (20.000 + 5.000), HA DJ 3.2 |
| Winner lasted 66 days | 10 | Dio 74.17.5 |
| Legendary rooster named Rome | 8 | Prokop III.2, nur als Legende („legendary“) |
| Kid emperor (kein Alter genannt) | 15 | Prokop V.1 „still a lad“ |
| Fired with a pension | 6, 16 | Jordanes 46 / Exc. Val. 8.38 („income of six thousand gold-pieces“); „pension“ im Drehbuch-Faktencheck als OK geprüft |
| East still called itself Roman until 1453 | 7, 20 | WHE Byzantine Empire |
| 476 vs. 1453 als Frage | 6, 7, 25 | als Zuschauerfrage ohne Wertung (Drehbuch-Faktencheck „vote“: OK) |
| Sources-Zeile | – | alle genannten Werke stehen in der Freigabeliste |

Bewusst **nicht** in den Texten: „guards killed the emperor“ (nur im Drehbuch-Faktencheck belegt, nicht als eigene Freigabe-Nr.),
„Year of the Six Emperors“ (verboten, Nr. 13), ein Alter für Romulus Augustulus (Nr. 15), „yearly“ bei der Pension (nur Gibbon).

## Vorschaubild
- **Vorschlag 1:** Szene `auction`, ca. **15,0 s** (Finger-Gebot ab 13,62 s, Sticker „25,000 SESTERCES / SOLDIER“ ab 14,78 s,
  „Sold!“ bei 16,05 s). Overlay: **„YOU BOUGHT ROME“** (groß, oben), der Sticker im Bild liefert die Zahl.
- **Vorschlag 2:** Szene `fired`, ca. **69,5 s** (Sticker „6,000 GOLD PIECES“ ab 69,06 s, Villa-Gang ab 70,3 s).
  Overlay: **„FIRED… WITH A PENSION“**.
- Einschränkung: Es gibt noch keinen Rom-Render und keine Standbilder (`out/` enthält keine Rom-Datei). Die Sekunden stammen aus
  `timeline.json`; ob das Bild an der Stelle gut lesbar ist (Kontrast, Gesicht), kann ich nicht bestätigen → nach dem Render am Standbild prüfen.
- Ob und wie YouTube Shorts ein eigenes Vorschaubild erlauben, habe ich nicht nachgeprüft (keine Quelle in der Freigabe/README).

## Hinweise für das Posten (`publish.note`)
Titel B, Vorschaubild, Hashtag-Gegenprüfung, Kommentar „Comment A or B: 476 or 1453“ anpinnen, Länge ca. 90 s < 3 Min. Shorts-Grenze
(YouTube-Hilfe, https://support.google.com/youtube/answer/15424877).
