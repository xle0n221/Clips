# Clips Studio – Dashboard

Steuerseite für die Erklärvideo-Produktion: Themen eintragen, Fortschritt verfolgen,
Drehbücher / Kontaktabzüge mit **OK** / **Nicht OK** + Feedback freigeben.

- **Live-Seite (privat):** https://claude.ai/artifact/5hB3B36zzQuaX5e78LEr8H
- **Quelle:** `dashboard/index.html` (wird so, wie sie ist, per Artifact-Tool veröffentlicht)
- **Capabilities:** `db` (gemeinsame Datenbank), `user` (Schreibrecht prüfen), `assets` (Bilder/Videos für Kontaktabzug und Vorschau), `artifact` (Seite speichert bei jeder Aktion eine neue Version → weckt beobachtende Sitzungen, siehe unten), `mcp` (Connector „Claude Code Remote“, nur `fire_trigger` für „Jetzt starten“), `sample` (Themen-Ideen)

Erneut veröffentlichen aus einer anderen Sitzung: Artifact-Tool, `action: "read"` mit obiger URL,
dann `publish` mit `url` = obige URL und `file_path` = `dashboard/index.html`.
Ohne `url` entsteht eine **neue** Seite mit leerer Datenbank. Immer vorher lesen: Die Seite erzeugt selbst
Versionen (Datei `last-action.json`), ein Publish ohne vorheriges Lesen wird abgelehnt.

## Datenmodell

Collection `videos`, ein Dokument pro Video, `doc_id` = kurzer Slug (z. B. `haie`).
Die Seite erzeugt den Slug aus dem Thema (Umlaute → ae/oe/ue/ss, max. 40 Zeichen, bei Kollision `-2`, `-3` …).

