# Faktencheck Drehbuch – `episodes/roman-empire.json` („You bought Rome. Worst job ever.“)

Prüfung am 2026-11-08, Rolle Faktenprüfer (`docs/agenten-team.md`). Grundlage: die Freigabeliste in
`docs/faktencheck-roemisches-reich.md` und die Zitate in `docs/quellen-roemisches-reich.md`. Alle Stellen, auf die es hier
ankommt, habe ich **neu per `curl` geladen** (Gutenberg-Klartext pg25717 Gibbon, pg16765 Prokop III–IV, pg20298 Prokop V–VI;
Thayer: Dio 74, HA Didius Julianus, Excerpta Valesiana; WHE: Gordian Emperors, Maximinus Thrax, Vandals, Odoacer,
Septimius Severus, Byzantine Empire, Fall of the Western Roman Empire) und den Wortlaut im normalisierten Seitentext gesucht.
Seitenmarken („p143“, „p145“) und Fußnotenziffern sind in den Zitaten weggelassen.
Das Drehbuch habe ich **nicht** geändert.

**Status:** OK = durch Freigabe/Quelle gedeckt · UMFORMULIEREN = Kern stimmt, Wortlaut überdehnt oder irreführend · STREICHEN = nicht belegbar.

## Zusammenfassung

| Szene | Satz | Status |
| --- | --- | --- |
| auction | „The last emperor lasted 87 days, so the guards sell the throne.“ | **UMFORMULIEREN** (falsche Ursache „so“) |
| chaos | „Six rulers killed in a few months.“ | **UMFORMULIEREN** (nicht alle getötet) |
| perished | ganze Szene | **UMFORMULIEREN** (Legenden-Kennzeichnung fehlt hier; Zitat näher an Prokop) |
| kid | „Final respawn: 476.“ | **UMFORMULIEREN (empfohlen)** – Herrschaftsantritt 475 |
| vote | „Historians still argue.“ | **UMFORMULIEREN** – laut Quelle streitet man über die Ursachen, nicht über das Jahr |
| alle übrigen | – | OK (teils mit Hinweis) |

Es gibt keinen STREICHEN-Fall.

---

## Szene „hook“ (facts: F2)

| Satz | Status | Beleg / Befund | Ersatz (EN) |
| --- | --- | --- | --- |
| „the Roman Empire got *auctioned* off.“ | OK | Dio 74.11.3: “both the City and its entire empire were auctioned off.” – https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/74*.html | – |
| „An actual auction.“ | OK (Hinweis) | Dio benutzt einen Vergleich („just as if it had been in some market or auction-room“), beschreibt danach aber echte Gebote pro Soldat (74.11.3–5). „Actual“ als Pointe ist vertretbar. | – |
| „And you won it. Congrats, Emperor! So how long do you last?“ | OK | Dio 74.11.5: “received Julianus inside and declared him emperor.” | – |

## Szene „auction“ (facts: Z2, F4, F2)

| Satz | Status | Beleg / Befund | Ersatz (EN) |
| --- | --- | --- | --- |
| „Rewind: 193.“ | OK | WHE Septimius Severus (Z2) | – |
| „The last emperor lasted 87 days, so the guards sell the throne.“ | **UMFORMULIEREN** | 87 Tage stimmen (Dio 74.10: “had reigned eighty-seven days”). Aber das „so“ macht die kurze Regierung zur Ursache des Verkaufs. Tatsächlich hatten die Garden Pertinax **selbst ermordet** und verkauften dann den Thron: “the Pretorian troops and Laetus formed a plot against him” (Dio 74.8) und “The sellers were the ones who had slain their emperor” (Dio 74.11.3). | „The guards killed the last emperor after 87 days. Now they sell the throne.“ (13 statt 13 Wörter) |
| „Your rival bids inside their camp, you shout from the gates.“ | OK | Dio 74.11.1–2: Sulpicianus “had been sent by Pertinax to the camp … remained on the spot”; Julianus “standing at the gates of the enclosure, made bids to the soldiers”; 74.11.3 “one from the inside, the other from the outside”; 74.11.5 “shouting it in a loud voice”. | – |
| „Bids hit 20,000 sesterces per soldier.“ | OK | Dio 74.11.4: “They gradually raised their bids up to twenty thousand sesterces per soldier.” | – |
| „Then you jump by 5,000, showing it with your fingers.“ | OK | Dio 74.11.5: “raised his bid no longer by a small amount but by five thousand at one time, both shouting it in a loud voice and also indicating the amount with his fingers.” | – |
| „*25,000*.“ | OK | Herleitung 20.000 + 5.000; HA DJ 3.2: “Although he had promised five and twenty thousand sesterces to each soldier, he gave thirty.” – https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Historia_Augusta/Didius_Julianus*.html | – |
| „Sold!“ | OK | Dio 74.11.5 (s. o.). Hinweis: Dio nennt als zweiten Grund die Angst, Sulpicianus könnte Pertinax rächen – für die Pointe nicht nötig. | – |

