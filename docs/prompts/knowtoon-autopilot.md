# Autopilot-Regel (Nutzer 14.11.2026, dauerhaft) – ergänzt alle Prompts und Hausregeln

Wortlaut des Nutzers (unverändert):

```
KNOWTOON – AUTOPILOT-REGEL (dauerhaft)
Ablage: docs/prompts/knowtoon-autopilot.md, Verweis in CLAUDE.md

0. GELTUNG
- Gilt ab sofort, für alle Videos, dauerhaft.
- Du arbeitest vollständig selbstständig: Themen finden, Videos herstellen, prüfen, freigeben, ablegen. Du fragst mich nichts und wartest nie auf mich.
- Ich poste nur die fertigen Videos.
- Diese Regel ERGÄNZT. Sie ändert nur, wer freigibt und woher Themen kommen. Alle bestehenden Prompts und Hausregeln bleiben unverändert und dauerhaft gültig. Du löschst, kürzt und überschreibst keinen davon.
- Rangfolge für die Herstellung bleibt: Erweiterung > Basis-Prompt > Hausregeln. Die Upload-Strategie gilt weiter für Veröffentlichung und Auswertung.
- Wo ältere Texte eine Freigabe oder ein „ok“ von mir verlangen, gibst du ab jetzt selbst frei. Das gilt auch für Plan-Änderungen.
- Bei Widersprüchen entscheidest du nach der Rangfolge, trägst Konflikt und Entscheidung in docs/prompts/konflikte.md ein und arbeitest weiter.

1. TÄGLICHE MARKTANALYSE (jeden Tag, vor der Themenwahl)
Ergebnis in docs/trends/<datum>.md, Kurzfassung in docs/trends/aktuell.md.
1. Suche, welche englischsprachigen Kurzvideos in unserer Branche (Animation, Story, Wissen, What-if) aktuell hohe Aufrufe und starkes Interesse haben, auf TikTok und YouTube Shorts getrennt.
2. Halte je Fund fest: Quelle mit URL, Abrufdatum, was gemessen wurde, Thema, Hook-Art, Aufbau, Länge.
3. Vergleiche mit dem Vortag: Was ist neu, was steigt, was fällt.
4. Leite daraus mindestens [5] neue Themen ab. Übernimm nur Muster, nie Figuren, Texte, Bilder oder Musik anderer.
5. Bewerte jedes Thema 1–10 in: belegtes Interesse | Hook-Stärke | Eignung für 3D-Klotzfiguren | Faktenlage | Abstand zu fertigen Videos. Nur Schnitt ≥ 8 kommt in die Warteschlange.
6. Sortiere die Warteschlange täglich neu nach Bewertung. Themen, die [14] Tage ungenutzt sind, neu bewerten oder streichen.

Regeln:
- Keine erfundenen Zahlen. Nicht Abrufbares heißt „Ich kann das nicht bestätigen“.
- Kennzeichne [GEMESSEN], [STUDIE], [HYPOTHESE].
- Liegen eigene Zahlen im Feld `analytics`, wiegen sie schwerer als fremde Trends.
- Kein Thema doppelt. Höchstens [2] Videos derselben Art hintereinander.

2. SELBSTFREIGABE
Die vier Stationen bleiben als Prüfpunkte. Du setzt sie selbst auf „ok“, wenn alle Bedingungen erfüllt und belegt sind:
- Station 1 Paket: Faktenprüfer ≥ 9, Retention-Kritiker ≥ 9, jede Tatsache mit Primärquelle und URL, Scorecard überall ≥ 9.
- Station 2 Hörprobe: Whisper-Abgleich ≥ 98 %, earshot-Werte innerhalb der Hausregeln.
- Station 3 Kontaktabzug: Regie-Kritiker ≥ 9, Design-Kritiker ≥ 9, Shot- und Untertitel-Regeln gemessen eingehalten.
- Station 4 Fertig: Endkontrolle ≥ 9, ffprobe-Werte korrekt, Limiter ≤ −1 dBTP, `publish` vollständig mit Upload-Block.

Prüfregeln:
- Wer erstellt, prüft nicht. Prüfer arbeiten nur lesend.
- Jede Note braucht einen Beleg (Messwert, Szenennummer oder Zitat). Ohne Beleg gilt sie als nicht bestanden.
- Die Schwelle 9/10 wird nie gesenkt.
- Nicht bestanden: nachbessern und neu prüfen. Nach 2 Runden arbeitet das nächstgrößere Modell nach. Scheitert auch das, wird das Video als „geparkt“ mit Grund abgelegt und das nächste Thema beginnt.

3. HARTE STOPPS
- Tatsache ohne Primärquelle → streichen oder Thema verwerfen.
- Geschützte Figuren, Marken, Spiel- oder Filmbilder, fremde Melodien → umbauen oder verwerfen.
- Aussagen über reale Personen nur mit Primärquelle, im Zweifel verwerfen.
- Derselbe technische Fehler zweimal → Schritt stoppen, im Dashboard vermerken, nächstes Video.

4. TAGESABLAUF
1. Marktanalyse (Abschnitt 1)
2. Bestes Thema der Warteschlange wählen
3. Video nach den bestehenden Prompts herstellen und selbst freigeben
4. Ablegen: MP4, Vorschau, Titel, Caption, Hashtags, Slot mit Datum und Uhrzeit unter „Bereit zum Posten“
5. Lessons-Log fortschreiben, committen, pushen, Dashboard aktualisieren
6. Nächstes Thema beginnen
Ziel: [2] fertige Videos pro Tag. Liegen [6] ungepostete Videos bereit, pausiert die Herstellung, die Marktanalyse läuft trotzdem täglich weiter.

5. ABLAGE UND BERICHT
- Tagesbericht in docs/berichte/<datum>.md und im Dashboard, 6 Zeilen: Trends heute | fertig | in Arbeit | geparkt mit Grund | neue Themen | Probleme.
- Je Video alle Noten mit Beleg und die Quellenliste.
- Sparsam bleiben: so wenige Agenten wie nötig, kleinstes passendes Modell, nur ein Render gleichzeitig.

GRUNDREGEL
Du entscheidest alles selbst, aber nie mit schwächerer Prüfung. Im Zweifel wird geparkt, nicht freigegeben.
```

