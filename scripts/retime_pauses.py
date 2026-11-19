#!/usr/bin/env python3
"""Lange Wortlücken einer fertigen Vertonung kürzen, ohne neu zu sprechen (z. B. Längenvorgabe K15: 61–70 s inkl. End-Card).

Kürzt jede Lücke zwischen zwei Wörtern (captions.json), die länger als --cap ms ist, auf --cap ms: aus voice.wav wird
die Mitte der Stille herausgeschnitten (20-ms-Überblendung), alle Zeiten danach (captions, timeline: scenes, cues,
durationMs) rücken nach vorn. --tail setzt das Ende der letzten Szene auf letztes Wort + tail ms (End-Card früher).
Danach music.wav neu wie make_episode.py (Szenenzeiten), Bett neu mit scripts/make_sound_bed.py.

    .venv/bin/python scripts/retime_pauses.py <episode-id> --cap 700 [--tail 250] [--dry]
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("id")
    ap.add_argument("--cap", type=int, required=True, help="längste erlaubte Wortlücke in ms")
    ap.add_argument("--tail", type=int, help="letzte Szene endet tail ms nach dem letzten Wort")
    ap.add_argument("--dry", action="store_true")
    a = ap.parse_args()
    pub = ROOT / "public" / "episodes" / a.id
    caps = json.loads((pub / "captions.json").read_text())
    tl = json.loads((pub / "timeline.json").read_text())
    voice, sr = sf.read(str(pub / "voice.wav"), dtype="float32")

    # Schnitte: (Mitte der Lücke in ms, zu entfernende ms)
    cuts = []
    for w0, w1 in zip(caps, caps[1:]):
        gap = w1["startMs"] - w0["endMs"]
        if gap > a.cap:
            cuts.append((w0["endMs"] + gap / 2, gap - a.cap, w0["text"].strip(), w1["text"].strip()))
    for c in cuts:
        print(f"  {c[0] / 1000:7.2f} s  −{c[1]:4.0f} ms  {c[2]!r} → {c[3]!r}")
    total = sum(c[1] for c in cuts)

    def shift(ms: float) -> float:
        return ms - sum(d for m, d, *_ in cuts if m < ms)

    last_end = shift(caps[-1]["endMs"])
    old_len = max(tl["durationMs"], tl["scenes"][-1]["endMs"] + (tl.get("endCard") or {}).get("seconds", 0) * 1000)
    if a.dry:
        print(f"Lücken −{total:.0f} ms; Länge alt {old_len / 1000:.2f} s")
        return

    # Audio schneiden (von hinten, damit Indizes stimmen)
    x = voice.copy()
    fade = int(0.02 * sr)
    for mid, d, *_ in sorted(cuts, reverse=True):
        i0 = int(round((mid - d / 2) / 1000 * sr))
        i1 = int(round((mid + d / 2) / 1000 * sr))
        ramp = np.linspace(0, 1, fade, dtype="float32")
        if x.ndim > 1:
            ramp = ramp[:, None]
        tail = x[i1 : i1 + fade] * ramp + x[i0 - fade : i0] * (1 - ramp)
        x = np.concatenate([x[: i0 - fade], tail, x[i1 + fade :]])
    sf.write(str(pub / "voice.wav"), x, sr, subtype="PCM_16")

    for c in caps:
        for k in ("startMs", "endMs", "timestampMs"):
            if c.get(k) is not None:
                c[k] = round(shift(c[k]))
    (pub / "captions.json").write_text(json.dumps(caps, indent=1) + "\n")

    for s in tl["scenes"]:
        s["startMs"] = round(shift(s["startMs"]))
        s["endMs"] = round(shift(s["endMs"]))
    for c in tl.get("cues", []):
        c["atMs"] = round(shift(c["atMs"]))
    if a.tail is not None:
        tl["scenes"][-1]["endMs"] = round(last_end + a.tail)
    tl["durationMs"] = round(len(x) / sr * 1000)
    (pub / "timeline.json").write_text(json.dumps(tl, indent=1) + "\n")

    # Musik wie make_episode.py
    from make_audio import make_music  # noqa: E402
    from make_episode import music_plan  # noqa: E402

    ep = json.loads((ROOT / "episodes" / f"{a.id}.json").read_text())
    mus = ep.get("music") or {}
    at = {sc["id"]: sc["startMs"] / 1000 for sc in tl["scenes"]}
    make_music(pub / "music.wav", seconds=tl["durationMs"] / 1000 + 1, bpm=mus.get("bpm"), mood=mus.get("mood", "upbeat"),
               seed=mus.get("seed", ep["id"]), sparse_until=at.get(mus.get("sparseUntilScene"), 0.0), plan=music_plan(mus, at))
    new_len = max(tl["durationMs"], tl["scenes"][-1]["endMs"] + (tl.get("endCard") or {}).get("seconds", 0) * 1000)
    print(f"Lücken −{total:.0f} ms; Länge {old_len / 1000:.2f} → {new_len / 1000:.2f} s (inkl. End-Card)")


if __name__ == "__main__":
    main()
