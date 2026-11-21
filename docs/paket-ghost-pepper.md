# Video-Paket „What a Ghost Pepper Does Inside Your Body“ (`ghost-pepper`, 21.11.2026)

Format: Innenwelt-Cartoon, Prompt `docs/prompts/innenwelt-cartoon.md` (Nutzer 20.11.: „Benutze das, erstelle ein 30sek video als Beispiel“).
Thema wie vorgegeben (Ghost Pepper / Capsaicin-Gangster). Kein stärkeres Thema gewählt: Begründung – die Vorgabe deckt
alle Prompt-Bausteine ab (Körper als Ort, belegbarer Kern-Fakt mit Nobelpreis-Quelle, Ekel-/Fäkal-Pointe, Loop) und ist in
30 s erzählbar; eine Marktprüfung für ein stärkeres Thema hätte nur dünne Belege gebracht (Audit 20.11.: kein Ranking Nov. 2026 auffindbar).

Eingaben: Thema = Ghost Pepper im Körper · Länge = 30 s (gemessen 30,26 s inkl. End-Card 1,5 s) · Voiceover = Englisch, `am_michael`, Chatterbox.
Quellen: `docs/quellen-ghost-pepper.md`. Drehbuch: `episodes/ghost-pepper.json`. Szenen: `src/episode/scenes/ghost.tsx` (Komposition `GhostPepper`).

## Szenentabelle (Ausgabeformat des Prompts; Zeiten = gemessene Timeline)
Jeder Video-Prompt beginnt mit dem Stil-Block des Prompts („2D hand-drawn cartoon explainer animation, vertical 9:16. Simple doodle characters with huge round white heads … slight shake on impacts.“) – unten als **[STYLE]** abgekürzt. Negative: „3D, photorealistic, realistic humans, gore, horror lighting, messy lines, garbled text“. Umsetzung in Remotion/SVG, kein externer Generator.