| Feld | Typ | Wer schreibt | Bedeutung |
|---|---|---|---|
| `topic` | string | Seite (beim Anlegen) | Thema |
| `lengthSec` | number \| null | Seite | Wunschlänge in Sekunden |
| `note` | string | Seite | freie Notiz des Nutzers |
| `stage` | `"queued"` \| `"research"` \| `"script"` \| `"scenes"` \| `"render"` \| `"done"` \| `"error"` | Seite: nur `queued` beim Anlegen; danach die bearbeitende Sitzung | Arbeitsschritt |
| `statusText` | string | Sitzung | kurzer Klartext, was gerade passiert / Fehlertext bei `error` |
| `review` | null \| `{ kind: "script" \| "audio" \| "contactsheet", title, text?, imageUrl?, mediaUrl?, sources? }` | Sitzung | Prüfinhalt, solange eine Freigabe gebraucht wird; `sources` = Liste `{ claim, quote, url }` |
| `decision` | null \| `{ value: "ok" \| "not_ok", feedback, at }` | **nur die Seite / der Nutzer** | Entscheidung zum aktuellen `review`; `at` = ISO-Zeit |
| `branch` | string \| null | Sitzung | Git-Branch des Videos (Link auf github.com/xle0n221/clips) |
| `sessionId` | string \| null | Sitzung | ID der bearbeitenden Cloud-Sitzung |
| `updatedAt` | ISO-String | beide | letzte Änderung |
| `previewUrl` | string \| null (optional) | Sitzung | verkleinerte Vorschau bei `done` (Bild oder Video), siehe Assets; nur kleine Dateien |
| `voice` | string (optional) | Seite (beim Anlegen) | Sprecherstimme (Kokoro). Auf der Seite mit Namen angezeigt: `af_heart` = „Lily – Frau“, `af_bella` = „Bella – Frau“, `am_fenrir` = „Finn – Mann (Standard, seit 09.11.2026 mit Chatterbox)“, `am_puck` = „Max – Mann“. Die Namen sind frei vergeben, nur für die Bedienung |
| `voicePreset` (früher `voiceStyle`) | `"lebendig"` \| `"spannend"` \| `"witzig"` \| `"ruhig"` (optional) | Seite (beim Anlegen) | Sprechstil des Videos → Drehbuch-Feld `voicePreset` (`scripts/voice_fx.py`, Regeln in `docs/clip-regeln.md`, Abschnitt „Stimme“). Fehlt es: `lebendig` |
| `inspiration` | Liste `{ id, name, type }` (optional) | Seite / Nutzer | Vom Nutzer hochgeladene Inspirations-Dateien (Bilder, kurze Videos, PDFs) als Assets der Seite. Angezeigt unter `/_blob/<id>`. Hochladen beim Anlegen oder später auf Karten in den Stufen `queued`, `research`, `script` |
| `metrics` | null \| `{ durationSec?, words?, wordsPerSec?, whisperMatch?, voice? }` (optional) | Sitzung | Kennzahlen; `whisperMatch` als Text `"283/284"` (Aussprache-Gegenprobe). `wordsPerSec` unter 2,6 oder über 3,6 und ungleiche Whisper-Zahlen werden orange markiert |
| `renderProgress` | number 0..1 (optional) | Sitzung | Balken bei `stage: "render"` |
| `renderEta` | string (optional) | Sitzung | z. B. `"noch ca. 23 Min."` |
| `actionNeeded` | string \| null (optional) | Sitzung | auffälliges rotes Banner, z. B. `"Freigabe in der Claude-App nötig (Netzwerk)"`; Karte wird oben einsortiert |
| `fileSizeBytes` | number (optional) | Sitzung | Dateigröße auf der Fertig-Karte |
| `busy` | boolean (optional) | Sitzung | `true`, solange eine Sitzung am Video arbeitet (Sperre für den Abholer); bei Freigabe, Fertig oder Fehler `false` |
| `resume` | true \| null (optional) | Seite / Nutzer | Knopf „Erneut versuchen“ (bei `error`) bzw. „Erledigt – weitermachen“ (bei `actionNeeded`): der nächste Durchlauf setzt das Video fort; die Sitzung setzt es beim Übernehmen auf `null` |
| `priority` | true \| null (optional) | Seite / Nutzer | Knopf „Als Nächstes“ auf wartenden Karten: wird vor älteren Themen übernommen |
| `publish` | null \| `{ youtube?: { title, description, hashtags[] }, tiktok?: { caption, hashtags[] }, note? }` (optional) | Sitzung | Texte zum Veröffentlichen; aufklappbarer Bereich „Veröffentlichen“ mit Kopier-Knöpfen (bei `done` offen). Hashtags mit oder ohne `#` |

Zusätzliche optionale Felder in `review`:
- `review.corrections`: Liste `{ claim, note }` – Aussagen, die von gängigen Angaben abweichen; immer sichtbar hervorgehoben
  (Beispiel: `{ claim: "1.300 Erden passen in Jupiter", note: "NASA: rund 1.000" }`).
- `review.scenes`: Liste `{ id, label }` – erzeugt ein Auswahlfeld „Betrifft Szene“; die Auswahl landet in `decision.scene` (Szenen-`id` oder `null` = ganzes Video).

**Zwei Freigabe-Stufen** über `review.kind`: Stufe 1 = `"script"` (Drehbuch + Quellen), Stufe 2 = `"contactsheet"`
(Kontaktabzug, z. B. 3 Bilder pro Szene) **vor** dem finalen Render.

Die Ziel-Werte 2,6–3,0 Wörter/s (seit 09.11.2026, docs/clip-regeln.md) und die Stimmenliste stammen aus der Video-Produktions-Sitzung
(Vorgabe der Orchestrator-Sitzung, hier nicht unabhängig nachgeprüft).

Neue Themen von der Seite: `stage: "queued"`, `review: null`, `decision: null`, `branch: null`, `sessionId: null`.

