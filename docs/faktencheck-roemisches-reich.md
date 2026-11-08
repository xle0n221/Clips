# Faktencheck – „Der Untergang des Römischen Reiches“ (Fall of Rome)

Prüfung von `docs/quellen-roemisches-reich.md`, 2026-11-08, Rolle Faktenprüfer (`docs/agenten-team.md`).

**Methode:** Alle angegebenen URLs wurden per `curl` über den Proxy neu geladen (Gutenberg als Klartext
`https://www.gutenberg.org/cache/epub/<ID>/pg<ID>.txt`, Thayer-URLs mit `%2A` statt `*`). Der Seitentext wurde
normalisiert (HTML-Tags entfernt, Leerraum und typografische Anführungszeichen vereinheitlicht), danach wurde
jedes Zitat maschinell gesucht, bei Auslassung „…“ jedes Teilstück einzeln. Bei Fehlschlägen wurde die Stelle von Hand verglichen.
Die Stellenangaben (Buch, Kapitel, Abschnitt) wurden an den Kapitelankern bzw. Überschriften der Quelle geprüft.

**Gesamtergebnis Wortlaut:** Alle 76 geprüften Zitate (plus die Ersatzbelege für 27 v. Chr. und 238) stehen wörtlich in der angegebenen Quelle. Abweichungen betreffen
nur entfernte Seitenmarken („p145“, „p355“, „p359“, „p1013“, „p1137“), Abschnittsziffern (Dio „3“/„4“/„5“, HA „4“),
Fußnotenmarken („[B]“, „[26]“, „⁠13“, „⁠i“, Gibbon „126“, „29“) und Leerzeichen vor Satzzeichen, die durch HTML-Links
entstehen („auction-room ,“). Das deckt der Hinweis in der Quellendatei ab; Abschnittsziffern sind dort nicht ausdrücklich
genannt, verändern den Wortlaut aber nicht.

