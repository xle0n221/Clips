# Selbst-Audit „In This City, Every Time You Swear, Your Mom Appears“ (`fluch-stadt`, 22.11.2026) – Rolle: Comic-/Cartoon-Designer + Publikum

Maßstab: `docs/audit-2026-11-20.md` (nicht milder). Grundlage: Kontaktabzüge `out/fluch-cs1.jpg` (34 Bilder alle 2 s, echte Zeitachse), `out/fluch-cs2.jpg` + `out/fluch-cs3.jpg` (17 Korrektur-/Nachprüfbilder), Messwerte unten.

## Viral-Analyse (22.11.2026, 1 Suche – dünn)
- Suche „"in this city" animated short viral dark humor November 2026“: kein aktueller Treffer zum Format; nur ältere Kurzfilme (z. B. https://www.cartoonbrew.com/shorts/aggelos-papantoniou-shitty-city-short-pick-223336.html, Datum dort nicht angegeben).
- Marktlage aus `docs/audit-2026-11-20.md` (Shorts-Feed > 61 % der organischen Views laut https://metricool.com/youtube-trends/) – heute nicht erneut geprüft.
- Welche „In This City“-Clips im Nov. 2026 vorn liegen: **Ich kann das nicht bestätigen.** Themenwahl „Fluchen → Mutter erscheint“ ist eine begründete Annahme (universelle Peinlichkeit, Mütter-Humor, Piep als natürlicher Gag), kein belegter Trend.
- Abwechslung (Auftrag): Konsequenz = Peinlichkeit/Strafe, **niemand stirbt** (todo, suche, akku endeten mit Tod).

## Noten (ehrlich, 1–10)
| Kriterium | Note | Beleg |
|---|---|---|
| **Hook** (Bild 1 + erste 2 s) | 9 | Bild 1: Hammer trifft Daumen (Bewegung ab Frame 0), Daumen pocht rot, Fluch-Blase „#@%&!“ + Piep bei 0,07 s, Cover „SWEAR = MOM APPEARS“ (Gesicht frei – akku-Schwäche behoben). Bei 2,7 s Poof + Basstreffer: Mutter mit Hausschuh steht hinter ihm. Offene Frage „Can he do it without one bad word?“ (23,2 s) erst bei 46 s („Not one bad word“) beantwortet, dann Twist. Schwäche: Regel ist erst nach dem Poof (2,7 s) ganz sichtbar, davor nur über das Cover. |
| Bildvielfalt | 9 | 28 Einstellungen in 65,5 s (Ø 2,3 s), 18 Bildwelten (Garage, OP, Vorstand, Comic grün/pink/rot/gelb/lila, Schiff, Kinderzimmer, Spiegel, Kirche außen, Zeh-ECU, Schlafzimmer, Mutter-Sessel, Parkplatz, Abfluss-ECU, Altar, Kirchenbank, Stufe-ECU, Festsaal, Ecke, POV); Set-Folge im Code gezählt (`FLUCH_SHOT_COUNT`), nie > 2 gleiche am Stück. Schwäche: Kinderzimmer-Einstellung 4,2 s und Outro 4,1 s knapp über 4 s (Kamerafahrt/Aufstieg läuft). |
| Figuren/Schauspiel | 9 | Dave: Schrei mit „><“-Augen, Erstarren, Zwangslächeln vor dem Spiegel, Reißverschluss-Geste, lautloser Kissenschrei mit Ader, zuckendes Auge beim „Fudge“, Triumph mit Träne, Ecke mit gesenktem Kopf; Mütter: Hausschuh-Ausholen, enttäuschtes Hinsetzen, zuckendes Auge; Braut flucht mit Gesten, Gäste halten sich den Mund. Schwäche: Pfarrer und Gäste wenig bewegt. |
| Lesbarkeit/Ordnung | 9 | Eine Text-Ebene (gelbe Phrasen); Fluch-Blasen „#@%&!“ sind der Gag; keine Schilder/Banner. Blasen nach Kontaktabzug 1 ins Bild gerückt, Kissen vom Gesicht genommen. Schwäche: Mütter-Menge (57–59 s) vorn knapp am Untertitelband. |
| Konzept sofort sichtbar | 9 | Fluch-Blase → Poof → Mutter mit Hausschuh: stumm in 3 s verständlich; jede Wiederholung (OP, Vorstand, Braut, Oma) zeigt dieselbe Mechanik. |
| Humor | 9 | 31 Gag-Momente, größter Abstand 3,8 s (Liste `docs/paket-fluch-stadt.md`); zynischer Erzähler, schwarzer Unterton (Waisen werden Matrosen, Mutter führt die Firma besser, 41 Mütter), Fluch mit echtem Piep (Stimme stumm), Loop „Don't turn around“ + Mutter im schwarzen Bildschirm. Tabus eingehalten (keine realen Personen/Marken, keine Minderjährigen als Witzziel, keine Gruppe herabgesetzt, kein medizinischer Rat). |
| Farbe/Kontrast | 9 | Dave grün vor rosa/blau/gelb, Mutter pink-lila, Comic-Flächen im Wechsel grün/pink/rot/gelb/lila; Outro bewusst dunkel. |
| Länge/Format | 9 | 67,6 s inkl. End-Card 2 s (Vorgabe 61–70 s), 1080×1920, H.264 yuv420p, 30 fps, AAC. |
| **Gesamt Publikum** | **9** | |

## Messwerte
- Stimme (`scripts/stimm_messung.py fluch-stadt`): 163 W, **2,47 W/s** (Regel 2,3–2,6 ✓); **Satzpausen Median 480 ms, P10–P90 430–558 ms** (Regel 450–800 ✓ – akku-Schwäche 305 ms behoben durch weniger, längere Sätze + `gap_ms` 480–520); Komma 190 ms; Satzende −4,5 dB / 79 % leiser, Tonhöhe −1,6 HT; 0 harte Kanten; Whisper 99,4 % gesprochen (Aussprache 27/27 Sätze ohne Abweichung; Rest: „dessert“→„desert“ = Homophon, „fuck“ stummgeschaltet).
- Mix (ffmpeg ebur128, fertiges MP4): **−14,6 LUFS, −3,8 dBFS Spitze**, LRA 2,9 LU.
- earshot `critique --fast`: launch-grade, 19 von 21 im Bereich, 0 kritisch/0 major; minor: fast mono (−37,5 dB), wenig Sub (−21,5 dB). Bild-Ton-Sync: 64 % der Schnitte mit hörbarem Treffer ±100 ms (Refs 8–49 %).
- Musik-Abstand (duck_music): Median 14,5 dB, P10 −16,1 dB.

## Bekannte Schwächen (nicht verschwiegen)
1. Mono-Mix und wenig Sub (earshot minor); `realness`/`music presence` nicht gemessen (`--fast`).
2. Zwei Einstellungen 4,1–4,2 s (Regel ≤ 4 s).
3. Piepse der Fluch-Blasen liegen am Satzende, nicht exakt auf dem Erscheinen der Blase (bis ~1 s später), damit sie die Stimme nicht überdecken.
4. Marktlage „In This City“ Nov. 2026 nicht belegt (Ich kann das nicht bestätigen).
