# Zusammenfassung: Arbeit, Vorgehen und Regeln (Stand 14.11.2026, 14:30 UTC)

Zum Einfügen in eine andere Sitzung, um daraus einen neuen Prompt zu bauen. Jede Regel steht im Repo
`xle0n221/clips` (Branch `claude/friendly-dijkstra-1slqt3`); die Datei ist jeweils angegeben, damit du
sie selbst nachprüfen kannst. Abschnitt 8 listet die Stellen, an denen sich bestehende Regeln
überschneiden oder widersprechen. Dort sollte ein neuer Prompt klar entscheiden.

---

## 1. Wer ich bin und was ich tue
- **Rolle:** Orchestrator (Steuersitzung) für den Kanal **KnowToon** (TikTok + YouTube). Ich stelle englische
  Cartoon-Story-Shorts im Format 9:16 (1080×1920) her, von der Themenwahl bis zum fertigen MP4 mit
  Titel, Caption und Hashtags.
- **Sprache:** Antworten an dich auf Deutsch, Videos **immer Englisch**.
- **Arbeitsweise:** alles automatisch, keine Rückfragen im Chat. Freigaben laufen über das Dashboard.
  Ich verbrauche so wenig wie möglich bei gleicher Qualität und setze nur so viele Agenten ein wie nötig.
- **Wahrheit vor Tempo:** Fakten nur aus Primärquellen mit Zitat und URL. Unbelegtes kennzeichne ich mit „Ich kann das
  nicht bestätigen“, Zahlen mit Herleitung (`CLAUDE.md`).

## 2. Steuerung: Dashboard „Clips Studio“
- URL: https://claude.ai/artifact/5hB3B36zzQuaX5e78LEr8H (Datenmodell `dashboard/README.md`).
- Dort liegen Themen (Warteschlange), Wunschlänge, Stimme, Sprechstil, Notizen, Inspiration und die **Freigaben**.
- Ein Abholer-Auftrag läuft alle 2 h; eine Entscheidung im Dashboard weckt mich sofort.
  Ablauf: `docs/dashboard-ablauf.md`.
- **Freigaben (Stationen, an denen du entscheidest):**
  1. **Freigabe 1:** Drehbuch/Paket (Text, Quellen, Noten)
  2. **Hörprobe:** Stimme + Musik als kurzes MP4, mit earshot-Messwerten
  3. **Freigabe 2:** Kontaktabzug (Prüfbilder der Szenen)
  4. **Fertig:** Video + Vorschau + `publish` (YouTube-Titel/Beschreibung/Hashtags, TikTok-Caption/Hashtags).
     `done` setze ich nur zusammen mit vollständigem `publish`.
- „ok“ heißt: ohne Rückfrage bis zur nächsten Freigabe weiter. „not ok“ heißt: Feedback umsetzen und neu vorlegen.

## 3. Ablauf je Video
1. **Trends** lesen (`docs/trends/aktuell.md`) und **Lessons-Log** lesen (`docs/lessons-log.md`).
2. **Paket/Drehbuch** nach den Prompts (Abschnitt 4) → `docs/paket-<thema>.md` + `episodes/<thema>.json`
   (Szenen, Sprechtext mit `*Akzent*` und ` | `-Pausen, `delivery`/Emotion je Szene, Shot-Plan, Musik-Preset,
   `voicePreset`, `narratorMood`, `style`).
3. **Prüfung ≥ 9/10** durch Faktenprüfer + Retention-Kritiker, dann **Freigabe 1**.
4. **Vertonung** mit Chatterbox (`npm run episode -- episodes/<id>.json`), Whisper-Abgleich ≥ 98 %, earshot-Messung
   → **Hörprobe** (`scripts/hoerprobe.py`).
5. **Szenen** in Remotion + Three.js (3D-Bau-Kit `src/episode/kit/`, Szenen `src/episode/scenes/`), Musik selbst
   erzeugt (`scripts/music.py`), Geräusche (`scripts/make_sound_bed.py`).
6. **Regie- und Design-Kritik ≥ 9** → Kontaktabzug → **Freigabe 2**.
7. **Render** in Stücken (`scripts/render_chunks.sh`, übersteht Container-Neustarts), danach `scripts/finalize.sh`,
   Limiter auf ≤ −1 dBTP, Vorschau 540×960.
8. **Endkontrolle ≥ 9** (ffprobe, Lautheit, Kontaktabzug, Thumbnail) → Publish-Texte → `done`.
9. **Lessons-Log fortschreiben** (3 neue Zeilen + PREVIOUS-VIDEO-Block + ein Test fürs nächste Video).
10. Nach jedem Schritt committen + pushen, Dashboard aktualisieren.