## Szene „stones“ (facts: F5, F3)

| Satz | Status | Beleg / Befund | Ersatz (EN) |
| --- | --- | --- | --- |
| „But Rome hates you.“ | OK | HA DJ 6.1: “the populace hated and laughed at him more and more every day.” (neu gefunden, gleiche URL) | – |
| „People curse you and throw stones.“ | OK | HA DJ 4.3–4: “they heaped curses upon him … they even hurled stones at him”; dazu 4.2 “they even launched a shower of stones.” | – |
| „After 66 days, it's over.“ | OK | Dio 74.17.5: “Julianus was slain … out of which he had reigned sixty-six days.” | – |
| „Last words? "Whom have I killed?"“ | OK | Dio 74.17.5: “his only words were, "But what evil have I done? Whom have I killed?"” – zweiter Teil wörtlich. | – |
| „Buddy. You *bought* an empire.“ | OK | Kommentar/Pointe, gedeckt durch F2. | – |

## Szene „chaos“ (facts: Z2, F6)

| Satz | Status | Beleg / Befund | Ersatz (EN) |
| --- | --- | --- | --- |
| „And 193 is called the Year of the Five Emperors.“ | OK | WHE Septimius Severus: “the year 193 CE is known as 'The Year of Five Emperors.'” (https://www.worldhistory.org/Septimius_Severus/); WHE Didius Julianus: “the second emperor in the "Year of the Five Emperors."” (https://www.worldhistory.org/Didius_Julianus/). Tertiärquelle, für einen gängigen Beinamen ausreichend. | – |
| „Respawn in 238?“ | OK | WHE Gordian Emperors (https://www.worldhistory.org/Gordian_III/): “22 Mar 238 CE - 12 Apr 238 CE Reign of Gordian I and Gordian II”, “238 CE - 244 CE Reign of Gordian III”. | – |
| „Six rulers killed in a few months.“ | **UMFORMULIEREN** | Die **Zahl sechs stimmt, „killed“ nicht für alle**. Die sechs bei Gibbon sind Maximinus und sein Sohn, Gordian I und II, Maximus (Pupienus) und Balbinus (Kapitelüberschrift Kap. 7: “Violent Deaths Of Maximin And His Son, Of Maximus And Balbinus, And Of The Three Gordians”). Gibbons Satz “In the space of a few months, six princes had been cut off by the sword.” widerspricht seiner eigenen Erzählung: Gordian I “put an end to his life on the first news of the defeat” (Gibbon Kap. 7). WHE: “In the skirmish Gordian II was killed. When he received word of his son's death, the elder Gordian became distraught and hanged himself.” Maximinus und Sohn: “they murdered both the emperor and his son” (WHE Maximinus Thrax, https://www.worldhistory.org/Maximinus_Thrax/); Pupienus und Balbinus “were seized by the Praetorian Guard and murdered” (WHE Gordian). **Gordian III überlebte 238** (Kaiser bis 244). Außerdem war Maximinus’ Sohn nur Caesar (“His son Gaius Julius Verus Maximus would be named Caesar”, WHE Maximinus Thrax), Gibbon sagt „princes“. „Rulers“ ist dafür gerade noch vertretbar, da die Freigabe „sechs Herrscher“ nennt. Herodian selbst war nicht erreichbar (Thayer: “cannot find the page”). | **„Six rulers dead in a few months.“** (gleiche Länge; Sticker „6 RULERS · FEW MONTHS“ bleibt). Strenger: „Five emperors and an heir, dead in a few months.“ |
| „*Nope*.“ | OK | Pointe. | – |

## Szene „split“ (facts: Z3, F1)

| Satz | Status | Beleg / Befund | Ersatz (EN) |
| --- | --- | --- | --- |
| „Respawn: 395.“ | OK | Prokop III.1, Dewing-Einfügung “[Jan. 17, 395 A.D.]” – https://www.gutenberg.org/ebooks/16765 | – |
| „The empire splits for good.“ | OK (Hinweis) | Prokop III.1: “his kingdom was taken over by his two sons, Arcadius, the elder, receiving the Eastern portion, and Honorius, the younger, the Western.” „For good“ (endgültig) steht nicht bei Prokop. Prokop fügt hinzu: “the Roman power had been thus divided as far back as the time of Constantine and his sons”. Für „endgültig“ gibt es aber neuen Beleg bei Gibbon, Kap. 29 (Überschrift): “Final Division Of The Roman Empire Between The Sons Of Theodosius.” – https://www.gutenberg.org/cache/epub/25717/pg25717.txt (Sekundärquelle, 18. Jh.). Wie im Faktencheck Z3: nicht als erste Teilung darstellen, das tut der Satz nicht. | – |
| „Your brother gets the East.“ | OK | Prokop III.1: „his two sons, Arcadius … the Eastern portion, and Honorius … the Western“ (Brüder als Söhne desselben Vaters). Ausdrücklich Gibbon Kap. 29: “His younger brother Honorius, assumed, in the eleventh year of his age, the nominal government of Italy, Africa, Gaul, Spain, and Britain”. | – |
| „You're *Honorius*, Emperor of the West.“ | OK | Prokop III.1; Gibbon Kap. 29: “saluted … as the lawful emperors of the East, and of the West”. | – |
| „Legend says you keep a huge rooster named Rome.“ | OK | Prokop III.2: “For he had a very large cock, Rome by name”, eingeleitet mit “they say”. „Legend says“ wie in der Freigabe gefordert. | – |

## Szene „goths“ (facts: Z4, F11)

| Satz | Status | Beleg / Befund | Ersatz (EN) |
| --- | --- | --- | --- |
| „But in 410, Goths plunder the city.“ | OK | Prokop III.2: “received Alaric and the army into the city … [Aug. 24, 410 A.D.]”, Plünderung im selben Kapitel. | – |
| „One story says 300 young men, posing as gift slaves, opened the gate at noon.“ | OK | Prokop III.2: “he chose out three hundred … pretending that they were slaves”; “on an appointed day at about midday … they should all come to the gate called Salarian and with a sudden rush kill the guards … and open the gates”; ausgeführt: “then they opened the gates”. Gegenversion (Proba) steht direkt danach – „One story says“ ist deshalb richtig. | – |

## Szene „perished“ (facts: F1)

| Satz | Status | Beleg / Befund | Ersatz (EN) |
| --- | --- | --- | --- |
| ganze Szene | **UMFORMULIEREN** | Die Szene erzählt die Legende als Tatsache. Das „Legend says“ steht zwei Szenen vorher, dazwischen kommt die Goten-Szene mit einer eigenen „One story says“-Kennzeichnung. Die Freigabe (F1) verlangt: „Nur als ‚legend says‘ erzählen“, Prokop sagt zweimal “they say”. | s. Gesamtvorschlag unten |
| „Your poultry keeper reports: "Rome has perished!"“ | OK (inhaltlich) | Prokop III.2: “received the message from one of the eunuchs, evidently a keeper of the poultry, that Rome had perished.” Bei Prokop indirekte Rede; direkte Rede als Dramatisierung zulässig. | „As the story goes, your poultry keeper reports: "Rome has perished!"“ |
| „You cry: "But it just ate from my hands!"“ | UMFORMULIEREN (leicht) | Prokop: “And he cried out and said, "And yet it has just eaten from my hands!"” In Anführungszeichen gehört der Wortlaut der Quelle. „But it just ate“ ist nur eine Umschreibung. | „You cry: "And yet it just ate from my hands!"“ |
| „He means the city.“ | OK | Prokop: “the eunuch comprehending his words said that it was the city of Rome which had perished at the hands of Alaric”. | – |
| „You? *Relieved*.“ | OK | Prokop: “the emperor with a sigh of relief answered quickly: "But I, my good fellow, thought that my fowl Rome had perished."” | – |

**Gesamtvorschlag „perished“ (EN, +3 Wörter):**
„As the story goes, your poultry keeper reports: "Rome has perished!" You cry: "And yet it just ate from my hands!" He means the city. You? *Relieved*.“

## Szene „vandals“ (facts: Z5, F12, M5)

| Satz | Status | Beleg / Befund | Ersatz (EN) |
| --- | --- | --- | --- |
| „In 455, the Vandals plunder Rome for 14 days“ | OK | WHE Vandals: “455 CE Vandals sack Rome”; Gibbon Kap. 36: “The pillage lasted fourteen days and nights” (Sekundärquelle, Freigabe F12). | – |
| „and rip off half the gilded roof of Jupiter's temple.“ | OK | Prokop III.5: “He plundered also the temple of Jupiter Capitolinus, and tore off half of the roof. Now this roof was of bronze of the finest quality, and since gold was laid over it exceedingly thick …” → vergoldetes Bronzedach = „gilded roof“. | – |
| „Thanks to Roman writers, *vandal* now means wrecking stuff.“ | OK (Hinweis) | **Die Zuordnung zu „Roman writers“ ist belegt**, und zwar genau durch das M5-Zitat: WHE Vandals: “The name "vandal" has now become synonymous with careless destruction owing to the accounts by Roman writers describing their violent behavior generally and their sack of Rome in 455 CE specifically.” (https://www.worldhistory.org/Vandals/). Die Freigabeliste Nr. 29 deckt das ausdrücklich: „wegen der Berichte römischer Autoren (WHE)“. Der Satz behauptet **nicht**, wer das Wort geprägt hat. Das ist richtig so, denn Grégoire 1794 ist nicht nachprüfbar und bleibt draußen. Einschränkung: Das ist eine Tertiärquelle, und eine Primärquelle für die Wortgeschichte gibt es nicht (etymonline und Britannica gesperrt). Dieselbe WHE-Seite schränkt ein: “this identification of wanton destruction with the Vandals is unfortunate” und zitiert Jacobsen: “the Vandals conducted themselves much better during the sack of Rome than did many other invading barbarians.” | Bleibt wie es ist. Optional fairer (+7 Wörter, ebenfalls WHE): „Thanks to Roman writers, *vandal* now means wrecking stuff. Kind of unfair: they looted, but spared the city.“ Beleg für den Zusatz: “Leo told Gaiseric he was free to plunder the city but asked him not to destroy it nor harm the inhabitants - and Gaiseric agreed.” (WHE Vandals). Sicherste Variante: „Today, *vandal* means wrecking stuff.“ |

## Szene „kid“ (facts: Z6, F8)

| Satz | Status | Beleg / Befund | Ersatz (EN) |
| --- | --- | --- | --- |
| „Final respawn: 476.“ | **UMFORMULIEREN (empfohlen)** | Die anderen Respawns fallen auf das Jahr, in dem die Herrschaft beginnt (193, 395). Romulus Augustulus wurde aber **475** Kaiser: Dewing bei Prokop V.1 “[B]July 31, 475 A.D.” (https://www.gutenberg.org/ebooks/20298), Faktencheck Z10. 476 ist das Jahr der Absetzung (Z6). | „Final respawn: 475.“ und in „fired“: „Then, in 476, Odoacer takes your throne.“ (HUD-Cue „476“ dann auf das Wort „476“ in „fired“ legen.) Alternative ohne neue Jahreszahl: „Final respawn. You're a kid named Romulus Augustus.“ (Jahr 476 erst in „fired“). |
| „You're a kid named Romulus Augustus.“ | OK | Gibbon Kap. 36: “The son of Orestes assumed and disgraced the names of Romulus Augustus”; Prokop V.1: “while still a lad”; Exc. Val. 8.38 “tender years”. „Kid“ ist eine umgangssprachliche Übertragung von „lad“ und nennt kein Alter (Vorgabe F8). | – |
| „So Romans call you *Augustulus*. Little Augustus.“ | OK | Prokop V.1: “Augustus, whom the Romans used to call by the diminutive name Augustulus because he took over the empire while still a lad”. Das „so“ (wegen der Jugend) entspricht Prokops „because“. „Little Augustus“ = Herleitung der Verkleinerungsform (Gibbon: “the contemptible diminutive Augustulus”). | – |

## Szene „fired“ (facts: Z6, F9)

| Satz | Status | Beleg / Befund | Ersatz (EN) |
| --- | --- | --- | --- |
| „Then Odoacer takes your throne.“ | OK | Exc. Val. 8.38: “deposed Augustulus from his throne” – https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Excerpta_Valesiana/2*.html | ggf. „Then, in 476, …“ (s. Szene kid) |
| „You're a kid, so he spares you.“ | OK | Exc. Val. 8.38: “but in pity for his tender years, granted him his life”. Genau die Korrektur aus F9 (verschont wegen der Jugend, nicht wegen der Schönheit). | – |
| „Because you're pretty, he pays you 6,000 gold pieces.“ | OK (Hinweis) | Exc. Val. 8.38: “and because of his beauty he also gave him an income of six thousand gold-pieces”. Die Begründung „pretty“ ist richtig zugeordnet. „Pays you“ kann man als einmalige Zahlung verstehen. Die Quelle sagt „income“, und „pension“ im Folgesatz macht das klar. „Yearly“ wird zu Recht nicht gesagt (nur Gibbon „annual allowance“). | Präziser (+2 Wörter): „Because you're pretty, he gives you an income of 6,000 gold pieces.“ |
| „Fired, with a *pension*.“ | OK | Exc. Val. 8.38 “income … sent him to Campania, to live there a free man”; WHE Odoacer: “with a fixed annual allowance”. | – |

## Szene „deleted“ (facts: F10)

| Satz | Status | Beleg / Befund | Ersatz (EN) |
| --- | --- | --- | --- |
| „Your job? The Senate tells Constantinople: one emperor is enough.“ | OK (Sekundär/Tertiär) | Gibbon Kap. 36: “An epistle was addressed, by their unanimous decree, to the emperor Zeno … They solemnly "disclaim the necessity, or even the wish, of continuing any longer the Imperial succession in Italy; since, in their opinion, the majesty of a sole monarch is sufficient to pervade and protect, at the same time, both the East and the West."” WHE Odoacer: “wrote to the emperor in the east (who, at this time, was Zeno) that they no longer felt a western emperor was necessary in Rome”. Zwei voneinander unabhängige Darstellungen, die Primärquelle (Malchus) war nicht einsehbar (Freigabe F10). Für eine verkürzte Pointe ausreichend. | – |
| „Emperor of the West? *Deleted*.“ | OK | wie oben („continuing any longer the Imperial succession in Italy“). | – |

## Szene „twist“ (facts: M1, F13, Z8)

| Satz | Status | Beleg / Befund | Ersatz (EN) |
| --- | --- | --- | --- |
| „Plot twist: Rome didn't fall in a day.“ | OK | M1, als Gag freigegeben; WHE Fall of the Western Roman Empire: “the decline and fall were only in the west.” | – |
| „The East keeps going 977 more years, until 1453,“ | OK | 1453 − 476 = 977; WHE Byzantine Empire: “the Byzantine Empire terminated on Tuesday 29 May 1453” | – |
| „still calling itself *Roman*.“ | OK | WHE Byzantine Empire: “The Byzantines called themselves 'Romans', their emperor was basileon ton Rhomaion or 'Emperor of the Romans'”. | – |

## Szene „vote“ (facts: Z6, Z8, M1, M2)

| Satz | Status | Beleg / Befund | Ersatz (EN) |
| --- | --- | --- | --- |
| „So when did Rome fall? A, 476, or B, 1453? Comment A or B.“ | OK (fair) | Beide Daten sind belegt und vorher im Video erklärt: 476 = Ende des Westens (Jordanes 46, WHE: “c. 476 CE is the traditionally accepted date for the end of the Western Roman Empire”), 1453 = Ende des Ostens, der sich „Roman“ nannte (WHE). Als Frage für die Zuschauer ohne Wertung ist das fair. | – |
| „Historians still argue.“ | **UMFORMULIEREN** | Direkt nach der Datumsfrage klingt der Satz so, als stritten Historiker über **476 oder 1453**. Die Quelle (M2) sagt das Gegenteil: “Although historians generally agree on the year of the fall, 476 CE, and its consequences for western civilization, they often disagree on its causes.” (https://www.worldhistory.org/article/835/fall-of-the-western-roman-empire/); für 1453: “Most historians do agree that the Byzantine Empire terminated on Tuesday 29 May 1453” (WHE Byzantine Empire). Belegt ist nur der Streit über die **Ursachen** (und nach Gibbon Anm. 125 eine Unsicherheit über das genaue Jahr, nicht 476 gegen 1453). | **„Historians still argue about why.“** (+2 Wörter; Sticker „HISTORIANS STILL ARGUE WHY“) |
| „My vote? It went downhill the day [the Roman Empire got auctioned off].“ | OK | erkennbar persönliche Meinung („My vote“), kein Faktenanspruch. Die Auktion selbst ist belegt (F2). | – |

---

## Bild-Hinweise (Nebenbefunde, nicht Teil des gesprochenen Texts)

- **hook/auction „Night“:** Dio 74.12: “So toward evening the new ruler hastened to the Forum” – die Auktion war **vor** dem Abend. Besser Spätnachmittag/Dämmerung statt Nacht.
- **vandals/fired „FurCloak“:** Die Quellendatei verlangt „keine Felle als ‚Steinzeit‘-Klischee“ für Goten/Vandalen. Für Odoaker gibt es Exc. Val. 10.46 “now clad in paltry skins”, aber das beschreibt ihn als Jugendlichen vor seinem Aufstieg und nicht als König 476. Fellumhänge für die Vandalen 455 sind nicht belegt.
- **perished:** Laut Prokop ist der Bote „one of the eunuchs“. Ein „servant“ ist neutral und in Ordnung.

## Herleitungen

- 977 = 1453 − 476.
- 25.000 = 20.000 (Dio 74.11.4) + 5.000 (Dio 74.11.5).
- 238, sechs Tote: Maximinus + Sohn (Mai 238), Gordian I (Suizid) + Gordian II (Schlacht) (238; WHE nennt im Text 12. Mai, in der Zeitleiste 12. April), Pupienus + Balbinus (Ende Juli 238 laut Milman-Anmerkung bei Gibbon Kap. 7: “they are assassinated towards the end of July”). Davon wurden **5 getötet und 1 beging Suizid**. Gordian III überlebte.
- Wortzahl der Ersatztexte: auction ±0, chaos ±0, perished +3, vote +2, (optional fired +2, vandals +7). Insgesamt etwa +5 Wörter Pflicht, bei ca. 3,45 W/s also etwa +1,5 s.
