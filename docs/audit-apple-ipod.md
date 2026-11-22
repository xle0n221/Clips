# Audit – „Apple Was Almost Dead. Its Enemy Paid the Rent.“ (apple-ipod, 22.11.2026)

Maßstab: docs/audit-2026-11-20.md (Rolle Comic-/Cartoon-Designer + Publikum). Grundlage: Kontaktabzüge out/apple-kontakt*.jpg (30 + 10 + 2 + 6 Bilder), Cover-Einzelbilder 0,05/0,3/0,45 s aus dem fertigen MP4, Messwerte unten. Fertiges Video: out/apple-ipod.mp4 (nicht im Repo).

| Kriterium | Note | Beleg |
|---|---|---|
| Hook | 9 | Bild 1 (0,05 s): Computer-Patient schreit im Krankenbett, EKG fällt, Geldscheine fliegen; Cover „APPLE ALMOST DIED. WHO SAVED IT?“ verdeckt kein Gesicht. Offene Frage, die erst im Outro ganz aufgelöst wird („Its worst enemy did“ → Rivale; „iMac + Rivale + iPod“). Schwäche: unteres Drittel des Covers ist leerer Boden. |
| Bildvielfalt | 9 | 29 Einstellungen, Ø 2,2 s, max. 3,6 s (drei Einstellungen über 4 s vor dem Render geteilt); 18 Bildwelten (Klinik, Comic grün/pink/rot/blau/gold/hellblau, Bühne ×2 Farben, Gegenlicht, Flur, Büro, Friedhof, Schulhof, Showroom, Nerd-Zimmer, Tastatur-ECU, Gold-Klinik, Handy-POV). Klinik kehrt als Leitmotiv wieder, nie > 2 am Stück. |
| Schauspiel | 9 | Bildschirm-Gesichter mit Pupillen/Brauen/Mund (Schrei, xx-Augen, Scham, Grinsen mit Sonnenbrille), Nerd mit Kieferfall, Gründer als Springteufel, Musikplayer tanzt/zuckt mit Schultern. |
| Lesbarkeit | 9 | Eine Text-Ebene: Untertitel-Phrasen; „$$$“ auf Scheck/Preisschild ist Teil des Gags. Alle Gesichter über y ≈ 1250 (geprüft). |
| Konzept | 9 | Firma = Patient, Rivale = Mobber mit Sonnenbrille, Geräte als Figuren – ohne Ton verständlich; ehrliche Mehrschritt-Rettung statt „iPod allein“. |
| Humor | 9 | Roast/Slang alle 2–3 s (Brieftasche kotzt Geld, „Bro was cooked“ + Garanzeige, Röntgenbild mit Motte, „Interim. Sure, buddy.“, „It was giving brick“ + Ziegel-Grab, „your bully paying your rent“, „Humiliating as f—“, „lowkey lickable“, Slashdot-„Lame“ → „Lame, my a—“, Zuschauer-Roast 10 % Akku). Flüche nur teilweise gepiept (Nutzer 22.11.), erkennbar (Whisper hört „f**k“, „a**“). |
| Farbe | 9 | Kräftige Flächen (Mint-Klinik, Pink, Rot, Gold, Blau), Hauptfigur beige/mint hebt sich ab. |
| Länge | 9 | 67,2 s inkl. End-Card 2 s (Regel 61–70 s). |
| Fakten | 9 | Alle Zahlen/Daten mit Primärquelle + Zitat in docs/quellen-apple-ipod.md (SEC 10-K FY1997/1998/2002/2006, Microsoft-PM 6.8.1997, Slashdot 23.10.2001); Unbelegtes (90-Tage-Zitat, Dell-Zitat, Buhrufe, Preis 399 $) gestrichen. |

## Ton (gemessen)
- Stimme am_michael, voicePreset witzig, ironic/tense je Szene; 145 Wörter (156 gesprochen inkl. ausgeschriebener Zahlen), Sprechzeit 66,1 s.
- Tempo 2,19 W/s Skriptwörter bzw. 2,36 W/s gesprochene Wörter (156/66,1) – Skriptwert liegt unter dem Band 2,3–2,6, weil Jahreszahlen als ein Wort zählen. Offen benannt.
- Satzpausen Median 455 ms (P10 327 / P90 520) nach `retime_pauses --cap 650`; Komma 200 ms; Satzende −9,3 dB, 79 % fallend; harte Kanten 0 (ein 60-ms-Knackser bei 57,3 s entfernt).
- Whisper: 98,7 % gesprochen vor dem Kürzen; nach dem Kürzen übersprang der Volldurchlauf einen Abschnitt (82,1 %), Abschnitts-Transkription 18–30 s und 54–60 s bestätigt vollständigen Text.
- Mix: −14,8 LUFS, True Peak −4,0 dBFS, LRA 3,2 LU; Musik geduckt (Median-Abstand Stimme−Musik 13,9 dB).
- earshot critique: launch-grade, 21/23 im Bereich, 0 kritisch, 0 groß (minor: wenig Sub-Bass, mono).

## Offen benannt
- Cover: unteres Drittel leerer Klinikboden.
- Drei Nerd-Einstellungen in Folge (weit, nah, Tastatur-ECU) – Tastatur hat eigenen dunklen Grund, zählt hier als eigene Bildwelt.
