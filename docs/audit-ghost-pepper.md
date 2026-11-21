# Selbst-Audit „What a Ghost Pepper Does Inside Your Body“ (`ghost-pepper`, 21.11.2026) – Rolle: Comic-/Cartoon-Designer + Publikum

Maßstab: `docs/audit-2026-11-20.md` (nicht milder als dort). Grundlage: Kontaktabzüge `out/gp-k1.jpg`–`out/gp-k4.jpg`
(22 + 11 + 20 + 2 Standbilder), Einzelbilder des fertigen MP4 bei 0,1 / 0,8 / 26,6 s, Messwerte unten.

## Noten (ehrlich, 1–10)
| Kriterium | Note | Beleg |
|---|---|---|
| **Hook** (erste 2 s verständlich + Neugier) | 9 | Bild 1: Kerl mit Ghost Pepper an der Wange + Cover-Titel „GHOST PEPPER vs YOUR BODY“; ab Bild 10 Biss → „><“-Augen, Dampf, roter Kopf; Satz 1 endet bei 1,9 s, Pointe 2 („His tongue filed a complaint“) bei 3,2 s. Offene Frage „was passiert drinnen?“ wird erst am Morgen (26 s) aufgelöst. |
| Bildvielfalt | 9 | 13 Bildwelten (Stand, Mund, Rachen, Club-Straße, Club-Tür, gelbe + blaue Comic-Fläche, Gehirn-Amt, Fabrik, Garten, Bad, Darm-Ausgang, Stand bei Tag) + End-Card, 19 Einstellungen in 28,8 s (Ø 1,5 s); kein Set > 2 Einstellungen am Stück (Runde 2: Thermometer-Nah und „no heat“ auf eigene Comic-Flächen gelegt, vorher 5× Club-Tür in Folge). |
| Figuren/Schauspiel | 9 | „><“-Augen, Schrei-Mund, Tränen-Fontänen, Dampf; Capsaicin läuft, Kette blitzt, winkt; Türsteher wütend → zeigt → brüllt → entsetzt; Beamter mit geschlossenen Augen beim Stempeln. Schwäche: Gehirn-Beamter und Zellen bewegen sich wenig (Kamera trägt). |
| Lesbarkeit/Ordnung | 9 | Eine Text-Ebene: rote 1-Wort-Untertitel; Schilder sind die Hintergrund-Gags (Prompt-Pflicht), klein und am Rand. Schwäche: im Cover liegt der Titel knapp über der Stirn. |
| Konzept sofort sichtbar | 9 | Prämisse stumm verständlich: Mann isst Chili → schreit; drinnen Gangster-Molekül vs. Türsteher „HEAT ONLY“; Hebel „HEAT“ ohne Feuer → Amt stempelt „FIRE!!“. |
| Humor | 9 | 15 Gag-Momente, größter Abstand 3,2 s (Liste `docs/paket-ghost-pepper.md`); zynischer Erzähler, Fäkal-Pointe mit Piep, Loop „buying two“ ↔ Schild „BUY 1 GET 1 FREE“ aus dem ersten Bild. |
| Farbe/Kontrast | 9 | Warme gesättigte Sets mit Glow; Hauptfiguren heben sich ab (rotes Molekül auf Lila, weißer Kopf auf Orange/Grün). |
| Fakten | 9 | 4 Aussagen, je Primärquelle mit Zitat (`docs/quellen-ghost-pepper.md`); Scoville-Zahl weggelassen, weil nicht primär abrufbar; kein medizinischer Rat. |
| **Gesamt Publikum** | **9** | |

## Messwerte
- Länge 30,30 s (ffprobe) inkl. End-Card 1,5 s – Vorgabe 30 ± 1 s erfüllt. 1080×1920, 30 fps, H.264 yuv420p BT.709, AAC 48 kHz.
- Stimme (`scripts/stimm_messung.py`): 74 Wörter, 2,50 W/s, Satzpause Median 190 ms, Komma 220 ms, Satzende −5,7 dB (89 % leiser, 75 % fallend), 0 harte Kanten, Whisper gesprochen 98,8 % (Rest: „meet“ → „the meat“, Homophon).
- Mix (ffmpeg ebur128): −14,4 LUFS integriert, −2,2 dBTP.
- earshot `critique --fast`: „launch-grade“, 20 von 21 Messwerten im Bereich (gewichtet 97 %), 0 kritisch/0 groß; Ton-Bild-Sync 88 % (≥ 45 %). Präsenz 4–8 kHz vorher −10,9 dB (zu hell) → EQ −3,5 dB bei 6 kHz → −13,2 dB (ok).

## Bekannte Schwächen (nicht verschwiegen)
1. Mix fast mono (Seite −33,5 dB; earshot „minor“) – Musik/Bett sind mono erzeugt.
2. `realness` und `music presence` nicht gemessen (`--fast`).
3. Sprechpausen auf 330 ms gekappt (für 30 s) – Pausen vor Pointen sind dadurch kürzer als die Regie-Vorgabe „Pause vor Pointe“ idealerweise hätte.
4. Kein Marktvergleich mit aktuellen Top-Shorts dieses Formats (Ich kann nicht bestätigen, welche Innenwelt-Kanäle im Nov. 2026 vorn liegen).
