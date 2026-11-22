# Video-Paket „In This City, Every Time You Swear, Your Mom Appears“ (`fluch-stadt`, 22.11.2026)

Format: „In This City“ + schwarzer Humor (CLAUDE.md „NÄCHSTE VIDEOS“). Video 2 vom 22.11., Upload-Slot **23.11.2026 B**.
Drehbuch `episodes/fluch-stadt.json` · Szenen `src/episode/scenes/fluch.tsx` (Komposition `FluchStadt`) · Audit `docs/audit-fluch-stadt.md` · Effekte `scripts/fx_events.py`.

## Prämisse und Abgrenzung
- Regel: „In this city, every time you swear, your mom appears.“ Konsequenz Peinlichkeit/Strafe, kein Tod (Abwechslung nach todo/suche/akku). Neu gegenüber allen `episodes/*.json`.
- Reine Fiktion, keine Marken, keine fremden Figuren.

## Szenen (Zeiten s)
| Szene | Zeit | Text | Bild |
|---|---|---|---|
| hook | 0,2–4,0 | In this city, every time you swear, your mom appears. | Hammer auf Daumen + Fluch-Blase/Piep · Poof: Mutter mit Hausschuh hinter Dave |
| rules | 4,0–12,7 | A surgeon swore once. His mom finished the surgery. A CEO swore at a meeting. Now his mom runs the company. It's doing better. | Chirurg flucht · Mutter operiert, Chirurg auf Hocker · CEO haut auf den Tisch · Mutter am Kopfende, Kurve schießt hoch |
| orphans | 12,7–16,7 | Only orphans swear freely here. Most of them became sailors. | Comic: Mann flucht, niemand kommt, grinst · Schiff voller fluchender Matrosen |
| dave | 16,7–25,4 | This is Dave, forty-three, grounded nine hundred times. Today, he gets married. Can he do it without one bad word? | Erwachsener auf Kinderbett, Strichlisten · Spiegel-Lächeln · Kirche, Reißverschluss-Mund |
| morning | 25,4–33,0 | Six a.m., he stubs his toe. Dave screams into a pillow, in total silence. His mom sits back down. | Zeh-ECU · lautloser Kissenschrei · Mutter setzt sich enttäuscht wieder |
| parking | 33,0–37,7 | Someone steals his parking spot. Dave says, "Fudge." His mom twitches. | Sportwagen klaut Lücke · Zwangslächeln · Mutters Auge zuckt |
| ring | 37,7–43,1 | At the altar, he drops the ring down a drain. The vein on his forehead says everything. | Ring hüpft in den Abfluss · Stirnader pocht |
| vows | 43,1–46,9 | "I do." He did it. Not one bad word. | Altar · Triumph mit Konfetti |
| twist | 46,9–56,2 | Then his bride stubs her toe and says, "Oh, [Piep]." Her mom appears, sees Dave, and swears. So her mom appears. | Brautschuh gegen Stufe · Braut flucht, Gäste entsetzt · Poof Schwiegermutter flucht Dave an · Poof winzige Oma mit Riesen-Hausschuh |
| chain | 56,2–61,4 | By dessert, there were forty-one moms. Dave got grounded by all of them. | 41 Mütter im Festsaal · Dave in der Ecke |
| outro | 61,4–65,5 (+ End-Card) | So, when did you last swear? Don't turn around. | POV: schwarzer Handybildschirm spiegelt Mutter mit Hausschuh hinter dem Zuschauer (Loop zum Hook-Poof) |

Gag-Takt (s): 0,2 · 2,8 · 5,9 · 9,0 · 10,1 · 11,8 · 14,6 · 15,8 · 19,6 · 21,5 · 24,5 · 27,0 · 28,5 · 30,3 · 32,2 · 34,0 · 35,6 · 36,8 · 39,7 · 41,9 · 43,3 · 44,5 · 48,3 · 50,3 · 51,4 · 53,6 · 55,0 · 57,9 · 60,7 · 62,9 · 64,6 → größter Abstand 3,8 s (≤ 5 s).

## Titel-/Hook-Varianten
1. **In This City, Every Time You Swear, Your Mom Appears** (gewählt)
2. He Didn't Swear Once at His Wedding. His Bride Did.
3. 41 Moms Showed Up to This Wedding

## Caption + Hashtags (identisch im Dashboard, Dokument `videos/welt-fluch-mutter`)
- YouTube-Titel: „In This City, Every Time You Swear, Your Mom Appears 🩴🤬“
- YouTube-Beschreibung: „An original animated dark-humor satire: in this city, every time you swear, your mom appears. Dave (43, grounded 900 times) has to get through his wedding without one bad word. Pure fiction – the city, the rule and all characters are invented. #shorts“
- TikTok-Caption: „In this city, every time you swear, your mom appears. When did YOU last swear? Don't turn around. 🩴🤬 (fiction)“
- Hashtags (≤ 5): #KnowToon #Animation #DarkHumor #MomsBeLike #InThisCity (Reichweite unbelegt – vor dem Posten gegenprüfen)

## Regie
- Stimme `am_michael` (Chatterbox), Preset `witzig`, `ironic`/`playful`, `tense` in morning/ring; speed 1,0, `gap_ms` 480–520 (Satzpausen-Regel).
- Untertitel `phrase-yellow`; Musik `funny` (G-Dur, 96 BPM, Seed 11140), Stille vor Twist und Schlusszeile, geduckt (Median 14,5 dB). Bett: Basstreffer bei „appears“ (hook, twist) und „forty-one“; Glocken-Akzent bei „bride“; 9 Pieps (Fluch „fuck“ 50,30 s 700 ms, Stimme dort stumm; Fluch-Blasen 0,07/5,20/9,24/14,62/16,16–16,68/54,08 s); 3 Poofs (2,74/51,28/54,64 s).
- Final: finalize.sh → EQ −3,5 dB @ 6 kHz, +0,7 dB, `alimiter=limit=0.6:level=disabled` (4× überabgetastet) → −14,6 LUFS / −3,8 dBFS.

## Upload (Slot B, 23.11.2026, Winterzeit überall)
TikTok 22:00 DE = 21:00 UTC → 16:00 New York · 13:00 Los Angeles · 21:00 London; YouTube 23:00 DE = 22:00 UTC → 17:00 · 14:00 · 22:00. Thumbnail: Bild 1 (Cover 0–0,5 s: „SWEAR = MOM APPEARS“, Dave schreit mit Hammer + Daumen).
