# Playbook: ein Video zu jedem Thema – schnell und gut

Gepflegt vom Wissensverwalter ([`agenten/wissensverwalter.md`](agenten/wissensverwalter.md)).
Verbindlich bleiben [`clip-regeln.md`](clip-regeln.md) (Regeln), [`design-system.md`](design-system.md)
(Look) und der Skill `.claude/skills/clip-video/SKILL.md` (Befehle). Dieses Playbook bündelt nur, **was
wann zu tun ist**, und überträgt das Gelernte aus unseren zwei Videos auf andere Themen-Arten.

**Kennzeichnung:** **[belegt]** = in einem unserer Videos gemessen oder geprüft, mit Fundstelle.
**[Empfehlung]** = übertragene Idee, für dieses Thema noch nicht erprobt – im ersten Video dieser
Themen-Art als Experiment behandeln und das Ergebnis hier nachtragen.
Bisherige Videos: **Sonnensystem** (`episodes/solar-system.json`, 284 Wörter, 87,2 s) und
**Römisches Reich** (`episodes/roman-empire.json`, 319 Wörter, 90,0 s; Dauer aus
`public/episodes/<id>/timeline.json` `durationMs`).

## A. Ablauf-Checkliste (jedes Thema)

| # | Schritt | Rolle (Datei lesen!) | Ergebnis | Fertig, wenn … |
| --- | --- | --- | --- | --- |
| 0 | Thema in eine **Themen-Art** (Abschnitt C) einordnen, Hook-Muster und Erzähl-Klammer wählen | Orchestrator | Notiz im Drehbuch-Feld `note` | Zentrale Frage in einem Satz formuliert |
| 1 | Recherche: Primärquellen, wörtliche Zitate + URL, Mythen markieren, 2 „Wow“-Zahlen fürs Bild | [Recherche](agenten/recherche.md) | `docs/quellen-<thema>.md` | jede Aussage mit Zitat, Quellen-Art (primär/sekundär/tertiär) vermerkt |
| 2 | Zitate gegenprüfen, Freigabeliste | [Faktenprüfer](agenten/faktenpruefer.md) | Faktencheck-Datei | nur Bestätigtes in der Freigabeliste |
| 3 | Drehbuch: Hook ≤ 2 s, Du-Perspektive, Kausalkette, Eskalation, Wendepunkt, Loop; HUD + Auswahlkarte | [Drehbuch](agenten/drehbuch.md) | `episodes/<thema>.json` | Story-Prüfung aus `clip-regeln.md` bestanden |
| 4 | Retention-Review (erst 3 s, dann Loop, dann Mitte) + Fakten-Review des Textes | [Retention-Kritiker](agenten/retention-kritiker.md), Faktenprüfer | Review-Datei | Top-5 eingearbeitet, Text freigegeben |
| 5 | **Freigabe 1** (Drehbuch + Quellen) im Dashboard | Orchestrator | `review.kind = "script"` | Nutzer: OK |
| 6 | Stimme + Tempo: 2–3 Tempi aufnehmen, bestes nach W/s **und** Whisper-Treffern | [Stimme](agenten/stimme.md) | Tonspur, `metrics` | W/s im Zielbereich, Abgleich ≥ 98 % |
| 7 | Themen-Kit: Hauptfigur mit Erkennungsmerkmal, Kostüme, Kulisse, Palette, Stimmungen | [Art Direction](agenten/art-direction.md) → [Design-Kritiker](agenten/design-kritiker.md) | `src/episode/kit/<thema>.tsx`, Abschnitt in `design-system.md` | Standbild ohne Ton verrät das Thema |
| 8 | Szenen auf Beats, Schnitt etwa alle 2–3 s, Untertitel-Zone frei | [Szenen](agenten/szenen.md) → [Regie-Kritiker](agenten/regie-kritiker.md) | `src/episode/scenes/<thema>*.tsx` | Kontaktabzug ohne Anschnitt, `npm run lint` sauber |
| 9 | **Freigabe 2** (Kontaktabzug) | Orchestrator | `review.kind = "contactsheet"` | Nutzer: OK |
| 10 | Render, −14 LUFS, Endkontrolle | [Render/Endkontrolle](agenten/render-endkontrolle.md) | `out/<thema>.mp4` | ffprobe 1080×1920/30 fps, Kontaktabzug alle 3 s |
| 11 | Titel, Texte, Hashtags; Titel-Versprechen gegen Einlöse-Sekunde messen | [Veröffentlichung](agenten/veroeffentlichung.md) | Dashboard `publish` | jede Faktenaussage belegt |
| 12 | Lernen: Rollen-Dateien, Austausch-Brett, `verbesserungen.md`, dieses Playbook | alle, [Wissensverwalter](agenten/wissensverwalter.md) | Einträge | je Rolle ein Experiment gemessen |

