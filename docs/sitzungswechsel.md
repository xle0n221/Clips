# Sitzungswechsel – automatisch, ohne Rückfrage (Vorgabe des Nutzers, 09.11.2026)

> „Die Sitzungen sollen immer dann erneuert werden, wenn du merkst, dass es zu viel ist. Es soll immer
> automatisch laufen und es soll auch nicht gefragt werden.“

Grund: Jeder Schritt einer Sitzung liest den ganzen bisherigen Verlauf mit. Alles Wissen steht im Repo –
eine frische Sitzung arbeitet gleich gut, verbraucht aber viel weniger.

## Wann wechseln (eins genügt)
- Ein Video ist fertig (stage `done`) und das nächste beginnt.
- Die Sitzung wurde schon einmal zusammengefasst (Kontext-Kompaktierung) und es steht größere Arbeit an.
- Der Verlauf ist spürbar lang (viele Agenten-Berichte, Bilder, Stunden Arbeit).
Nicht mitten in einem laufenden Render oder während Agenten arbeiten – erst sichern/abschließen.

## Wie (der Orchestrator macht alles selbst, fragt nicht)
1. Alles committen und pushen; Dashboard-Status aktuell.
2. `create_session` mit `source_url` = Repo, `source_revision`/`outcome_branch` = aktueller Branch,
   `title` „CLIPS – <Thema/Stand>“ und einem **Übergabe-Prompt**: Stand in 5–10 Zeilen (laufendes Video,
   Stufe, offene Entscheidungen des Nutzers, nächste Schritte), Verweis auf `CLAUDE.md` und diese Datei.
3. Geplante Aufgaben umziehen: Abholer und Wochenrunde je mit `create_trigger` und
   `persistent_session_id` = neue Sitzung neu anlegen (gleicher Prompt – er enthält die automatische Modellwahl), die alten mit
   `update_trigger enabled=false` abschalten.
4. Dashboard: `meta/pickup` = `{ triggerId, sessionId, since }` schreiben (mit `if_version`, das Dokument
   existiert). Die Seite liest die Trigger-ID für „Jetzt starten“/Sofortstart live von dort (Rückfall: Konstante
   `PICKUP_TRIGGER` in `dashboard/index.html`) – **kein Neuveröffentlichen nötig**.
   `sessionId` beim laufenden Video auf die neue Sitzung setzen.
5. Dem Nutzer in einem Satz sagen, dass es in der neuen Sitzung weitergeht (Titel nennen).

