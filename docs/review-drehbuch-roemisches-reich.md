# Review Drehbuch „roman-empire“ (Retention-Kritiker, Runde 1)

Geprüft: `episodes/roman-empire.json` (Stand 08.11.2026, 13 Szenen, 311 Wörter, Finn `am_fenrir` @ 1.25).
Maßstab: `docs/clip-regeln.md`, `docs/referenz-analyse-2.md`, `docs/schnittstelle.md`.
Die Datei wurde **nicht** geändert. Alle Ersatztexte nutzen nur Fakten, die schon im Drehbuch stehen
oder in `docs/quellen-roemisches-reich.md` belegt sind (Angabe in Klammern). Der Faktenprüfer muss die
neuen Formulierungen trotzdem gegenlesen.

Wie gemessen (in dieser Sitzung):
- Wortzahl je Szene mit `len(text.split())`; Sprechwörter mit `speakable()` aus `scripts/tts.py`
  (Zahlen ausgeschrieben, Bindestriche getrennt).
- Aussprache: Phoneme aus `kokoro_onnx.tokenizer.Tokenizer().phonemize(wort, "en-us")`, also genau dem,
  was `tts.py` an Kokoro gibt. Eine echte Hörprobe habe ich nicht erzeugt.

## Gesamturteil: 7/10

Starke Prämisse (Kaiserthron wird versteigert), sehr guter Loop, gute Pointen in der zweiten Hälfte
(Hahn, Rente, „Deleted“). Schwach sind die Mitte (Goten und Vandalen ohne „du“ und ohne Pointe), die
nicht erklärte Respawn-Mechanik und die Zahlen beim Sprechen.

