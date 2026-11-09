# Rolle: Veröffentlichung (Titel, Texte, Hashtags, Thumbnail-Bild)

> Gedächtnis dieser Rolle. **Vor jedem Auftrag lesen, nach jedem Auftrag ergänzen.** Ablauf: [`README.md`](README.md).

## Auftrag
Schreibt für jedes fertige Video YouTube-Shorts- und TikTok-Texte (Titel, Beschreibung, Caption, Hashtags aus `hashtags/current` im Dashboard) und schlägt das Vorschaubild vor. Ergebnis ins Dashboard-Feld `publish`. Prüfer: Retention-Kritiker + Faktenprüfer (keine unbelegten Behauptungen in Texten).

## Messlatte (1–10)
- Titel ≤ 100 Zeichen, Neugier ohne Clickbait-Lüge
- Hashtags: YouTube ≤ 3 sichtbar, TikTok ≤ 5
- Jede Faktenaussage im Text belegt

## Checkliste (aktueller bester Stand – nur Erprobtes)
- Von Faktenprüfer: Kausal-Wörter („so“, „because“, „killed“) in Titel und Caption gegen die Freigabeliste prüfen – sie erzeugen Behauptungen, die die Quelle nicht macht (`faktencheck-drehbuch-roemisches-reich.md`) (übertragen vom Wissensverwalter 09.11.2026).

## Gelernt (neueste oben; Datum · Clip · Befund · Beleg)
- 09.11.2026 · Rom · **Titel gegen Hook-Zeitpunkt messen:** Zu jeder Titel-Variante notieren, in welcher Sekunde das Video ihr
  Versprechen einlöst (Wortzeit aus `captions.json`, Sticker aus `timeline.json`). Titel A „You bought the Roman Empire“ → 0,92 s
  („auctioned“ + Sticker), Titel B „He lasted 66 days“ → 19,3 s. Darum A als Hauptvariante. · `docs/veroeffentlichung-roemisches-reich.md`
- 09.11.2026 · Rom · **Hashtag-Kombis im Dashboard sind themenabhängig:** `hashtags/current` hat nur Weltraum/Wissenschaft; für ein
  Geschichtsthema passte kein Tag → alle themenspezifisch ersetzt, Reichweite als unbelegt markiert. · `hashtags/current` Version 4
- 09.11.2026 · Rom · **Faktentabelle Text → Freigabe-Nr.** macht die Prüfung für den Faktenprüfer schnell; Aussagen, die nur im
  Drehbuch-Faktencheck, aber nicht in der Freigabeliste stehen („guards killed …“), lieber weglassen. · `docs/veroeffentlichung-roemisches-reich.md`
- 09.11.2026 · Rom · `publish` hat nur **ein** Feld `title`: Variante B und Vorschaubild stehen in `publish.note`. · `out/rome-publish.json`

## Nächste Experimente
- Zwei Titel-Varianten je Video, Nutzer wählt; Ergebnis (Aufrufe) später nachtragen. **Rom (09.11.2026) durchgeführt:** A 44 Z.
  (Einlösung 0,92 s), B 60 Z. (Einlösung 19,3 s); Aufrufe nach dem Posten nachtragen.
- Vorschaubild am echten Standbild prüfen (Kontrast Overlay/Hintergrund messen wie der Design-Kritiker), nicht nur nach Sekunde aus `timeline.json`.
- Werkzeugbau: kleines Skript, das für einen Titel die Einlöse-Sekunde aus `captions.json` sucht und Zeichenzahlen prüft.
- Wissensverwalter/Hashtag-Lauf bitten, eine Kombi „Geschichte“ in `hashtags/current` aufzunehmen.

## Bewertungsverlauf
| Datum | Clip | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- | --- |
| 09.11.2026 | Rom | ausstehend (Retention-Kritiker + Faktenprüfer) | – |