**Zugriffstest Bot-Schutz (bestätigt):** britannica.com → HTTP 403 „Just a moment…“; metmuseum.org → HTTP 429
„Vercel Security Checkpoint“; britishmuseum.org → HTTP 403. Ersatzversuch etymonline.com (Herkunft „vandalism“):
vom Proxy abgewiesen. Ersatzquelle für 238: WHE Gordian III (https://www.worldhistory.org/Gordian_III/) erreichbar.

---

## Für das Drehbuch freigegeben (nur BESTÄTIGT)

1. **27 v. Chr.** – Augustus ist der erste Kaiser (WHE Western Roman Empire: „first emperor Augustus (r. 27 BCE-14 CE)“). Nicht mit Jordanes begründen.
2. **193 = „Year of the Five Emperors“** (WHE).
3. **395** – Theodosius stirbt, Arcadius bekommt den Osten, Honorius den Westen (Prokop III.1).
4. **410** – Alarich und die Goten kommen nach Rom und plündern es (Prokop III.2).
5. **455** – Die Vandalen plündern Rom (WHE Vandals; Prokop III.5).
6. **476** – Odoaker setzt Romulus Augustulus ab: „the Western Empire … perished with this Augustulus“ (Jordanes 46). Nur das Jahr sagen.
7. **1453** – Die Osmanen unter Mehmed II. erobern Konstantinopel (WHE).
8. **F1 Huhn-Legende** – Honorius denkt, sein großer Hahn namens „Rome“ sei gestorben (Prokop III.2). **Nur als „legend says“ erzählen** (Prokop: „they say“). Im Englischen „rooster“, nicht „hen“.
9. **F2 Thron-Auktion 193** – Rom „wie auf einem Markt oder in einem Auktionsraum“ versteigert; Sulpicianus drinnen, Julianus draußen; erst bis 20.000 Sesterzen, dann erhöht Julianus mit einem Mal um 5.000 und zeigt die Zahl mit den Fingern → **Gebot 25.000 Sesterzen pro Soldat** (Dio 74.11.2–5; HA DJ 3.2 nennt die 25.000).
10. **F3 Julianus regiert 66 Tage**; seine letzten Worte: „But what evil have I done? Whom have I killed?“ (Dio 74.17.5).
11. **F4 Pertinax regiert 87 Tage** (Dio 74.10).
12. **F5 Das Volk verflucht Julianus und wirft Steine nach ihm** (HA DJ 4.3–4).
13. **F6 „In wenigen Monaten wurden sechs Herrscher umgebracht“** (Gibbon Kap. 7); dass es **238** war, ist über WHE Gordian III belegt. Den Begriff „Year of the Six Emperors“ **nicht** verwenden.
14. **F7** – Septimius Severus löst die Prätorianergarde auf und ersetzt sie (WHE); Konstantin löst sie 312 endgültig auf (WHE).
15. **F8 „Augustulus“ ist eine Verkleinerungsform = „little Augustus“**, weil er „still a lad“ war (Prokop V.1, Gibbon Kap. 36). Der letzte Westkaiser trug die Namen von Romulus und Augustus (Gibbon). Kein genaues Alter nennen.
16. **F9 Pension statt Tod** – Odoaker verschont ihn wegen seiner Jugend und gibt ihm **wegen seiner Schönheit** 6.000 Goldstücke Einkommen; er lebt frei in Kampanien (Excerpta Valesiana 8.38). *Formulierung „too pretty to kill“ siehe Befund.*
17. **F10** – Der Senat schreibt nach Konstantinopel, ein Kaiser genüge für Ost und West; die Kaiserinsignien gehen an Zeno (Gibbon Kap. 36; WHE Odoacer). Gibbon ist eine Sekundärquelle.
18. **F11 300 junge Krieger als „Sklaven-Geschenk“, die mittags das Salarische Tor öffnen** (Prokop III.2). **Nur als „one story says“** erzählen, denn Prokop nennt selbst eine zweite Version (Proba).
19. **F12** – Die Vandalen reißen die Hälfte des **vergoldeten Bronzedachs** vom Jupitertempel ab; ein Schiff mit Statuen geht unter („they say“) (Prokop III.5). **14 Tage Plünderung** (Gibbon Kap. 36).
20. **F13** – Der Osten bestand noch **977 Jahre** weiter (1453 − 476), „fast 1000 Jahre“. Die Byzantiner nannten sich „Romans“ (WHE).
21. **F14** – Das Reich maß an der Mittelmeerküste entlang **347 Tagesreisen** (Prokop III.1; „in the ancient times“).
22. **F15** – Caesar kämmte sein schütteres Haar nach vorn und trug am liebsten jederzeit einen Lorbeerkranz (Sueton, Iul. 45). Nur als Kostüm-Gag, Caesar war kein Kaiser.
23. **F16** – Frontinus prahlt mit den Aquädukten gegenüber den „idle Pyramids“ (De aquis 1.16).
24. **Zahlen:** Kolosseum fasste **50.000 Zuschauer** (WHE), die Fassade ist **48,50 m** hoch (Platner & Ashby). Für die Einwohnerzahl gibt es nur Gibbons Schätzung von 1,2 Mio. (Kap. 31), ausdrücklich als „one 18th-century estimate“.
25. **M1** – 476 ist das *traditionelle* Datum, und schon Gibbon schreibt, das genaue Jahr sei unsicher (Anm. 125). „Didn’t fall in a day“ ist als Gag freigegeben.
26. **M2** – Historiker streiten bis heute über die Ursachen (WHE). Im Video „historians still argue“ sagen.
27. **M3** – Vitruv warnte schon damals vor Bleirohren (8.6.10). Blei nur als „one wild theory“ nennen.
28. **M4** – Gibbon hält den Hass der Barbaren auf Monumente für eine „romance“ (Kap. 71). Als „even Gibbon said…“ formulieren.
29. **M5** – „vandal“ wurde zum Synonym für Zerstörung, wegen der Berichte römischer Autoren (WHE).
30. **Bild:** weiße Wolltoga; die bestickte toga picta nur im Triumph; Lorbeerkranz beim Triumph; Purpur = Kaiser; Purpur war teuer (Preisedikt 301: 150.000 Denare/Pfund); gewölbter Rechteckschild; Schienen- oder Kettenpanzer; Schildembleme je Kohorte; Kolosseum; Forum mit Tempeln, Säulen und Triumphbögen; Wasserleitung mit Kanal; Honorius mit großem Hahn; Odoaker „of tall stature“ in „paltry skins“.

---

## Befunde je Aussage

### 1. Kern-Zeitleiste

| # | Aussage | Status | Befund | Korrekturvorschlag |
| --- | --- | --- | --- | --- |
| Z1 | 27 v. Chr., Augustus erster Kaiser (Jordanes 46 §243) | **ABWEICHUNG** (in Quelle korrigiert) | Das Zitat und §243 stimmen wörtlich. Die „Herleitung“ von 27 v. Chr. ist aber **falsch**: Das 709. Jahr ab Gründung ergibt 754 − 709 ≈ **45 v. Chr.**, also Caesars Zeit. Auch Jordanes’ „522. Jahr“ bis 476 führt auf 476 − 521 ≈ 45 v. Chr. | 27 v. Chr. über WHE belegen: „The Roman Empire was founded by the first emperor Augustus (r. 27 BCE-14 CE)“ (https://www.worldhistory.org/Western_Roman_Empire/). Habe ich in der Quellendatei ergänzt. |
| Z2 | 193 Year of Five Emperors (WHE Septimius Severus) | BESTÄTIGT | wörtlich vorhanden. „his accession“ = Severus | – |
| Z3 | 395 Teilung (Prokop III.1) | BESTÄTIGT | Wortlaut und Kapitel I stimmen. „[Jan. 17, 395 A.D.]“ ist Dewings Einfügung. Prokop schreibt direkt danach, die Macht sei „as far back as the time of Constantine“ geteilt gewesen. | Im Video „split for good in 395“ ist in Ordnung; nicht behaupten, es sei die erste Teilung gewesen. |
| Z4 | 410 Alarich (Prokop III.2) | BESTÄTIGT | Kapitel II stimmt. Die Plünderung steht im selben Kapitel („after plundering the whole city“). Das Datum stammt von Dewing. | – |
| Z5 | 455 Vandalen (WHE Vandals) | BESTÄTIGT | wörtlich vorhanden. Prokop III.5 berichtet die Plünderung ebenfalls. | – |
| Z6 | 476 Odoaker/Augustulus (Jordanes 46 §242–243) | BESTÄTIGT | Wortlaut stimmt. Die Auslassung „…“ deckt „which Octavianus … city,“ ab, die Abschnittsangabe stimmt. | – |
| Z7 | 4. Sept. 476 (WHE Odoacer) | BESTÄTIGT (als WHE-Angabe) | wörtlich vorhanden. Prokop/Dewing nennt dagegen den 28. Juli 476 als Datum von Orestes’ Tod und Odoakers Machtübernahme ([C]/[D]). | wie in der Quelle: nur „476“ sagen |
| Z8 | 1453 (WHE Byzantine Empire) | BESTÄTIGT | wörtlich vorhanden | – |
| Z9 | Gibbon Anm. 125, Jahr unsicher | BESTÄTIGT | Kapitel 36, Anm. 125 stimmen. Die Anmerkung fährt fort: Jordanes’ Daten „would delay that great event to the year 479“. | – |
| Z10 | Excerpta Valesiana: „ten years“ falsch | BESTÄTIGT | Der Text sagt tatsächlich „Augustulus was made emperor and ruled for ten years“ (7.36). Dass er 475 Kaiser wurde, stützt Dewings [B] „July 31, 475“ bei Prokop V.1. | – |

### 2. Story-Fakten

| # | Aussage | Status | Befund | Korrekturvorschlag |
| --- | --- | --- | --- | --- |
| F1 | Honorius und der Hahn „Rome“ (Prokop III.2) | BESTÄTIGT (als Legende) | wörtlich vorhanden, Kapitel II. Die Legende ist als solche gekennzeichnet („they say“ steht zweimal). „~140 Jahre später“ passt: Prokop schrieb um 545–551. | Die Überschrift sagt „Huhn“, der Text „Hahn“: einheitlich **Hahn/rooster** schreiben. |
| F2 | Auktion 193 (Dio 74.11.2–5) | BESTÄTIGT | Alle drei Zitate stehen wörtlich in Kapitel 11 (Abschnitte 2–5; Thayer-Anker „73-11“ = Boissevain-Zählung, die Seite heißt „Epitome of Book 74“). Julianus stand „at the gates of the enclosure“. Die Rechnung 20.000 + 5.000 = 25.000 ist richtig, und HA DJ 3.2 nennt die 25.000 ausdrücklich. Herodian-Anmerkung wörtlich vorhanden (Thayer Anm. 15). | – |
| F3 | 66 Tage (Dio 74.17.5) | BESTÄTIGT | Wortlaut und Kapitel 17 §5 stimmen. Gegenprobe: 28. März 193 (Mord an Pertinax, WHE) bis 1. Juni 193 (Todesurteil, WHE) sind 65 Tage Abstand, also 66 Tage gezählt mit beiden Rändern. Die HA nennt „two months and five days“ (DJ **9.3**), das sind etwa 65–66 Tage und damit praktisch gleich. | ggf. HA-Stelle „9.3“ nachtragen |
| F4 | 87 Tage Pertinax (Dio 74.10.3) | BESTÄTIGT | Wortlaut und Kapitel 10 stimmen. Abschnitt 3 ist auf der Thayer-Seite nicht nummeriert und nicht nachprüfbar. Gegenprobe: 1. Jan. bis 28. März 193, beide Tage mitgezählt, sind 87 Tage. | – |
| F5 | Steine auf Julianus (HA DJ 4.3–4) | BESTÄTIGT | wörtlich vorhanden, Kapitel 4 §3–4 | – |
| F6 | 193 fünf Kaiser; 238 sechs Herrscher | BESTÄTIGT (mit Hinweis) | Alle WHE-Zitate sind wörtlich vorhanden. Die Liste der fünf ist eine Herleitung: WHE nennt Albinus, Niger und Severus „three possible candidates“. Gibbon „six princes“ steht in Kapitel VII. Die Jahreszahl 238 nennt Gibbon an der Stelle nicht; WHE Gordian III belegt „238 CE - 244 CE Reign of Gordian III“. | 238 mit WHE Gordian III belegen (https://www.worldhistory.org/Gordian_III/) |
| F7 | Garde aufgelöst (WHE) | BESTÄTIGT | beide Zitate wörtlich vorhanden | – |
| F8 | Romulus + Augustus → „Augustulus“ (Gibbon 36, Prokop V.1, Thayer Anm. 9) | BESTÄTIGT | alle drei wörtlich, Stellen stimmen. Bei Prokop wurde die Datumsmarke „[B]“ entfernt. Ein genaues Alter ist korrekt als unbelegt markiert. | – |
| F9 | „Zu hübsch zum Töten“ – Rente (Exc. Val. 8.38) | **ABWEICHUNG** (Überschrift überdehnt) | Das Zitat steht wörtlich in 8.38. Laut Text wurde sein **Leben aus Mitleid mit seiner Jugend** verschont („in pity for his tender years“); die **Schönheit** war nur der Grund für das **Einkommen**. Die Excerpta sagen nicht „jährlich“, erst Gibbon schreibt „annual allowance“. Gibbon- und Prokop-Zitate wörtlich vorhanden. | Überschrift und Gag ändern zu „spared because he was just a kid – and **paid a pension because he was pretty**“. „Yearly“ nur mit Gibbon. |
| F10 | Insignien nach Konstantinopel (Gibbon 36, Anm. 124; WHE) | BESTÄTIGT | alle Zitate wörtlich, Anm. 124 stimmt. Das erste Zitat ist ein Teil von Gibbons Paraphrase des Senatsbriefs. Die Einschränkung (Malchus nicht eingesehen) ist richtig. | – |
| F11 | 300 Jünglinge (Prokop III.2) | BESTÄTIGT (als eine Version) | wörtlich vorhanden. Die Gegenversion mit Proba ist richtig angegeben. | – |
| F12 | Halbes Golddach, 14 Tage (Prokop III.5; Gibbon 36) | BESTÄTIGT (mit Wortlaut-Hinweis) | beide Zitate wörtlich. Prokop beschreibt **Bronze mit dicker Vergoldung**, kein Golddach. Dass der Schiffsverlust nur Hörensagen ist („they say“), steht im Zitat. Kapitel V stimmt. | Überschrift auf „vergoldetes Bronzedach“ ändern |
| F13 | 977 Jahre, „Romans“ (WHE) | BESTÄTIGT | 1453 − 476 = 977 ✓. Beide Zitate wörtlich. Die URL des Artikels 835 hat sich per 301-Umleitung geändert. | URL in der Quelle korrigiert |
| F14 | 347 Tagesreisen (Prokop III.1) | BESTÄTIGT | wörtlich, Kapitel I. Die Zahl gilt nur unter der Bedingung „if … one ferries over the Ionian Gulf“, und Prokop: „one day's journey extends two hundred and ten stades“. | – |
| F15 | Caesars Kranz/Glatze (Sueton 45) | BESTÄTIGT | Beide Teilzitate stehen in Kapitel 45 | – |
| F16 | Aquädukte vs. Pyramiden (Frontinus 1.16) | BESTÄTIGT | wörtlich (Seitenmarke p359 entfernt), Abschnitt 1.16 stimmt | – |
| Z-Einw. | 1,2 Mio. (Gibbon 31) | BESTÄTIGT (als Gibbons Schätzung) | wörtlich, Kapitel XXXI. Gibbon bezieht die Zahl auf Rom zur Zeit Alarichs. Die „rund 1 Mio.“ ist zu Recht als unbelegt markiert. | – |
| Z-Kol. | 50.000 / 45.000 + 5.000 / 48,50 m | BESTÄTIGT | alle wörtlich vorhanden | – |

### 3. Mythen

| # | Aussage | Status | Befund | Korrekturvorschlag |
| --- | --- | --- | --- | --- |
| M1 | 476 nicht „an einem Tag“ | BESTÄTIGT (in Quelle korrigiert) | Das WHE-Zitat begann mitten im Satz und ließ das „**c.**“ weg (Original: „While c. 476 CE is the traditionally accepted date …“). Gibbon Anm. 125 ✓. | „c.“ in der Quelle ergänzt |
| M2 | Ursachen umstritten | BESTÄTIGT | WHE-Zitate wörtlich, Gibbon Kap. 38 („General Observations“) wörtlich. Die Aussage über „die Forschung“ stützt sich auf eine **Tertiärquelle (WHE)**, das ist für „historians still argue“ ausreichend. | – |
| M3 | Bleivergiftung | BESTÄTIGT (Vitruv) / NICHT NACHPRÜFBAR (Forschungsurteil) | Das Vitruv-Zitat steht wörtlich in **8.6.10**. Die Kapitelüberschrift „Chapter 6“ ist auf der Seite sichtbar, anders als in der Quelle behauptet (dort korrigiert). Das moderne Forschungsurteil ist zu Recht als unbelegt markiert. | – |
| M4 | Barbaren zerstörten nicht aus Hass | BESTÄTIGT (als Gibbons Urteil) | wörtlich, Kapitel LXXI. Das ist **Gibbons Meinung von 1788**, kein moderner Forschungsstand. Gibbon schreibt im Anschluss, es sei um „portable wealth“ gegangen, und die Goten hätten Rom am 6. Tag geräumt, die Vandalen am 15. | Im Video als „even Gibbon thought…“ und nicht als „historians agree“ |
| M5 | Vandalen = Vandalismus | BESTÄTIGT / Grégoire NICHT NACHPRÜFBAR | WHE wörtlich. Britannica gibt 403 zurück, etymonline wird vom Proxy abgewiesen. | Grégoire 1794 weiter nicht verwenden |
| M6 | Kaiserzeit nicht ständiges Chaos (Gibbon 3) | **ABWEICHUNG** (Zitat aus dem Zusammenhang) | Wortlaut und Kapitel III stimmen. Der Satz beginnt im Original aber mit „**Excepting only this short, though violent eruption of military license**, the two centuries …“, und direkt davor steht „In the space of eighteen months, four princes perished by the sword“. Die Quelle erwähnt das, aber das Zitat allein überdehnt Gibbon. Außerdem sagt Gibbon „four princes perished“ und nicht „4 Kaiser“. | Zitat mit „Excepting only this short, though violent eruption …“ anführen oder M6 im Drehbuch weglassen |

### 4. Bild-Hinweise

| Motiv | Status | Befund | Korrekturvorschlag |
| --- | --- | --- | --- |
| Toga weiß / toga picta | BESTÄTIGT | wörtlich (Seitenmarke p1137 entfernt) | – |
| Lorbeerkranz (Smith, Corona) | BESTÄTIGT | „It was made with laurel or bay leaves“ bezieht sich auf die erste Triumphkrone | – |
| Purpur = Kaiser / Preis | BESTÄTIGT | wörtlich. Die WHE-Quelle nennt das „301 CE price edict … of Diocletian“. | – |
| Scutum gewölbt, 4 × 2½ Fuß | BESTÄTIGT (Smith) mit Hinweis | wörtlich (p1013 entfernt). Smith verweist für die Maße auf „Polybius (VI.21)“, WHE Roman Army dagegen auf **Polybius 6.23.2–5**. Smiths Stellenangabe ist wahrscheinlich ungenau, Polybius selbst habe ich nicht geprüft. | Die Maße nicht als Polybius-Zitat ausgeben |
| Lorica (Bänder / Kettenhemd) | BESTÄTIGT | wörtlich. Das Kettenhemd gehört laut Smith zu den republikanischen hastati, die Bänder zu den „monuments of the times of the emperors“. | Für die Spätzeit beides möglich |
| Helm (Smith, Galea) | **ABWEICHUNG** (überdehnt) | Das Zitat ist wörtlich vorhanden, steht aber im Absatz über den **griechischen Begriff κυνέη bei Homer** („πάγχαλκος, Od. XVIII.377“). Für einen **römischen Legionärshelm** belegt es nichts. | Metallhelm als Stil-Entscheidung kennzeichnen oder eine andere Quelle suchen |
| Schild-Embleme (WHE) | BESTÄTIGT | wörtlich | – |
| Kolosseum / Forum / Aquädukt (Vitruv 8.6.1) | BESTÄTIGT | wörtlich | – |
| Odoaker (Exc. Val. 10.46) | BESTÄTIGT | wörtlich, 10.46 stimmt. Die Excerpta zitieren dort die *Vita Severini* (das sollte so genannt werden). | – |
| Goten/Vandalen-Kleidung | NICHT NACHPRÜFBAR | Es gibt keine Quelle, und die Museen sind gesperrt. Die Datei kennzeichnet das richtig. | – |

### Sonstiges

- Die Angaben zu den Quellen sind stichprobenartig geprüft: Jordanes schrieb 551 (Mierow-Vorbemerkung: „wrote his account in the year 551“) ✓. Dio war 193 Senator („As for us senators“, 74.12) ✓.
- Korrekturen in `docs/quellen-roemisches-reich.md` (markiert mit „[korrigiert Faktencheck]“): (1) Herleitung 27 v. Chr. und WHE-Beleg in der Zeitleiste, (2) Vitruv-Stelle 8.6.10, Kapitel sichtbar, (3) „c.“ im M1-Zitat ergänzt, (4) WHE-URL Artikel 835 (zwei Stellen).
- Nur Vorschläge, nicht geändert: F1 Huhn→Hahn, F9 Überschrift, F12 „vergoldetes Bronzedach“, M6 Zitat vervollständigen, Galea-Beleg ersetzen, F6 238 mit WHE Gordian III belegen.