| Kriterium | Note | Begründung |
| --- | --- | --- |
| Hook (2 s) | 8 | „the Roman Empire got auctioned off“ = 7 Wörter ≈ 2 s, ohne Vorwissen verständlich und absurd genug zum Bleiben. Aber die Frage „So how long do you last?“ ist nach ~25 s beantwortet (66 Tage). Danach trägt sie nicht mehr. Die Frage, die bis zum Schluss trägt („Wann ist Rom gefallen?“ bzw. „Wie schlimm wird der Job?“), wird im Hook nicht gestellt. |
| Loop | 9 | „My vote? It went downhill the day / the Roman Empire got auctioned off.“ ergibt einen echten Satz und hat eine Pointe. Für Erstzuschauer ist „the Roman Empire got auctioned off“ auch allein ein vollständiger Satz; das kleine „the“ fällt im Ton nicht auf. Risiko: Kokoro senkt am Ende von „the day“ (ohne Satzzeichen) die Stimme eventuell trotzdem ab. Nach dem ersten TTS-Lauf anhören. |
| Roter Faden „du bist Kaiser“ | 6 | In 9 von 13 Szenen ist „du“ da. Es **fehlt in `goths` und `vandals`**: Zwei Szenen hintereinander sind reine Geschichtsfakten, und genau dort reißt der Faden. „Respawn“ kommt in `chaos` zum ersten Mal, ohne dass das Spielprinzip erklärt wurde; Ältere und Nicht-Gamer verstehen den Sprung 193 → 238 → 395 dann als Aufzählung. |
| Kausalkette | 6 | Gut: Rewind → But → (Respawn) → But → Hahn-Rückgriff → Then → Your job? → Plot twist → So. Schwach: `chaos` beginnt mit „And“ (Listen-Signal), `vandals` beginnt ohne Verbindung („In 455“), 238 ist ein reines „Nope“ ohne Folge. |
| Eskalation / Wendepunkt | 7 | Der Job wird schlechter (gekauft → halbiert → Kind → gelöscht), der Wendepunkt „Plot twist: the East keeps going“ liegt richtig im letzten Drittel. Die Stufen werden aber nicht benannt; das Publikum muss die Steigerung selbst merken. |
| Humor (Dichte, Timing) | 7 | ~10 Pointen in ~90 s. Die stärksten stehen richtig am Szenenende: „Buddy. You *bought* an empire.“, „You? *Relieved*.“, „Fired, with a *pension*.“, „*Deleted*.“, „Rome didn't fall in a day“. Ohne Pointe: `auction` (endet mit „Sold!“, ok), **`goths` (keine)**, **`vandals` (Wortherkunft, eher Lexikon als Witz)**. |
| Slang / jede Altersgruppe | 8 | „Congrats“, „Buddy“, „Nope“, „Respawn“, „Plot twist“, „Deleted“, „wrecking stuff“: aktuell, kein Cringe, für Kinder verständlich. Schwierig für Nicht-Muttersprachler und Kinder sind „poultry keeper“, „plunder“ (2×), „gilded“, „posing as gift slaves“. |
| Verständlichkeit gesprochen (TTS) | 5 | Siehe Top-5 Nr. 4: `auction` hat 4 Zahlen in 12 s; Jahreszahlen werden als „one hundred ninety-three“ bzw. „one thousand four hundred fifty-three“ gesprochen; Odoacer, Augustulus, Augustus haben die Betonung falsch, Honorius verliert das H. |
| Einsatz / HUD | 7 | EMPIRE-Balken sinkt plausibel (0,95 → 0,5 bei der Teilung → 0 bei „Deleted“), Aufpumpen auf 0,5 beim Osten passt. „Sold“ −10 % versteht man ohne Erklärung nicht (warum schadet der Kauf dem Reich?). Besser fällt der erste Ruck auf „hates“. Der Jahreszähler ist der eigentliche Fortschrittsmotor und funktioniert gut. |
| Cues / Schnitt | 8 | Bei ~3,45 W/s gibt es in jeder Szene etwa alle 1,5–2,5 s einen Beat. Das reicht für Wechsel alle 2–3 s. Überladen ist `auction`: 3 Sticker + 3 Pills in 12 s, die mit 4 Zahlen konkurrieren. Sonst sind die Sticker kurz und gut. |
| Auswahlfrage am Ende | 7 | Echte, offene Streitfrage („Historians still argue“, belegt M1/M2), gut für Kommentare. Die Karten zeigen nur nackte Zahlen; mit Kontext („476 · WEST DIES“ / „1453 · EAST DIES“) entscheiden Zuschauer schneller. |
| Länge | 7 | 311 Skriptwörter ≈ 90 s nach der Kalibrierung in `note`. Gesprochen werden aber **355 Wörter**, weil `speakable()` Zahlen ausschreibt (+44, davon ~12 nur durch die Jahres-Lesart). Ob die Kalibrierung (Lily 284 W / 87,2 s) Skript- oder Sprechwörter zählte, kann ich nicht bestätigen. Wenn Sprechwörter: ~100 s. Nach dem ersten TTS-Lauf messen. |

## Top-5-Änderungen (mit Ersatztext)

### 1. Respawn-Spielregel im Hook setzen und „game over“ sagen (Hook + Roter Faden)
Problem: Die Hook-Frage ist nach 25 s erledigt, und „Respawn“ wird nie eingeführt.
Die neue Hook-Zeile verspricht stattdessen die ganze Reise. „game over“ in `stones` erklärt das
Spielprinzip, bevor der erste Respawn kommt.

- `hook`: „the Roman Empire got *auctioned* off. An actual auction. And you won it. Congrats, Emperor!
  Bad news: every time you respawn, this job gets worse.“
  Cue `long` → `worse` (`worriedPush`); neuer Cue `respawn` mit Sticker „RESPAWN = WORSE JOB“ (optional).
