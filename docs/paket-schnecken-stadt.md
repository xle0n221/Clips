# Video-Paket „In This City, If You Text "On My Way" From Bed, You Turn Into a Snail“ (`schnecken-stadt`, 26.11.2026)

Format: „In This City“ + schwarzer Humor, US-Slang, Teil-Piep (CLAUDE.md). Video 1 vom 26.11., Upload-Slot **27.11.2026 A**.
Drehbuch `episodes/schnecken-stadt.json` · Szenen `src/episode/scenes/schnecke.tsx` (Komposition `SchneckenStadt`) · Audit `docs/audit-schnecken-stadt.md` · Publish `docs/veroeffentlichung/publish-schnecken-stadt.json`.

## Prämisse
„In this city, if you text 'on my way' from bed, you turn into a snail.“ Konsequenz **Verwandlung** (kein Tod, keine Peinlichkeit, kein Altern, keine Unsichtbarkeit, kein Schrumpfen, keine Bürokratie). Reine Fiktion, keine Marken, keine fremden Figuren.

## Szenen (Zeiten s, Zeitachse)
| Szene | Zeit | Text | Bild |
|---|---|---|---|
| hook | 0,0–5,4 | In this city, if you text "on my way" from bed, you turn into a snail. | Kyle im Bett schickt die Renn-Blase (0,3 s), Schneckenhaus springt auf (0,5 s) · nah: Augen wandern auf Stiele, Schleim tropft · ganze Schnecke, Decke fliegt weg |
| rules | 5,4–11,8 | Five minutes out? Eye stalks. Almost there? Bro is leaving slime on the bus. | Sofa: Frau im Bademantel, Augen auf Stiele · Bus total: halbe Schnecke rutscht, Pendler schreien · nah: Schleimfuß + Warnschild |
| mayor | 11,8–17,6 | The mayor said "on my way" in 2019. He's still crawling to the ribbon cutting. | Rathausplatz: Menge mit Bärten, Spinnweben an der Schere, Bürgermeister-Schnecke vorn · nah: Zylinder, Schärpe, Schweiß |
| devin | 17,6–28,2 | This is Devin. Dinner with her parents at seven. It's seven. He's in bed, typing on my way. Can he get there before he's all shell? | Devin winkt im Bett (Chips) · Wanduhr 7 · Handy: Daumen sendet · Haus wächst, Sprung aus dem Bett mit Strauß |
| traffic | 28,2–33,4 | Seven fifteen. "Stuck in traffic." His legs merge into one foot. | leere Straße (Steppenläufer), Auto-Blase · Beine verschmelzen, Schuhe fliegen |
| pigeon | 33,4–37,7 | Seven forty. A pigeon looks at him like he's brunch. | Park · Riesen-Taube mit Serviette + Gabel, Devin verkriecht sich |
| door | 37,7–41,6 | Eleven. Devin, full snail, slimes up to the door. | Nachtstraße, Schleimspur, welker Strauß · Stielauge drückt Klingel |
| twist | 41,6–49,2 | It opens. Her parents are snails. She's a snail. Nobody left the house. They all texted on my way. | Tür auf: Eltern-Schnecken, kalter Braten · Maya-Schnecke, Handy am Stielauge · vier Handys mit derselben Renn-Blase |
| gone | 49,2–53,1 | Bro, the whole family is shells. What the f***. | Esszimmer, Kerzenstummel, Spinnweben · nah: Devins Schrei |
| after | 53,1–57,9 | They're engaged now. The wedding is lowkey set for whenever. | Ring am Stielauge · Kapelle: Gäste-Schnecken kriechen herein, Kalenderblätter fliegen |
| outro | 57,9–62,9 (+ End-Card) | You texted "on my way" ten minutes ago. Why's your phone slimy? | POV-Handy mit Bild 1 (Loop) + eigener Renn-Blase · Schleim läuft über den Bildschirm, Schneckenhaus aus dem Ärmel |

Schnitte (s, aus timeline + captions mit denselben Wortankern wie im Code): 0 · 2,49 · 4,36 · 5,39 · 7,23 · 8,62 · 11,83 · 14,44 · 17,59 · 21,28 · 23,50 · 24,70 · 28,19 · 30,43 · 33,38 · 34,05 · 37,72 · 39,70 · 41,59 · 43,95 · 46,74 · 49,22 · 50,98 · 53,06 · 54,02 · 57,86 · 60,01 → 27 Einstellungen, max 3,84 s, Ø 2,33 s. Zusätzliche Reize: Haus-Pop 0,5 · Poofs 4,40 / 6,74 / 24,71 / 32,52 / 40,87 · Basstreffer 4,38 / 43,94 · Glocke „texted“ · Teil-Piep 52,20.

## Titel-/Hook-Varianten
1. **In This City, If You Text "On My Way" From Bed, You Turn Into a Snail** (gewählt)
2. He Texted "On My Way" From Bed. Big Mistake.
3. Never Text "OMW" From Bed in This City

## Caption + Hashtags
Siehe `docs/veroeffentlichung/publish-schnecken-stadt.json` (identisch im Dashboard, Dokument `videos/schnecken-stadt`; Reichweite der Hashtags unbelegt).

## Regie
- Stimme `am_michael` (Chatterbox), Preset `witzig`, ironic/tense/playful/serious je Szene; speed 1,0, `gap_ms` 480–500; danach `insert_pauses` nur an den 12 Satzenden mit < 490 ms Stille (Pegel gemessen, +40…290 ms) → 2,40 W/s, Satzpausen-Median 490 ms.
- Untertitel `phrase-yellow`; Musik `funny` (Fis-Dur, 88 BPM, Seed 44383), geduckt (Median 13,8 dB), stereo (2. Durchlauf width 1,0 ab 200 Hz) + Sub +10 dB. Bett: Basstreffer „snail“/„She's“, Glocke „texted“, Poofs, Teil-Piep „fuck“ 52,20 s 300 ms (Stimme dort stumm; „f“ 52,03–52,20 s hörbar, per Spektrum geortet: > 76 % Energie über 3 kHz), stereo 0,7 + Sub +12 dB. Stimme leicht breit (Side ab 900 Hz, width 0,48).
- Final: finalize.sh → EQ −3,5 dB @ 6 kHz, +0,7 dB, `alimiter=limit=0.6:level=disabled` (4× überabgetastet).

## Upload (Slot A, 27.11.2026, Winterzeit überall)
TikTok 17:00 DE = 16:00 UTC → 11:00 New York · 08:00 Los Angeles · 16:00 London; YouTube 18:00 DE = 17:00 UTC → 12:00 · 09:00 · 17:00. Thumbnail: Bild 1 (Cover „OMW = SNAIL“).
