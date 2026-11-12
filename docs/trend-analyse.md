# Tägliche Trend-Analyse: was bei Cartoon-/Erklär-Shorts gerade viral geht

Vorgabe des Nutzers (12.11.2026): „Es soll täglich analysiert werden, welche Cartoon-Kanäle und welche Themen,
Animationen viral gehen und gut ankommen, und das soll dann hier bei uns umgesetzt werden.“

## Wer, wann
- Geplante Aufgabe **„Clips Trend-Analyse (täglich)“**, jeden Tag 12:41 Uhr (Europe/Berlin), frische Sitzung je Lauf,
  Modell `sonnet` (Rolle wie Recherche, `docs/agenten/README.md` → „Modellwahl je Aufgabe“).
- Geplante Aufgabe `trig_01RL4qV9UiaUyitJqmuxtAPN`. Hinweis beim Anlegen (12.11.2026): Die frische Sitzung bekommt **keine
  MCP-Connectoren** mit (also kein Apify-MCP). TikTok über Apify braucht daher zusätzlich, dass der Nutzer die Aufgabe in den
  claude.ai-Routinen mit dem Apify-Connector verknüpft.
- Rollen-Gedächtnis: [`agenten/trend-scout.md`](agenten/trend-scout.md) (Checkliste, Gelernt, Experimente).
- Läuft vor der täglichen Verbesserungsrunde (14:23 Uhr), damit die Runde die Befunde gleich umsetzen kann.

## Was beobachtet wird
1. **Kanäle:** englische Cartoon-/Animations-Erklärkanäle auf YouTube Shorts und TikTok (z. B. Vorbilder aus
   `docs/referenz-analyse-*.md`, dazu neue Kanäle, die in den Quellen auftauchen).
2. **Themen:** welche Themen-Arten (Playbook C1–C6, plus neue) gerade hohe Aufrufe/Engagement bekommen.
3. **Machart:** Animationsstil (2D/3D/Paper-Cut), Hook-Formulierung, Länge, Tempo (W/s), Schnitte, Untertitel-Stil,
   Cover/Thumbnail, Ton/Musik.

## Quellen und Wahrheit (verbindlich)
- Nur Zahlen, die in einer Quelle stehen; jede Zahl mit URL, Datum und Art der Kennzahl (Aufrufe, Likes, Abonnenten).
  Plattformen veröffentlichen keine offiziellen Trend-Listen für Nischen → Drittanbieter-Daten (Tracker, Artikel,
  Apify) sind erlaubt, aber als **Drittanbieter** zu kennzeichnen. Was nicht belegbar ist: „Ich kann das nicht bestätigen“.
- Netzsperren werden nicht umgangen. `www.tiktok.com` und `www.youtube.com` sind im Container gesperrt (Test 12.11.2026:
  Verbindung abgelehnt) → Daten kommen über die folgenden Wege.

