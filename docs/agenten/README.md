# Lernsystem der Agenten: jede Rolle wird mit jedem Clip besser

Vorgabe des Nutzers (08.11.2026): Jeder Agent soll eigenständig lernen und sich immer weiter
verbessern – Animation, Artwork und jeder andere Job. Dieses Verzeichnis ist das **Gedächtnis jeder
Rolle**. Ein Agent startet ohne Erinnerung; was er gelernt hat, existiert nur, wenn es hier steht.

## Rollen-Dateien
| Rolle | Datei | Prüfer |
| --- | --- | --- |
| Recherche | [recherche.md](recherche.md) | Faktenprüfer |
| Faktenprüfer | [faktenpruefer.md](faktenpruefer.md) | Orchestrator (Stichprobe) |
| Drehbuch | [drehbuch.md](drehbuch.md) | Retention-Kritiker + Faktenprüfer |
| Retention-Kritiker | [retention-kritiker.md](retention-kritiker.md) | Orchestrator (später echte Zuschauerzahlen) |
| Art Direction | [art-direction.md](art-direction.md) | Design-Kritiker |
| Design-Kritiker | [design-kritiker.md](design-kritiker.md) | Orchestrator (Stichprobe Standbilder) |
| Szenen / Animation | [szenen.md](szenen.md) | Regie-Kritiker |
| Regie-Kritiker | [regie-kritiker.md](regie-kritiker.md) | Endabnahme |
| Stimme | [stimme.md](stimme.md) | Endabnahme + Nutzer (Gehör) |
| Render / Endkontrolle | [render-endkontrolle.md](render-endkontrolle.md) | Orchestrator |
| Werkzeugbau (Tempo, Wiederverwendung) | [werkzeugbau.md](werkzeugbau.md) | Wissensverwalter + nutzende Rolle |
| Wissensverwalter (Querschnitt) | [wissensverwalter.md](wissensverwalter.md) | Orchestrator |
| Veröffentlichung | [veroeffentlichung.md](veroeffentlichung.md) | Retention-Kritiker + Faktenprüfer |
| Trend-Scout (täglich, `../trend-analyse.md`) | [trend-scout.md](trend-scout.md) | Retention-Kritiker + Faktenprüfer |

## Der Lern-Kreislauf (Pflicht für jeden Auftrag)
1. **Vorher lesen:** Der Orchestrator gibt jedem Agenten im Auftrag den Pfad seiner Rollen-Datei mit.
   Der Agent liest sie zuerst und arbeitet nach der **Checkliste**.
2. **Ein Experiment:** Jeder Auftrag probiert mindestens **ein** Experiment aus „Nächste Experimente“
   (oder ein eigenes, begründetes) und **misst** das Ergebnis (Standbild, Zahl, Hörprobe).
3. **Prüfen:** Der Prüfer bewertet nach der **Messlatte** der Rolle mit Note 1–10, Befund mit Ort und Beleg.
4. **Nachher schreiben:** Der Agent trägt ein (neueste oben):
   - unter **Gelernt**: Datum · Clip · Befund · Beleg (Commit, Standbild, Messwert);
   - unter **Bewertungsverlauf**: die Note des Prüfers;
   - unter **Nächste Experimente**: mindestens eine neue Idee für den nächsten Clip.
5. **Befördern:** Was zweimal als gut belegt ist, wandert in die **Checkliste**; was zweimal als Fehler
   auftritt, wird zusätzlich Regel in `docs/clip-regeln.md` oder Korrektur im Bau-Kit.
   Was sich als falsch erweist, wird aus der Checkliste gestrichen (mit Vermerk unter „Gelernt“).
6. **Der Prüfer lernt mit:** Auch Prüfer haben eine Datei. Hat ein Prüfer etwas übersehen, das später
   auffällt (Endabnahme, Nutzer-Feedback), trägt er es in seine eigene Datei ein.

