# Video-Paket „In This City, If You Ghost Someone, You Turn Invisible“ (`ghost-stadt`, 23.11.2026)

Format: „In This City“ + schwarzer Humor, US-Slang, Teil-Piep (CLAUDE.md). Video 2 vom 23.11., Upload-Slot **25.11.2026 A**.
Drehbuch `episodes/ghost-stadt.json` · Szenen `src/episode/scenes/ghosting.tsx` (Komposition `GhostStadt`) · Audit `docs/audit-ghost-stadt.md` · Publish `docs/veroeffentlichung/publish-ghost-stadt.json`.

## Prämisse
„In this city, if you ghost someone, you turn invisible.“ Konsequenz Verschwinden (kein Tod, keine Peinlichkeit, kein Altern). Reine Fiktion, keine Marken, keine fremden Figuren.

## Szenen (Zeiten s, fertiges Video)
| Szene | Zeit | Text | Bild |
|---|---|---|---|
| hook | 0,1–4,2 | In this city, if you ghost someone, you turn invisible. | Chat-Blase, Grinsen, Wischen, „gelesen“-Auge, Füße verblassen · POOF: nur das Handy schwebt, Passantin läuft durch |
| rules | 4,2–11,1 | Leave a text on read? Your hands go first. Ghost a date? Bro is a floating hoodie. | Café: Hände weg, Tasse/Handy schweben · Restaurant: Date mit Rosen vor leerem Hoodie · Hoodie schlürft, Date weint |
| landlord | 11,1–17,0 | The landlord ghosted his tenants for ten years. Now he's just a voice that says rent is due. | Bröckelndes Haus, Mieter mit Eimern · schwebender Hut + Zigarre, Schall-Ringe · Räumungsblatt unter der Tür, Schrei |
| jake | 17,0–26,0 | This is Jake. Forty-three unread chats. His legs are already gone. Can he answer them all before midnight erases him? | Jake grinst · Inbox voller roter Punkte, verschwommener Chat unten (Plant) · Beine nur noch Schimmer, Socken am Boden · Uhr 19 Uhr, Schweiß |
| mom | 26,0–31,1 | Chat one, his mom. "Sorry, been busy." His knees come back. | Daumen sendet · Mom tippt heulend eine Endlos-Rolle · Knie kehren mit Funkeln zurück, Jubel |
| ex | 31,1–36,7 | Chat two, his ex. She leaves him on read and vanishes out of pure spite. | Winke-Blase · Ex rollt die Augen, „gelesen“ · Ex verschwindet grinsend, Zunge raus, Handy schwebt |
| panic | 36,7–43,6 | Eleven fifty-nine. Bro is down to eyebrows and a thumb. One chat left. Unknown sender. | Uhr 23:59 rot · nur Brauen + Daumen über dem Handy · letzter Chat = der verschwommene von vorhin |
| twist | 43,6–51,3 | It's Jake. Five years ago. "Please don't become that guy." Jake reads it, and leaves himself on read. | Avatar = Jung-Jake · Sepia-Rückblende: Jung-Jake tippt · Brauen traurig, Daumen zögert · Wischen, „gelesen“, Brauen weg, Handy fällt |
| gone | 51,3–54,0 | Gone. What the f***, Jake. | Leere Couch, Uhr 12, Handy am Boden · Katze springt auf den unsichtbaren Jake, faucht |
| after | 54,0–59,2 | Honestly? Nothing changed. His boss lowkey still hasn't noticed. | Chef redet zum leeren Stuhl mit schwebender Tasse · klopft auf Luft, Tasse nimmt einen Schluck |
| outro | 59,2–63,4 (+ End-Card bis 65,4) | Anyway, you watched all of this and didn't comment. Check your hands. | POV Handy mit Hoodie-Vorschau · Daumen des Zuschauers verblasst (Loop zum Hook) |

Schnitt-/Reiz-Takt (s, aus timeline + captions mit denselben Wortankern wie im Code, + Poofs/Piep): 0,1 · 2,9 · 3,1 · 4,2 · 7,6 · 9,3 · 10,1 · 11,1 · 14,1 · 15,5 · 17,0 · 18,5 · 20,6 · 22,5 · 26,0 · 28,0 · 29,5 · 31,1 · 33,1 · 35,1 · 36,7 · 38,3 · 40,6 · 43,6 · 44,6 · 48,2 · 49,4 · 51,3 · 52,5 · 52,9 · 54,0 · 57,9 · 59,2 · 61,4 → größter Abstand 3,9 s (Einstellung „after“ 1, darin Rede-Gestik + schwebende Tasse).

## Titel-/Hook-Varianten
1. **In This City, If You Ghost Someone, You Turn Invisible** (gewählt)
2. He Had Until Midnight to Answer 43 Chats
3. The Last Unread Message Was From Himself

## Caption + Hashtags
Siehe `docs/veroeffentlichung/publish-ghost-stadt.json` (identisch im Dashboard, Dokument `videos/ghost-stadt`; Reichweite der Hashtags unbelegt).

## Regie
- Stimme `am_michael` (Chatterbox), Preset `witzig`, ironic/tense/playful/serious je Szene; speed 1,0, `gap_ms` 480–500; danach `insert_pauses` (+100 ms an 28 Satzenden, +400 ms nach „busy.“) und `retime_pauses --cap 700 --tail 280` → 2,33 W/s, Satzpausen-Median 460 ms.
- Untertitel `phrase-yellow`; Musik `dark` (E-Moll, 82 BPM, Seed 23360), geduckt (Median 13,5 dB), stereo (Side/Mid −8,2 dB) + Sub +7 dB. Bett: Basstreffer bei „invisible“ und „himself“, Glocke bei „Gone“, Poofs 3,08 / 10,06 / 35,06 / 49,42 s, Teil-Piep „fuck“ 52,89 s 300 ms (Stimme dort stumm; „f“ 52,81–52,87 s hörbar, per Spektrum geortet), stereo + Sub +9 dB. Stimme leicht breit (Side ab 900 Hz, −15,6 dB).
- Final: finalize.sh → EQ −3,5 dB @ 6 kHz, +0,7 dB, `alimiter=limit=0.6:level=disabled` (4× überabgetastet).

## Upload (Slot A, 25.11.2026, Winterzeit überall)
TikTok 17:00 DE = 16:00 UTC → 11:00 New York · 08:00 Los Angeles · 16:00 London; YouTube 18:00 DE = 17:00 UTC → 12:00 · 09:00 · 17:00. Thumbnail: Bild 1 (Cover „GHOST = INVISIBLE“).