## Verlauf
| Datum | alte Sitzung | neue Sitzung | Anlass |
|---|---|---|---|
| 09.11.2026 | session_01UNp77RB3vBiMZfvMTegJPC | session_01UNp77RfgMaxCV6mq19omHk („CLIPS – Orchestrator (ab 09.11.2026, nach Rom-Video)“) | Rom-Video fertig, Verlauf sehr lang; Abholer trig_01JLT1pGyNwh8YKTpJWtNJxp, Wochenrunde trig_01XgFBdQWeP3pQUJpqF5EKNr; alte Trigger abgeschaltet |
| 09.11.2026 | session_01UNp77RfgMaxCV6mq19omHk | session_01UNp77PfeZgZvzb2ptJpUgZ („CLIPS – Rom-Video v3 (Chatterbox Finn, ricksclip-Stil)“) | Verlauf lang, Rom-Überarbeitung beginnt; Abholer trig_011W3kQivp9AmUoMEjgQwfvL, Wochenrunde trig_01WspzYtyzSYSSJ4QBj9Msr2; alte Trigger aus |
| 11.11.2026 | session_01UNp77PfeZgZvzb2ptJpUgZ | session_01UNp77SBWELXkXVEa1Bhocq („CLIPS – Orchestrator (ab 11.11.2026, 3 neue Themen)“) | Verlauf sehr lang, 3 neue Themen im Dashboard; Abholer trig_01LrG4ZaCRWRsBfyow6Gq9Ag, tägliche Runde trig_015TKbafM6Bk1SAZKnHmyCoC; alte Trigger abgeschaltet |
| 12.11.2026 | session_01UNp77SBWELXkXVEa1Bhocq | session_01UNp77MbGLd9xQmQdv3FLjX („CLIPS – Orchestrator (ab 12.11.2026, Erde-Freigabe 2 + Warteschlange)“) | Sitzung schon kompaktiert, Erde wartet auf Freigabe 2, 8 Themen in der Warteschlange; Abholer trig_017AH4D9b5H8YGiKarMizM1a, tägliche Runde trig_01MSRAR4qxfJRSfyyTmt6c1S; alte Trigger abgeschaltet |
| 12.11.2026 | session_01UNp77MbGLd9xQmQdv3FLjX | session_01UNp77QbbGMJqc2nmbhEjyJ („CLIPS – Orchestrator (ab 12.11.2026 Mittag, Tyson + UFC + Rolls-Royce)“) | Wochenlimit knapp, Verlauf lang; alte Sitzung rendert nur noch „Erde ohne Menschen“ fertig; Abholer trig_01AD5K37cJTsy7zkgKqZbRd4 (alter trig_017AH4D9b5H8YGiKarMizM1a aus); tägliche Runde trig_01MSRAR4qxfJRSfyyTmt6c1S bis Limit-Reset pausiert |
| 12.11.2026 | session_01UNp77QbbGMJqc2nmbhEjyJ | session_01UNp77Rbv8zMoJNASdg9kGn („CLIPS – Orchestrator (ab 12.11.2026 Abend, Tyson/UFC/Rolls-Royce Freigaben)“) | Wochenlimit knapp, Verlauf lang; Hörproben aller drei Videos liegen zur Freigabe; Abholer trig_01LnS7BnVJhFZiuzXghfJjDr (alter trig_01AD5K37cJTsy7zkgKqZbRd4 aus); tägliche Runde trig_01MSRAR4qxfJRSfyyTmt6c1S weiter pausiert |
| 12.11.2026 | session_01UNp77Rbv8zMoJNASdg9kGn | session_01UNp77NVhVawXgBH2ZNK6s8 („CLIPS – Orchestrator (ab 12.11.2026 Nacht, Jensen Huang → Lucia → Jason)“) | Tyson + UFC fertig, Verlauf lang; Huang-Drehbuch wartet auf Freigabe 1; Abholer trig_01LwvVfuHuf1FAfnvscSeBAd (alter trig_01LnS7BnVJhFZiuzXghfJjDr aus) |
| 13.11.2026 | session_01UNp77NVhVawXgBH2ZNK6s8 | session_01UNp77QHeWKBPJK78ThrGyX („CLIPS – Orchestrator (ab 13.11.2026 Vormittag, Lucia → Jason → Zeit-Welt)“) | Huang fertig, Verlauf lang. **Neuer Abholer scheiterte:** Sitzung hat Tiefenlimit 8 erreicht (`create_trigger`/`update_trigger enabled=true` verweigert). Alter Abholer trig_01LwvVfuHuf1FAfnvscSeBAd aus. **Lösung:** Die Vorgängersitzung (Tiefe 7) legte den neuen Abholer trig_01NLm7wDjZkjX4TVWdW1r2uy mit `persistent_session_id` = neue Sitzung an und stellte meta/pickup um (geprüft per get_trigger). Nächster Wechsel aus dieser Sitzung ist nicht möglich → Nutzer muss dann selbst eine neue Sitzung starten. |
| 19.11.2026 | session_01UNp77QHeWKBPJK78ThrGyX | session_01UNp77MtRT1w4ZDwHvrEHpp („Clips – weiter nach Übergabe“, vom Nutzer gestartet, Tiefe 1) | alte Sitzung Tiefe 8; Abholer trig_01NLm7wDjZkjX4TVWdW1r2uy aus → trig_01YFVees4t4feuwwe9gyvcmh |
| 20.11.2026 | session_01UNp77MtRT1w4ZDwHvrEHpp | session_01UNp77QbmgR9ha8b4i9wViD („CLIPS – Orchestrator (ab 20.11.2026, nach Tor + Schwerkraft)“, Umgebung „Clips“) | Tor + Schwerkraft fertig, Verlauf lang; Abholer trig_01YFVees4t4feuwwe9gyvcmh aus → trig_01EyRuiZbGdYiSzo7QTd4vMa, meta/pickup v10 |
| 20.11.2026 abends | session_01UNp77QbmgR9ha8b4i9wViD | session_01UNp77MwDdQvCYQekQ5vs48 („CLIPS – Orchestrator (ab 20.11. abends, 2 Videos/Tag, Hook-Reset)“) | Qualitäts-Reset, 2 Videos/Tag; Abholer trig_01EyRuiZbGdYiSzo7QTd4vMa aus → trig_01LpDfKfrFJNjXSCf77t13ds (leere Läufe ohne Nachricht) |
| 20.11.2026 abends | session_01UNp77MwDdQvCYQekQ5vs48 (Orchestrator) | session_01UNp77PKkjFzGD2s8mqDXLD („CLIPS – Video 1 (20.11., Hook-Reset)“) | Video 1 des Tages in eigener Sitzung; Abholer bleibt beim Orchestrator |
| 20.11.2026 nachts | session_01UNp77MwDdQvCYQekQ5vs48 (Orchestrator) | session_01UNp77NwEQnkdwV347oHn4Q („CLIPS – Video 2 (20./21.11., Hook-Reset)“) | Video 1 Gähn-Stadt fertig; Video 2 in eigener Sitzung, Upload 21.11. Slot B |
| 21.11.2026 nachts | session_01UNp77R5aWAbWZYhvb8vvua (Ghost-Pepper-Beispiel) | session_01UNp77NjnLM6badC17a8k4E („CLIPS – In This City (schwarzer Humor) Video 1 (21.11.)“, Tiefe 5) | Ghost-Pepper fertig; Nutzer 21.11.: „Danach virale 'in this city' Clips … mit schwarzem Humor“; Abholer bleibt beim Orchestrator |
| 28.11.2026 | session_01UNp77R5aWAbWZYhvb8vvua | session_01UNp77SBSkQVVeFiEhCCFzL („CLIPS – TRX vs Raptor R (3D-Cartoon, 63 s)“, Tiefe 5) | Nutzer: „Mach es als 3D-Cartoon“ + „Wenn es besser ist und sparsamer erstelle eine neue sitzung“ |

