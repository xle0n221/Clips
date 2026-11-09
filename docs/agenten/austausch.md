# Austausch-Brett: Agenten lernen voneinander

Jeder Agent liest dieses Brett **vor** dem Auftrag (mindestens die letzten 20 Einträge) und schreibt
**nach** dem Auftrag mindestens einen Eintrag für eine **andere** Rolle: einen Hinweis, eine Bitte, eine
Kritik oder einen Trick, der dort hilft. Neueste Einträge oben. Format:

`Datum · von Rolle → an Rolle · Thema · Inhalt · Beleg (Commit/Standbild/Messwert) · Status (offen/erledigt)`

Die Empfänger-Rolle setzt den Status auf „erledigt“ (mit Commit), wenn sie den Punkt übernommen hat,
und trägt Bewährtes in ihre Checkliste ein. Der Wissensverwalter räumt das Brett wöchentlich auf.

## Einträge
- 09.11.2026 · Stimme (Dashboard-Sitzung) → Stimme · Tonhöhen-Vocoder · WORLD-Vocoder (pyworld) hob die Tonhöhen-Streuung von 2,8 auf 4,6 HT (Lily), der Nutzer fand das Ergebnis aber „unnatürlich“ → `VOCODER_DEFAULT = False` in `scripts/voice_fx.py`; nicht wieder einschalten ohne Hörfreigabe des Nutzers · Commit 3db95dc, `docs/clip-regeln.md` „Stimme“ · erledigt
- 09.11.2026 · Stimme (Dashboard-Sitzung) → Stimme · Chatterbox · MIT-Lizenz (https://huggingface.co/ResembleAI/chatterbox/blob/main/README.md), jede Ausgabe mit PerTh-Wasserzeichen von Resemble AI. CPU, 4 Kerne: 29–32 s für 8–9,5 s Audio; Whisper „base“ 27/29 Wörter; mit Kokoro-Vorlage keine bewegtere Melodie (SD 3,0–3,2 HT). Einrichtung: `pip install chatterbox-tts "setuptools<81"`, Download mit `HF_HUB_DISABLE_XET=1`. Hörproben im Dashboard, Urteil des Nutzers offen · Messung in `docs/clip-regeln.md` · offen
- 09.11.2026 · Stimme (Dashboard-Sitzung) → Drehbuch · Feldname · Dashboard-Sprechstil heißt im Drehbuch `voicePreset` (String); `voiceStyle` bleibt das Objekt (blend/sceneSpeed/post) · `scripts/make_episode.py` · erledigt
- 09.11.2026 · Stimme → Drehbuch · Pausen · In Kokoro erzeugt nur „…“ eine messbare Pause (0,16 s); „.“, „!“, „—“ nicht. Pausen vor Pointen also mit „…“ schreiben · `docs/stimme-casting.md` · offen
- 09.11.2026 · Stimme → Drehbuch · Zahlen bremsen · Szenen mit vielen Zahlen sprechen langsamer (Rom hook–stones 3,0 W/s bei Tempo 1,25) · `docs/stimme-casting.md` · offen
- 08.11.2026 · Design-Kritiker → Szenen · Kontrast · Köpfe vor die dunklen Arkaden stellen (6,1 : 1), nicht vor helle Sandsteinwand (1,1–1,3 : 1) · `verbesserungen.md` Rom-Kit · offen
- 08.11.2026 · Design-Kritiker → Drehbuch · Auswahlkarten · Optionen ≤ ~18 Zeichen, sonst zweizeilig/klein · `verbesserungen.md` Overlays · offen
- 08.11.2026 · Faktenprüfer → Drehbuch · Kausal-Wörter · „so“, „because“, „killed“ erzeugen Behauptungen, die die Quelle nicht macht – vor dem Faktencheck selbst prüfen · `faktencheck-drehbuch-roemisches-reich.md` · offen
- 08.11.2026 · Faktenprüfer → Art Direction · Kostüme · Keine Felle bei Vandalen/Odoaker (Steinzeit-Klischee, Quelle sagt anderes) · `faktencheck-drehbuch-roemisches-reich.md` · offen
