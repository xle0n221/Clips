# Benchmark Tempo: Sprechtempo und Länge viraler Cartoon-Shorts (12.11.2026)

Anlass: Nutzerwunsch 12.11.2026 „Gleiche die Geschwindigkeit mit der Videolänge mit anderen viralen Videos in der Branche ab.“
**Nur zur Information.** Die geltende Regel (Sprechtempo 2,3–2,6 W/s, Ziel 2,4, ruhigeres Bildtempo) hat der Nutzer festgelegt; dieser Text vergleicht sie nur mit den Messwerten.

## Methode
- Daten: Apify (Drittanbieter, kein Plattform-Export), je ein Lauf je Plattform, Abruf 12.11.2026:
  `clockworks/tiktok-scraper` (Suche, „meist geliked“, letzte 6 Monate, Untertitel von TikTok = ASR) und
  `streamers/youtube-scraper` (Shorts, Filter „Jahr“, Sortierung Aufrufe, Untertitel).
  Suchbegriffe: animated history story · cartoon explained narrator · what if animation · animated biography athlete · animated satire cartoon story.
- Rohsample: 20 TikTok + 11 YouTube Shorts (2 YouTube-Suchen lieferten keine Treffer: „animated biography athlete“, „animated history story“).
- Sprechtempo = Wörter der Untertitel / Gesamtdauer des Videos (Tags wie [music] und „>>“ entfernt). Pausen und Intro zählen mit, wie bei unserem Tyson-Wert (2,67 W/s).
- Auswahl für W/s: nur Videos mit Erzählerstimme **und** Untertiteln (n = 9). Ausgeschlossen: reine Dialog-/Meme-/Musikclips, Filmschnitte, Videos ohne Untertitel (siehe unten). Die Auswahl habe ich von Hand nach Titel und Anfangstext getroffen, das ist subjektiv.
- Schnitte/Minute: nicht gemessen (kein Videodownload, um Kosten und Netzsperren zu sparen). Ich kann dazu nichts bestätigen.
- Ein TikTok-Treffer (2128 s, Spielfilm-Ausschnitt) fließt nicht in die Dauer-Statistik ein.

## Tabelle: Erzähl-Videos mit Wörtern (n = 9)
| Plattform | Kanal | URL | Aufrufe | Datum | Dauer s | Wörter | W/s |
| --- | --- | --- | --- | --- | --- | --- | --- |
| YT | AumSum's What-If | https://www.youtube.com/shorts/4TFrfy26XeQ | 42.011.618 | 2026-04-08 | 52 | 135 | 2,60 |
| YT | AumSum's Lab | https://www.youtube.com/shorts/cNUbHEXFDIo | 26.286.986 | 2026-04-08 | 40 | 96 | 2,40 |
| TT | cardboard_cinema | https://www.tiktok.com/@cardboard_cinema/video/7672119860985367822 | 15.419.358 | 2026-08-09 | 79 | 177 | 2,24 |
| YT | JimStoriez | https://www.youtube.com/shorts/QHxKg4cR-tI | 9.813.526 | 2026-09-20 | 56 | 259 | 4,62 |
| TT | explainedhistory9 | https://www.tiktok.com/@explainedhistory9/video/7688932910379863326 | 8.506.365 | 2026-09-24 | 67 | 230 | 3,43 |
| TT | tempesty4 | https://www.tiktok.com/@tempesty4/video/7690615917239127329 | 7.585.533 | 2026-09-28 | 62 | 249 | 4,02 |
| YT | JimStoriez | https://www.youtube.com/shorts/cn1UdJ9LuAs | 5.905.938 | 2026-09-19 | 52 | 251 | 4,83 |
| YT | Kevin67 | https://www.youtube.com/shorts/CAH8qBN8PVg | 2.574.815 | 2026-09-26 | 52 | 248 | 4,77 |
| TT | crazyflamesxd | https://www.tiktok.com/@crazyflamesxd/video/7690262265492196630 | 2.572.280 | 2026-09-27 | 88 | 252 | 2,86 |