- `stones`: „…After 66 days: *game over*. Last words? …“ (statt „After 66 days, it's over.“).
  Sticker `66` bleibt, `game` bekommt `emph`.

### 2. Stufen benennen: „Hard mode“ / „Nightmare mode“ und „So“ statt „And“ (Kausalkette + Eskalation)
Die Gaming-Sprache aus Nr. 1 macht jede Respawn-Stufe als Steigerung hörbar, nicht als Liste.
- `chaos`: „So 193 gets five emperors in one year. Respawn in 238? Six rulers killed in a few months.
  *Nope*. Skip.“ (Z2, F6; „Year of the Six Emperors“ weiterhin nicht verwenden)
- `split`: „Respawn: 395. *Hard mode*. The empire splits: your brother gets the East. You're
  *Honorius*, Emperor of the West. Legend says you keep a huge rooster. Named Rome.“
  Neuer Sticker auf `Hard`: „HARD MODE“. Label `ROME (ROOSTER)` an `Named`.
- `kid`: „Final respawn: 476. *Nightmare mode*. You're a kid named Romulus Augustus. So Romans call
  you *Augustulus*. Little Augustus.“ Sticker auf `Nightmare`: „NIGHTMARE MODE“.

### 3. Das Loch in der Mitte schließen: Goten und Vandalen mit „du“ und Pointe
`goths` und `vandals` sind die einzigen Szenen ohne Hauptfigur und ohne Lacher; hier wird am
ehesten weggewischt. Außerdem: einfachere Wörter.
- `goths`: „But in 410, the Goths loot the city. One story says 300 young men, sent as a "gift",
  open the gate. Trojan Horse, but with people.“ (Z4, F11 „one story says“ bleibt)
  Cue `noon` entfällt → `gate` (`gateOpens`); neuer Cue `Trojan` (Beat `trojanGag`, Sticker „TROJAN HORSE 2.0“).
- `perished`: „Your rooster guy runs in: "Rome has perished!" You cry: "But it just ate from my
  hands!" He means the city. You? *Relieved*.“ („rooster guy“ statt „poultry keeper“; Cue `keeper` → `guy`)
- `vandals` (Honorius ist 455 nicht mehr da, also Wartezeit als Gag; YOU als Geist/Lade-Balken
  „RESPAWNING…“ im Bild): „While you wait to respawn: in 455, the Vandals loot Rome for 14 days. Their
  name? Now it means wrecking stuff.“ (Z5, F12, M5)
  Das Dach bleibt als Bild ohne Text (Beat `roofOff` auf `loot`). Cue `writers` → `name` (Sticker
  „VANDAL = WRECKER“). Neuer Cue `wait` (Beat `respawnQueue`).
  Hinweis: Der Kaiser von 455 kommt in den Quellen nicht vor. Eine „du“-Rolle über ihn kann ich nicht
  bestätigen, deshalb die Warte-Lösung.

### 4. Zahlen und Namen sprechbar machen (TTS)
a) **`auction` entschlacken** (4 Zahlen → 2, „sesterces“ nur noch als Sticker):
„Rewind: 193. The guards just killed the last emperor. Now they sell his job. Your rival bids inside the
camp, you shout from the gate. You flash five fingers: five thousand more! *25,000* per soldier. Sold!“
Beleg: Dio, „The sellers were the ones who had slain their emperor“ (F2 in den Quellen); der Sprung um
5.000 mit den Fingern war schon F2. Cues: `87` und `20,000` entfallen; `25,000`-Sticker → „25,000
SESTERCES / SOLDIER“; Pill `GUARDS` auf `guards`, `rival`, `shout`, `fingers`, `Sold` bleiben. Damit
bleiben 2 Sticker + 3 Pills.

b) **`twist`**: „Plot twist: Rome didn't fall in a day. The East keeps going almost a thousand more
years, until 1453. Still calling itself *Roman*.“ (F13 erlaubt „fast 1000 Jahre“). Sticker „+977 YEARS“
an `thousand`.

c) **`deleted`**: „The Senate tells *the East*: one emperor is enough.“ statt „Constantinople“. Der
Zuschauer kennt aus `split` nur „the East“, und es fällt ein schwieriges Wort weg (F10 vom
Faktenprüfer bestätigen lassen).

d) **`fired`**: „Then a general, Odoacer, takes your throne.“ Damit weiß auch ein Kind, wer das ist.

e) **Für den Orchestrator, nicht im Drehbuch lösbar** (`scripts/tts.py`, `speakable`):
- Jahreszahlen werden heute als „one hundred ninety-three“, „four hundred seventy-six“, „one thousand
  four hundred fifty-three“ gesprochen. Natürlich und kürzer wäre „one ninety-three“, „four
  seventy-six“, „fourteen fifty-three“ (geprüft: Kokoro phonemisiert diese Schreibweisen sauber). Das
  spart ~12 Sprechwörter ≈ 3,5 s. Vorschlag: Zahlen von 100 bis 2099 ohne Tausender-Komma als Jahr
  lesen (oder nur die Zahlen, die an einem `hud`-Cue `year` hängen).
