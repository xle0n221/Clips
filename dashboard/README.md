# Clips Studio – Dashboard

Steuerseite für die Erklärvideo-Produktion: Themen eintragen, Fortschritt verfolgen,
Drehbücher / Kontaktabzüge mit **OK** / **Nicht OK** + Feedback freigeben.

- **Live-Seite (privat):** https://claude.ai/artifact/5hB3B36zzQuaX5e78LEr8H
- **Quelle:** `dashboard/index.html` (wird so, wie sie ist, per Artifact-Tool veröffentlicht)
- **Capabilities:** `db` (gemeinsame Datenbank), `user` (Schreibrecht prüfen), `assets` (Bilder/Videos für Kontaktabzug und Vorschau), `artifact` (Seite speichert bei jeder Aktion eine neue Version → weckt beobachtende Sitzungen, siehe unten)

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
| `review` | null \| `{ kind: "script" \| "contactsheet", title, text?, imageUrl?, sources? }` | Sitzung | Prüfinhalt, solange eine Freigabe gebraucht wird; `sources` = Liste `{ claim, quote, url }` |
| `decision` | null \| `{ value: "ok" \| "not_ok", feedback, at }` | **nur die Seite / der Nutzer** | Entscheidung zum aktuellen `review`; `at` = ISO-Zeit |
| `branch` | string \| null | Sitzung | Git-Branch des Videos (Link auf github.com/xle0n221/clips) |
| `sessionId` | string \| null | Sitzung | ID der bearbeitenden Cloud-Sitzung |
| `updatedAt` | ISO-String | beide | letzte Änderung |
| `previewUrl` | string \| null (optional) | Sitzung | verkleinerte Vorschau bei `done` (Bild oder Video), siehe Assets; nur kleine Dateien |
| `voice` | string (optional) | Seite (beim Anlegen) | Wunschstimme: `af_heart` (Standard), `af_bella`, `am_fenrir`, `am_puck` |
| `metrics` | null \| `{ durationSec?, words?, wordsPerSec?, whisperMatch?, voice? }` (optional) | Sitzung | Kennzahlen; `whisperMatch` als Text `"283/284"` (Aussprache-Gegenprobe). `wordsPerSec` außerhalb 3,3–3,6 und ungleiche Whisper-Zahlen werden orange markiert |
| `renderProgress` | number 0..1 (optional) | Sitzung | Balken bei `stage: "render"` |
| `renderEta` | string (optional) | Sitzung | z. B. `"noch ca. 23 Min."` |
| `actionNeeded` | string \| null (optional) | Sitzung | auffälliges rotes Banner, z. B. `"Freigabe in der Claude-App nötig (Netzwerk)"`; Karte wird oben einsortiert |
| `fileSizeBytes` | number (optional) | Sitzung | Dateigröße auf der Fertig-Karte |

Zusätzliche optionale Felder in `review`:
- `review.corrections`: Liste `{ claim, note }` – Aussagen, die von gängigen Angaben abweichen; immer sichtbar hervorgehoben
  (Beispiel: `{ claim: "1.300 Erden passen in Jupiter", note: "NASA: rund 1.000" }`).
- `review.scenes`: Liste `{ id, label }` – erzeugt ein Auswahlfeld „Betrifft Szene“; die Auswahl landet in `decision.scene` (Szenen-`id` oder `null` = ganzes Video).

**Zwei Freigabe-Stufen** über `review.kind`: Stufe 1 = `"script"` (Drehbuch + Quellen), Stufe 2 = `"contactsheet"`
(Kontaktabzug, z. B. 3 Bilder pro Szene) **vor** dem finalen Render.

Die Ziel-Werte 3,3–3,6 Wörter/s und die Stimmenliste stammen aus der Video-Produktions-Sitzung
(Vorgabe der Orchestrator-Sitzung, hier nicht unabhängig nachgeprüft).

Neue Themen von der Seite: `stage: "queued"`, `review: null`, `decision: null`, `branch: null`, `sessionId: null`.

### Anzeige-Logik der Seite
- **Freigabe nötig** (orange Rahmen, oben einsortiert): `review` gesetzt, `decision` null, `stage` ≠ `done`.
- **Aktion nötig**: `actionNeeded` nicht leer → rotes Banner, ebenfalls oben.
- Nach dem Klick: Karte zeigt „Entscheidung gespeichert – wartet auf Claude“; der Nutzer kann sie zurücknehmen (setzt `decision` wieder auf `null`).
- „Nicht OK“ verlangt einen Feedback-Text.
- `queued`-Karten lassen sich (zweistufig) entfernen.
- Sortierung: Freigabe → Fehler → in Arbeit → wartend → fertig; innerhalb nach `updatedAt` absteigend.

### Ablauf für eine bearbeitende Sitzung (Vorschlag)
1. `ArtifactData list videos` → ein Dokument mit `stage: "queued"` wählen.
2. Übernehmen: `update` mit `if_version`, `stage: "research"`, `sessionId`, `branch`, `statusText`, `updatedAt`.
   `if_version` verhindert, dass zwei Sitzungen dasselbe Thema übernehmen (zweiter Schreibversuch scheitert).
3. Zur Freigabe: `update` mit `review: {…}`, `decision: null`, `statusText`, `updatedAt`.
4. Antwort abholen: Dokument lesen; ist `decision` gesetzt → umsetzen, danach `review: null`, `decision: null` und nächster `stage`.
5. Fertig: `stage: "done"`, `review: null`, optional `previewUrl`.

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

**Weck-Test: Ergebnis ausstehend** (Orchestrator-Sitzung beobachtet die Seite; echter Klick durch den Nutzer steht noch aus).

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
