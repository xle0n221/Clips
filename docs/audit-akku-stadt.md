# Selbst-Audit „In This City, When Your Phone Dies, You Die“ (`akku-stadt`, 22.11.2026) – Rolle: Comic-/Cartoon-Designer + Publikum

Maßstab: `docs/audit-2026-11-20.md` (nicht milder). Grundlage: Kontaktabzüge `out/akku-cs1.jpg` (33 Bilder), `out/akku-cs2.jpg` (7 Korrekturbilder), Einzelbilder des fertigen MP4 `out/akku-chk.jpg` (0,05/0,3/0,6/1,0/1,9/2,6/13/24/39,4/50/54,5/56,5/62/64,5/66,5/67,5 s), Messwerte unten.

## Viral-Analyse (22.11.2026, 2 Suchen – dünn)
- Shorts-Feed > 61 % der organischen Views (Stichprobe ~800.000 Videos): https://metricool.com/youtube-trends/
- Trendbericht Juli 2026 (Blog, Sekundärquelle): Animatoren bauen virale Meme-Animationen nach: https://www.anijam.ai/blog/youtube-shorts-trends/
- Dark-Humor-Animation als Umfeld (Lazy Square „Brainrot“, KrumbleTV) laut Cartoon Brew: https://www.cartoonbrew.com/shorts/lazy-square-alex-semenov-brainrot-262630.html
- Welche „In This City“-Shorts im Nov. 2026 vorn liegen: **Ich kann das nicht bestätigen** (keine Daten gefunden). Themenwahl „Akku leer = Tod“ ist eine begründete Annahme (Alltags-Angst, jeder Zuschauer hält gerade ein Handy), kein belegter Trend.

## Noten (ehrlich, 1–10)
| Kriterium | Note | Beleg |
|---|---|---|
| **Hook** (Bild 1 + erste 2 s) | 9 | Bild 1: grüngesichtiger Mann an der Haltestelle, Handy mit rot blinkendem „1%“ + Cover „PHONE DIES = YOU DIE“ → Regel stumm lesbar; Handy zittert, Schweiß ab Bild 1; Bildschirm schwarz bei „dies“ (~1,3 s), Mann kippt steif mit X-Augen um, Geist steigt auf (1,9 s). Offene Frage „Can Gary make it home?“ (16,5 s) erst bei 52–56 s aufgelöst. Schwäche: Cover-Titel verdeckt in den ersten 0,5 s halb das Gesicht. |
| Bildvielfalt | 9 | 32 Einstellungen in 65,7 s (Ø 2,05 s), > 15 Bildwelten (Haltestelle, Sterbebett, Klinik, Veranda, Büro, Karte, Straße grau, Augen-ECU, Handy-ECU, Comic-Flächen, Stecker-ECU, Tür, Steckdose, Boden, Friedhof, Grabstein, POV); kein Set > 2 am Stück (`AKKU_SHOT_COUNT`, vor dem Render gezählt). |
| Figuren/Schauspiel | 9 | Gary: Augen-Zucken, Schweiß, Lachtränen („Worth it“), Wutschrei mit Zensurbalken, kalter Blick beim Ablehnen, gefrierendes Lächeln, Brett-Sturz; Fremder grinst mit Sonnenbrille; Opa schmunzelt; Familie weint. Schwäche: Klinik-Patienten statisch. |
| Lesbarkeit/Ordnung | 9 | Eine Text-Ebene (gelbe Phrasen); Akku-Prozent/„47“/„MOM“ nur auf dem Handy als Gag. Gesichter über dem Untertitelband geprüft (Korrektur Hook-Sturz, Turn-Sturz, Familie). |
| Konzept sofort sichtbar | 9 | 1 % → schwarz → Mann tot: stumm in 2 s verständlich; Graustufen = „Low Power“. |
| Humor | 9 | 31 Gag-Momente, größter Abstand 4,6 s (Liste `docs/paket-akku-stadt.md`); zynischer Erzähler, schwarze Pointe (Update tötet ihn), Mutter wird weggedrückt, Fluch mit Piep, Beerdigung mit Ladegeräten, Zuschauerfrage als Loop. Tabus eingehalten (keine realen Personen/Marken, niemand wählt den Tod, keine Opfergruppe). |
| Farbe/Kontrast | 9 | Abendblau/Orange als Grundton, Akku-Rot als Signal, Gary gelb → bewusst entsättigt (Low Power), Comic-Flächen pink/gelb/rot/grün im Wechsel. Schwäche: Graustufen-Passage (19–24 s, 41–51 s) bewusst blass. |
| Länge/Format | 9 | 67,8 s inkl. End-Card 2 s (Vorgabe 61–70 s), 1080×1920, H.264 yuv420p, 30 fps, AAC. |
| **Gesamt Publikum** | **9** | |

## Messwerte
- Stimme (`scripts/stimm_messung.py`): 155 W in 66,3 s → **2,34 W/s** (Regel 2,3–2,6 ✓ – todo-stadt-Schwäche 2,69 behoben durch speed 1,0, pauseMs 330, sceneGap 230); Komma 185 ms, 0 harte Kanten, Whisper 98,7 % (99,4 % gesprochen; Rest = stummgeschaltetes Fluchwort).
- Mix (ffmpeg ebur128, fertiges MP4): −14,8 LUFS, −1,9 dBTP.
- earshot `critique --fast` (fertiges MP4): 20 von 21 gemessenen Werten im Bereich, Ausnahme Stereobreite (−32,8 dB, „minor“, Mono-Mix wie Vorgänger); Sync 57 % (≥ 45 %); Präsenz 4–8 kHz −14,4 dB (ok).
- Musik-Abstand Stimme–Musik (duck_music): Median 13,2 dB, P10 −19,1 dB.

## Bekannte Schwächen (nicht verschwiegen)
1. Satzpausen Median 305 ms (Regel 450–800 ms) und Satzende nur −2,2 dB / 50 % leiser – längere Pausen hätten die Länge über 70 s gehoben (Länge 61–70 s geht vor).
2. Mono-Mix; `realness`/`music presence` nicht gemessen (`--fast`).
3. Cover-Titel verdeckt in 0–0,5 s halb das Gesicht des Mannes.
4. Motiv Tod/Beerdigung wie todo-stadt und suche-stadt (dritter Tod-Clip in Folge) – Abwechslung beim nächsten Thema empfohlen.
5. Marktlage für „In this city“ Nov. 2026 nicht belegt (Ich kann das nicht bestätigen).