Die drei Roblox-Satire-Clips (JimStoriez, Kevin67) sind KI-/TTS-Stimmen im Schnellsprech-Stil, kein Cartoon-Erklärformat wie unseres.

## Statistik (Quartile Q1 · Median · Q3)
| Größe | Plattform | n | Q1 | Median | Q3 |
| --- | --- | --- | --- | --- | --- |
| Dauer s (alle Treffer, ≥ 1 Mio. Aufrufe) | YouTube Shorts | 11 | 30 | 40 | 52 |
| Dauer s (alle Treffer, ≥ 1 Mio. Aufrufe) | TikTok | 19 | 19 | 32 | 73,5 |
| Dauer s (nur Erzähl-Videos) | beide | 9 | 52 | 56 | 67 |
| W/s (Erzähl-Videos) | YouTube Shorts | 5 | 2,60 | 4,62 | 4,77 |
| W/s (Erzähl-Videos) | TikTok | 4 | 2,71 | 3,15 | 3,58 |
| W/s (Erzähl-Videos) | beide | 9 | 2,60 | 3,43 | 4,62 |
| W/s ohne die 3 TTS-Satire-Clips | beide | 6 | 2,3 | 2,7 | 3,4 (grob, n zu klein) |

Länge↔Reichweite (nur beschrieben): Die meistgesehenen Treffer sind 25–52 s lang (AumSum 40/52 s), der Zweitplatzierte unter den Erzählern 79 s; ein klarer Zusammenhang ist in dieser Stichprobe nicht erkennbar. Die Stichprobe ist nach Aufrufen vorsortiert (Survivorship), ein Rückschluss „kürzer = erfolgreicher“ ist nicht zulässig.

## Unsicherheiten
- Kleine Stichprobe (n = 9 mit Wörtern), Suchtreffer waren zur Hälfte themenfremd (Meme, Dialog, Musik); Ergebnis ist ein Hinweis, kein Beleg.
- Untertitel sind ASR (Auto-Untertitel): Fehler, fehlende Wörter bei Musik möglich; Wörter/Gesamtdauer unterschätzt das reine Sprechtempo bei Pausen.
- Aufrufzahlen: Drittanbieter-Scraper, Stand 12.11.2026, nicht offiziell. Reichweite sagt nichts über Verweildauer; **Zuschauerbindung („angenehm“) kann ich nicht bestätigen**.
- Bildtempo (Schnitte) nicht gemessen.

## Vergleich mit unserer geltenden Regel (keine neue Regel)
| | W/s | Dauer |
| --- | --- | --- |
| Unsere alten Clips | 2,6–3,0 (Tyson 2,67) | ~60–90 s |
| Geltende Regel (Nutzer) | 2,3–2,6, Ziel 2,4 | – |
| Benchmark, ruhige Erzähler (AumSum ×2, cardboard_cinema, Clarence) | 2,24–2,86 | 40–88 s |
| Benchmark, Schnellsprech-Satire (TTS) | 4,6–4,8 | 52–56 s |

Einordnung: Die geltende Spanne 2,3–2,6 liegt am unteren Rand der Erzählvideos mit hoher Reichweite, die ruhig sprechen (AumSum 2,4–2,6 bei 40/52 s, 26–42 Mio. Aufrufe); sie deckt sich also mit der Spitze dieser Stichprobe. Unsere alten Werte (2,6–3,0) lagen im Mittelfeld, nicht über dem Markt; das schnelle Marktsegment (> 4 W/s) ist ein anderes Format. Bei der Länge liegen unsere 60–90 s über dem Median aller Treffer (32–40 s) und im Bereich der Erzähler (52–67 s); kürzer als 60 s wäre durch diese Daten gedeckt, aber nicht bewiesen.
