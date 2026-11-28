# Video-Paket „In This City, Every Minute You Doomscroll, You Shrink One Inch“ (`scroll-stadt`, 25.11.2026)

Format: „In This City“ + schwarzer Humor, US-Slang, Teil-Piep (CLAUDE.md). Video 1 vom 25.11., Upload-Slot **26.11.2026 A**.
Drehbuch `episodes/scroll-stadt.json` · Szenen `src/episode/scenes/scroll.tsx` (Komposition `ScrollStadt`) · Audit `docs/audit-scroll-stadt.md` · Publish `docs/veroeffentlichung/publish-scroll-stadt.json`.

## Prämisse
„In this city, every minute you doomscroll, you shrink one inch.“ Konsequenz Schrumpfen (kein Tod, keine Peinlichkeit, kein Altern, keine Unsichtbarkeit). Reine Fiktion, keine Marken, keine fremden Figuren.

## Szenen (Zeiten s, fertiges Video)
| Szene | Zeit | Text | Bild |
|---|---|---|---|
| hook | 0,1–4,8 | In this city, every minute you doomscroll, you shrink one inch. | Sofa + Messlatte: jeder Wisch = eine Stufe kleiner · POOF: winzig auf dem Kissen, Handy größer als er, scrollt weiter |
| rules | 4,8–12,0 | Morning bus? Hamster-sized adults. Dating apps don't ask your height. They ask your screen time. | Bus mit Riesensitzen, Mini-Pendler, einer hüpft zum Halteknopf · Dating-Profil: Lineal durchgestrichen · Nah: Bildschirmzeit-Balken läuft über, X |
| grandpa | 12,0–17,0 | The tallest man in town? Grandpa. Flip phone. Unbearable. | Opa ragt über die Dächer · klappt das Klapphandy zu, nippt aus Riesentasse |
| tyler | 17,0–22,7 | This is Tyler. Four feet. Interview at nine. Will there be anything left of him? | Tyler im Anzug an der Messlatte, Daumen hoch · Wecker 7 + Termin-Karte 9 · Handy vibriert nachts, Tyler schwitzt |
| ex | 22,7–28,5 | Seven a.m. "Your ex posted." Thirty minutes later, bro is cat-sized. | Benachrichtigung, Daumen tippt · schrumpft stufenweise im Bett · Nase an Nase mit der Katze |
| pigeon | 28,5–32,7 | He rides a pigeon downtown. The pigeon is also on its phone. | Ritt über die Stadt · Taube scrollt, Laternen-Crash |
| lobby | 32,7–37,5 | Eight fifty-nine. The elevator button is a mountain. Bro does parkour. | Uhr 8:59 · Lobby, Hausmeister mit Staubsauger läuft durch (Plant) · Parkour-Salto, Knopf leuchtet |
| interview | 37,5–42,2 | "Where do you see yourself in five years?" Tyler checks his phone. Cooked. | Riesensessel, Frage aus dem Off · Handy raus · POOF zum Punkt |
| twist | 42,2–48,1 | Two inches. He looks around. The whole company is two inches tall. Hired instantly. | Zwischen Stift und Tasse · Mini-Büro auf dem Tisch, Chefin winkt · Handschlag + Konfetti |
| gone | 48,1–55,7 | Day one, the janitor walks in. No phone. He vacuums the entire marketing department. Oh f***. | Riese im Türrahmen · Kopfhörer, kein Handy · Düse saugt Büro + Leute ein · leerer Tisch, Krawatte trudelt |
| outro | 55,7–61,2 (+ End-Card bis 63,3) | Tyler's fine. He lives in the vacuum bag now, watching a video called "In this city..." | Staubbeutel-Galaxie, alle scrollen · Tyler grinst aufs Handy · Handy zeigt Bild 1, Kamera fährt hinein (Loop) |

Schnitt-/Reiz-Takt (s, aus timeline + captions mit denselben Wortankern wie im Code, + Poofs/Piep): 0,1 · 3,9 · 4,0 · 4,8 · 7,8 · 10,0 · 12,0 · 13,9 · 17,0 · 19,4 · 20,6 · 22,7 · 25,4 · 26,8 · 28,5 · 30,5 · 32,7 · 34,1 · 36,2 · 37,5 · 39,8 · 41,3 · 41,4 · 42,2 · 44,6 · 47,0 · 48,1 · 50,4 · 51,5 · 51,8 · 54,3 · 54,8 · 55,7 · 58,5 · 59,5 → größter Abstand 3,8 s (hook → Bild 1, darin Schrumpf-Stufen alle ≈ 0,7 s).

## Titel-/Hook-Varianten
1. **In This City, Every Minute You Doomscroll, You Shrink One Inch** (gewählt)
2. He Had a Job Interview at 9. He Also Had TikTok.
3. The Whole Company Was Two Inches Tall

## Caption + Hashtags
Siehe `docs/veroeffentlichung/publish-scroll-stadt.json` (identisch im Dashboard, Dokument `videos/scroll-stadt`; Reichweite der Hashtags unbelegt).

## Regie
- Stimme `am_michael` (Chatterbox), Preset `witzig`, ironic/tense/playful/serious je Szene; speed 1,0, `gap_ms` 480–500; danach `insert_pauses` (+80 ms an 18 Satzenden), `retime_pauses --cap 700 --tail 280`, `insert_pauses` (+40 ms an 16 Satzenden) → 2,30 W/s, Satzpausen-Median 470 ms.
- Untertitel `phrase-yellow`; Musik `funny` (G-Dur, 96 BPM, Seed 60490), geduckt (Median 13,8 dB), stereo (Side/Mid −10,5 dB) + Sub +10 dB. Bett: Basstreffer bei „inch“ und „company“ (−8 dB), Glocke bei „instantly“ (−9 dB), Poofs 3,96 / 26,82 / 41,37 s, Staubsauger-Wusch 51,81 s (1,4 s, −5 dB), Teil-Piep „fuck“ 54,79 s 260 ms (Stimme dort stumm; „f“ 54,57–54,77 s hörbar, per Spektrum geortet), stereo 0,7 + Sub +12 dB. Stimme leicht breit (Side ab 900 Hz, width 0,48).
- Final: finalize.sh → EQ −3,5 dB @ 6 kHz, +0,7 dB, `alimiter=limit=0.6:level=disabled` (4× überabgetastet).

## Upload (Slot A, 26.11.2026, Winterzeit überall)
TikTok 17:00 DE = 16:00 UTC → 11:00 New York · 08:00 Los Angeles · 16:00 London; YouTube 18:00 DE = 17:00 UTC → 12:00 · 09:00 · 17:00. Thumbnail: Bild 1 (Cover „SCROLL = SHRINK“).
