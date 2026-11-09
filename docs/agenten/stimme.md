# Rolle: Stimme (Casting + Sprechweise)

> Gedächtnis dieser Rolle. **Vor jedem Auftrag lesen, nach jedem Auftrag ergänzen.** Ablauf: [`README.md`](README.md).

## Auftrag
Stimme und Sprechweise wählen und einstellen (Kokoro, `scripts/tts.py`). Ergebnis `docs/stimme-casting.md`. Prüfer: Orchestrator/Endabnahme (Hörprobe + Messung).

## Messlatte (woran der Prüfer die Arbeit bewertet, 1–10)
- Lebendig, aufgeweckt, charakteristisch, angenehm (Nutzer-Vorgabe)
- Gemessen: Wörter/s 2,6–3,0 (Nutzer 09.11.2026: Rom mit 3,54 „zu schnell, unnatürlich“), Tonhöhen-Spannweite, Pausen – im Vergleich zu R3
- Aussprache: Whisper-Gegenprobe erkannte/geschriebene Wörter

## Checkliste (aktueller bester Stand – nur Erprobtes)
- **Natürlich wie ein echter Sprecher** hat Vorrang vor messbarer Melodie (Nutzer, 09.11.2026). Keine künstliche Tonhöhen-Bearbeitung.
- Zahlen/Jahre über `years`/`speakable`, Namen über `say`.
- Sehr kurze Sätze bündeln (Kokoro schwächelt).
- Lautheit am Ende −14 LUFS.
- Nur `…` erzeugt eine messbare Pause (0,16 s); `.`, `:`, `!`, `?`, `—` nicht.
- Tempo verändert die Tonhöhe nicht; Tonhöhe pro Szene verschieben klingt künstlich → nicht nutzen.
- Lebendige Melodie (Tonhöhen-Streuung ≥ 6 Halbtöne wie R3) erreichen nur am_fenrir und am_puck.
- Von Retention-Kritiker: Ersatz-Schreibweisen für `say` vorher an den Kokoro-Phonemen prüfen (`kokoro_onnx.tokenizer.Tokenizer().phonemize`, Rom: Odoacer, Augustulus, Augustus, Honorius, `review-drehbuch-roemisches-reich.md` 4e) (übertragen vom Wissensverwalter 09.11.2026).

## Gelernt (neueste oben; Datum · Clip · Befund · Beleg)
- 09.11.2026 · Rom v3 (Chatterbox Finn, exag 0,6, cfg 0,4, maxPauseMs 300) · ganzes Video 384 Skriptwörter / 133,0 s = **2,89 W/s** (Ziel 2,6–3,0 getroffen, Zahlen ausgeschrieben gezählt); Whisper small.en verhörte „Augustulus“ als „Augustus“, **medium.en erkannte es richtig** → bei Zweifel immer mit medium.en gegenprüfen, nicht sofort neu vertonen. Chatterbox würfelt jede Aufnahme neu (1. Lauf 136,2 s, 2. Lauf 133,0 s) → für reine Cue-Änderungen `make_episode.py --retime` · Commit a2d83d3.
- 09.11.2026 · Chatterbox-Probe (exag 0,6, cfg 0,4; Rom-Intro 115 W.) · Prüfer-Messung: Whisper alle 115 Wörter inkl. Zahlen (als Ziffern), keine Halluzination/Wiederholung; Fenrir 2,90 W/s (Artikulation 3,49), Lily 2,73 (3,41) vs. Referenz ricksclip 3,80/4,0. Hauptabweichung: **Pausen nach Punkt/Frage ~0,50–0,65 s statt 0,22 s** (Komma passt: 0,20 vs 0,21). Keine Clips (−1,5 dBFS), Szenengrenzen sauber, Pegel je Szene ±0,5–0,9 dB. Melodie P10–P90 Fenrir 9,5 HT, Lily 8,7 HT. Note Fenrir 7, Lily 6 · Skript `scratchpad/pruef/m.py`.
- 09.11.2026 · Nutzer-Feedback (über Dashboard-Sitzung) · „Stimmen hören sich unnatürlich an … sollen sich anhören als wären sie echte Voice-Actor“; Tonhöhen-Bearbeitung per WORLD-Vocoder klang unnatürlich → **keine Vocoder-Tonhöhenbearbeitung**. Ziel ist Natürlichkeit vor Effekt. Ausdrucksstärkeres Modell (Chatterbox, MIT) wird in der Dashboard-Sitzung getestet.
- 09.11.2026 · Rom · Tempo-Faktor wirkt **nicht linear** (1.33→99,8 s, 1.34→91,5 s, 1.36→88,4 s): immer 2–3 Werte um die Schätzung herum aufnehmen und den besten nach W/s **und** Whisper-Treffern wählen. Gewählt 1.35 = 3,57 W/s, Whisper 315/319 · Commit 47fcab0.
- 08.11.2026 · Rom · Casting gemessen: Mischung fenrir 0,6 + puck 0,4 trifft R3 (126,6 Hz, 6,3 HT); `lively` hebt Präsenz 2–5 kHz von −13,6 auf −10,1 dB · `docs/stimme-casting.md`.
- 08.11.2026 · Rom · Rom-Szenen mit vielen Zahlen sprechen nur 3,0 W/s bei Tempo 1,25 (Schätzung 3,45 war zu hoch) → Tempo erst nach dem vollen Sprachlauf festlegen.

## Nächste Experimente (je Clip mindestens eins ausprobieren und messen)
- Chatterbox: Pausen > 0,3 s nach Satzende auf ~0,25 s kürzen + Szenen-Lücke 0,3 → 0,1 s; danach W/s und Pausen-Median gegen Referenz messen. Zusätzlich cfg 0,3/0,5 je einmal (Tempo-Wirkung messen, nicht annehmen).
- Rom mit K1 (Mischung + `lively`): Whisper-Gegenprobe über die ganze Episode; „respawn“ anhören.
- Gehör-Urteil des Nutzers einholen (Hörproben K0–K3) und hier eintragen.
- Silbenrate statt Wortrate messen.

## Bewertungsverlauf
| Datum | Clip | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- | --- |
| 09.11.2026 | Chatterbox-Probe | Fenrir 7, Lily 6 (Messung, nicht gehört) | Satzpausen 2× zu lang, Tempo 2,9 statt 3,8 W/s |
| 09.11.2026 | Rom | – (Gehör-Urteil Nutzer offen) | Mischung trifft R3-Melodie laut Messung |