- Aussprache-Tabelle nur für die Sprachausgabe (Untertitel bleiben gleich), gemessene Phoneme:

  | Wort | Kokoro heute | Ersatz-Schreibweise → Phoneme |
  | --- | --- | --- |
  | Odoacer | ˈoʊdoʊsɚ („OH-doh-ser“, falsch) | `Odo-acer` → ˈoʊdoʊˈeɪsɚ ✓ |
  | Augustulus | ˈɔːɡəstʃələs (Betonung vorn, falsch) | `Au-gustulus` → ˌoʊɡˈʌstʃələs ✓ |
  | Augustus | ˈɔːɡʌstəs (Betonung vorn, falsch) | `Au-gustus` → ˌoʊɡˈʌstəs ✓ |
  | Honorius | ənˈɔːɹɪəs (H fehlt) | `Hon-orius` → hˈɑːnˈɔːɹɪəs ✓ |
  | Ravenna | ɹˈeɪvənə (falsch) | im Ersatztext bewusst vermieden |
  | sesterces, Constantinople, Vandals, Whom | korrekt | – |

  Der Whisper-Abgleich in `make_episode.py` vergleicht mit dem Skripttext. Danach prüfen, ob „Abgleich
  N/M“ gleich bleibt.

### 5. Auswahl am Ende schärfen und HUD-Logik glätten
- `vote`-Choice: `"options": ["476 · WEST DIES", "1453 · EAST DIES"]`. Der Sprechtext bleibt, er ist
  wegen des Loops genau richtig.
- Optional, nach Referenz R1/R3: Serien-Titel „WORST JOB IN ROME · PART 1“ nur dann, wenn ein Teil 2
  geplant ist. Sonst nicht, ein leeres Versprechen schadet.
- HUD: Der erste Balken-Ruck kommt auf `hates` (0,95 → 0,85) statt auf `Sold`. Bei „Sold“ ist der
  Verlust nicht erklärt, bei „Rome hates you“ versteht man ihn sofort. Die übrigen Werte bleiben.

### Länge nach Top-5
Alle Ersatztexte zusammen (`hook`…`vote`, ganze Szenen siehe Anhang): **312 Skriptwörter / 350
Sprechwörter**, vorher 311 / 355. Gleich lang, aber weniger Zahlen und mehr Pointen. Mit der
Jahres-Lesart aus 4e: ~338 Sprechwörter. Wenn der erste TTS-Lauf über 92 s liegt, in dieser Reihenfolge
kürzen: „Skip.“ (chaos), „Nightmare mode.“ (kid), „Still calling itself“ → „Still“ (twist), „An actual
auction.“ (hook, nur als letzte Option).

## Kleinkram
- `hook`: „And you won it.“ → „And you won.“ (1 Wort, klingt knackiger).
- `auction`: „their camp“ ist mehrdeutig (wessen?) → „the camp“ (im Ersatztext schon umgesetzt).
- `stones`: „Last words?“ und „Whom have I killed?“ stehen direkt hintereinander, beide mit „?“. Kokoro
  hebt vermutlich beide an (nicht gehört). Nach dem TTS-Lauf testen; zur Not „Your last words:“ mit Doppelpunkt.
- `chaos`: Sticker „6 RULERS · FEW MONTHS“ ist lang; kürzer „6 RULERS DOWN“ (gleiche Aussage, F6).
- `split`: „for good“ ist für Nicht-Muttersprachler ein Idiom; im Ersatztext weggelassen (Fakt bleibt korrekt).
- `goths`: „gift slaves“ ist für Kinder schwer und unnötig heikel; „sent as a "gift"“ trägt dieselbe Info (F11).
- „plunder“ kommt zweimal vor (goths, vandals): beide Male „loot“ (einfacher, kürzer).
- `vandals`: „gilded“ ist schweres Wort; im Ersatz gestrichen, das Dach zeigt nur das Bild.
- `kid`: Gute Zusatzpointe, belegt (Gibbon Kap. 36, F8 „the two great founders, of the city and of the
  monarchy“): „Named after Rome's founder AND its first emperor. No pressure.“ Nur, wenn die Länge es erlaubt (+10 Wörter).
