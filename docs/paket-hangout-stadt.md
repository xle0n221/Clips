# Video-Paket „In This City, "We Should Hang Out Sometime" Is Legally Binding“ (`hangout-stadt`, 25.11.2026)

Format: „In This City“ + schwarzer Humor, US-Slang, Teil-Piep (CLAUDE.md). Video 2 vom 25.11., Upload-Slot **26.11.2026 B**.
Drehbuch `episodes/hangout-stadt.json` · Szenen `src/episode/scenes/hangout.tsx` (Komposition `HangoutStadt`) · Audit `docs/audit-hangout-stadt.md` · Publish `docs/veroeffentlichung/publish-hangout-stadt.json`.

## Prämisse
„In this city, if you say 'we should hang out sometime,' it's legally binding.“ Konsequenz Bürokratie/Vertragszwang (kein Tod, keine Peinlichkeit, kein Altern, keine Unsichtbarkeit, kein Schrumpfen). Reine Fiktion, keine Marken, keine fremden Figuren.

## Szenen (Zeiten s, Zeitachse)
| Szene | Zeit | Text | Bild |
|---|---|---|---|
| hook | 0,1–4,9 | In this city, if you say "we should hang out sometime," it's legally binding. | Straße: zwei verabschieden sich, Beamter fällt von oben, Stempel KNALL (0,6 s), Handschellen-Kette · Nah: Vertrag + rotes Siegel, beide starren |
| rules | 4,9–10,1 | Skip a brunch you promised? Three to five years. Of brunch. | Gericht, Hammer · Brunch-Knast hinter Gittern, Häftlinge essen Pancakes |
| exes | 10,1–14,6 | Exes don't say "let's stay friends" anymore. That's a life sentence. | Parkbank: er hält ihr panisch den Mund zu · Jahrzehnte später: beide alt, immer noch angekettet |
| marcus | 14,6–22,1 | This is Marcus. Professional people pleaser. Last weekend he said it forty times. Can he survive one Saturday? | Marcus Daumen hoch · Straße, winkt jedem, Strichliste wächst auf 40 · Nah: Schweiß |
| clerk | 22,1–29,2 | Saturday, six a.m. The city clerk delivers his schedule. Forty hangouts. Court-ordered. | Wecker 6 · Beamter rollt endlose Liste aus · Stempel KNALL auf die Liste |
| rush | 29,2–36,7 | Coffee with his dentist. Gym with a guy he met once. Karaoke with his ex. Lowkey, her lawyer came too. | Café: Mundspiegel beim Kaffee · Gym: Hantel, Fremder brüllt · Karaoke: Ex schreit, Anwältin singt Backing |
| cooked | 36,7–41,5 | By noon, his social battery is literally smoking. Bro is cooked. | Akku rot blinkend, Kopf raucht · Faceplant, Beamter hakt ab |
| twist | 41,5–47,9 | Then, a loophole. One giant party. All forty people. Technically, one hangout. | Glühbirne · Riesenparty mit allen · grünes Häkchen-Siegel |
| clerk2 | 47,9–52,8 | The clerk approves it, waves goodbye, and says, "We should hang out sometime." | Beamter winkt an der Tür · Nah: er sagt es, Party friert grau ein |
| gone | 52,8–59,0 | Oh f***. Two clerks crash through the ceiling. Now he's chained to Marcus. For life. | Gesicht wird grün · Decke bricht, zwei Beamte + Stempel · Beamter schluchzt, an strahlenden Marcus gekettet |
| outro | 59,0–65,2 (+ End-Card) | They're roommates now. Marcus owes him rent. He just said, "I'll pay you back sometime." | Sofa, Mietrechnung, Chips · Nah: Marcus sagt es · Decke reißt, Stempel fällt → harter Schnitt auf Bild 1 (Loop) |

Schnitte (s, aus timeline + captions mit denselben Wortankern wie im Code): 0 · 3,62 · 4,90 · 8,09 · 10,06 · 12,97 · 14,55 · 17,67 · 20,32 · 22,08 · 24,30 · 25,89 · 29,22 · 30,95 · 33,13 · 36,69 · 40,21 · 41,47 · 42,99 · 45,79 · 47,87 · 51,07 · 52,80 · 53,61 · 55,98 · 59,02 · 62,50 · 64,40 → 28 Einstellungen, max 3,62 s, Ø 2,36 s. Zusätzliche Reize: Stempel-Knall 0,61 · Basstreffer 3,61 / 54,92 · Poofs 28,01 / 40,48 / 65,07 · Glocke „hangout“ · Teil-Piep 53,04.

## Titel-/Hook-Varianten
1. **In This City, "We Should Hang Out Sometime" Is Legally Binding** (gewählt)
2. He Said "Let's Hang Out" 40 Times. The Court Noticed.
3. Never Say "We Should Hang Out Sometime" in This City

## Caption + Hashtags
Siehe `docs/veroeffentlichung/publish-hangout-stadt.json` (identisch im Dashboard, Dokument `videos/hangout-stadt`; Reichweite der Hashtags unbelegt).

## Regie
- Stimme `am_michael` (Chatterbox), Preset `witzig`, ironic/playful/tense/serious je Szene; `gap_ms` 480–500; danach `retime_pauses --cap 800 --tail 280`, `atempo 1,03` (Zeiten mitskaliert), `insert_pauses` (+220 ms an 4 zu kurzen Satzenden, +100/+150 an 3), 60-ms-Ausblendung an 2 harten Kanten → 2,30 W/s, Satzpausen-Median 450 ms.
- Untertitel `phrase-yellow`; Musik `funny` (F-Dur, 100 BPM, Seed hangout-stadt), geduckt, stereo (2. Durchlauf width 1,0 ab 200 Hz) + Sub +10 dB. Bett: Stempel-Knall 0,61 s (−7 dB), Basstreffer „legally“/„ceiling“ (−8 dB), Glocke „hangout“ (−9 dB), Poofs, Teil-Piep „fuck“ 53,04 s 290 ms (Stimme dort stumm; „f“ 52,92–53,03 s hörbar, per Spektrum geortet: > 85 % Energie über 3 kHz), stereo 0,7 + Sub +12 dB. Stimme leicht breit (Side ab 900 Hz, width 0,48).
- Final: finalize.sh.

## Upload (Slot B, 26.11.2026, Winterzeit überall)
TikTok 22:00 DE = 21:00 UTC → 16:00 New York · 13:00 Los Angeles · 21:00 London; YouTube 23:00 DE = 22:00 UTC → 17:00 · 14:00 · 22:00. Thumbnail: Bild 1 (Cover „FAKE PLANS = LAW“).
