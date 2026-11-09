# Referenz-Analyse 4 – @ricksclip3000 (TikTok), vom Nutzer als Hauptvorbild gewählt (09.11.2026)

Vorgabe des Nutzers: „Wichtig, dass du dir viel Inspo dieser Videos nimmst – Stimme, Animationen,
Geschwindigkeit, Untertitel, 3D-Animationen … Alles, was du findest, übernehmen und verbessern, besser sogar
als in den Videos.“ Übernommen werden **Techniken**, keine Figuren, Texte oder Looks 1:1.

Methode: ffprobe; harte Schnitte `select='gt(scene,0.3)'`; Kontaktabzug 36 Bilder (scratchpad `inspo/r6.jpg`,
`inspo/r7.jpg`); Transkript whisper.cpp (`scripts/whisper-words.mjs`, Sprache auto).

| | R6 „How do painkillers know where the pain is?“ | R7 „Brain in a jar“ |
|---|---|---|
| Länge | 34,5 s | 57,0 s |
| Harte Schnitte | **1** | **0** |
| Wörter (Whisper) | 137 | 214 |
| Wörter/s (über die ganze Länge) | 137 / 34,5 = **3,97** | 214 / 57,0 = **3,75** |

Hinweis: Sprechbeginn/-ende ließen sich wegen Musik nicht per Pausenerkennung messen; die Rate ist über die
Gesamtlänge gerechnet (Untergrenze). **Befund:** Die Vorbilder sprechen *schneller* als Rom v1 (3,54 W/s), wirken
aber natürlich. „Zu schnell“ lag bei Rom also vermutlich nicht an der Wortrate allein, sondern an der
künstlich beschleunigten Kokoro-Stimme (Tempo 1,35) – Ich kann das nicht bestätigen (keine Hörprüfung durch
mich möglich). Folge: Tempo über **Text** (kurze Sätze, wenig Füllpausen) statt über den Speed-Faktor;
Kokoro-Faktor ≤ 1,2; Hörprobe entscheidet (Freigabe nach Drehbuch).

## Techniken (Bild/Ton belegt durch Kontaktabzug bzw. Transkript)
1. **Durchgehende Kamerareise statt Schnitte** (0–1 Schnitt): Übergänge sind Fahrten *in* etwas hinein
   (Kopf → Körperwelt, Tür → Flur, Bildschirm → Simulation). → Baustein „Portal-Fahrt“: Kamera fliegt in ein
   Objekt, das zur nächsten Kulisse wird.
2. **Held = Gegenstand mit Gesicht auf einer Reise** (Tablette durch den Körper) – POV-Story mit Etappen.
3. **Erklär-Metapher als Set** („picture your body as a house with thousands of rooms“) – Flur mit
   Fluchtpunkt, Türen, Schilder; abstrakt → räumlich.
4. **Schilder-Humor im Bild**: Verkehrsschild „HEADACHE ↑ 20 MIN“, „ACID SPA 98.6 °F – NO DIVING“,
   Einverständnis-Formular „The procedure is 100% fatal“.
5. **Untertitel: ein Wort zur Zeit**, Großbuchstaben, rot mit weißer Kontur, klein, mittig-unten.
6. **Ausdrucksstarke Gesichter**: Schweißtropfen, Stress-Striche, zugekniffene Augen, gefletschte Zähne,
   extreme Großaufnahmen; Figuren einfach (runder Kopf, Kontur).
7. **Warme, tiefe Hintergründe** mit weichem Leuchten und Vignette; Farbwelt wechselt je Ort.
8. **Stilbruch als Gag**: Wechsel in Klötzchen-Spiellook für „Simulation“ mit „+100 NOM!“-Anzeige.
9. **Text-Muster** (Transkript): Frage-Hook in Du-Form („How do painkillers know…? You swallow one…“),
   Alltagsbild als Erklärung, trockene Pointe am Satzende („…unless someone trips over the power cable“),
   „Well,“ als Umschwung.

## „Besser als die Vorbilder“ – unsere Vorteile
- Echtes 3D: Portal-Fahrten mit Parallax/Orbit und Licht statt 2D-Zoom.
- Belegte Fakten mit Quellen (Faktenprüfer) – die Vorbilder nennen keine.
- Spiel-Klammer + Loop/Quiz als Kommentar-Treiber.
- Wort-Untertitel mit Akzentfarbe nur auf Schlüsselwörtern (lesbarer als Dauer-Rot).