Parallel möglich (eigene Dateien, keine Überschneidung): Schritt 7 schon ab Schritt 2 (Kostüme
und Orte stehen in der Freigabeliste); Schritt 6 sofort nach Freigabe 1, parallel zu 7/8.
Engpass ist der Render (nur einer gleichzeitig, ~40 Min für 87 s, `agenten-team.md`).

### Tempo-Abkürzungen [belegt]
- **Wortzahl planen = Skriptwörter** (so zählt die Messung in `stimme-casting.md`, Methode). Zahlen
  werden beim Sprechen länger (Rom: 311 Skript- → 355 Sprechwörter, `review-drehbuch-roemisches-reich.md`
  Länge) und Zahlen-Szenen sprechen langsamer (Rom hook–stones 3,0 W/s bei 1,25, `agenten/stimme.md`).
  Wenige Zahlen, Jahreszahlen in `years`.
- **Tempo-Faktor nicht linear** (Rom 1,33 → 99,8 s, 1,34 → 91,5 s, 1,36 → 88,4 s, `agenten/stimme.md`):
  immer mehrere Werte aufnehmen statt hochrechnen.
- **Schwierige Namen** vorab über die Kokoro-Phoneme prüfen und in `say` eintragen (Rom: Odoacer,
  Augustulus, Augustus, Honorius, `review-drehbuch-roemisches-reich.md` 4e).
- **Bot-gesperrte Quellen** gar nicht erst versuchen (Britannica, Met, British Museum:
  `quellen-roemisches-reich.md`, Quellenlage).

## B. Bausteine, die für jedes Thema gelten

| Baustein | Muster | Stand |
| --- | --- | --- |
| Hook | Absurde, sofort verständliche Aussage + Frage, die **bis zum Schluss** trägt (nicht nach 25 s beantwortet) | [belegt] Rom-Review: Hook 8/10, aber Frage „how long do you last?“ nach ~25 s erledigt → Respawn-Versprechen ergänzt (`review-drehbuch-roemisches-reich.md`, Hook) |
| Du-Perspektive | Zuschauer **ist** die Hauptfigur („You just bought …“) | [belegt] Rom: Szenen ohne „you“ (goths, vandals) waren die Schwachstelle (Roter Faden 6/10) |
| Erzähl-Klammer | Ein Spiel- oder Wett-Prinzip, das jede Station zur nächsten Stufe macht | [belegt] Rom: Respawn / Hard mode / Nightmare mode. Sonnensystem: Milos Wette – laut Selbstkritik „schwach genutzt“ (`clip-regeln.md`) |
| Laufendes Element | HUD: ein Zähler + ein Balken | [belegt] Rom: YEAR + EMPIRE (Review: „Jahreszähler ist der Fortschrittsmotor“). Grenze: höchstens 1 Zähler + 1 Balken (`schnittstelle.md`) |
| Schluss | Loop in den ersten Satz + Auswahlkarte A/B mit echter, offener Frage | [belegt] Rom: Loop 9/10, Wahl „476 oder 1453“ („Historians still argue“, belegt) |
| Legende vs. Fakt | „Legend says / One story says“ | [belegt] Rom (Prokop-Hahn), `agenten/drehbuch.md` |
| Mythos als Gag | falsches Klischee nur, wenn der Text es auflöst | Regel `clip-regeln.md` Themen-Treue 3; [belegt] Sonnensystem: „1.300 Erden“ vermieden (NASA: 1.000) |
| Hauptfigur | `Toonie` im Kostüm des Themas + **ein exklusives Erkennungsmerkmal** in Signalfarbe | [belegt] Rom: gelbes Halstuch, Gelb sonst nur an Dingen (`design-system.md` §6); Sonnensystem: oranger Anzug ohne Helm = Themen-Treue verfehlt |
| Farbwelt nach Story-Phase | gleiche Kulisse, anderes Licht = Fortschritt ohne Worte | [belegt] Rom `romeMood` glory/decline/fall (`design-system.md` §5.6) |
| Partei-Farben | eine Farbe je Gruppe, das ganze Video gleich | [belegt] Rom Rot/Purpur/Grün (`design-system.md` §2.4) |
| Gefahr | Licht (kaltes Karmin, gedimmte kühle Szene), nicht rote Objekte | [belegt] Rom (`design-system.md` §2.3, §5.5) |
| Titel | Versprechen des Titels in ≤ 1 s einlösen; Hook-Sticker ≤ 0,3 s | [belegt] Rom: Titel A löst bei 0,92 s ein, B erst bei 19,3 s (`agenten/veroeffentlichung.md`); ≤ 0,3 s ist [Empfehlung] |