## Umsetzung (Orchestrator, 14.11.2026)
- **Selbstfreigabe im Dashboard:** `decision: { value: "ok", via: "autopilot", at, evidence }`. `evidence` enthält die Noten mit Beleg. Danach wird `review` sofort geleert. Die Freigabe ist eine Prüfakte, keine Station, an der auf dich gewartet wird.
- **„Geparkt“:** `stage: "parked"` mit `statusText` als Grund. Die Seite zeigt das als eigenen Zustand.
- **„Bereit zum Posten“:** alle Karten mit `stage: "done"`, die `publish.upload.status: "plan"` haben und noch keine `analytics` (also noch nicht gepostet sind). Oben im Dashboard stehen sie als Liste mit Datum, Slot und Uhrzeit. „Ungepostet“ heißt: `analytics` ist leer. Sind 6 Videos ungepostet, pausiert die Herstellung.
- **Tagesbericht:** `docs/berichte/<datum>.md` und das Dashboard-Dokument `meta/report`, das oben auf der Seite angezeigt wird.
- **Takt:** Der bestehende Abholer (alle 2 h) arbeitet nach diesem Ablauf. Der erste Lauf eines Tages (deutsche Zeit) macht die Marktanalyse; jeder Lauf setzt die Herstellung fort. Neue geplante Aufgaben kann diese Sitzung nicht anlegen (Lineage-Tiefe, `docs/sitzungswechsel.md`); deshalb bekommt der bestehende Auftrag den neuen Wortlaut.
- **Konflikte:** `docs/prompts/konflikte.md`.
