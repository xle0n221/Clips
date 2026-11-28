#!/usr/bin/env python3
"""Stille in eine fertige Vertonung EINFÜGEN, ohne neu zu sprechen (Gegenstück zu retime_pauses.py, Suche-Stadt 21.11.2026).

Wofür: Platz für einen Zensur-Piep („my… [Piep] …smell“) oder eine Kunstpause vor/nach einem Pointen-Wort, wenn
Chatterbox „…“ nicht als Pause spricht. --at "<ms>:<dauer>" (mehrfach): an Stelle ms (Tonspur-Zeit, z. B. Wort-Ende aus
captions.json) werden dauer ms Raumstille eingesetzt; alle Zeiten ≥ ms (captions, timeline: scenes, cues, durationMs)
rücken nach hinten. Danach music.wav neu wie make_episode.py; Bett neu mit scripts/make_sound_bed.py (+ add_bleep.py).

    .venv/bin/python scripts/insert_pauses.py <episode-id> --at 46440:550 --at 41220:500 [--dry]
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
    ap.add_argument("--at", action="append", required=True, help="<ms>:<dauer ms>")
    ap.add_argument("--dry", action="store_true")
    a = ap.parse_args()
    ins = sorted((float(x.split(":")[0]), float(x.split(":")[1])) for x in a.at)
    pub = ROOT / "public" / "episodes" / a.id
    caps = json.loads((pub / "captions.json").read_text())
    tl = json.loads((pub / "timeline.json").read_text())
    voice, sr = sf.read(str(pub / "voice.wav"), dtype="float32")

    def shift(ms: float) -> float:
        return ms + sum(d for m, d in ins if m <= ms)

    for m, d in ins:
        print(f"  {m / 1000:7.2f} s  +{d:4.0f} ms")
    if a.dry:
        return
    x = voice
    for m, d in sorted(ins, reverse=True):
        i = int(round(m / 1000 * sr))
        n = int(round(d / 1000 * sr))
        rng = np.random.default_rng(int(m))
        sil = (rng.standard_normal((n,) + x.shape[1:]) * 10 ** (-72 / 20)).astype("float32")  # Raumton wie room_tone_db
        x = np.concatenate([x[:i], sil, x[i:]])
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
    tl["durationMs"] = round(tl["durationMs"] + sum(d for _, d in ins))
    (pub / "timeline.json").write_text(json.dumps(tl, indent=1) + "\n")

    from make_audio import make_music  # noqa: E402
    from make_episode import music_plan  # noqa: E402

    ep = json.loads((ROOT / "episodes" / f"{a.id}.json").read_text())
    mus = ep.get("music") or {}
    at = {sc["id"]: sc["startMs"] / 1000 for sc in tl["scenes"]}
    make_music(pub / "music.wav", seconds=tl["durationMs"] / 1000 + 1, bpm=mus.get("bpm"), mood=mus.get("mood", "upbeat"),
               seed=mus.get("seed", ep["id"]), sparse_until=at.get(mus.get("sparseUntilScene"), 0.0), plan=music_plan(mus, at))
    print(f"+{sum(d for _, d in ins):.0f} ms; Länge jetzt {tl['durationMs'] / 1000:.2f} s + End-Card")


if __name__ == "__main__":
    main()