## C. Je Themen-Art

Jede Zeile „Hook“ ist ein Muster, kein fertiger Text; konkrete Zahlen erst nach der Recherche.

### C1. Geschichte (Ereignisse, Reiche, Personen) – erprobt mit Rom
- **Hook (Du):** „You just became <Rolle> – <absurde Tatsache>.“ [belegt, Rom: „the Roman Empire got
  auctioned off … And you won it.“]
- **Erzähl-Klammer:** Respawn durch die Epochen, jede Stufe ein „Mode“ [belegt]. Alternative: „Your job
  gets worse every year“ / Lebensbalken des Reichs [belegt als HUD-Balken].
- **Hauptfigur:** Rolle der Epoche (Kaiser, Pharao, Wikinger) mit einem Merkmal in Signalfarbe, das
  keine andere Figur trägt [belegt, Rom]. Kopf-Silhouette je Gruppe unterscheiden (Helm, Kranz, Kappe)
  [belegt, `design-system.md` §4.1].
- **Kulisse/Farbwelt:** ein Wahrzeichen monumental hinten (Rom: Kolosseum `scale` 2,4–3) [belegt];
  Phasen-Licht Blüte → Krise → Fall [belegt]. Ägypten Sand/Gold/Türkis, Wikinger Blau/Grau/Holz
  [Regel `clip-regeln.md`, noch nicht gebaut].
- **Quellen:** antike Texte in Übersetzung auf Thayer/LacusCurtius (penelope.uchicago.edu) und Project
  Gutenberg (Klartext `cache/epub/<ID>/pg<ID>.txt`) [belegt: 36 der Link-Vorkommen in `quellen-roemisches-reich.md` (Gutenberg 20, Thayer 16)]; World History
  Encyclopedia nur ergänzend [belegt, zeitweise gesperrt]; Museen mit offener Seite für Kleidung
  [Empfehlung – Met/British Museum waren gesperrt].
- **Fallen:** Hörnerhelme, Fell-„Steinzeit“-Barbaren [belegt, `quellen-roemisches-reich.md` Bildhinweise];
  Herrschaftsbeginn vs. Absetzung (475/476) [belegt, Faktenprüfer]; Zahlen nur aus Zusammenfassung
  übernehmen (Gibbon „six princes“) [belegt, Recherche]; unbelegte Kostümdetails (Querbusch) nur als Stil,
  nie im Sprechtext [belegt]; Kausal-Wörter „so/because“ erzeugen neue Behauptungen [belegt].

### C2. Natur / Tiere
- **Hook (Du):** „You're a <Tier> and <unglaubliche Fähigkeit/Gefahr>.“ [Empfehlung, übertragen von
  Rom-Du-Perspektive]
- **Erzähl-Klammer:** Überlebens-Spiel: Level = Lebensphase oder Jahreszeit, HUD „ENERGY“-Balken +
  Tag-Zähler [Empfehlung, übertragen vom Rom-HUD].