## Austausch und gegenseitige Analyse (Vorgabe des Nutzers, 09.11.2026)
- **Austausch-Brett** [`austausch.md`](austausch.md): vor dem Auftrag lesen, danach mindestens einen
  Eintrag für eine **andere** Rolle schreiben (Hinweis, Bitte, Kritik, Trick mit Beleg).
- **Kreuz-Prüfung:** Neben dem festen Prüfer analysiert jeder Agent am Ende kurz das Ergebnis einer
  Nachbar-Rolle in der Kette (Recherche → Drehbuch → Stimme → Art Direction → Szenen → Render →
  Veröffentlichung → Recherche) und schreibt den Befund ins Austausch-Brett.
- **Themenunabhängig denken:** Jede Erkenntnis so formulieren, dass sie für jedes künftige Thema gilt;
  Themen-Spezielles gehört in die Themen-Dateien (`kit/<thema>.tsx`, `quellen-<thema>.md`).
  Muster je Themen-Art und Ablauf-Checkliste: [`../playbook-themen.md`](../playbook-themen.md).
- **Parallel, aber sparsam (Vorgabe des Nutzers, 09.11.2026: „so effizient, dass das Sitzungslimit so
  langsam wie möglich erreicht wird, ohne Qualitätsverlust“):** Agenten nur für Schritte, die echte
  Arbeit sind und auf dem kritischen Pfad zum nächsten Video liegen; keine Agenten „auf Vorrat“.
  **So viele Agenten wie nötig, nicht wie möglich** (Nutzer, 09.11.2026) – ersetzt die frühere
  Vorgabe „so viele wie möglich“. Was der Orchestrator selbst in wenigen Schritten erledigt, macht er
  selbst. Pflicht bleiben nur die Prüfpaare (Ersteller ≠ Prüfer), damit die Qualität gleich bleibt.
  Grenzen: ein Video-Render gleichzeitig (4 CPU-Kerne) und das Nutzungslimit; nach dem Limit setzt der
  stündliche Abholer automatisch fort.

## Modellwahl je Aufgabe (Vorgabe des Nutzers 11.11.2026: leichte Aufgaben kleineres Modell, schwere Opus)
Der Orchestrator gibt jedem Agenten beim Start das Modell mit (`Agent`-Parameter `model`). Faustregel:
**so klein wie möglich, so groß wie nötig** – Qualität geht vor; Prüfpaare bleiben, sie fangen Fehler kleinerer Modelle ab.

| Modell | Wann | Rollen / Aufgaben |
|---|---|---|
| `haiku` | mechanisch, klar vorgegeben, leicht nachprüfbar | Webseite abrufen/zusammenfassen (`web-fetch`), Dateien suchen/auflisten, Messungen ausführen und berichten (ffprobe, LUFS, W/s), Endkontrolle nach Checkliste, Dashboard-Status übertragen |
| `sonnet` | Standardarbeit mit Urteil, aber gut eingegrenzt | Recherche (Quellen finden + zitieren), Trend-Scout, Retention-Kritiker, Design-Kritiker, Werkzeugbau (Skripte), Wissensverwalter, Veröffentlichung (Titel/Texte/Hashtags), Hashtag-Analyse |
| `opus` | schwer, kreativ oder fehlerteuer | Drehbuch, Faktenprüfer (Wahrheit vor Tempo), Szenen/Animation (3D-Code), Art Direction, Regie-Kritiker (Bildurteil), Stimme/Casting, Orchestrator selbst, alles mit unklarer Ursache (Fehlersuche) |

Regeln:
- Ist ein Ergebnis eines kleineren Modells beim Prüfer unter Note 7, wird die **Nacharbeit mit dem nächstgrößeren Modell** vergeben (nicht dasselbe Modell erneut).
- Prüfer ist nie kleiner als der Ersteller (sonst übersieht er dessen Fehler).
- Das Modell der laufenden Orchestrator-Sitzung und der an sie gebundenen geplanten Aufgaben (Abholer, Wochenrunde) ist fest;
  nur Agenten und geplante Aufgaben mit frischer Sitzung je Lauf können ein eigenes Modell bekommen.