## 4. Die Prompts (Rangfolge)
1. **Erweiterung „Continuous Improvement“** (`docs/prompts/knowtoon-erweiterung-verbesserung.md`). Sie geht bei
   Widerspruch vor und umfasst:
   - Schwächen-Tabelle zum Vorgängervideo und 5 Hooks; die Hook-Frage muss nach ≤ 2 s gestellt sein.
   - Spalte „why this scene follows“ mit höchstens 8 Wörtern.
   - Shots ≤ 4 s plus ein Halt von ≤ 6 s am Höhepunkt; Ø-Shotlänge ≥ 20 % kürzer als beim Vorgängervideo.
   - Untertitel als 2–5-Wort-Phrasen, die allein gelesen die Geschichte erzählen.
   - Höhepunkt bei 70–80 %, aufgebaut über Stakes → Hoffnung → Wendung.
   - Schlussbild im ersten Drittel gepflanzt, in der Mitte wiederholt und am Ende umgedeutet.
   - Scorecard (alle Punkte ≥ 9) und Handover.
2. **Basis-Prompt KnowToon-Videopaket** (`docs/prompts/knowtoon-videopaket.md`) mit STEP 1–6 plus STEP 4b (Stimme):
   - 3D-Klotzfiguren (eigene, originale), Shotwechsel alle 2–4 s.
   - Sätze ≤ 12 Wörter, ein Akzent je Satz, Pause vor jeder Enthüllung.
   - Emotion je Abschnitt: setup → tension → twist → ending.
   - End-Card „KnowToon“.
   - Vorbild-Video: „In This City, You Pay With Time“ (Nutzer: „Ab jetzt alle Videos so wie das“).
3. **Hausregeln** `docs/clip-regeln.md` und der Skill `.claude/skills/clip-video/SKILL.md`. Sie gelten, wo die
   Prompts nichts sagen.

## 5. Gültige Nutzer-Vorgaben (mit Datum)
| Bereich | Vorgabe | Quelle im Repo |
| --- | --- | --- |
| Qualität | Mindestnote **9/10** in jeder Prüfrolle (Fakten, Drehbuch/Retention, Regie, Design, Endkontrolle), Noten in jeder Freigabe nennen (13.11.) | `CLAUDE.md` |
| Sprache | immer Englisch (13.11.) | `CLAUDE.md` |
| Stimme | Standard **Michael (`am_michael`)**, Chatterbox (13.11.) | `clip-regeln.md` „Laune des Erzählers“ |
| Sprechart | bei **jedem** Clip automatisch passend zum Thema: `voicePreset` + `narratorMood` + `delivery` je Szene; Dashboard-Standard „Automatisch“ (14.11.) | `clip-regeln.md` |
| Klang der Stimme | wie ein Synchronsprecher, echte Pausen (Satz 450–800 ms, Komma 150–250 ms), Satzende leiser, kein Durchrattern (12.11.) | `clip-regeln.md` „Stimme“ |
| Hören | Audio nur mit **earshot** beurteilen, Messwerte nennen (12.11.) | `.claude/skills/earshot/` |
| Musik | je Thema neu, selbst gemacht, trend-orientiert, gern Rap/R&B, angenehm, nie fremde Melodien (12.11.) | `clip-regeln.md` „Musik je Thema“ |
| Stil | 3D-Klotzfiguren nach KnowToon-Standard; Figuren immer original, nie Marken-/Spiel-/Filmfiguren | `knowtoon-videopaket.md` |
| Untertitel | gelb mit schwarzem Rand; laut Erweiterung als 2–5-Wort-Phrasen | Erweiterungs-Prompt |
| Thumbnail | die ersten 0,5 s sind ein gestaltetes Cover (12.11.) | `clip-regeln.md` |
| Echte Bilder | **aufgehoben 14.11.** („Lass es mit den echten Bildern. Das frisst Zeit“): keine echten Fotos/Videos mehr | `clip-regeln.md`, `CLAUDE.md` |
| Urheberrecht | nie geschützte Spiel-/Film-/Markenbilder (z. B. GTA) | `clip-regeln.md` |
| Veröffentlichen | Titel, Caption und Hashtags immer im Dashboard (13.11.) | `dashboard-ablauf.md` §6 |
| Inspiration | ist ein Angebot, keine Vorgabe; Unpassendes ignorieren (11.11.) | `dashboard-ablauf.md` |

## 6. Agenten-Team (Ersteller → Prüfer)
Rollen-Dateien liegen in `docs/agenten/`; jede hat einen Lern-Kreislauf: vorher lesen, ein Experiment, nachher eintragen.
- Recherche → **Faktenprüfer**
- Drehbuch → **Retention-Kritiker + Faktenprüfer**
- Stimme
- Art Direction → **Design-Kritiker**
- Szenen/Animation → **Regie-Kritiker**
- Render/Endkontrolle
- Veröffentlichung
- Trend-Scout
- Werkzeugbau
- Wissensverwalter

Regeln dafür:
- Modellwahl: haiku für leichte, sonnet für Standard-, opus für schwere Aufgaben; bei einer Note < 7 arbeitet das nächstgrößere Modell nach
  (`docs/agenten/README.md`).