- **Hauptfigur:** `Toonie` im Tier-Kostüm (Ohren/Schwanz/Muster als `head`/`body`-Steckplatz) mit einem
  Merkmal in Signalfarbe; Fressfeinde als Partei-Farbe [Empfehlung].
- **Kulisse/Farbwelt:** ein Lebensraum, Tageszeit/Jahreszeit als Phasen-Licht [Empfehlung, übertragen
  von `romeMood`].
- **Quellen:** Fachseiten von Naturkundemuseen und Zoos mit offener Seite, Behörden (z. B. US Fish &
  Wildlife, NOAA), Fachartikel mit DOI [Empfehlung – noch nicht auf Erreichbarkeit geprüft].
- **Fallen:** verbreitete Tier-Mythen (Gedächtnis, „gefährlichstes Tier“-Ranglisten) nur mit Quelle
  [Empfehlung]; Vermenschlichung nicht als Fakt behaupten (Regel Fakt/Legende/Pointe trennen, belegt
  beim Faktenprüfer).

### C3. Weltraum – erprobt mit dem Sonnensystem
- **Hook (Du):** paradoxe Tatsache mit Ziffer: „On Venus, a day is longer than a year.“ [belegt,
  NASA-Zitat in `quellen-sonnensystem.md`] – besser mit „you“: „You'd have a birthday before your
  first sunset.“ [Empfehlung, Wortlaut gegen Quelle prüfen]
- **Erzähl-Klammer:** Reise mit Ziel und Einsatz (Treibstoff-/Sauerstoff-Balken, Entfernungs-Zähler)
  statt Planeten-Liste [Empfehlung; belegt ist nur der Fehler: „Struktur eher Liste (9 Planeten à
  5–7 s)“, `clip-regeln.md` Selbstkritik].
- **Hauptfigur:** Astronaut im **weißen Raumanzug mit Helm** + ein Signalfarben-Merkmal [Regel
  `clip-regeln.md` Themen-Treue 1; belegt als Fehler: oranger Anzug mit Antenne].
- **Kulisse/Farbwelt:** dunkles All, Planeten als Lichtquellen; Bahnen und Gruppen **vertikal**
  anordnen [belegt, Fallstrick Hochformat in `clip-regeln.md`].
- **Quellen:** science.nasa.gov-Faktenseiten [belegt, alle Sonnensystem-Fakten]; ESA, JPL
  [Empfehlung].
- **Fallen:** veraltete Zahlen („1.300 Erden“, „465 °C“) weichen von der aktuellen NASA-Seite ab
  [belegt]; Größen-/Abstandsverhältnisse im Bild sind schematisch, nie maßstäblich behaupten
  [Empfehlung, übertragen von der schematischen `EmpireMap`].

### C4. Technik / Erfindungen
- **Hook (Du):** „You invented <Ding> – and <unerwartete Folge>.“ oder „You have 1 try to <Aufgabe>.“
  [Empfehlung]
- **Erzähl-Klammer:** Versuch-und-Irrtum als Spiel: „Attempt 1 … Attempt 2“ mit Zähler, jeder
  Fehlschlag größer [Empfehlung, übertragen von Respawn/Eskalation].
- **Hauptfigur:** Erfinder mit Werkzeug/Brille in Signalfarbe [Empfehlung].
- **Kulisse/Farbwelt:** Werkstatt; Info-Einschub als Querschnitt im Toon-Stil auf dunklem
  Studio-Grund `#2A1A12` [belegt als Baustein-Regel `design-system.md` §5.4/§7; Querschnitt-Idee aus
  `referenz-analyse-2.md` Punkt 4].
- **Quellen:** Patentschriften (Patentämter), Original-Veröffentlichungen, Herstellerdokumente,
  Technikmuseen [Empfehlung].
- **Fallen:** „Erfinder“-Legenden (Einzelgenie statt mehrerer paralleler Entwicklungen),
  Jahreszahl Patent vs. erste Vorführung [Empfehlung, übertragen von „Herrschaftsbeginn vs. Absetzung“].

