# Bildnachweise – „In This City, You Pay With Time“ (zeit-welt)

Stand 13.11.2026 (Szenen/Art Direction). Regel: `docs/clip-regeln.md` → „Echte Bilder und Videos“.

## Verwendet (gemeinfrei, NASA)

Lizenzgrundlage (wörtlich, https://www.nasa.gov/nasa-brand-center/images-and-media/, abgerufen 13.11.2026):
„NASA content – images, audio, video, and media files … – generally are not subject to copyright in the United States.“ und
„NASA should be acknowledged as the source of the material.“ – Keine der Dateien ist auf der Seite als Fremdmaterial
(„Image courtesy of …“) gekennzeichnet (geprüft über die WordPress-Medien-API von nasa.gov, Feld `caption`).

| # | Szene | Datei im Repo | Quelle (Datei-URL) | Detailseite | Inhalt laut NASA | Bearbeitung |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | franklin, literal (Bilderrahmen „OUR WORLD“) | `public/episodes/zeit-welt/real/city-lights-iss.jpg` | https://www.nasa.gov/wp-content/uploads/2026/11/iss075e0227352orig.jpg | https://www.nasa.gov/image-detail/iss075e0227352/ | „City lights from the midwestern United States to the East Coast sparkle across the landscape a couple of hours before sunrise.“ (ISS-Foto iss075e0227352) | verkleinert auf 1600 px Breite, Ken-Burns-Fahrt im Rahmen |
| V1 | question (Spiegelung im Zeitglas) | `public/episodes/zeit-welt/real/aurora-city-lights-iss.mp4` | https://www.nasa.gov/wp-content/uploads/2025/04/iss072e503021-aurora-borealis-4k.mp4 | https://www.nasa.gov/video-detail/iss072e503021-aurora-borealis-4k/ | NASA-Titel „Aurora borealis over the US and Canada“; Beschreibung: „Brilliant green auroras glow and swirl above clusters of the white lights of cities on Earth as viewed from space at night.“ **Im verwendeten Ausschnitt (Standbilder 1 s/6 s geprüft 13.11.2026): überwiegend Stadtlichter auf der Nachtseite, Polarlicht nur als schwacher grüner Schimmer am unteren Rand** – deshalb Dateiname „aurora-city-lights“ und im Video nur als „city lights from space“ beschrieben, nicht als Pendler/Menschenmenge | 8 s ab 0 s, linkes 42-%-Bildteil (Städte) beschnitten, 720 px, ohne Ton; im Glas bläulich getönt und teiltransparent |
| (Reserve) | – | `public/episodes/zeit-welt/real/city-lights-vertical.jpg` | https://www.nasa.gov/wp-content/uploads/2026/03/light-the-way-%E2%80%93-mobile-%E2%80%93-image-only.png | https://www.nasa.gov/image-detail/light-the-way-mobile-image-only/ | „City lights trace river valleys … Romania. The International Space Station was orbiting 262 miles above Europe …“ | nicht im Bild verwendet (Hochformat-Alternative) |

Beschreibungstext (YouTube/TikTok): „Real footage: NASA (ISS photo of city lights at night; ISS video 'Aurora borealis over the US and Canada', public domain).“

## Nicht gefunden / bewusst nicht verwendet (Befund)

- **Wikimedia Commons** (geplant: Uhrwerk-Video V1, Uhrmacher-Werkzeug B1, Turmuhr-Mechanik B2, Franklin-Porträt B3, Pendler-Zeitraffer V3):
  aus dieser Umgebung gedrosselt – `commons.wikimedia.org/w/api.php` antwortete am 13.11.2026 mit **HTTP 429**. Nicht erzwungen.
- **Echtes Uhrwerk / Sanduhr mit klarer Lizenz** auf den erlaubten Hosts: Suche in der nasa.gov-Medien-API („clock“, „gears“,
  „pendulum“, „hourglass“, „pocket watch“) brachte nur Atomuhr-Grafiken, Raumfahrt-Fotos, Nebel-Aufnahmen und
  „Hourglasses (Image courtesy of JAXA)“ – letzteres ist **Fremdmaterial (JAXA)**, also nicht gemeinfrei → nicht verwendet.
  „Hourglass Samples“ (jsc2019e039835) zeigt nur beschriftete Sandbeutel – passt nicht zum Bild. nps.gov / noaa.gov: Suche nur per
  JavaScript, keine Treffer mit Lizenzangabe; usgs.gov antwortete 403. → Uhrwerk, Turmuhr und Sand bleiben eigene 3D-Modelle.
- **Franklin-Porträt**: Die NPS-Seite https://www.nps.gov/inde/learn/historyculture/people-franklin.htm zeigt Bilder ohne
  Bildnachweis (Lizenz nicht bestätigbar) → nicht verwendet. Statt Porträt: eigene Papierkarte „ADVICE TO A YOUNG TRADESMAN ·
  B. FRANKLIN · 1748“ (kein Faksimile) neben dem echten NASA-Foto „unserer Welt“. Ich kann nicht bestätigen, dass es auf den
  erlaubten Hosts ein Franklin-Bild mit klarer Lizenz gibt.