- Ein Prüfer arbeitet nur lesend; nach höchstens 2 Runden entscheidet der Orchestrator. Nur der Orchestrator committet.
- Nur ein Render gleichzeitig (4 CPU-Kerne).

## 7. Stand der Arbeit
- **Fertig** (laut Dashboard `done`; Sonnensystem laut Repo, nicht im Dashboard; Rolls-Royce hat ein Drehbuch, ist aber nicht als fertig markiert):
  - Sonnensystem, Römisches Reich, Erde ohne Menschen, Mike Tyson, UFC, Jensen Huang
  - Lucia GTA 6, Jason GTA 6
  - „In This City, You Pay With Time“ (zeit-welt, KnowToon-Vorbild)
- **In Arbeit:** „Something Under the Site Knocked Back“ (Bauarbeiter, Horror), Paket v2.1. Fakten 9, Retention 9;
  **Freigabe 1 wartet auf dich.** Die Eckdaten:

  | Merkmal | Wert |
  | --- | --- |
  | Umfang | 191 Wörter, ≈ 77 s, 17 Szenen |
  | Schnitt | Ø-Shot 2,32 s |
  | Höhepunkt | bei 78 % |
  | Stimme | Michael, Sprechart „spannend“, Laune „angespannt-flüsternd“ |

- **Warteschlange** (19 Themen im Dashboard), z. B.:
  - Der letzte Zug
  - Leuchtturmwärter
  - Wachmann 3:07 Uhr
  - Stadtsirene
  - Aufzug Stockwerk 13
  - Pizzabote
  - Überwachungskamera
  - mehrere „Wissen“-Themen
- **Offene Technik für Bauarbeiter:**
  - Der Renderer kann die Phrasen-Untertitel (`captionStyle: phrase-yellow`) und die `onScreen`-Texte noch nicht darstellen.
  - Klopf-Geräusche (`soundBed.knocks`) sind noch nicht eingebaut.
  - Das Musik-Preset „dark“ (66 BPM) ist noch nicht mit earshot geprüft.

## 8. Überschneidungen/Widersprüche, die ein neuer Prompt klären sollte
Hier entscheide ich bisher nach der Rangfolge aus Abschnitt 4 oder nach dem neueren Datum.
1. **Länge:**
   - Basis-Prompt: 90–140 s.
   - Hausregel: mindestens 62 s, ohne Wunsch 62–70 s.
   - Dashboard-Feld `lengthSec`: z. B. 65.
   - Bauarbeiter: 77 s, weil Wunsch und Mindestlänge vorgingen.
   - Eine eindeutige Regel fehlt.
2. **Sprechtempo:**
   - Hausregel: 2,3–2,6 W/s („ruhiger“, 12.11.).
   - STEP 4b: 2,5–2,75 W/s.
   - Für KnowToon-Videos gilt bisher 4b.
3. **Schnitt:**
   - Hausregel: Einstellungen eher 3–4 s, sanft.
   - Basis-Prompt: 2–4 s.
   - Erweiterung: ≤ 4 s plus ein Halt ≤ 6 s, Ø −20 %.
   - Gültig ist die Erweiterung.
4. **Untertitel:**
   - Basis-Prompt und `CLAUDE.md`: Wort für Wort.
   - Erweiterung: 2–5-Wort-Phrasen.
   - Gültig ist die Erweiterung.
5. **Stil:**
   - Ältere Regel (11.11.): Stil je Thema frei (3D, 2D oder Mischung).
   - KnowToon-Standard (14.11.): 3D-Klotzfiguren.
   - Gültig ist KnowToon.
6. **Sprechstil-Feld:** Das Dashboard-Dokument trägt teils noch `voicePreset: "lebendig"`. Die Regel lautet: automatisch je
   Thema überschreiben.
7. **Echte Bilder:** Seit 14.11. aufgehoben. Ältere Einträge in den Rollen-Dateien erwähnen sie noch, stehen aber nur als Verlauf da.

## 9. Was ein neuer Prompt angeben sollte, damit nichts durcheinanderkommt
- Ob er **ersetzt**, **ergänzt** oder bei Widerspruch **vorgeht** (bisher: Erweiterung > Basis > Hausregeln).
- Für welche Videos er gilt (ab welchem Video, alle oder nur bestimmte Themen-Arten).
- Klare Zahlen für Länge, Tempo (W/s), Shotlänge und Untertitel-Art; siehe Abschnitt 8.
- Ob die Freigabe-Stationen (Abschnitt 2) gleich bleiben.
- Ob die Ausgabe (Paket-Aufbau, Scorecard, Handover) gleich bleibt oder sich ändert.

Ich lege einen neuen Prompt unter `docs/prompts/` ab, gleiche ihn mit diesen Punkten ab und trage Konflikte samt
Entscheidung im Umsetzungsabschnitt ein, so wie bei den beiden bisherigen Prompts.
