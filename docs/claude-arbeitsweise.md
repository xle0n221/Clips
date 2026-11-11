# Claude-Arbeitsweise (geprüfte Tipps, eingearbeitet 11.11.2026)

Anlass: Video des Nutzers (TikTok @aiagentgeorg, „Die Tipps vom Erfinder von Claude Code“, 62 s, Transkript per
faster-whisper). Jede Aussage wurde gegen die offizielle Claude-Code-Dokumentation geprüft (Abruf 11.11.2026).
Urheberschaft: „Boris Cherny, who created Claude Code at Anthropic“ – https://claude.com/office-hours.
Dass die Tipps von ihm stammen: **Ich kann das nicht bestätigen** (die Doku nennt keinen Autor).

| # | Aussage im Video | Prüfung | Beleg (wörtlich) |
|---|---|---|---|
| 1 | Größere Aufgaben im Plan Mode starten (Shift+Tab), Plan verbessern, dann bauen | **bestätigt** | „Enter plan mode by pressing `Shift+Tab`“ · „edits stay blocked until you approve the plan“ – https://code.claude.com/docs/en/permission-modes.md#analyze-before-you-edit-with-plan-mode |
| 2 | 3–5 Aufgaben parallel, jede in eigener Arbeitskopie | **teilweise**: Worktrees belegt, die Zahl „3–5“ nicht | „Each git worktree is a separate checkout on its own branch“ – https://code.claude.com/docs/en/common-workflows.md#run-parallel-sessions-with-worktrees |
| 3 | Nach Fehlern Regel in CLAUDE.md; Datei unter 200 Zeilen | **teilweise**: 200 Zeilen belegt; Korrekturen landen laut Doku in Auto-Memory, CLAUDE.md pflegt man selbst | „target under 200 lines per CLAUDE.md file.“ – https://code.claude.com/docs/en/memory.md#write-effective-instructions |
| 4 | Ein Claude schreibt, ein zweiter prüft | **bestätigt in der Sache** | „A second session is also the easiest independent reviewer you can get.“ – https://code.claude.com/docs/en/best-practices.md |

## So setzen wir es um (autonome Cloud-Sitzungen)
1. **Plan vor dem Bau.** Plan Mode blockiert, bis ein Mensch freigibt – für unbeaufsichtigte Läufe ungeeignet
   (`create_session` warnt ausdrücklich). Stattdessen der dokumentierte Weg „Plan als Datei, dann bauen“
   (best-practices.md): Bei Aufgaben über eine Datei/Szene hinaus schreibt der Agent zuerst einen Plan
   (max. 15 Zeilen: Dateien, Schritte, Risiken, Prüfung) in seine Antwort; der Orchestrator prüft ihn, erst dann wird gebaut.
   Beim Video ist das Drehbuch (Freigabe 1) bereits dieser Plan.
2. **Parallel nur mit Isolation.** Agenten, die gleichzeitig Code ändern, laufen mit `isolation: "worktree"`
   (https://code.claude.com/docs/en/sub-agents.md); Ergebnisse führt der Orchestrator zusammen. Agenten, die nur lesen/prüfen
   oder getrennte Dateien bearbeiten, brauchen das nicht. Grenze bleibt die CPU: **nur ein Render gleichzeitig**
   (Rom v3: unbemerkte Parallel-Vorschau verlängerte den Render von ~60 auf 80 min).
3. **Regeln kurz halten.** `CLAUDE.md` bleibt **unter 200 Zeilen** (aktuell < 40) und verweist nur; Details stehen in `docs/`.
   Lehren aus Fehlern kommen in die Rollen-Datei der betroffenen Rolle (`docs/agenten/*.md`, „Gelernt“), Wiederholtes in
   `docs/clip-regeln.md`. Unverzichtbares lieber als Prüfskript/Hook statt als Text (best-practices.md).
4. **Prüfpaare.** Unverändert Pflicht (`docs/agenten-team.md`). Prüfer bekommen frischen Kontext und arbeiten nur lesend
   (Doku: „a reviewer that can read but not edit“, sub-agents.md); der Ersteller setzt die Befunde um.
5. **Fremde Skills/Plugins/MCP-Server** vor dem Einbau mit `/skillspector` prüfen (`.claude/skills/skillspector/`).

## SkillSpector-Prüfung der Repo-Skills (11.11.2026, SkillSpector 2.12.0, `--no-llm`)
| Skill | Score | Empfehlung | Befunde | Urteil nach Quellprüfung |
|---|---|---|---|---|
| `clip-video` | 10/100 LOW | SAFE | 2× RP1 MEDIUM „`npx remotion` ohne gepinnte Version“ (SKILL.md Z. 80, 89) | **APPROVE** – `npx` nutzt die lokal installierte, per `package-lock.json` gepinnte Remotion-Version, kein MCP-Server |
| `skillspector` | 8/100 LOW | SAFE | 1× AS3 MEDIUM „Skill Enumeration“ (Z. 7) | **APPROVE** – Skills lesen ist der Zweck des Skills |
Neue Skills: vor dem Einbau `/skillspector`; Ergebnis hier eintragen.

## Automatik (Vorgabe des Nutzers, 11.11.2026)
> „Ab jetzt automatisiere alles und Umgebungen automatisch freigeben.“

- Keine Rückfragen im Chat. Fehlt etwas aus der Umgebung (gesperrter Host: Proxy-Antwort 403, fehlendes Werkzeug, langer
  Einrichtungsschritt), beantragt der Orchestrator die Änderung sofort selbst mit `update_environment`, nur mit genau den nötigen Hosts.
- Grenze, die Claude nicht aufheben kann: Jede Umgebungsänderung zeigt dem Nutzer eine Freigabe-Abfrage – laut Werkzeugbeschreibung
  „every time, in every permission mode“. Claude bestätigt sie nie selbst; der Nutzer muss sie in der App antippen.
- Fremde Plugins/Skills: `/plugin` gibt es in Cloud-Sitzungen nicht („/plugin isn't available in this environment“, 11.11.2026).
  Ersatz: Repo klonen, mit `/skillspector` prüfen, bei SAFE/APPROVE den Skill-Ordner nach `.claude/skills/<name>/` übernehmen, Ergebnis in die Tabelle oben.