## Grenze: Sitzungs-Tiefe (gelernt 13.11.2026)
Jede per `create_session` gestartete Sitzung zählt eine Stufe tiefer; ab **Tiefe 8** darf eine Sitzung keine Sitzungen
starten und keine geplanten Aufgaben anlegen, auslösen oder wieder einschalten (Abschalten geht noch). Deshalb:
1. Vor dem Wechsel mit `get_session` die `lineage.depth` der **neuen** Sitzung prüfen; ist sie 8, legt die **alte** Sitzung den neuen Abholer an (`persistent_session_id` = neue Sitzung) und stellt meta/pickup um – die neue kann es nicht.
2. Die Kette wird nur zurückgesetzt, wenn der Nutzer selbst eine neue Sitzung startet (Tiefe 0).


## Abholer-Wortlaut im Autopilot (14.11.2026, für die nächste Sitzung mit Rechten zum Ändern)
Diese Sitzung konnte `trig_01NLm7wDjZkjX4TVWdW1r2uy` nicht ändern (Lineage-Tiefe 8). Neue Sitzung: Auftrag mit diesem Inhalt anlegen oder ersetzen: Autopilot nach `docs/prompts/knowtoon-autopilot.md` – 0. brachliegende Arbeit fortsetzen; 1. videos + meta/report lesen, analytics → docs/analytics/uploads.md; 2. erster Lauf des Tages: Marktanalyse (Trend-Scout, sonnet) → docs/trends/<datum>.md, Warteschlange neu bewerten; 3. Herstellung mit Selbstfreigabe (Noten ≥ 9 mit Beleg, Prüfer ≠ Ersteller), sonst parken; Pause bei 6 ungeposteten; 4. Fertig → Bereit zum Posten, MP4 per SendUserFile; 5. Tagesbericht docs/berichte/<datum>.md + meta/report; 6. Konflikte → docs/prompts/konflikte.md; 7. nichts zu tun → ein Satz.

## Nutzer 18.11.2026: „Bitte ab jetzt immer automatisch in eine neue Sitzung wechseln“
Dauerregel: nach jedem fertigen Video und sobald der Verlauf lang ist, ohne Rückfrage wechseln (Ablauf oben). Die Sitzung session_01UNp77QHeWKBPJK78ThrGyX hat Tiefe 8 und kann keine Sitzung/keinen Abholer anlegen → erst die nächste vom Nutzer gestartete Sitzung (Tiefe 0) kann den Wechsel automatisch ausführen und den Abholer umziehen.
- 21.11.2026 Video 2 (session_01UNp77PDyyPk6Bk6BDFgKHu, Slot 22.11. B): Thema belegt = **suche-stadt** „In This City, Your Last Search Is Read at Your Funeral“ (Tod/Beerdigung, Suchverlauf). Andere Sitzungen bitte andere Prämisse.
