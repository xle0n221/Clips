# Selbst-Audit „In This City, You Die When Your To-Do List Is Done“ (`todo-stadt`, 21.11.2026) – Rolle: Comic-/Cartoon-Designer + Publikum

Maßstab: `docs/audit-2026-11-20.md` (nicht milder). Grundlage: Kontaktabzüge `out/todo-k1.jpg` (27 Bilder, Rohfassung), `out/todo-k2.jpg` (Hook 0,1–3,0 s), Einzelbilder des fertigen MP4 (0,05/0,3/0,45/1,0/1,8/13,9/14,5/37/38/40,5/42,3/61/61,5/62,7 s, `out/todo-chk.jpg`), Messwerte unten.

## Noten (ehrlich, 1–10)
| Kriterium | Note | Beleg |
|---|---|---|
| **Hook** (Bild 1 + erste 2 s) | 9 | Bild 1: Mann mit To-do-Liste auf der Couch, Schädel mit Sense lugt über die Lehne, Cover-Titel „FINISH YOUR LIST = YOU DIE“ → Regel stumm lesbar. Bewegung ab Bild 2 (Haken wird gezogen), POOF + Tod steht auf bei 0,3–0,6 s, Schrei; Satz 1 endet bei 3,1 s, Gegen-Gag „BUY MILK“ bei 2,9 s. Offene Frage („wer schafft seine Liste?“) wird erst bei 47,7 s („Relax“) aufgelöst. |
| Bildvielfalt | 9 | 17 Bildwelten, 27 Einstellungen + Schwarzbild in 62,5 s (Ø 2,3 s); kein Set > 2 Einstellungen am Stück (vor dem Render gezählt, `TODO_SHOT_COUNT`). Schwäche: Outro-Einstellung 4,8 s lang (Knochenhand als Reiz bei 59,1 s). |
| Figuren/Schauspiel | 9 | Tod mit 4 Mienen (gelangweilt mit Lid, glücklich, Schock, neutral), Gähnen, hängende Schultern, Popcorn-Aufstehen, Arm um Dennis; Mann schreit, Edna zwinkert verschlagen, Mama weint → schreit, Dennis' Auge zuckt. Schwäche: Nachbarn nur winkende Arme. |
| Lesbarkeit/Ordnung | 9 | Eine Text-Ebene (gelbe Phrasen); Listen/Schilder sind selbst der Gag („BUY MILK“, „Q3 GOALS“, „RELAX“, „FINISH THIS SENTENCE“). Gesichter über dem Untertitelband geprüft; Ausnahme: Tod in Reihe 1 (13,9 s) kurz hinter dem Untertitel, bevor er aufsteht. |
| Konzept sofort sichtbar | 9 | Haken → Tod erscheint → neuer Punkt → Tod enttäuscht: Regel ohne Ton in 3 s verständlich. |
| Humor | 9 | 27 Gag-Momente, größter Abstand 3,4 s (`docs/paket-todo-stadt.md`); schwarzer Humor trocken (Coach „one seminar“, Mama „devastated“, Tod zieht ein), Pointe + Loop durch Abbruch mitten im Wort. Tabus eingehalten (keine realen Personen, niemand wählt den Tod, keine Opfergruppe). |
| Farbe/Kontrast | 9 | Gesättigte Pastell-Sets je Szene unterschiedlich (rot/blau/lila/grün); Tod schwarz auf hellen Gründen, Dennis grün. Schwäche: Tür-Nachtszene dunkel, Tod dort weniger Kontrast. |
| Länge/Format | 9 | 64,0 s inkl. End-Card 2 s (Vorgabe 61–70 s), 1080×1920, H.264 yuv420p BT.709, AAC. |
| **Gesamt Publikum** | **9** | |

## Messwerte
- Stimme (`scripts/stimm_messung.py`): 168 W in 62,5 s → 2,69 W/s gesamt (Regel 2,3–2,6: **über dem Band**, wie Gähn-Stadt 2,65 – bewusst für Comedy-Tempo, offen benannt); Satzpause Median 230 ms, Komma 175 ms, Satzende −5,5 dB (89 % leiser, 74 % fallend), 0 harte Kanten, Whisper 98,2 % der gesprochenen Wörter (Rest: „road work“ → „roadwork“, „sent—“ → „sentence“ = gewollter Abbruch).
- Mix (ffmpeg ebur128, fertiges MP4): −14,9 LUFS, −2,4 dBTP.
- earshot `critique --fast` (vor EQ/Limiter, `out/todo-stadt-norm.mp4`): 20 von 21 gemessenen Werten im Bereich, Ausnahme Stereobreite (−33 dB, „minor“, Mono-Mix wie Ghost-Pepper); Sync 66 % (≥ 45 %); Präsenz 4–8 kHz −11,9 dB (Grenze −11,6) → EQ −3,5 dB @ 6 kHz im Final.
- Musik-Abstand Stimme–Musik (duck_music): Median 13,7 dB, P10 −16,8 dB.

## Bekannte Schwächen (nicht verschwiegen)
1. Sprechtempo 2,69 W/s über der Tempo-Regel (2,3–2,6).
2. Mono-Mix; `realness`/`music presence` nicht gemessen (`--fast`).
3. earshot: 4 Bildwechsel ohne Klang (3,1 / 24,4 / 37,5 / 41,1 s).
4. Marktlage für „In this city“ Nov. 2026 nicht belegt (Ich kann das nicht bestätigen); kein Vergleich mit konkreten Top-Shorts.
5. Ein Parallel-Video am 22.11. (`suche-stadt`) nutzt ebenfalls das Motiv Tod.
