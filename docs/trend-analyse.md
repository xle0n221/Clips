# Tägliche Trend-Analyse: was bei Cartoon-/Erklär-Shorts gerade viral geht

Vorgabe des Nutzers (12.11.2026): „Es soll täglich analysiert werden, welche Cartoon-Kanäle und welche Themen,
Animationen viral gehen und gut ankommen, und das soll dann hier bei uns umgesetzt werden.“

## Wer, wann
- Geplante Aufgabe **„Clips Trend-Analyse (täglich)“**, jeden Tag 12:41 Uhr (Europe/Berlin), frische Sitzung je Lauf,
  Modell `sonnet` (Rolle wie Recherche, `docs/agenten/README.md` → „Modellwahl je Aufgabe“).
- Geplante Aufgabe `trig_01RL4qV9UiaUyitJqmuxtAPN` (frische Sitzung ohne MCP-Connectoren; Apify läuft deshalb über die REST-API, s. u.).
- Rollen-Gedächtnis: [`agenten/trend-scout.md`](agenten/trend-scout.md) (Checkliste, Gelernt, Experimente).
- Läuft vor der täglichen Verbesserungsrunde (14:23 Uhr), damit die Runde die Befunde gleich umsetzen kann.

## Was beobachtet wird
1. **Kanäle:** englische Cartoon-/Animations-Erklärkanäle auf YouTube Shorts und TikTok (z. B. Vorbilder aus
   `docs/referenz-analyse-*.md`, dazu neue Kanäle, die in den Quellen auftauchen).
2. **Themen:** welche Themen-Arten (Playbook C1–C6, plus neue) gerade hohe Aufrufe/Engagement bekommen.
3. **Machart:** Animationsstil (2D/3D/Paper-Cut), Hook-Formulierung, Länge, Tempo (W/s), Schnitte, Untertitel-Stil,
   Cover/Thumbnail, Ton/Musik.
4. **Sound/Musik** (Vorgabe Nutzer 12.11.2026, „ähnlich was momentan im Trend ist“): welche Musikstile, Tempi und
   Stimmungen virale Shorts unterlegen (z. B. dunkles R&B/Trap bei True-Crime, Lo-fi bei Erklärstücken), soweit aus
   Metadaten belegbar (Sound-/Musik-Titel im Scraper-Ergebnis, Beschreibung). In `aktuell.md` als eigene Erkenntnis
   mit Beleg → Umsetzung: welches Preset von `scripts/music.py` (`docs/clip-regeln.md` → „Musik je Thema“) passt.
   Nur Stil notieren, nie Titel zum Nachbauen; ohne Beleg „Ich kann das nicht bestätigen“.

## Quellen und Wahrheit (verbindlich)
- Nur Zahlen, die in einer Quelle stehen; jede Zahl mit URL, Datum und Art der Kennzahl (Aufrufe, Likes, Abonnenten).
  Plattformen veröffentlichen keine offiziellen Trend-Listen für Nischen → Drittanbieter-Daten (Tracker, Artikel,
  Apify) sind erlaubt, aber als **Drittanbieter** zu kennzeichnen. Was nicht belegbar ist: „Ich kann das nicht bestätigen“.
- Netzsperren werden nicht umgangen. `www.tiktok.com` und `www.youtube.com` sind im Container gesperrt (Test 12.11.2026:
  Verbindung abgelehnt) → Daten kommen über die folgenden Wege.

### Datenwege TikTok + YouTube Shorts (Vorgabe Nutzer 12.11.2026: „TikTok und YouTube Shorts nehmen und dort analysieren“)
**Werkzeug:** `python3 scripts/trends_fetch.py` (Standard: 25 TikTok-Videos + 25 YouTube Shorts der letzten Woche zu
englischen Erklär-/Animations-Suchbegriffen) → `out/trends/<datum>/summary.json` (sortiert nach Aufrufen) + Rohdaten.
Läuft über die **Apify-REST-API** (`api.apify.com`); der Apify-API-Token ist seit 12.11.2026 Netzwerk-Secret der Umgebung
„Clips“ und wird vom Proxy eingesetzt – funktioniert daher auch in frischen Sitzungen ohne Connector. Daten = **Drittanbieter**
(Apify-Scraper der öffentlichen Plattform-Seiten), keine offizielle Plattform-Statistik.

| Plattform | Actor | Preis Stufe FREE (Apify-Store-API, 12.11.2026) |
| --- | --- | --- |
| TikTok | `clockworks/tiktok-scraper` (Suche, Filter „letzte Woche“) | 0,0037 $ je Video + 0,0013 $ Datumsfilter + 0,001 $ je Start; Actor verlangt Deckel ≥ 0,50 $ je Lauf |
| YouTube Shorts | `streamers/youtube-scraper` (Suche, `maxResultsShorts`, Filter „week“) | 0,004 $ je Short + 0,0013 $ Datumsfilter |

**Kostenfreigabe des Nutzers: 12.11.2026** („Mach das es geht“ auf die Rechnung unten). Rechnung je Lauf: TikTok 25 × 0,005 $
+ 0,001 $ = 0,126 $; YouTube 25 × 0,0053 $ = 0,133 $; zusammen ≈ **0,26 $/Tag** ≈ 7,8 $/30 Tage – **mehr als das
Gratisguthaben von 5 $/Monat**; ist es aufgebraucht, pausiert Apify bis zum Monatswechsel (keine Rechnung, `docs/apify.md`).
Deshalb täglich nur **je 12** Videos (≈ 0,13 $/Tag ≈ 3,9 $/Monat). Monatsverbrauch prüfen:
`curl -s https://api.apify.com/v2/users/me/limits` → `current.monthlyUsageUsd`; ab 4,5 $ nur noch YouTube.
Test 12.11.2026: Abruf klappt (u. a. YouTube „Why the SHARPEST Sword is actually the WORST Sword“, 148.838 Aufrufe;
TikTok @the_bonezone2, 384.781 Aufrufe, 60,7 s). Lange synchrone Anfragen bricht der Proxy mit 502 ab → Skript startet
asynchron und fragt den Status ab. Suchtreffer enthalten auch Themenfremdes (z. B. Hindi-Diwali-Clip) → beim Auswerten filtern.
Die YouTube Data API (Google) ist damit nicht nötig.

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