- **Orchestrator spart selbst:** Leichte Schritte (Statuslisten, Messungen, Datei-Suche, Endkontrolle) gibt er an einen `haiku`-Agenten
  statt sie im eigenen langen Verlauf zu machen; jedes neue Video startet in einer **frischen Sitzung** (`docs/sitzungswechsel.md`),
  weil jeder Schritt einer langen Sitzung den ganzen Verlauf mitliest.
- Getestet 11.11.2026: Eine Haiku-Vorprüfung als geplante Aufgabe mit frischer Sitzung kostet ~0,8 Cent/Lauf und erkennt Arbeit,
  **kann den Orchestrator aber nicht wecken** (`fire_trigger` fehlt in solchen Sitzungen) → wieder entfernt; der Abholer bleibt.
- Jede Rollen-Datei nennt ihr Standardmodell nicht separat – maßgeblich ist diese Tabelle (eine Stelle, kein Widerspruch).

## Sparsam arbeiten (Token-Budget)
Qualität bleibt unverändert – gespart wird nur Leerlauf und Doppelarbeit:
- Aufträge kurz: auf Rollen-Datei und Regeln **verweisen**, nicht abschreiben.
- Bilder nur ansehen, wenn sie eine Entscheidung tragen (Kontaktabzug statt vieler Einzelbilder,
  verkleinert mit `--scale`); dasselbe Bild nicht mehrfach öffnen.
- Große Dateien gezielt lesen (`grep`, Zeilenbereiche), nicht komplett; Datenbank-Reads mit `out_dir`.
- Agenten-Berichte knapp: Ergebnis, geänderte Dateien, was nicht verifiziert ist – keine Wiederholung
  des Auftrags.
- Dashboard nur bei echtem Statuswechsel schreiben; Repo→Dashboard-Sync gebündelt nach mehreren Commits.
- Ein Agent übernimmt zusammenhängende Teilaufgaben, statt sie auf mehrere zu verteilen, wenn sie
  dieselben Dateien lesen müssten.
- **Neue Sitzung je Video** (größter Hebel): Jeder Schritt einer langen Sitzung liest den ganzen bisherigen
  Verlauf mit. Alles Wissen steht im Repo – ein neues Video startet daher in einer frischen Sitzung
  (oder nach `/compact`), nicht im Verlauf des vorigen.
- Abholer nur alle 2 h (Dashboard-Entscheidungen wecken sofort per `fire_trigger`); „Nichts zu tun“ ohne
  weitere Werkzeuge.
- Warten auf Render/Agenten ohne Abfragen: Hintergrund-Befehl, der beim Ende weckt.
- Antworten an den Nutzer kurz; keine Wiederholung bereits gesagter Inhalte.
- **Repo wird schneller:** Der Werkzeugbau macht aus jedem Ad-hoc-Code, der zweimal geschrieben wurde,
  ein wiederverwendbares Werkzeug.

## Regeln
- Nur belegte Einträge: Messwert, Standbild oder Commit. Keine Vermutungen als „gelernt“.
- Eine Verbesserung darf einen Referenzwert (`docs/clip-regeln.md`) nicht verschlechtern, ohne Begründung.
- Feedback des Nutzers aus dem Dashboard (`decision.feedback`) wird immer in die betroffene Rollen-Datei
  übernommen – es ist das wichtigste Lernsignal.
- Bestehende fertige Videos werden für Verbesserungen nicht neu gerendert.

## Wöchentliche Verbesserungsrunde (geplante Aufgabe, Mittwoch)
Je Rolle: Datei lesen, Checkliste entrümpeln, das wirkungsvollste offene Experiment am Bau-Kit oder an
den Skripten umsetzen, mit Vorher/Nachher belegen, vom Prüfer der Rolle gegenprüfen lassen, eintragen.