### C5. Körper / Medizin
- **Hook (Du):** „Right now, your body is <unglaubliche Zahl/Vorgang>.“ [Empfehlung]
- **Erzähl-Klammer:** Mission durch den eigenen Körper (Zelle/Blutkörperchen als Hauptfigur),
  HUD-Balken „IMMUNE“ oder Zeit-Zähler [Empfehlung].
- **Hauptfigur:** `Toonie` als Zelle/Blutkörperchen mit Signalfarben-Merkmal; Erreger als
  Partei-Farbe [Empfehlung].
- **Kulisse/Farbwelt:** warme Innenwelt, Gefahr wie in Rom über **Licht** statt nur rote Objekte (Blut
  ist schon rot – gleiche Doppelbelegung wie Legionsrot) [Empfehlung, übertragen von
  `design-system.md` §2.3].
- **Quellen:** Behörden und Fachgesellschaften (NIH/NCBI, WHO, CDC), Lehrbücher auf NCBI Bookshelf
  [Empfehlung].
- **Fallen:** keine Gesundheitsratschläge; Durchschnittswerte („10 % des Gehirns“, „8 Gläser Wasser“)
  sind typische Mythen – nur mit Quelle oder als aufgelöster Gag [Empfehlung, Mythos-Regel aus
  `clip-regeln.md`].

### C6. Alltag / Psychologie
- **Hook (Du):** „You do this every day – and it's <überraschender Grund>.“ [Empfehlung]. Die
  Referenz „They painted the jail cell pink …“ ist genau dieses Muster (Rätsel bis zum Schluss)
  [belegt als Referenz in `clip-regeln.md` Story 1; nicht von uns produziert].
- **Erzähl-Klammer:** Experiment mit Entscheidung: Auswahlkarten „What would you do?“ an jeder Stufe,
  Schluss „Comment A or B“ [belegt als Overlay, Wirkung beim Publikum noch nicht gemessen].
- **Hauptfigur:** Alltagsfigur mit einem Merkmal (Mütze/Hoodie in Signalfarbe wie R2/R3) [belegt in den
  Referenzen, `referenz-analyse-2.md` Punkt 7].
- **Kulisse/Farbwelt:** eine Wohnung/ein Ort, Stimmung über Licht (warm vs. kühl) [Empfehlung].
- **Quellen:** Original-Studien (Zeitschrift, DOI), Replikationsprojekte, Übersichtsarbeiten
  [Empfehlung].
- **Fallen:** nicht replizierte Studien als Gesetz verkaufen; „Studien zeigen“ ohne Studie; ob die Pink-Zelle
  der Referenz wirkt, haben wir nicht geprüft – Ich kann das nicht bestätigen; vor Verwendung recherchieren.

## D. Wo steht was (eine Quelle je Wert – nicht doppelt pflegen)
| Wert | Maßgeblich | Kopien (nur verweisen) |
| --- | --- | --- |
| Story-, Bild-, Sprachregeln, Ziel-Sprechtempo, Schnittfrequenz | `clip-regeln.md` | SKILL.md, `agenten-team.md`, Rollen-Messlatten |
| Stimmenliste und Standard-ID | `scripts/voices.json` | `clip-regeln.md`, SKILL.md, `schnittstelle.md` |
| Stimmen-Messwerte (W/s, F0, R3) | `stimme-casting.md` | `agenten/stimme.md` |
| Farben, Kontrast, Licht, Kostüme | `design-system.md` | `dashboard-ablauf.md` Abschnitt Stil |
| Overlay-Felder, Safe-Areas, Untertitel-Lage | `schnittstelle.md` + Code (`Captions.tsx`, `Hud.tsx`) | `design-system.md` §4.6 |
| Dashboard-Felder und Zeitplan | `dashboard-ablauf.md`, `dashboard/README.md` | – |

## E. Pflege
Nach jedem Video: Zeilen mit **[Empfehlung]**, die erprobt wurden, auf **[belegt]** mit Fundstelle
umstellen oder streichen (mit Vermerk in `agenten/wissensverwalter.md` unter „Gelernt“).
