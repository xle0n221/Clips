# Rückblick: „Der Untergang des Römischen Reiches“ (09.11.2026) und Ablauf für den nächsten Clip

## Ergebnis
- 90,1 s, 1080×1920, 30 fps, −14 LUFS, BT.709 (`out/Rome-Worst-Job-Shorts-TikTok.mp4`).
- 13 Szenen / 41 Einstellungen (Ø 2,18 s je Einstellung, aus dem Code gezählt), 319 Wörter, 3,54 W/s.
- Regie-Kritiker: Ø 6,0 → 7,0 (Selbstbewertung der Rolle, keine Nutzernote).

## Was gut lief (belegt)
- Faktencheck vor der Stimme: 5 Umformulierungen gefunden, bevor Arbeit daran hing
  (`faktencheck-drehbuch-roemisches-reich.md`).
- Prüfpaare: Regie-Kritiker hob die schwächsten Szenen (vote 4→6,5, twist 4,5→7) vor der Freigabe.
- Kontaktabzug-Werkzeug (`npm run contactsheet`): 39 beschriftete Bilder in einem Lauf.
- Freigabe im Dashboard / Chat → Render ohne Rückfrage.

## Was Zeit gekostet hat (belegt)
| Ursache | Verlust | Gegenmaßnahme (umgesetzt) |
|---|---|---|
| Nutzungslimit, 5 Agenten gleichzeitig | ~4 h Stillstand (00:20–04:40 UTC) | nur so viele Agenten wie nötig; Abholer setzt automatisch fort |
| Tempo linear geschätzt (Kokoro-Stufe 1,33→1,34 ≈ −10 %) | mehrere Tonaufnahmen | `npm run calibrate` |
| Render ohne lokalen Browser | 1 Fehlstart | Befehl in SKILL.md |
| Render 56 min statt ~40 (mehr Figuren) | +16 min | Experiment: Mesh-Reduktion messen |
| Querschnitts-Agenten (Playbook, Kit, Texte) parallel zum Video | Limit früher erreicht | künftig nach dem Video bzw. in der Wochenrunde |
| Geschätzte Uhrzeiten im Dashboard | 2 Korrekturen | `updatedAt` nur aus `date -u` |

## Offene Schwächen dieses Clips
- YOU im Quiz klein; in `goths` und `deleted` ohne YOU.
- Pills können nicht pro Einstellung ausgeblendet werden (Overlay-Code) → Kamera muss sich danach richten.
- Bewegung/Wackler nur im Video prüfbar; Hashtags für Geschichte ohne Kennzahlen.

## Ablauf für den nächsten Clip (kurz)
1. **Thema** aus dem Dashboard; Muster der Themen-Art aus `playbook-themen.md`.
2. **Recherche + Drehbuch** (1 Agent) → **Faktenprüfer** (Prüfpaar) → Freigabe 1 im Dashboard.
3. **Stimme**: `npm run calibrate` für das Tempo, dann `npm run episode -- … --save`.
4. **Szenen**: `npm run scaffold` erzeugt das Gerüst; Bausteine aus `kit/common.tsx` + Themen-Kit;
   YOU in jeder Szene, Pills nur auf Dinge, die über die ganze Szene im Bild bleiben.
5. **Regie-Kritiker** (Prüfpaar) → `npm run contactsheet` → Freigabe 2 im Dashboard.
6. **Render** (Befehl in SKILL.md) → `scripts/finalize.sh` (upload-fertig) → Endkontrolle → Datei + Texte.
7. **Lernen**: jede Rolle trägt ein; Querschnittsarbeit in die Wochenrunde.

Agenten je Clip: Recherche/Drehbuch, Faktenprüfer, Szenen, Regie-Kritiker, Veröffentlichung – mehr nur,
wenn ein Schritt wirklich parallel laufen kann. Erwartete Dauer: nicht gemessen – erst der nächste Clip
liefert einen Vergleichswert ohne Limit-Pause.

## Vorgabe des Nutzers für den nächsten Clip (09.11.2026)
„Die Agenten sollen lernen, die Animationen besser zu machen und sich mehr von anderen Cartoon-Clips
inspirieren lassen – 3D-Animationen, Transitions etc. verbessern. Das nächste Video soll anders aussehen,
besser und optisch ansprechender.“ Umsetzung:
1. Recherche → `docs/animation-techniken.md` (belegte Techniken, Machbarkeit, Top 8).
2. Art Direction + Szenen bauen die Top-Techniken als wiederverwendbare Bausteine ins Kit
   (Übergänge, Kamera, Figuren-Bewegung) mit Prüf-Komposition und Vorher/Nachher-Clip.
3. Regie-Kritiker prüft im **bewegten** Probe-Clip (nicht nur Standbild), Note je Technik.
4. Der nächste Clip muss mindestens 5 der Top 8 sichtbar nutzen; Inspiration = Technik, nie fremde
   Figuren/Marken/Looks kopieren.

## Selbstanalyse Orchestrator – was besser wird (maximale Qualität, 09.11.2026)
| Fehler (Beleg) | Folge | Neu |
|---|---|---|
| Tempo-Regel 3,3–3,6 W/s ohne Hörprobe übernommen | Nutzer: „zu schnell“ nach dem Render → Neuaufnahme + 2. Render | Hörprobe direkt nach Freigabe 1 |
| Freigabe 2 nur Standbilder | Bewegung/Tempo erst im fertigen Video sichtbar | Vorschau-Video halbe Auflösung zur Freigabe 2 |
| Kontaktabzug mit bekannten Schwächen vorgelegt (YOU fehlt in 2 Szenen, Quiz) | Nutzer prüft Unfertiges | Qualitäts-Tor: keine Note < 7 |
| Export: Vollbereich-Farben, 104 MB | Farbrisiko, Download scheiterte | `finalize.sh` BT.709 + Download-Fassung ≤ 50 MB |
| Inspiration erst nach dem Video | Look erst beim nächsten Clip besser | Referenzen beim Thema-Start abfragen |
| Primärquellen teils gesperrt (remotion.dev, wikipedia.org) | Belege nur aus Suchauszügen | Freigabe der Hosts vorschlagen, sobald nötig |
| Plattform-Grenzen nicht geprüft | Unsicherheit beim Posten | vor Veröffentlichung offizielle Hilfe-Seiten prüfen |
| Uhrzeiten geschätzt (2×) | Korrekturen | nur `date -u` |
