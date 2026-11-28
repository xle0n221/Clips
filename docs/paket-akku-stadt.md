# Video-Paket „In This City, When Your Phone Dies, You Die“ (`akku-stadt`, 22.11.2026)

Format: „In This City“ + schwarzer Humor (CLAUDE.md „NÄCHSTE VIDEOS“). Video 1 vom 22.11., Upload-Slot **23.11.2026 A**.
Drehbuch `episodes/akku-stadt.json` · Szenen `src/episode/scenes/akku.tsx` (Komposition `AkkuStadt`) · Audit `docs/audit-akku-stadt.md`.

## Prämisse und Abgrenzung
- Regel: „In this city, when your phone dies, you die.“ Akku nur auf dem Handy (keine Zahl über dem Kopf), keine Handy-/App-Marken.
- Neu gegenüber früheren Regeln (Zeit, Tor, Schwerkraft, Gähnen, Lügen, To-do, Suchverlauf).
- Tabus (`docs/prompts/innenwelt-cartoon.md`): keine realen Personen, niemand wählt den Tod, keine Opfergruppe, kein Horror; Fluch „shit“ stummgeschaltet + Piep (39,24 s, 580 ms).

## Szenen (gemessene Timeline, Sprechzeit 65,7 s + End-Card 2 s)
| Szene | Zeit | Voiceover | Bild / Gag |
|---|---|---|---|
| hook | 0,1–3,2 | In this city, when your phone dies, you die. | 1 % blinkt → schwarz → Mann kippt steif um, Geist mit totem Handy |
| rules | 3,2–12,2 | So nobody here says "my phone is dying." They say goodbye. Power banks are life support. And the old man with the flip phone? He's 140. | Sterbebett mit 2 % · Klinik mit Powerbank-Tropf · Opa mit Klapphandy, Torte, Geister-Freunde |
| gary | 12,2–18,1 | This is Gary. Nine percent. Three miles from his charger. Can Gary make it home? | Büroausgang, 9 % · Karte mit Weg zum leuchtenden Haus |
| lowpower | 18,1–24,2 | First, Low Power Mode. Gary dims himself. He walks slower. He stops blinking. | Gary wird grau · Schnecke überholt · Fliege landet auf dem Auge |
| chat | 24,2–32,1 | Then, the group chat. Forty-seven unread. Don't open it, Gary. Gary opens it. Four percent. Worth it. | Handy vibriert „47“ · Daumen zittert · Akku läuft aus · selige Lachtränen |
| stranger | 32,1–40,2 | A stranger has a charger! Wrong cable. The stranger is at a hundred percent. And laughing. Gary says, "Oh, [Piep]." | Heiligenschein-Fremder · Stecker verbiegt sich · grüne Aura + Smoothie · Zensurbalken |
| sprint | 40,2–46,4 | Two percent. Gary runs. Everything turns gray. His mom calls. He declines. | Sprint mit Speedlines · Welt wird grau · Anruf „MOM“ · kaltes Wegdrücken |
| home | 46,4–51,1 | One percent. The door. The outlet. He plugs in. | Tür kracht auf · Steckdose als Heiligtum · Funke, Gary sinkt selig hin |
| turn | 51,1–56,7 | The screen lights up. "Installing update. Do not turn off." Gary turns off. | Update-Rad · Lächeln gefriert · Brett-Sturz + Flatline-Ton |
| funeral | 56,7–62,3 | The funeral was lovely. Everyone brought a charger. His phone? A hundred percent. | Friedhof im Regen · Handys an der Steckdosenleiste auf dem Sarg · Grabstein mit leerem Akku, Handy 100 % |
| outro | 62,3–65,7 (+ End-Card) | So, how much battery do you have left? | POV: Handy des Zuschauers, 1 % blinkt (Loop zum Hook) |

Gag-Takt (Wortzeiten, s): 1,9 · 6,3 · 8,0 · 11,0 · 14,1 · 15,8 · 20,4 · 22,1 · 23,1 · 26,8 · 28,9 · 30,5 · 32,9 · 34,0 · 35,8 · 37,0 · 39,3 · 41,8 · 43,4 · 45,4 · 47,9 · 48,8 · 49,8 · 52,8 · 54,4 · 55,7 · 57,5 · 59,4 · 60,6 · 63,5 · 64,2 → größter Abstand 4,6 s (≤ 5 s).

## Titel-/Hook-Varianten
1. **In This City, When Your Phone Dies, You Die** (gewählt)
2. Never Let Your Phone Hit 1% in This City
3. Gary Made It Home at 1%. Then the Update Started.

## Caption + Hashtags (identisch im Dashboard, Dokument `videos/welt-akku-tod`)
- YouTube-Titel: „In This City, When Your Phone Dies, You Die 🔋💀“
- YouTube-Beschreibung: „An original animated dark-humor satire: in this city, when your phone dies, you die. Gary is at 9 % and three miles from his charger. Pure fiction – the city, the rule and all characters are invented. #shorts“
- TikTok-Caption: „In this city, when your phone dies, you die. Gary is at 9%. How much battery do YOU have left? 🔋💀 (fiction)“
- Hashtags (≤ 5): #KnowToon #Animation #DarkHumor #PhoneBattery #InThisCity (Reichweite unbelegt – vor dem Posten gegenprüfen)

## Regie
- Stimme `am_michael` (Chatterbox), Preset `witzig`, `ironic`/`playful`, `tense` in sprint/home; speed 1,0 (todo-stadt-Lehre).
- Untertitel `phrase-yellow`; Musik `dark` (F♯-Moll, 88 BPM, Seed 23181), Stille vor Twist und Schlusszeile, geduckt (Median 13,2 dB). Bett: Ticken (lauter in sprint/home), Basstreffer bei „you“, „plugs“, „off“; Piep 39,24 s; Flatline 880 Hz ab 56,15 s.
- Final: finalize.sh → EQ −3,5 dB @ 6 kHz, +0,7 dB, `alimiter=limit=0.6:level=disabled` → −14,8 LUFS / −1,9 dBTP.

## Upload (Slot A, 23.11.2026, Winterzeit überall)
TikTok 17:00 DE = 16:00 UTC → 11:00 New York · 08:00 Los Angeles · 16:00 London; YouTube 18:00 DE = 12:00 · 09:00 · 17:00. Thumbnail: Bild 1 (Cover 0–0,5 s: „PHONE DIES = YOU DIE“, Mann mit 1-%-Handy).
