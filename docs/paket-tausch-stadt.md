# Video-Paket „In This City, on Black Friday, You Can Trade In Your Family“ (`tausch-stadt`, 26.11.2026)

Format: „In This City“ + schwarzer Humor, US-Slang, Teil-Piep (CLAUDE.md). Video 2 vom 26.11., Upload-Slot **27.11.2026 B** (Black Friday).
Drehbuch `episodes/tausch-stadt.json` · Szenen `src/episode/scenes/tausch.tsx` (Komposition `TauschStadt`) · Audit `docs/audit-tausch-stadt.md` · Publish `docs/veroeffentlichung/publish-tausch-stadt.json`.

## Prämisse
„In this city, on Black Friday, you can trade in your family.“ Konsequenz **Tausch**. Reine Fiktion, keine Marken, keine fremden Figuren, keine Eigennamen.

## Szenen (Schnitte s)
hook 0,13 / 3,23 · rules 4,23 / 6,63 · guy 8,37 / 10,63 · line 13,97 / 16,43 · scan 18,33 · sister 21,33 / 23,30 · mom 24,87 / 27,17 · print 28,80 / 31,73 · deluxe 32,90 / 35,00 · creepy 37,93 / 39,23 · back 42,37 / 45,30 · twist 47,07 / 48,87 / 50,67 · dog 52,07 / 53,80 · shelf 55,70 / 57,17 · outro 59,30 / 61,27 · End-Card 63,7 → 30 Einstellungen, max 3,33 s, Ø 2,12 s; jeder Schnitt mit Whoosh (`cutWhoosh` in soundBed.fx).

## Titel-/Hook-Varianten
1. **In This City, on Black Friday, You Can Trade In Your Family** (gewählt)
2. He Traded In His Whole Family. Then He Read the Fine Print.
3. Black Friday Deal: Return Your Uncle for Socks

## Regie
- Stimme `am_michael` (Chatterbox), Preset `witzig`, ironic/playful/tense/serious/indignant je Szene; gap_ms 480–500; `insert_pauses` an 5 Satzenden → 2,39 W/s, Satzpausen-Median 510 ms.
- Musik `funny` (F-Dur, 100 BPM, Seed 8359), geduckt (Median 13,7 dB), stereo (2. Durchlauf width 1,0 ab 200 Hz) + Sub +10 dB. Bett: Basstreffer „family“/„him“ (−1 dB), Glocke „traded“, Laser-Pieps 2,6 kHz, Poofs, 29 Schnitt-Whooshes, Teil-Piep „fuck“ ab Vokal (+260 ms, 230 ms), stereo 0,7 + Sub +12 dB; Stimme width 0,48 ab 900 Hz.
- Final: finalize.sh → EQ −3,5 dB @ 6 kHz, +0,7 dB, `alimiter=limit=0.6:level=disabled` (4× überabgetastet).

## Upload (Slot B, 27.11.2026, Winterzeit überall)
TikTok 22:00 DE = 21:00 UTC → 16:00 New York · 13:00 Los Angeles · 21:00 London; YouTube 23:00 DE = 22:00 UTC → 17:00 · 14:00 · 22:00. Thumbnail: Bild 1 (Cover „TRADE IN YOUR FAMILY“).