### Werkzeuge auf der Seite (ab Version 9)
- **Jetzt starten:** löst die geplante Aufgabe „Clips Dashboard-Abholer“ (`trig_01GPmrJycLUKEASvHqbaG4hz`) sofort aus,
  über den Connector „Claude Code Remote“ (`mcp`-Capability, Werkzeug `fire_trigger`, als der Betrachter). Sichtbar nur, wenn Arbeit
  wartet und der Connector das Werkzeug anbietet; danach 10 Min. gesperrt (gegen Doppelstarts; die Sperre `busy` schützt zusätzlich).
- **Themen-Ideen:** `sample`-Capability (fragt Claude auf dem Konto des Betrachters, verbraucht dessen Nutzung); 5 Vorschläge mit
  englischem Hook, Antippen übernimmt Thema + Hook als Notiz. Vorschläge sind ungeprüft.
- **Länge:** Knöpfe 30/60/90 s und Wortzahl-Rechner (2,6–3,0 Wörter/s).
- **Doppelte Themen:** Hinweis, wenn ein ähnliches Thema schon existiert.
- **Filter** (ab 4 Videos): Alle / Zu erledigen / In Arbeit / Wartend / Fertig; Auswahl wird im Browser gemerkt.
- **Hänger:** `busy` und seit über 3 Std. keine Änderung → Hinweis auf der Karte.
- **Erneut versuchen / Erledigt – weitermachen / Als Nächstes:** setzen `resume` bzw. `priority`.
- **Nächster Durchlauf:** aus dem Zeitplan berechnet (jeweils :17 Uhr, 7–23 Uhr deutscher Zeit); geplante Läufe können sich verzögern.

### Anzeige-Logik der Seite
- **Freigabe nötig** (orange Rahmen, oben einsortiert): `review` gesetzt, `decision` null, `stage` ≠ `done`.
- **Aktion nötig**: `actionNeeded` nicht leer → rotes Banner, ebenfalls oben.
- Nach dem Klick: Karte zeigt „Entscheidung gespeichert – wartet auf Claude“; der Nutzer kann sie zurücknehmen (setzt `decision` wieder auf `null`).
- „Nicht OK“ verlangt einen Feedback-Text.
- `queued`-Karten lassen sich (zweistufig) entfernen.
- Sortierung: Freigabe → Fehler → in Arbeit → wartend → fertig; innerhalb nach `updatedAt` absteigend.

### Ablauf für eine bearbeitende Sitzung
Verbindlich ist `docs/dashboard-ablauf.md` (Auswahl, Sperre über `busy`, Felder je Schritt, Stil). Kurzfassung:
1. `ArtifactData list videos` → ein Dokument mit `stage: "queued"` wählen.
2. Übernehmen: `update` mit `if_version`, `stage: "research"`, `sessionId`, `branch`, `statusText`, `updatedAt`.
   `if_version` verhindert, dass zwei Sitzungen dasselbe Thema übernehmen (zweiter Schreibversuch scheitert).
3. Zur Freigabe: `update` mit `review: {…}`, `decision: null`, `statusText`, `updatedAt`.
4. Antwort abholen: Dokument lesen; ist `decision` gesetzt → umsetzen, danach `review: null`, `decision: null` und nächster `stage`.
5. Fertig: `stage: "done"`, `review: null`, optional `previewUrl`.

### Veröffentlichen: Titel, Texte, Hashtags (Regeln für die Sitzung)
Recherche-Stand 2026-11-08, per Websuche (die Seiten selbst sind aus dieser Umgebung gesperrt, daher Wiedergabe laut Suchergebnis).

**Belegt (offizielle Quellen):**
- YouTube: Über 60 Hashtags ignoriert YouTube alle Hashtags des Videos; irrelevante oder zu viele Hashtags können zur Entfernung führen.
  Bis zu 3 Hashtags aus der Beschreibung zeigt YouTube über dem Titel (welche, entscheidet YouTube).
  Quelle: YouTube-Hilfe „Find playlists & videos using hashtags“, https://support.google.com/youtube/answer/6390658
