#!/usr/bin/env python3
"""Holt Trend-Rohdaten von TikTok und YouTube Shorts über die Apify-API (docs/trend-analyse.md).

Der Apify-Token liegt als Netzwerk-Secret der Umgebung „Clips“ für api.apify.com; der Proxy setzt den
Authorization-Header. Dieses Skript sendet daher einen Platzhalter, nie einen echten Wert.

Aufruf:  python3 scripts/trends_fetch.py [--tiktok N] [--youtube N] [--cap 0.15] [--out out/trends/<datum>]
Ergebnis: <out>/tiktok.json, <out>/youtube.json (Rohdaten) und <out>/summary.json (verdichtet, sortiert nach Aufrufen).
"""
import argparse
import datetime as dt
import json
import pathlib
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.apify.com/v2"
# Suchbegriffe: englische Cartoon-/Animations-Erklärvideos (Themen-Nische der Clips)
QUERIES = ["animated explainer", "cartoon explained", "what if animation", "history animated", "science animation"]


def call(method: str, path: str, data: dict | None = None, timeout: int = 60):
    req = urllib.request.Request(f"{API}{path}", method=method,
                                 data=json.dumps(data).encode() if data is not None else None,
                                 headers={"Content-Type": "application/json", "Authorization": "Bearer proxy-injected"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read() or b"null")


def items_of(run_data: dict) -> list:
    ds = run_data.get("defaultDatasetId")
    return call("GET", f"/datasets/{ds}/items?clean=true&format=json") if ds else []


def run(actor: str, payload: dict, cap: float, timeout: int = 900) -> list:
    """Startet den Actor asynchron (lange synchrone Anfragen bricht der Proxy mit 502 ab), wartet, holt den Datensatz."""
    try:
        q = urllib.parse.urlencode({"maxTotalChargeUsd": cap, "timeout": timeout})
        r = call("POST", f"/acts/{actor}/runs?{q}", payload)["data"]
        rid, waited = r["id"], 0
        while r.get("status") in ("READY", "RUNNING") and waited < timeout + 60:
            r = call("GET", f"/actor-runs/{rid}?waitForFinish=50", timeout=90)["data"]
            waited += 50
        cost = (r.get("usageTotalUsd") or 0)
        print(f"{actor}: {r.get('status')}, Kosten {cost:.4f} USD, Lauf {rid}")
        return items_of(r)
    except urllib.error.HTTPError as e:
        print(f"{actor}: HTTP {e.code} {e.read()[:300]!r}")
        return []


def num(x):
    try:
        return int(x)
    except (TypeError, ValueError):
        return None


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--tiktok", type=int, default=25, help="TikTok-Videos gesamt (0 = aus)")
    ap.add_argument("--youtube", type=int, default=25, help="YouTube Shorts gesamt (0 = aus)")
    ap.add_argument("--cap", type=float, default=0.15, help="Kostendeckel YouTube in USD (TikTok-Actor: mindestens 0,50)")
    ap.add_argument("--out", type=pathlib.Path, default=None)
    a = ap.parse_args()
    today = dt.date.today().isoformat()
    out = a.out or pathlib.Path("out/trends") / today
    out.mkdir(parents=True, exist_ok=True)
    rows = []
    per_q = lambda n: max(1, n // len(QUERIES))  # noqa: E731

    if a.tiktok:
        items = run("clockworks~tiktok-scraper", {
            "searchQueries": QUERIES, "resultsPerPage": per_q(a.tiktok), "searchSection": "/video",
            "videoSearchDateFilter": "PAST_WEEK", "shouldDownloadVideos": False, "shouldDownloadCovers": False,
        }, max(a.cap, 0.5))  # Actor verlangt Deckel >= 0,50 $; Kosten steuert die Ergebnisanzahl
        (out / "tiktok.json").write_text(json.dumps(items, ensure_ascii=False, indent=1))
        for it in items:
            au = it.get("authorMeta") or {}
            vm = it.get("videoMeta") or {}
            rows.append({"platform": "tiktok", "url": it.get("webVideoUrl"), "author": au.get("name"),
                         "followers": num(au.get("fans")), "text": (it.get("text") or "")[:160],
                         "views": num(it.get("playCount")), "likes": num(it.get("diggCount")),
                         "shares": num(it.get("shareCount")), "comments": num(it.get("commentCount")),
                         "durationSec": vm.get("duration"), "created": it.get("createTimeISO")})

    if a.youtube:
        items = run("streamers~youtube-scraper", {
            "searchQueries": QUERIES, "maxResults": 0, "maxResultsShorts": per_q(a.youtube),
            "maxResultStreams": 0, "dateFilter": "week",
        }, a.cap)
        (out / "youtube.json").write_text(json.dumps(items, ensure_ascii=False, indent=1))
        for it in items:
            if it.get("error"):
                print(f"youtube: {it.get('input')}: {it.get('error')}")
                continue
            rows.append({"platform": "youtube", "url": it.get("url"), "author": it.get("channelName"),
                         "followers": num(it.get("numberOfSubscribers")), "text": (it.get("title") or "")[:160],
                         "views": num(it.get("viewCount")), "likes": num(it.get("likes")), "shares": None,
                         "comments": num(it.get("commentsCount")), "durationSec": it.get("duration"),
                         "created": it.get("date")})

    rows.sort(key=lambda r: r["views"] or 0, reverse=True)
    summary = {"fetchedAt": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
               "source": "Apify (Drittanbieter): clockworks/tiktok-scraper, streamers/youtube-scraper",
               "queries": QUERIES, "count": len(rows), "rows": rows}
    (out / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=1))
    by = {}
    for r in rows:
        by[r["platform"]] = by.get(r["platform"], 0) + 1
    print(f"{out}/summary.json: {by}")


if __name__ == "__main__":
    main()