- `fired`: „Because you're pretty“ ist ein Top-Gag und laut Faktencheck F9 korrekt getrennt (Leben aus
  Mitleid, Geld wegen Schönheit). Unbedingt so lassen.
- `deleted`: Cue `job` sitzt auf dem ersten Wort der Szene; mit `sceneGapMs` 120 kommt der Beat
  sehr früh. Prüfen, ob `emptyThrone` mit dem Szenenwechsel zusammenfällt (dann ein Beat zu viel).
- `twist`: „Rome didn't fall in a day“ funktioniert nur, wenn man „Rome wasn't built in a day“ kennt.
  Für Nicht-Muttersprachler hilft ein Sticker „(it wasn't built in one either)“ – optional.
- `vote`: „Comment A or B“ + Overlay „COMMENT A OR B“ doppelt sich. Das ist ok (Ton + Bild), aber es
  sollte kein dritter Sticker dazukommen.
- `note`: Die Story-Zeile nennt „193 Julianus -> 395 Honorius -> 476 Augustulus“; 238 fehlt dort. Für
  Szenen und Regie ergänzen, dass 238 ein übersprungener Respawn ist (Beat `nopeSkip`).
- Make-Pipeline: `make_episode.py` legt 0,15 s Stille vor die erste Szene. Für den Loop stört das
  kaum, aber das Video sollte nicht mit Schwarz beginnen (Bild läuft schon, Ton setzt kurz danach ein).

## Anhang: vollständiger Ersatztext (zum Übernehmen durch den Drehbuch-Agenten)
```text
hook:     the Roman Empire got *auctioned* off. An actual auction. And you won it. Congrats, Emperor! Bad news: every time you respawn, this job gets worse.
auction:  Rewind: 193. The guards just killed the last emperor. Now they sell his job. Your rival bids inside the camp, you shout from the gate. You flash five fingers: five thousand more! *25,000* per soldier. Sold!
stones:   But Rome hates you. People curse you and throw stones. After 66 days: *game over*. Last words? "Whom have I killed?" Buddy. You *bought* an empire.
chaos:    So 193 gets five emperors in one year. Respawn in 238? Six rulers killed in a few months. *Nope*. Skip.
split:    Respawn: 395. *Hard mode*. The empire splits: your brother gets the East. You're *Honorius*, Emperor of the West. Legend says you keep a huge rooster. Named Rome.
goths:    But in 410, the Goths loot the city. One story says 300 young men, sent as a "gift", open the gate. Trojan Horse, but with people.
perished: Your rooster guy runs in: "Rome has perished!" You cry: "But it just ate from my hands!" He means the city. You? *Relieved*.
vandals:  While you wait to respawn: in 455, the Vandals loot Rome for 14 days. Their name? Now it means wrecking stuff.
kid:      Final respawn: 476. *Nightmare mode*. You're a kid named Romulus Augustus. So Romans call you *Augustulus*. Little Augustus.
fired:    Then a general, Odoacer, takes your throne. You're a kid, so he spares you. Because you're pretty, he pays you 6,000 gold pieces. Fired, with a *pension*.
deleted:  Your job? The Senate tells the East: one emperor is enough. Emperor of the West? *Deleted*.
twist:    Plot twist: Rome didn't fall in a day. The East keeps going almost a thousand more years, until 1453. Still calling itself *Roman*.
vote:     So when did Rome fall? A, 476, or B, 1453? Comment A or B. Historians still argue. My vote? It went downhill the day
```
Achtung beim Übernehmen: In JSON müssen die inneren Anführungszeichen (`"gift"`, `"Rome has perished!"` …) als
`\"` maskiert werden, und alle Cue-Wörter müssen zum neuen Text passen (siehe Top-5).
