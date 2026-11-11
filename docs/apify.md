# Apify (eingerichtet 11.11.2026 nach https://apify.com/agents.md)

- **Verbindung:** Remote-MCP-Server `https://mcp.apify.com` (Streamable HTTP) in `.mcp.json`. Kein Token in Dateien:
  Der Apify-API-Token liegt als Netzwerk-Secret der Umgebung „Clips“ für `mcp.apify.com`; der Proxy setzt den Header
  `Authorization: Bearer …`. MCP-Server werden beim **Sitzungsstart** geladen → in einer neuen Sitzung prüfen, ob die
  Apify-Werkzeuge (`search-actors`, `fetch-actor-details`, `call-actor`, `get-actor-run`, `get-dataset-items`) da sind.
- **Netz:** `apify.com`, `docs.apify.com`, `api.apify.com`, `mcp.apify.com` in der Umgebung erlaubt.
- **Ablauf (agents.md):** `search-actors` (Plattform/Produkt als Stichwort, z. B. `tiktok`) → `fetch-actor-details` (README,
  Preis, Input-Schema) → `call-actor` mit kleinem Input → bei langen Läufen `get-actor-run` → `get-dataset-items`.
- **Kostenregel (verbindlich):** Vor dem **ersten bezahlten Lauf** einer Sitzung dem Nutzer Preismodell + Kostenschätzung nennen
  und auf sein OK warten; Läufe klein halten; Kostendeckel immer in `callOptions.maxTotalChargeUsd` (nicht im Input).
  Freier Plan: 5 $ Guthaben/Monat, danach Pause statt Rechnung (agents.md).
- **Einsatz im Projekt:** Hashtag-/Reichweiten-Daten und Referenzvideos (TikTok/YouTube) – als Drittanbieter-Daten kennzeichnen,
  keine Primärquelle für Fakten im Video.
- **Stand Test 11.11.2026:** Handshake an `mcp.apify.com` lieferte **401 invalid_token**, auch 2 min nach dem Speichern des
  Secrets. Mögliche Ursachen: Token falsch/ohne Rechte oder Secret greift nicht. Ich kann die Verbindung noch nicht bestätigen.
