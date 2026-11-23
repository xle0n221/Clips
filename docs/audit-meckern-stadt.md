# Selbst-Audit „In This City, Every Time You Complain, You Age One Year“ (`meckern-stadt`, 23.11.2026) – Rolle: Comic-/Cartoon-Designer + Publikum

Maßstab: `docs/audit-2026-11-20.md` (nicht milder). Grundlage: Kontaktabzüge `out/meckern-cs0.jpg` (Schätz-Zeitachse, 33 Bilder), `out/meckern-cs1.jpg` (echte Zeitachse, 35 Bilder alle 2 s), `out/meckern-cs2.jpg` + `out/meckern-cs0b.jpg` (Nachprüfung), `out/meckern-final-cs.jpg` (fertiges MP4 alle 3 s), Messwerte unten.

## Viral-Analyse (23.11.2026, 2 Suchen – dünn)
- Suche „"in this city" animated shorts viral trend November 2026“: kein Treffer zum Format im Nov. 2026. Ich kann das nicht bestätigen.
- Suche „viral TikTok animation dark humor trend week November 2026“: nur ältere Animations-Trends (z. B. „Twins at the Carousel“, Juni–Juli 2026: https://trending.knowyourmeme.com/editorials/guides/what-is-the-twins-at-the-carousel-trend-the-massive-animation-meme-set-to-kikuos-song-explained), keine Daten für diese Woche.
- Themenwahl „Meckern = +1 Jahr“ ist eine begründete Annahme (universelle Montags-Frustration, Kommentar-Köder „Comment that this was too long“), kein belegter Trend.
- Abwechslung (Auftrag): Konsequenz = **Altern** – weder Tod (todo/suche/akku) noch Peinlichkeit (fluch).

## Noten (ehrlich, 1–10)
| Kriterium | Note | Beleg |
|---|---|---|
| **Hook** (Bild 1 + erste 2 s) | 9 | Bild 1 ist ab Frame 0 in Bewegung: Schirm klappt im Regen um, Mann schreit, Meckerwolke (Gewitter-Blase) ab 0,2 s; Cover „COMPLAIN = +1 YEAR“ 0–0,5 s; bei 3,2 s POOF + Basstreffer: derselbe Mann ist alt (Bart, Stock, krumm) – Regel stumm verständlich. Offene Frage „Can he get through his worst Monday ever without one complaint?“ (≈ 22 s) erst bei 49 s scheinbar gelöst, dann Gedanken-Twist (54 s). Eingepflanzte Rätsel (graues Haar ohne Worte 32 s, allein alterndes Auge 46 s) werden erst im Twist erklärt. Schwäche: der erste Witz-Satz (Regel) kommt erst mit dem POOF bei 3,2 s. |
| Bildvielfalt | 9 | 30 Einstellungen in 69,9 s, alle ≤ 4 s (gerechnet aus timeline + captions mit denselben Wortankern wie W(): max 3,93 s, nach Anker-Fix Mitternacht), 22 Bildwelten (Regen-Straße, Diner, Warteschleife, Party, Dunkelzimmer, Couch, Hausfassade, Schreibtisch-ECU, blaues Zimmer, Bahnsteig, Ohr-Wand, Büro, Uhr, Schlafzimmer, Haustür, POV + 7 Comic-Flächen), nie > 2 gleiche am Stück (`MECKERN_SHOT_COUNT`). |
| Figuren/Schauspiel | 9 | Tyler: Augenrollen beim Meckern, X-Tape + Daumen hoch, Geisel-Lächeln mit Schweiß, sarkastischer Doppeldaumen, zuckendes Auge + Faust, Jubel, Greis mit Bart/Rollator/Gebiss fällt; Nebenfiguren: Gäste schreien vor der Kerzen-Flamme, verschrumpelter Kritiker, sabbernde Senioren in der Warteschleife, hoffnungsvoll spähendes Date. Schwäche: Kollegen im Büro und Bahnsteig-Wartende wenig bewegt. |
| Lesbarkeit/Ordnung | 9 | Eine Text-Ebene (gelbe Phrasen); Meckerwolken, Sterne, Kommentar-Zeilen sind Bildzeichen ohne Schrift. Gesichter nach Kontaktabzug 1 freigestellt (Suppe, Laptop, Telefone, Bart). Schwäche: Ein-Stern-Karten im Dunkelzimmer klein. |
| Konzept sofort sichtbar | 9 | Meckerblase → POOF → alt: stumm in 3,2 s verständlich; jede Wiederholung (Suppe/Bart, Bauch nach Sarkasmus, Greis nach Gedanke) zeigt dieselbe Mechanik. |
| Humor | 9 | ≈ 44 Gag-Momente, größter Abstand ≈ 2,8 s (aus Schnittzeiten geschätzt, Liste `docs/paket-meckern-stadt.md`); zynischer Erzähler mit US-Slang (lowkey, it's giving, bro, cooked); schwarzer Unterton (Warteschleife = Altersheim, ältester Mann 31 und Online-Kritiker, 47 Jahre auf einmal, Date fragt nach dem Enkel); Fluch „sh*t“ nur teilweise gepiept (Whisper hört im Endmix „s***“); Schluss-Köder „Comment that this was too long“ + alternder Daumen. Tabus eingehalten (keine realen Personen/Marken, keine Minderjährigen, keine Gruppe herabgesetzt, kein medizinischer Rat). |
| Farbe/Kontrast | 9 | Tyler orange/blau vor türkis, rosa, gelb, grün, lila, rot; Hauptfigur hebt sich überall ab; Nacht-/POV-Szenen bewusst dunkel. |
| Länge/Format | 9 | 69,9 s inkl. End-Card 2 s (Vorgabe 61–70 s – knapp an der Obergrenze), 1080×1920, H.264 yuv420p, 30 fps, AAC. |
| **Gesamt Publikum** | **9** | |

## Messwerte
- Stimme (`scripts/stimm_messung.py meckern-stadt`, nach `retime_pauses --cap 560 --tail 280`): 160 W, **2,33 W/s** (Regel 2,3–2,6 ✓, unteres Ende); **Satzpausen Median 490 ms**, P10–P90 344–569 ms (Regel ≥ 450 im Median ✓; P10 darunter); Komma 215 ms; Satzende −6,5 dB / 95 % leiser, Tonhöhe −3,5 HT; 1 harte Kante (29,97 s, Ausklang nach „smiles.“ fällt in 20 ms um 24 dB – im Mix unter Musik/Bett, nicht nachgebessert); Whisper 98,8 % gesprochen, Aussprache 27/28 Sätze ohne Abweichung (Rest: „lowkey“ → „low key“ = Schreibweise).
- Mix (ffmpeg ebur128, fertiges MP4): **−14,9 LUFS, −3,9 dBFS Spitze**, LRA 3,8 LU.
- earshot `critique --fast`: **launch-grade**, 19 von 21 im Bereich (94 %), 0 kritisch/0 major; minor: fast mono (−38,1 dB), wenig Sub (−20,8 dB). Bild-Ton: 36 % der Schnitte mit hörbarem Treffer ±100 ms (Refs 8–49 %); 5 Schnitte ohne Klang (20,8 / 26,3 / 26,5 / 44,5 / 67,8 s). `realness`/`music presence` nicht gemessen (`--fast`).
- Musik-Abstand (duck_music): Median 14,3 dB, P10 −17,5 dB.

## Bekannte Schwächen (nicht verschwiegen)
1. Länge 69,9 s liegt 0,1 s unter der Obergrenze; Tempo 2,33 W/s am unteren Rand.
2. Mono-Mix, wenig Sub (earshot minor); 5 Schnitte ohne Ton-Akzent.
3. Satzpausen P10 344 ms (unter 450) – Median erfüllt die Regel.
4. Marktlage „In This City“ Nov. 2026 nicht belegt (Ich kann das nicht bestätigen).
