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
  Grenzen: ein Video-Render gleichzeitig (4 CPU-Kerne) und das Nutzungslimit; nach dem Limit setzt der
  stündliche Abholer automatisch fort.

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