| Szene | Dauer | Voiceover (wörtlich) | Visuelle Aktion | Hintergrund-Gag | Kamera | Video-Prompt (EN) |
|---|---|---|---|---|---|---|
| 1 Hook | 0,0–3,7 s | „This guy just ate a ghost pepper. His tongue filed a complaint.“ | Cover 0–0,5 s; Kerl beißt, Augen „><“, Dampf aus den Ohren, Kopf wird rot → Schnitt in den Mund: wütende Zunge knallt Beschwerde „COMPLAINT #4,817“ auf den Tresen | „BUY 1 GET 1 FREE“, „NO REFUNDS. NO SURVIVORS.“; im Mund „COMPLAINTS DEPT.“, „WAIT TIME: FOREVER“ | Push-in + Stoß beim Biss; Mund: leichter Push, Stoß beim Knall | [STYLE] Night food market stall with string lights, a white-headed guy bites a ghost pepper, >< eyes, steam from ears; cut inside his mouth, an angry tongue with a tiny face slams a complaint form on a counter between giant teeth |
| 2 Abtauchen | 3,7–8,8 s | „Down inside, meet Capsaicin. Small molecule. Huge attitude.“ | Fahrt durch den Rachen-Tunnel (Ringe, Glow) → Capsaicin (rotes Molekül, Fedora, Sonnenbrille, Goldkette, Zahnstocher) stolziert in die Club-Straße, Kette blitzt bei „Huge“ | Neon „CLUB NERVE“, Poster „TONIGHT: DJ SALIVA (AGAIN)“, Zuckerwürfel „SUGAR“ guckt beleidigt | Rotierende Dive-Fahrt; dann Push-in | [STYLE] Dive down a glowing throat tunnel into a neon nightclub street inside the body; a red molecule gangster with fedora, shades and gold chain struts toward camera |
| 3 Türsteher | 8,8–14,7 s | „He walks up to TRPV1, your heat sensor. Its one job? Yell when it's painfully hot.“ | Türsteher = lila Ionenkanal mit Gesicht + Namensschild „TRPV1“, Arme verschränkt → zeigt aufs Thermometer → brüllt (Strahlen, Wackeln) | Neon „HEAT ONLY“, Schild „DRESS CODE: ≥ PAINFUL“, Samtkordel | Totale → Nah aufs Thermometer → Nah-Schrei mit Stoß | [STYLE] Club entrance with velvet rope, a purple ion-channel bouncer labelled TRPV1 with a tiny angry face, points at a giant thermometer, then yells |
| 4 Gehirn-Amt | 14,7–20,1 s | „But he brings no heat. He just flips the switch. The brain reads fire and signs it unread.“ | Capsaicin zeigt leere Hände, Thermometer eiskalt → legt Hebel „HEAT“ um, Kanal glüht gelb, Türsteher entsetzt → Gehirn-Beamter (rosa Hirnkopf, Brille, Kaffee „#1 BOSS“) → stempelt „APPROVED“ auf „FIRE!!“ mit geschlossenen Augen | „NO THINKING AFTER 5 PM“, Neuronen-Fenster | Nah → halbnah + Stoß → Push → Nah-Stempel mit Stoß | [STYLE] The molecule pulls a lever marked HEAT, the bouncer's gate glows; cut to a cozy brain office where a pink brain-headed clerk stamps APPROVED on a FIRE!! memo without looking |
| 5 Panik | 20,1–23,5 s | „Red alert. Sirens. Somebody's crying. It's you.“ | Alarm-Fabrik: Zellen-Arbeiter mit Helm rennen mit Eimern → draußen: Kerl trinkt aus dem Gartenschlauch, Tränen-Fontänen → Nah auf sein Gesicht | „CALM DOWN DEPT. (CLOSED)“, „NEIGHBORHOOD WATCH“ | Wackelnde Totale mit Drehlicht → Push → Nah-Push | [STYLE] Red alarm light sweeping a body factory, little helmeted cells run with buckets; outside, the guy drinks from a garden hose crying fountains of tears |
| 6 Am Morgen | 23,5–26,7 s | „Next morning. Same sensors, waiting at the exit.“ | Klo bei Morgensonne, Kerl liest „BODY NEWS: ALL CALM“ → unten: zweiter TRPV1-Türsteher knackt die Knöchel vor „EXIT“, Capsaicin winkt → Kerl schreit, Sprechblase „#@%&!“ + Piep | „LIVE. LAUGH. REGRET.“, „WELCOME BACK, CAPSAICIN“ | Ruhig → Push → Nah-Schrei mit Wackeln | [STYLE] Sunny bathroom, the guy calmly on the toilet with a newspaper; cut to a gut tunnel where the same bouncer cracks his knuckles next to an EXIT door; the guy screams, censored speech bubble |
| 7 Loop | 26,7–28,8 s (+ End-Card 1,5 s) | „And tonight? He's buying two.“ | Gleicher Stand wie im Hook (Tag), Kerl hält mit totem Grinsen zwei Ghost Peppers hoch; „BUY 1 GET 1 FREE“ wird rot umkreist | Lichterkette, „NO SURVIVORS.“ | Langsamer Push (Loop zum ersten Bild) | [STYLE] Same food stall in daylight, the sweaty guy smiles dead-eyed holding up two ghost peppers, the BUY 1 GET 1 FREE sign circled in red |

Gag-Takt (gemessene Wortzeiten): Biss (1,4 s) · Beschwerde (3,2 s) · Gangster-Auftritt (4,9 s) · „Huge attitude“ (7,7 s) · Türsteher-Auftritt + Basstreffer (9,6 s) · Thermometer (12,4 s) · Brüllen (13,0 s) · kaltes Thermometer (15,4 s) · Hebel (16,7 s) · Stempel (19,0 s) · Alarm (20,4 s) · Tränen (22,2 s) · „It's you“ (23,0 s) · Exit + Piep (26,3 s) · „buying two“ (28,2 s) → größter Abstand 3,2 s (< 5 s).

## 3 Titel-/Hook-Varianten
1. **What a Ghost Pepper Does Inside Your Body** (gewählt – klare Neugier-Frage, Suchbegriff vorn)
2. Your Body Thinks It's on Fire. It Isn't.
3. The Ghost Pepper Always Comes Back

## Caption + 5 Hashtags
- TikTok: „There is no fire. Your heat sensor just got scammed by a molecule in a fedora. 🌶️ And it comes back for the exit.“
- Hashtags: #KnowToon #Animation #GhostPepper #Body #Comedy

## Voiceover-Regie
- Stimme `am_michael` (Chatterbox), Preset `witzig`, Szenen `ironic` (Panik `tense`): zynisch-gelangweilt, leicht sadistisch, direkt an den Zuschauer.
- Tempo: 74 Wörter, 2,50 W/s über die Sprechzeit (stimm_messung); Sprechpausen gekürzt auf max. 330 ms (`retime_pauses.py --cap 400`, dann `--cap 330`), damit 30 s ± 1 eingehalten werden.
- Pausen vor Pointen: vor „His tongue…“, „Huge attitude“, „It's you“, „Next morning“ und „He's buying two“ je ≈ 0,33 s (Kappungsgrenze); Musik setzt vor „Next morning“ 0,4 s aus.
- Betonung (Akzentwörter): *ghost*, *complaint*, *Capsaicin*, *Huge*, *painfully*, *switch*, *fire*, *Red*, *you*, *morning*, *exit*, *two*. Satzenden fallend und leiser (end_db 7–8).
- Fluchen plattformtauglich: kein gesprochenes Schimpfwort; Schrei als Sprechblase „#@%&!“ + 1-kHz-Piep (650 ms, −17 dB, `scripts/add_bleep.py`).

## Untertitel
1 Wort pro Einblendung, Großbuchstaben, Montserrat 900, **rot (#F01E2C) mit weißer Kontur**, Pop-in (Variante `captionStyle: "word-red"`, `src/episode/overlays/Captions.tsx`). Akzentwörter etwas größer.
