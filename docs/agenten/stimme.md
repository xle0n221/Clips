# Rolle: Stimme (Casting + Sprechweise)

> Gedächtnis dieser Rolle. **Vor jedem Auftrag lesen, nach jedem Auftrag ergänzen.** Ablauf: [`README.md`](README.md).

## Auftrag
Stimme und Sprechweise wählen und einstellen (Chatterbox `scripts/tts_chatterbox.py` + `emotion` je Szene; früher Kokoro `scripts/tts.py`). Ergebnis `docs/stimme-casting.md`. Prüfer: Orchestrator/Endabnahme (Hörprobe + Messung).

## Messlatte (woran der Prüfer die Arbeit bewertet, 1–10)
- Lebendig, aufgeweckt, charakteristisch, angenehm (Nutzer-Vorgabe)
- Gemessen: Wörter/s 2,3–2,6, Ziel 2,4 (Nutzer 12.11.2026; davor 2,6–3,0, Nutzer 09.11.2026: Rom mit 3,54 „zu schnell, unnatürlich“), Tonhöhen-Spannweite, Pausen – im Vergleich zu R3
- Aussprache: Whisper-Gegenprobe erkannte/geschriebene Wörter

## Checkliste (aktueller bester Stand – nur Erprobtes)
- **Wie ein echter Geschichtenerzähler** (Nutzer 12.11.2026 abends, `docs/clip-regeln.md`): nie per `speed`/atempo beschleunigen (max. 1,05), Pausen Satz 450–640 ms / Komma 160–240 ms / Szene ≈ 0,8–1,0 s, Satzende weich 1–3 dB leiser, Ausklang nicht kappen, exag ≤ 0,70. Vor Freigabe `scripts/stimm_messung.py <id>` (Werte alt/neu in die Freigabe). Zu wenig W/s → Skript kürzen, nicht beschleunigen.
- Aussprache-Prüfung je Satz läuft automatisch (Whisper, bis 3 Seeds). Rest-Abweichungen aus dem Log ansehen: Namen (D'Amato) sind meist nur Whisper-Schreibweise; echte Fehler → umformulieren (ex-boxer → former boxer).
- **Natürlich wie ein echter Sprecher** hat Vorrang vor messbarer Melodie (Nutzer, 09.11.2026). Keine künstliche Tonhöhen-Bearbeitung.
- **Emotion je Szene** (`emotion`, Tabelle `docs/clip-regeln.md` → „Stimme wie ein Synchronsprecher“): Chatterbox spricht dann Satz für Satz mit festem Seed (reproduzierbar) – nur echte Chatterbox-Regler (exaggeration, cfg_weight, temperature), keine Tonhöhen-Bearbeitung.
- Zahlen/Jahre über `years`/`speakable`, Namen über `say`.
- Sehr kurze Sätze bündeln (Kokoro schwächelt).
- Lautheit am Ende −14 LUFS.
- Nur `…` erzeugt eine messbare Pause (0,16 s); `.`, `:`, `!`, `?`, `—` nicht.
- Tempo verändert die Tonhöhe nicht; Tonhöhe pro Szene verschieben klingt künstlich → nicht nutzen.
- Lebendige Melodie (Tonhöhen-Streuung ≥ 6 Halbtöne wie R3) erreichen nur am_fenrir und am_puck.
- Von Retention-Kritiker: Ersatz-Schreibweisen für `say` vorher an den Kokoro-Phonemen prüfen (`kokoro_onnx.tokenizer.Tokenizer().phonemize`, Rom: Odoacer, Augustulus, Augustus, Honorius, `review-drehbuch-roemisches-reich.md` 4e) (übertragen vom Wissensverwalter 09.11.2026).

## Gelernt (neueste oben; Datum · Clip · Befund · Beleg)
- 12.11.2026 abends · Tyson/UFC/Rolls neu vertont („rattert alles durch“) · **Ursache gemessen** (`scripts/stimm_messung.py`, alt → neu): atempo 1,02/1,22/1,11 → 1,0; Satzpause Median 355/235/210 → 515/520/390 ms; Komma 60/65/100 → 200/210/240 ms; Szenenwechsel 135/140/130 → 845/755/780 ms; Satzrate (ohne Pausen) 3,32/3,10/3,28 → 3,50/2,77/3,40 W/s, Silben 4,41/5,34/4,49 → 4,84/4,53/4,55 /s; earshot Onsets/s 4,23/5,13/4,80 → 3,53/3,84/3,79; Satzende leiser −3,9/−1,9/−1,5 → −4,5/−3,0/−3,6 dB; Satzende fallend 92/62/75 → 92/84/92 % (−4,5/−1,4/−3,3 → −4,5/−3,8/−5,1 HT, exag ≤ 0,70); „harte Kanten“ 1/6/5 → 0/4/3 (Rest: Chatterbox-Aufnahme endet direkt nach dem letzten Laut, jetzt 120-ms-Ausblendung); Whisper gesprochene Form 97,0/98,2/96,7 → 99,5/99,1/97,8 % (Schreibweise 92,7/93,3/91,4 → 92,7/94,8/93,7 – Differenz sind Ziffern/Bindestriche, keine Fehler). Aussprache-Prüfung: 23/26, 27/30, 26/28 Sätze ohne Abweichung. **Folge: Gesamt-W/s 2,42/2,36/2,40 → 2,06/1,75/1,89 (Dauer 79,1/82,3/73,0 → 93,3/110,7/92,7 s) – unter 2,3, nicht beschleunigt, gemeldet.** Rolls: Satzpause-Median nur 390 ms, weil gebündelte Kurzsätze („Done? Cool.“) innen keine erkennbare Stille haben. Rechenzeit ≈ 5 s je Sekunde Audio (4 Kerne, allein). **Nicht gehört** – Urteil Nutzer offen.
- 12.11.2026 · A/B Emotion (Tyson exodus/champion, UFC ban/sale, Rolls hood/bmw; alt = Stück am Stück aus out/cb-cache, neu = Satz-Modus mit `emotion`; `out/stimme-ab/`, Messung `ab-messung.json`, pyin 5.–95. Perzentil) · Tonhöhen-Spanne alt→neu (HT): 11,4→11,5 · 9,3→12,7 · 12,6→14,4 · 15,5→19,2 · 15,4→21,0 · 12,2→8,8 (ironic bmw flacher). **Pegelunterschied zwischen Szenen** (Median, 400-ms-RMS) alt 2,2 dB (−20,5…−18,3), neu 7,0 dB (sad −22,1 … triumphant −15,1) → Kontrast messbar größer. Lautheits-Spanne innerhalb der Szene und Pausenanteil ohne klare Richtung (n = 1 Aufnahme je Szene, Zufall der Aufnahme überwiegt). W/s alt 2,20–2,65, neu 2,06–2,47 (hood 2,06: nur 11 Wörter, `playful`-Pausen). Rechenzeit 1016 s für 44,4 s Audio = 23 s je Sekunde (CPU geteilt mit pip-Installation; früher 3,5×) → Satz-Modus ≈ 2–3 min je Szene. **Nicht gehört** – Urteil des Nutzers offen.
- 09.11.2026 · Rom v3 (Chatterbox Finn, exag 0,6, cfg 0,4, maxPauseMs 300) · ganzes Video 384 Skriptwörter / 133,0 s = **2,89 W/s** (Ziel 2,6–3,0 getroffen, Zahlen ausgeschrieben gezählt); Whisper small.en verhörte „Augustulus“ als „Augustus“, **medium.en erkannte es richtig** → bei Zweifel immer mit medium.en gegenprüfen, nicht sofort neu vertonen. Chatterbox würfelt jede Aufnahme neu (1. Lauf 136,2 s, 2. Lauf 133,0 s) → für reine Cue-Änderungen `make_episode.py --retime` · Commit a2d83d3.
- 09.11.2026 · Chatterbox-Probe (exag 0,6, cfg 0,4; Rom-Intro 115 W.) · Prüfer-Messung: Whisper alle 115 Wörter inkl. Zahlen (als Ziffern), keine Halluzination/Wiederholung; Fenrir 2,90 W/s (Artikulation 3,49), Lily 2,73 (3,41) vs. Referenz ricksclip 3,80/4,0. Hauptabweichung: **Pausen nach Punkt/Frage ~0,50–0,65 s statt 0,22 s** (Komma passt: 0,20 vs 0,21). Keine Clips (−1,5 dBFS), Szenengrenzen sauber, Pegel je Szene ±0,5–0,9 dB. Melodie P10–P90 Fenrir 9,5 HT, Lily 8,7 HT. Note Fenrir 7, Lily 6 · Skript `scratchpad/pruef/m.py`.
- 09.11.2026 · Nutzer-Feedback (über Dashboard-Sitzung) · „Stimmen hören sich unnatürlich an … sollen sich anhören als wären sie echte Voice-Actor“; Tonhöhen-Bearbeitung per WORLD-Vocoder klang unnatürlich → **keine Vocoder-Tonhöhenbearbeitung**. Ziel ist Natürlichkeit vor Effekt. Ausdrucksstärkeres Modell (Chatterbox, MIT) wird in der Dashboard-Sitzung getestet.
- 09.11.2026 · Rom · Tempo-Faktor wirkt **nicht linear** (1.33→99,8 s, 1.34→91,5 s, 1.36→88,4 s): immer 2–3 Werte um die Schätzung herum aufnehmen und den besten nach W/s **und** Whisper-Treffern wählen. Gewählt 1.35 = 3,57 W/s, Whisper 315/319 · Commit 47fcab0.
- 08.11.2026 · Rom · Casting gemessen: Mischung fenrir 0,6 + puck 0,4 trifft R3 (126,6 Hz, 6,3 HT); `lively` hebt Präsenz 2–5 kHz von −13,6 auf −10,1 dB · `docs/stimme-casting.md`.
- 08.11.2026 · Rom · Rom-Szenen mit vielen Zahlen sprechen nur 3,0 W/s bei Tempo 1,25 (Schätzung 3,45 war zu hoch) → Tempo erst nach dem vollen Sprachlauf festlegen.

## Nächste Experimente (je Clip mindestens eins ausprobieren und messen)
- Gebündelte Kurzsätze: Pause innen auch ohne erkennbare Stille setzen (an der Energiesenke nahe der erwarteten Stelle) oder Kurzsätze einzeln erzeugen und Aussetzer messen.
- Abrupt endende Chatterbox-Aufnahmen (Sprache bis zum letzten Sample) erkennen und mit neuem Seed neu erzeugen statt nur auszublenden.
- W/s < 2,3 nach Erzähler-Regel: Kürzen allein hebt die Rate kaum (Pausen schrumpfen mit). Rate steigt nur mit weniger Pausen je Wort, also längeren Sätzen statt Stakkato-Kurzsätzen und weniger „ | “; UFC hat zusätzlich langsame Satzrate 2,77 W/s (Zahlen-Sätze). Mit Regie/Orchestrator klären, ob 2,3 W/s für die Erzähler-Fassung gilt.
- Emotion: Hörurteil des Nutzers zu `out/stimme-ab/*-alt|neu.wav` einholen; danach `EMOTIONS` anpassen. Je Szene 2–3 Seeds erzeugen und Streuung messen (eine Aufnahme ist kein Beleg). `ironic` (bmw flacher) mit exag 0,8 testen.
- Klangvorlage ist flaches Kokoro (10 s) – Chatterbox übernimmt die Sprechweise der Vorlage: eine ausdrucksstärkere, lizenzfreie Vorlage derselben Stimme testen (keine echte Person klonen).
- Chatterbox: Pausen > 0,3 s nach Satzende auf ~0,25 s kürzen + Szenen-Lücke 0,3 → 0,1 s; danach W/s und Pausen-Median gegen Referenz messen. Zusätzlich cfg 0,3/0,5 je einmal (Tempo-Wirkung messen, nicht annehmen).
- Rom mit K1 (Mischung + `lively`): Whisper-Gegenprobe über die ganze Episode; „respawn“ anhören.
- Gehör-Urteil des Nutzers einholen (Hörproben K0–K3) und hier eintragen.
- Silbenrate statt Wortrate messen.

## Bewertungsverlauf
| Datum | Clip | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- | --- |
| 12.11.2026 abends | Tyson/UFC/Rolls Erzähler-Fassung | – (Messung, nicht gehört) | Pausen/Satzende im Ziel, Whisper ≥ 97,8 %, aber Gesamt 1,75–2,06 W/s |
| 12.11.2026 | Emotion A/B (6 Szenen) | – (Messung, nicht gehört) | Szenen-Kontrast Pegel 2,2 → 7,0 dB, Melodie in 5/6 Szenen weiter |
| 09.11.2026 | Chatterbox-Probe | Fenrir 7, Lily 6 (Messung, nicht gehört) | Satzpausen 2× zu lang, Tempo 2,9 statt 3,8 W/s |
| 09.11.2026 | Rom | – (Gehör-Urteil Nutzer offen) | Mischung trifft R3-Melodie laut Messung |

