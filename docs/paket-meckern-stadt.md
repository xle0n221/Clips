# Video-Paket „In This City, Every Time You Complain, You Age One Year“ (`meckern-stadt`, 23.11.2026)

Format: „In This City“ + schwarzer Humor, US-Slang, Teil-Piep (CLAUDE.md). Video 1 vom 23.11., Upload-Slot **24.11.2026 B**.
Drehbuch `episodes/meckern-stadt.json` · Szenen `src/episode/scenes/meckern.tsx` (Komposition `MeckernStadt`) · Audit `docs/audit-meckern-stadt.md` · Publish `docs/veroeffentlichung/publish-meckern-stadt.json`.

## Prämisse
„In this city, every time you complain, you age one year.“ Konsequenz Altern (kein Tod, keine Peinlichkeit). Reine Fiktion, keine Marken, keine fremden Figuren.

## Szenen (Zeiten s, fertiges Video)
| Szene | Zeit | Text | Bild |
|---|---|---|---|
| hook | 0,2–5,1 | In this city, every time you complain, you age one year. | Schirm klappt im Regen um, Meckerwolke · POOF: Mann alt (Bart, Stock) |
| rules | 5,1–13,2 | A guy said his soup was cold. His beard fell in the soup. The customer service hold line? Lowkey a nursing home. | Diner · Bart wächst in die Suppe · Warteschleife = Senioren mit Telefonen, Spinnweben |
| oldest | 13,2–17,5 | The oldest man here is thirty-one. He wrote online reviews. | Torte mit 31 Kerzen = Flammenmeer, Feuerlöscher · verschrumpelter Kritiker, Ein-Stern-Karten |
| tyler | 17,5–25,6 | This is Tyler, twenty-five, a professional complainer. Can he get through his worst Monday ever without one complaint? | Couch-Meckern · Gewitter nur über seinem Fenster, schwarze Katze · X-Tape + Daumen |
| coffee | 25,6–35,1 | Seven a.m., coffee all over his laptop. Tyler smiles. It's giving hostage video. Weird, one gray hair pops out anyway. | Kaffee flutet Laptop, Funken · Geisel-Lächeln · ein graues Haar springt heraus (Plant) |
| train | 35,1–42,8 | His train is an hour late. He says, "Wow, love that for me." Sarcasm counts, bro. Two more years. | Leeres Gleis + Schnecke · Doppeldaumen · Ohr wächst aus der Wand · POOF Bauch/graue Schläfen |
| boss | 42,8–48,6 | His boss steals his idea. Tyler says nothing. His left eye ages on its own. | Chef zeigt Glühbirnen-Zeichnung · Zuckauge + Faust · nur linkes Auge altert (Plant) |
| midnight | 48,6–53,0 | Midnight. He made it. Twenty-eight, looking great. | Uhr schlägt zwölf · Jubel + Konfetti |
| twist | 53,0–60,4 | Then he thinks, "Today was sh*t." Turns out, thoughts count. Forty-seven years at once. Bro is cooked. | Gedankenblase Gewitter + Haufen (Teil-Piep) · POOF · Greis, Bett kracht · Gebiss fällt |
| date | 60,4–64,7 | His date showed up anyway. She asked if his grandson was home. | Date mit Blumen, Greis mit Rollator · Date späht hoffnungsvoll vorbei, Blüten fallen |
| outro | 64,7–67,8 (+ End-Card bis 69,9) | So go ahead. Comment that this was too long. | POV Handy · Daumen tippt Kommentar und altert, graue Haare fallen aufs Display |

Gag-Takt (s, aus Schnitt-/Wortzeiten geschätzt): 0,0 · 0,2 · 3,2 · 5,5 · 7,4 · 8,0 · 9,3 · 10,8 · 12,6 · 13,5 · 14,4 · 15,5 · 17,3 · 18,5 · 20,5 · 21,5 · 23,0 · 25,3 · 26,3 · 27,8 · 30,6 · 31,8 · 34,6 · 36,0 · 38,6 · 40,6 · 42,4 · 44,1 · 46,0 · 48,5 · 50,4 · 52,5 · 54,5 · 54,8 · 56,6 · 58,6 · 60,4 · 61,6 · 63,0 · 64,6 · 66,0 → größter Abstand ≈ 2,8 s.

## Titel-/Hook-Varianten
1. **In This City, Every Time You Complain, You Age One Year** (gewählt)
2. He Survived Monday Without Complaining. Then He Thought About It.
3. The Oldest Man in This City Is 31

## Caption + Hashtags (identisch im Dashboard, Dokument `videos/meckern-stadt`)
Siehe `docs/veroeffentlichung/publish-meckern-stadt.json` (YouTube-Titel/Beschreibung, TikTok-Caption, 5 Hashtags – Reichweite unbelegt).

## Regie
- Stimme `am_michael` (Chatterbox), Preset `witzig`, ironic/playful/tense/triumphant je Szene; speed 1,0, `gap_ms` 480–500, danach `retime_pauses --cap 560 --tail 280` (70,66 → 69,78 s).
- Untertitel `phrase-yellow`; Musik `chill` (Es-Dur, 88 BPM, Seed 35863), geduckt (Median 14,3 dB). Bett: Basstreffer bei „age“ und „Forty-seven“; Glocken-Akzent „Midnight“; Poofs 3,22 / 7,37 / 40,60 / 54,78 s; Teil-Piep „shit“ 54,56 s 330 ms (Stimme dort stumm; „sh“ 54,34–54,58 s hörbar, per Spektrum geortet).
- Final: finalize.sh → EQ −3,5 dB @ 6 kHz, +0,7 dB, `alimiter=limit=0.6:level=disabled` (4× überabgetastet) → −14,9 LUFS / −3,9 dBFS.

## Upload (Slot B, 24.11.2026, Winterzeit überall)
TikTok 22:00 DE = 21:00 UTC → 16:00 New York · 13:00 Los Angeles · 21:00 London; YouTube 23:00 DE = 22:00 UTC → 17:00 · 14:00 · 22:00. Thumbnail: Bild 1 (Cover „COMPLAIN = +1 YEAR“, Schirm klappt um).