- YouTube Shorts: quadratisch oder hochkant, bis 3 Minuten (Uploads ab 15.10.2024). Quelle: https://support.google.com/youtube/answer/15424877
- TikTok Creator Academy: Mehr Hashtags verbessern das Ranking nicht; nur relevante Begriffe verwenden. Aktuelle Vorschläge liefert
  „Creator Search Insights“ in der TikTok-App. Quelle: https://www.tiktok.com/creator-academy/article/Getting-discovered-with-Search

**Berichtet, nicht offiziell bestätigt:**
- TikTok begrenzt seit etwa Juli/August 2025 auf 5 Hashtags pro Post (Hinweis in der App, keine offizielle Mitteilung).
  Quelle: https://searchengineland.com/tiktok-limits-hashtags-460894
- YouTube-Titel max. 100 Zeichen (übereinstimmend in Drittquellen); in Suche/Mobil sind ca. 60–70 sichtbar (Schätzung von Drittanbietern).
- TikTok-Caption: Angaben schwanken zwischen 2.200 und 4.000 Zeichen; das Dashboard warnt vorsichtshalber ab 2.200.

**„Welche Hashtags bringen die meiste Reichweite?“** Dafür gibt es keine belastbare, öffentliche Antwort:
- Eine Auswertung der TikTok-Research-API fand mehr Aufrufe bei Videos mit „viralen“ Hashtags, der Effekt nimmt aber in neueren Jahren ab
  (https://arxiv.org/pdf/2402.13855). Eine Studie fand höhere Viralität, wenn ein Hashtag *während* seines Trends genutzt wird
  (https://arxiv.org/pdf/2111.02452). Beides belegt keinen festen „besten“ Hashtag.
- Trend-Listen sind tagesaktuell und regional (z. B. Creator Search Insights / TikTok Creative Center) und aus dieser Umgebung nicht abrufbar.
- Allgemeine Tags wie #fyp: kein Beleg in offiziellen Quellen, weder dafür noch dagegen. Nicht verwenden, bis Daten vorliegen.

**Regel für die bearbeitende Sitzung** (folgt aus den belegten Punkten, eigene Ableitung):
- Texte auf Englisch (die Videos sind englisch).
- TikTok: höchstens 5 Hashtags. 1 breites Thema (z. B. `#science`, `#space`), 2–3 themenspezifische, die zur gesprochenen Aussage passen.
  Caption: der stärkste Fakt aus dem Video als Frage oder Aussage, kurz.
- YouTube Shorts: Titel unter 70 Zeichen mit dem Kern-Fakt vorne; Beschreibung 1–3 Sätze inkl. „Facts checked against …“ mit der Hauptquelle;
  3–5 Hashtags, die relevantesten zuerst; `#Shorts` optional (YouTube nennt ihn in seinem Shorts-Leitfaden als gängigen Hashtag).
- Keine Hashtags ohne Bezug zum Inhalt (YouTube-Richtlinie).
- In `publish.note` vermerken: „Hashtags vor dem Posten in Creator Search Insights / YouTube-Suche gegenprüfen“.

### Hashtag-Liste mit Reichweiten-Kennzahlen (automatisch, wöchentlich)
- Dokument `hashtags/current` (angezeigt als eingeklappter Bereich „Hashtags“ oben im Dashboard) und Verlauf `hashtags/snap-<YYYY-MM-DD>`.
- Struktur: `{ updatedAt, nextUpdate, method, tiktok: { combos: [{label, tags[]}], tags: [{tag, metric, source, url, change}] }, youtube: {…}, notes[] }`,
  `change` = `"up" | "down" | "same" | "new"` (Vergleich mit dem Vorwert derselben Quelle).
- Startstand 08.11.2026: `dashboard/hashtags-start-2026-11-08.json` (per Websuche; alle Zahlen von Drittanbieter-Trackern, mit Quelle).
- Automatisch: geplante Aufgabe „Clips Hashtag-Update“ (`trig_01QwibfNVjsxrTu5VBRJD1yF`), jeden Montag 20:41 Uhr (Europe/Berlin),
  startet jeweils eine neue Sitzung, recherchiert neu, vergleicht mit dem Vorstand und schreibt beide Dokumente. Push-Benachrichtigung an.
- Grenzen: TikTok und YouTube veröffentlichen keine offiziellen Hashtag-Zahlen. Für YouTube Shorts wurden keine Reichweiten-Zahlen gefunden.
  Die Tracker-Zahlen sind Richtwerte und untereinander nicht vergleichbar. Eigene Video-Statistiken sind nicht angebunden (kein Zugang zu
  YouTube Studio / TikTok Analytics in dieser Umgebung).
- Bearbeitende Sitzungen: für `publish` die passende `combo` aus `hashtags/current` nehmen und 1–2 Tags durch themenspezifische ersetzen.
- Testlauf 08.11.2026 (von Hand gestartet, Sitzung `cse_01UNp77NZJY8fRGs28tb4xtR`): erfolgreich. Die neue Sitzung konnte per ArtifactData
  schreiben; `current` und `snap-2026-11-08` standen danach auf Version 3 und waren inhaltlich gleich. Neu: #universe, #spacefacts (hashtagradar),
  #physics, #astronomy (best-hashtags.com, Werte aus Suchauszügen), #space-Gesamtaufrufe (TikTok-Tag-Seite). Kombis unverändert.
  Einschränkungen des Laufs: Tracker-Seiten waren nicht direkt abrufbar (Netzwerk-Sperre), Werte stammen aus Suchergebnis-Auszügen bzw. dem Vorlauf;
  der Lauf schrieb `updatedAt` 19:00Z (in der Zukunft), nachträglich auf 16:03Z (Sitzungsende) korrigiert (Version 4).
  Manche Tags erscheinen zweimal (je Quelle eine Zeile) – gewollt, da die Kennzahlen nicht vergleichbar sind.

### Hörproben der Stimmen
`dashboard/voices/voice-<stimme>.mp3`, mit der Seite unter `voices/…` veröffentlicht (Knopf „▶ Anhören“ neben der Stimmen-Auswahl).
Jede Stimme stellt sich auf Englisch vor (die Videos sind englisch): „Hi, I'm <Name>. I could be the voice of your next video.“
Erzeugt mit `scripts/tts.py` (Kokoro-82M, Geschwindigkeit 1.0), danach `ffmpeg -ac 1 -b:a 64k`. Länge je ca. 3 s, 24–27 KB.
Audio lässt sich nicht als Asset hochladen (Artifact-Tool nimmt dort kein mp3), daher als Seiten-Datei. Beim erneuten Veröffentlichen
bleiben nicht genannte Dateien erhalten.

### Inspirations-Dateien des Nutzers lesen
Eine bearbeitende Sitzung lädt eine Datei mit dem Artifact-Tool herunter: `action: "read"`, `url` = Seiten-URL, `path` = die `id` aus `inspiration`.
Die Datei landet lokal (Pfad steht im Ergebnis) und kann dann mit dem Read-Tool angesehen werden. Das ist nicht getestet, weil noch keine Datei hochgeladen wurde.

Stimmen-Namen laut Kokoro-Stimmenliste (VOICES.md, huggingface.co/hexgrad/Kokoro-82M): `a` = American English, `f` = weiblich, `m` = männlich.
Gesamtnoten dort: af_heart A, af_bella A-, am_fenrir C+, am_puck C+.
Seit 08.11.2026 sind die Hörproben mit `scripts/voice_fx.py` bearbeitet (wie die Videos). Hörvergleich vorher/nachher:
`voices/demo-{lily,finn}-{vorher,nachher}.mp3` (Bereich „Stimme: Hörvergleich“ auf der Seite).
Knopf „▶ Anhören“ spielt seit 09.11.2026 die gewählte Stimme **im gewählten Sprechstil**: `voices/style-<stil>-<stimme>.mp3`
(16 Dateien, Satz „Hi, I'm <Name>. Rome ruled the world for *five hundred years*. | Then, in a *single afternoon*, it was over.“,
Kokoro + `scripts/voice_fx.py` mit den Werten aus `STYLES`; Akzentwörter per Whisper „base“ getimt).

### Bilder (Kontaktabzug) und Vorschau
Die Seite darf **keine externen Bilder** laden (Content-Security-Policy der Artifact-Seiten). `imageUrl` / `previewUrl` müssen daher sein:
- eine Asset-URL dieser Seite: hochladen mit dem Artifact-Tool, `action: "publish"`, `url` = Seiten-URL,
  `asset: true`, `file_path` = lokale Datei (Limit laut Tool-Beschreibung: 15 MB pro Binärdatei).
  Die Antwort liefert die `url`, die genau so eingetragen wird (oder `/_blob/<id>`), **oder**
- ein kleines `data:image/…`-URI (zählt zur 256-KiB-Grenze pro Dokument).

## Geprüfte Punkte (Stand 2026-11-08)

Getestet mit dem `ArtifactData`-Tool in der erstellenden Sitzung:

| Test | Ergebnis |
|---|---|
| Beispiel-Dokument `videos/test-beispiel` mit `stage: "script"` + `review` schreiben | ok (Version 1) |
| Entscheidung schreiben wie die Seite (`update` mit `decision` + `updatedAt`) auf Stufe `interact` | ok (Version 2) |
| `decision` per `ArtifactData list` zurücklesen | ok, Feld vollständig vorhanden |
| Schreiben auf Stufe `view` (nur Betrachter) | abgelehnt, wie erwartet |
| Beispiel löschen, Collection danach leer | ok |
| Darstellung der Karten (Mobil 390 px hell, Desktop 900 px dunkel) | lokal mit nachgebauter `db`-Schnittstelle per Playwright geprüft; kein horizontales Scrollen |

**Nicht getestet:** ein echter Klick auf der Live-Seite in claude.ai (das kann diese Sitzung nicht bedienen)
und das Rendern der Live-Seite mit echten Datenbankdaten. Der Schreibweg der Seite ist derselbe `update`-Aufruf,
der oben über das Tool getestet wurde.

### Aufwecken per Selbst-Veröffentlichung (ab Version 2)
Nach jedem erfolgreichen Datenbank-Schreibvorgang (OK, Nicht OK, Zurücknehmen, Thema hinzufügen) ruft die Seite
`artifact.publish({ "last-action.json": … })` auf (Dateien-Form der Capability `artifact`). Inhalt: `{ action, id, at }`.
Das erzeugt eine neue Version der Seite. Laut Typdefinition läuft die klickende Ansicht dabei weiter, nur andere offene Ansichten laden neu.
Eine Sitzung, die die Seite per `ArtifactComments watch` beobachtet, sollte dadurch geweckt werden, denn ein Watch weckt
„when this artifact is republished elsewhere“. Schlägt das Speichern fehl (z. B. `capability_disabled` bei öffentlich geteilter Seite),
zeigt die Seite: „Damit Claude sofort reagiert: Kommentar mit @claude … senden oder in der Sitzung „weiter“ schreiben.“

Die Entscheidung selbst steht weiterhin nur in der Datenbank; `last-action.json` ist nur das Signal.
Eine geweckte Sitzung liest danach `videos` per `ArtifactData`.

**Weck-Test 1 – Veröffentlichung aus einer anderen Sitzung:** Die Orchestrator-Sitzung beobachtete die Seite seit 15:11:27 UTC
(laut ihrer Watch-Liste). Version 3 wurde aus dieser Sitzung gegen 15:15 UTC veröffentlicht. Bis 15:21:25 UTC kam dort **kein** Weck-Turn an.
Ob Veröffentlichungen aus einer anderen Sitzung desselben Nutzers grundsätzlich nicht wecken oder ob die Zustellung verzögert ist,
kann nicht bestätigt werden.

**Weck-Test 2 – Klick auf der Seite (Selbst-Veröffentlichung):** ausstehend; braucht einen Klick des Nutzers.
Erkennbar daran, dass die Datei `last-action.json` in der Dateiliste der Seite auftaucht (Stand Version 5: noch nicht vorhanden).

### (a) Weckt ein Klick auf OK eine beobachtende Claude-Sitzung? (Stand Version 1)
**Nein, nach den Angaben der Werkzeuge nicht.** Die Watch-Liste dieser Sitzung meldet für die Seite wörtlich:
„durable wake subscription (woken on publish and to-Claude comments; no live updates)“.
Laut Tool-Beschreibung (`ArtifactComments`) weckt ein Watch nur bei **neuer Version der Seite** oder bei einem
**Kommentar, der an Claude gesendet wird**; einfache Kommentare wecken ebenfalls nicht.
Datenbank-Änderungen sind dort nicht aufgeführt. Beobachtet: nach den Test-Schreibvorgängen kam kein Weck-Ereignis
(diese stammten allerdings aus derselben Sitzung, daher ist das allein kein Beweis).

Folgerung: Eine bearbeitende Sitzung muss die Entscheidung **selbst abholen**, z. B.
- mit `send_later` / einer geplanten Aufgabe sich selbst in Abständen wecken und das Dokument lesen, oder
- der Nutzer schreibt nach dem Klick kurz in die Sitzung („weiter“).

Seit Version 2 umgesetzt: Selbst-Veröffentlichung (siehe oben). Weiterhin nicht umgesetzt, nur als Möglichkeit laut Capability-Doku: Die Seite könnte über die `mcp`-Capability den
claude.ai-Connector „Claude Code Remote“ (`send_message` an `sessionId`) aufrufen und so die Sitzung direkt wecken.
Das ist **ungetestet**; Verfügbarkeit des Tools für den Betrachter ist laut Doku nicht garantiert.

### (b) Wie schreibt eine andere Sitzung desselben Nutzers in die Datenbank?
Über das `ArtifactData`-Tool mit der Artifact-URL (siehe oben) – es liest und schreibt „als der Nutzer“.
Es gibt keinen anderen Schlüssel als die URL; Collection `videos`, `doc_id` = Slug.
Schreibvorgänge auf bestehende Dokumente brauchen `if_version` (Version aus dem letzten Lesen).
Das Tool ist in Cloud-Sitzungen als „deferred tool“ vorhanden und muss per ToolSearch (`select:ArtifactData`) geladen werden.
**Nicht getestet:** der Zugriff aus einer zweiten, separaten Sitzung – nur aus der erstellenden Sitzung.

### Sofortstart nach Entscheidung (ab Version 13, 08.11.2026)
Weck-Test 2 ist entschieden: Der Klick auf „OK“ um 23:49:28 UTC erzeugte `last-action.json`, die beobachtende
Sitzung CLIPS wurde dadurch **nicht** geweckt (sie sah die Entscheidung erst beim manuellen Nachsehen).
Darum ruft die Seite jetzt nach jeder Entscheidung, jedem neuen Thema und jedem „weitermachen“ sofort
`fire_trigger` für die geplante Aufgabe `trig_013fFkYLstdCwVbtokfU68w5` (Abholer, feuert in die Sitzung CLIPS) auf –
über den Connector „Claude Code Remote“ als der Betrachter. Beim ersten Mal fragt claude.ai nach der Erlaubnis.
Läuft die Sitzung gerade, wartet die Nachricht bis zum Ende ihres aktuellen Arbeitsschritts.
Die Trigger-ID kommt aus `meta/pickup.triggerId` (`{ triggerId, sessionId, since }`, beim Sitzungswechsel neu geschrieben, docs/sitzungswechsel.md); fehlt sie, gilt die Konstante `PICKUP_TRIGGER`. Klappt der Aufruf nicht, bleibt der Abholer (alle 2 h um :17, gerade Stunden) als Rückfallweg.
