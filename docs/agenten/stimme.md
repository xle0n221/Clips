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
- 09.11.2026 · Nutzer-Feedback (über Dashboard-Sitzung) · „Stimmen hören sich unnatürlich an … sollen sich anhören als wären sie echte Voice-Actor“; Tonhöhen-Bearbeitung per WORLD-Vocoder klang unnatürlich → **keine Vocoder-Tonhöhenbearbeitung**. Ziel ist Natürlichkeit vor Effekt. Ausdrucksstärkeres Modell (Chatterbox, MIT) wird in der Dashboard-Sitzung getestet.
- 09.11.2026 · Rom · Tempo-Faktor wirkt **nicht linear** (1.33→99,8 s, 1.34→91,5 s, 1.36→88,4 s): immer 2–3 Werte um die Schätzung herum aufnehmen und den besten nach W/s **und** Whisper-Treffern wählen. Gewählt 1.35 = 3,57 W/s, Whisper 315/319 · Commit 47fcab0.
- 08.11.2026 · Rom · Casting gemessen: Mischung fenrir 0,6 + puck 0,4 trifft R3 (126,6 Hz, 6,3 HT); `lively` hebt Präsenz 2–5 kHz von −13,6 auf −10,1 dB · `docs/stimme-casting.md`.
- 08.11.2026 · Rom · Rom-Szenen mit vielen Zahlen sprechen nur 3,0 W/s bei Tempo 1,25 (Schätzung 3,45 war zu hoch) → Tempo erst nach dem vollen Sprachlauf festlegen.

## Nächste Experimente (je Clip mindestens eins ausprobieren und messen)
- Rom mit K1 (Mischung + `lively`): Whisper-Gegenprobe über die ganze Episode; „respawn“ anhören.
- Gehör-Urteil des Nutzers einholen (Hörproben K0–K3) und hier eintragen.
- Silbenrate statt Wortrate messen.

## Bewertungsverlauf
| Datum | Clip | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- | --- |
| 09.11.2026 | Rom | – (Gehör-Urteil Nutzer offen) | Mischung trifft R3-Melodie laut Messung |