### Datenwege TikTok + YouTube Shorts (Vorgabe Nutzer 12.11.2026: „TikTok und YouTube Shorts nehmen und dort analysieren“)
| Plattform | Weg | Kosten (Quelle) | Status 12.11.2026 |
| --- | --- | --- | --- |
| YouTube Shorts | **YouTube Data API v3** (`search.list` mit `videoDuration=short`, `order=viewCount`, `publishedAfter` = vor 7 Tagen; dann `videos.list` für Aufrufe/Likes/Kommentare/Dauer) – offizielle Plattform-Daten | kostenlos mit Tageskontingent. **Ich kann die Zahlen nicht bestätigen**: Die Kontingent-Seite (https://developers.google.com/youtube/v3/determine_quota_cost) ist aus dem Container gesperrt; nach Erinnerung 10.000 Einheiten/Tag, `search.list` = 100, `videos.list` = 1 – beim ersten Lauf an der Antwort/Konsole messen und hier eintragen | `www.googleapis.com` erreichbar, aber **Schlüssel fehlt** (Antwort 403 „Permission denied“). Nutzer trägt ihn in den Umgebungs-Einstellungen als Netzwerk-Secret ein: Host `www.googleapis.com`, Header `X-goog-api-key` (Header-Name aus Erinnerung, nicht an der Google-Doku geprüft; erster Lauf testet ihn). |
| YouTube Shorts (Ersatz) | Apify `streamers/youtube-shorts-scraper` | 0,004 $ je Short + 0,0013 $ Datumsfilter (Apify-Store-API, Stufe FREE, abgerufen 12.11.2026) | nur mit Kostenfreigabe |
| TikTok | Apify `clockworks/tiktok-scraper` (Suche nach Hashtags/Stichworten, Aufrufe/Likes/Shares/Dauer je Video) | 0,0037 $ je Ergebnis + 0,0013 $ Datumsfilter + 0,001 $ je Start (Apify-Store-API, Stufe FREE, 12.11.2026) | **wartet auf Kostenfreigabe des Nutzers** (Regel `docs/apify.md`) |

Kostenrechnung je Lauf (Stufe FREE): TikTok 25 Videos × (0,0037 + 0,0013) $ + 0,001 $ = **0,126 $**; YouTube über die API 0 $.
Täglich ≈ 0,13 $ → 30 Tage ≈ **3,8 $** (Apify-Gratisguthaben 5 $/Monat laut `docs/apify.md`). Deckel je Lauf:
`callOptions.maxTotalChargeUsd: 0.15`. Ohne Freigabe oder ohne Apify-Werkzeuge: TikTok-Teil auslassen und das im Bericht sagen.

- Zusätzlich erlaubt: WebSearch (Artikel, Tracker – als Drittanbieter kennzeichnen).
- Videos ansehen (Animation, Schnitt, Tempo): nur wenn ein Download-Weg erlaubt ist; sonst aus Metadaten (Dauer,
  Titel/Hook, Beschreibung) und – falls geliefert – Transkript schließen, und das als „nicht angesehen“ kennzeichnen.
- Keine Inhalte kopieren: übernommen werden **Techniken** (Tempo, Hook-Muster, Schnittrhythmus, Stilmittel), nie Figuren,
  Texte, Musik oder Looks 1:1 (`docs/referenz-analyse-4.md`, Grundsatz).

## Ergebnis je Lauf
- `docs/trends/<YYYY-MM-DD>.md`: Tabelle Beobachtung · Kennzahl · Quelle (URL, Datum, Typ) · Bedeutung für uns.
- `docs/trends/aktuell.md` (wird überschrieben): höchstens **5 Erkenntnisse** mit Beleg, je eine **Umsetzung** mit Ort
  (Datei/Rolle) und eine Liste **Themen-Ideen** (nur Vorschläge, der Nutzer entscheidet im Dashboard).
- Gibt es nichts belastbar Neues: nur eine Zeile in `aktuell.md` („Stand <Datum>: nichts Neues mit Beleg“), keine neue Datei.

## Wie es umgesetzt wird
1. Die Trend-Analyse schreibt jede umsetzbare Erkenntnis als Eintrag ins [Austausch-Brett](agenten/austausch.md)
   an die zuständige Rolle (Drehbuch, Szenen, Art Direction, Stimme, Veröffentlichung) mit Status „offen“.
2. Die **tägliche Verbesserungsrunde** liest `docs/trends/aktuell.md` und wählt die wirkungsvollste Erkenntnis als
   Experiment (Prüfpaar, Vorher/Nachher-Beleg, Note).
3. Beim **nächsten Video** liest die Drehbuch- und Szenen-Rolle `docs/trends/aktuell.md` vor dem Auftrag.
4. Was sich in zwei Videos bewährt, wandert nach `docs/clip-regeln.md` bzw. ins Bau-Kit (Lernsystem `docs/agenten/README.md`).
5. Neue Themen trägt nur der Nutzer ins Dashboard ein; die Analyse macht Vorschläge, legt aber keine Videos an.
