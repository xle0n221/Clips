#!/usr/bin/env python3
"""Sprechweise messen wie ein Geschichtenerzähler-Check (Vorgabe Nutzer 12.11.2026 abends: „rattert alles durch …
zum Satzende muss es leiser werden“). Misst an voice.wav + captions.json + Drehbuch:

  W/s gesamt         Skriptwörter / Videodauer (timeline.durationMs, wie hoerprobe.py)
  Satzrate           Wörter bzw. Silben (geschätzt) je Sekunde INNERHALB der Sätze (erstes Wort-Start bis letztes
                     Wort-Ende, ohne Pausen ≥ 150 ms) – Median über Sätze ≥ 4 Wörter
  Pausen             längste Stille (10-ms-RMS < Sprachpegel − 35 dB) zwischen zwei Wörtern: nach Satzende, Komma,
                     Szenenwechsel (Median)
  Pegelabfall        letztes Wort eines Satzes gegen Median der übrigen Wörter des Satzes (dB, negativ = leiser)
  Tonhöhe Satzende   letztes Wort gegen Satz-Median (Halbtöne, pyworld dio/stonemask; negativ = fallend)
  Kanten             Satzenden, an denen der Pegel innerhalb von 10 ms von Sprachpegel −25 dB in Stille fällt
                     (abgeschnittener Ausklang)
  Whisper            Skriptwörter, die faster-whisper (small.en) wörtlich erkennt, + Liste der Abweichungen

    .venv/bin/python scripts/stimm_messung.py mike-tyson [--dir public/episodes/mike-tyson] [--whisper out/x.json]
                                                          [--json out/x-messung.json]
"""
from __future__ import annotations

import argparse
import difflib
import json
import os
import re
import subprocess
import sys
import tempfile
import warnings
from pathlib import Path

import numpy as np
import soundfile as sf

warnings.filterwarnings("ignore")
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from tts import apply_say, speakable  # noqa: E402

HOP_S = 0.01


def norm(w: str) -> str:
    return re.sub(r"[^a-z0-9]", "", w.lower())


def syllables(word: str) -> int:
    w = re.sub(r"[^a-z]", "", word.lower())
    if not w:
        return 0
    n = len(re.findall(r"[aeiouy]+", w))
    if w.endswith("e") and not w.endswith(("le", "ee")) and n > 1:
        n -= 1
    return max(1, n)


def script_words(ep: dict) -> list[dict]:
    out = []
    for sc in ep["scenes"]:
        toks = [t.replace("*", "") for t in sc["text"].split() if t.replace("*", "") and t != "|"]
        for k, t in enumerate(toks):
            spoken = speakable(apply_say(t, ep.get("years"), ep.get("say")))
            end = "scene" if k == len(toks) - 1 else "sent" if re.search(r"[.!?…]$", t) else "comma" if re.search(r"[,:;—]$", t) else None
            out.append({"w": t, "scene": sc["id"], "end": end, "syl": sum(syllables(x) for x in re.split(r"[\s-]+", spoken))})
    return out


def whisper_words(wav: Path) -> list[dict]:
    with tempfile.TemporaryDirectory() as tmp:
        w16, js = Path(tmp) / "v16.wav", Path(tmp) / "w.json"
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav), "-ar", "16000", "-ac", "1", str(w16)], check=True)
        subprocess.run([sys.executable, str(ROOT / "scripts" / "whisper_words_fw.py"), str(w16), str(js), "en"], check=True,
                       stdout=subprocess.DEVNULL)
        return [c for c in json.loads(js.read_text()) if norm(c["text"])]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("id")
    ap.add_argument("--dir", type=Path)
    ap.add_argument("--episode", type=Path)
    ap.add_argument("--whisper", type=Path, help="vorhandenes Whisper-JSON (sonst neu transkribieren)")
    ap.add_argument("--json", type=Path)
    a = ap.parse_args()
    d = a.dir or ROOT / "public" / "episodes" / a.id
    ep = json.loads((a.episode or ROOT / "episodes" / f"{a.id}.json").read_text())
    caps = json.loads((d / "captions.json").read_text())
    tl = json.loads((d / "timeline.json").read_text())
    words = script_words(ep)
    if len(words) != len(caps):
        raise SystemExit(f"Wortzahl Skript {len(words)} ≠ captions {len(caps)}")
    y, sr = sf.read(str(d / "voice.wav"), dtype="float32")
    y = y.mean(1) if y.ndim > 1 else y
    hop = int(sr * HOP_S)
    n = len(y) // hop
    db = 20 * np.log10(np.sqrt(np.mean(y[: n * hop].reshape(n, hop).astype(np.float64) ** 2, axis=1)) + 1e-9)
    speech = np.median(db[db > np.percentile(db, 40)])
    thr = speech - 35
    quiet = db < thr

    def fr(ms: float) -> int:
        return int(min(n - 1, max(0, ms / 1000 / HOP_S)))

    def longest_quiet(a_ms: float, b_ms: float) -> tuple[float, int]:
        i0, i1 = fr(a_ms), fr(b_ms)
        best, cur, start, bstart = 0, 0, i0, i0
        for i in range(i0, i1 + 1):
            if quiet[i]:
                if cur == 0:
                    start = i
                cur += 1
                if cur > best:
                    best, bstart = cur, start
            else:
                cur = 0
        return best * HOP_S * 1000, bstart

    def word_level(c: dict) -> float:
        seg = db[fr(c["startMs"]): fr(c["endMs"]) + 1]
        seg = seg[seg > thr]
        return float(10 * np.log10(np.mean(10 ** (seg / 10)))) if len(seg) else float("nan")

    import pyworld as pw

    x64 = y.astype(np.float64)
    f0, t = pw.dio(x64, sr, f0_floor=60, f0_ceil=400, frame_period=10)
    f0 = pw.stonemask(x64, f0, t, sr)

    def word_st(c: dict) -> float:
        seg = f0[fr(c["startMs"]): fr(c["endMs"]) + 1]
        seg = seg[seg > 0]
        return float(np.median(12 * np.log2(seg))) if len(seg) else float("nan")

    pauses = {"sent": [], "comma": [], "scene": []}
    edges, edge_at = 0, []
    for i in range(len(words) - 1):
        kind = words[i]["end"]
        if not kind:
            continue
        p, ps = longest_quiet(caps[i]["startMs"], caps[i + 1]["endMs"])
        pauses[kind].append(p)
        if kind in ("sent", "scene") and p >= 150 and ps > 0 and db[ps - 1] > speech - 25:
            edges += 1
            edge_at.append(round(ps * HOP_S, 2))
    # Sätze
    sents, cur = [], []
    for i, w in enumerate(words):
        cur.append(i)
        if w["end"] in ("sent", "scene"):
            sents.append(cur)
            cur = []
    if cur:
        sents.append(cur)
    rates_w, rates_s, drops, fdrops = [], [], [], []
    for s in sents:
        if len(s) < 4:
            continue
        span = caps[s[-1]]["endMs"] - caps[s[0]]["startMs"]
        inner = 0.0
        for i in s[:-1]:
            p, _ = longest_quiet(caps[i]["startMs"], caps[i + 1]["endMs"])
            inner += p if p >= 150 else 0
        dur = max(0.3, (span - inner) / 1000)
        rates_w.append(len(s) / dur)
        rates_s.append(sum(words[i]["syl"] for i in s) / dur)
        lv = [word_level(caps[i]) for i in s]
        if not np.isnan(lv[-1]):
            drops.append(lv[-1] - float(np.nanmedian(lv[:-1])))
        st = [word_st(caps[i]) for i in s]
        if not np.isnan(st[-1]) and not np.all(np.isnan(st[:-1])):
            fdrops.append(st[-1] - float(np.nanmedian(st[:-1])))
    dur_s = tl["durationMs"] / 1000
    wsp = json.loads(a.whisper.read_text()) if a.whisper else whisper_words(d / "voice.wav")
    wsp = [c for c in wsp if norm(c["text"])]
    A, B = [norm(w["w"]) for w in words], [norm(c["text"]) for c in wsp]
    sm = difflib.SequenceMatcher(a=A, b=B, autojunk=False)
    matched = sum(b.size for b in sm.get_matching_blocks())
    diffs = [f"{' '.join(w['w'] for w in words[i1:i2])!r} → {' '.join(c['text'].strip() for c in wsp[j1:j2])!r}"
             for tag, i1, i2, j1, j2 in sm.get_opcodes() if tag != "equal"]
    # Gesprochene Form (Zahlen/Jahre ausgeschrieben, Bindestriche getrennt): zählt echte Aussprache-Fehler statt
    # Schreibweisen-Unterschiede („13“ vs „thirteen“, „no -holds -barred“).
    def spoken_tokens(text: str) -> list[str]:
        text = re.sub(r"\$([\d.,]*\d)((?:\s+(?:thousand|million|billion))?)(?!\s*(?:dollar|thousand|million|billion))", r"\1\2 dollars", text)
        text = speakable(apply_say(text.replace("$", "").replace("*", "").replace(" | ", " "), ep.get("years"), ep.get("say")))
        return [t for t in (norm(x) for x in re.split(r"[\s\-–—]+", text)) if t]

    SA = spoken_tokens(" ".join(sc["text"] for sc in ep["scenes"]))
    SB = spoken_tokens("".join(c["text"] for c in wsp))
    sm2 = difflib.SequenceMatcher(a=SA, b=SB, autojunk=False)
    matched2 = sum(b.size for b in sm2.get_matching_blocks())
    diffs2 = [f"{' '.join(SA[i1:i2])!r} → {' '.join(SB[j1:j2])!r}" for tag, i1, i2, j1, j2 in sm2.get_opcodes() if tag != "equal"]
    med = lambda v: round(float(np.median(v)), 1) if len(v) else None  # noqa: E731
    res = {
        "id": a.id, "durationSec": round(dur_s, 1), "words": len(words), "wpsTotal": round(len(words) / dur_s, 2),
        "satzrateWps": round(float(np.median(rates_w)), 2), "satzrateSylPs": round(float(np.median(rates_s)), 2),
        "pauseSentMs": med(pauses["sent"]), "pauseSentP10P90": [round(float(np.percentile(pauses["sent"], q))) for q in (10, 90)],
        "pauseCommaMs": med(pauses["comma"]), "pauseSceneMs": med(pauses["scene"]),
        "sentEndDropDb": round(float(np.mean(drops)), 1), "sentEndQuieterShare": round(float(np.mean(np.array(drops) < -1)), 2),
        "sentEndPitchSt": round(float(np.mean(fdrops)), 1), "sentEndFallingShare": round(float(np.mean(np.array(fdrops) < -0.5)), 2),
        "hardEdges": edges, "hardEdgesAtS": edge_at, "sentEnds": len(pauses["sent"]) + len(pauses["scene"]),
        "whisperMatched": matched, "whisperPct": round(100 * matched / len(words), 1), "whisperDiffs": diffs,
        "spokenTokens": len(SA), "whisperSpokenPct": round(100 * matched2 / len(SA), 1), "whisperSpokenDiffs": diffs2,
    }
    if a.json:
        a.json.write_text(json.dumps(res, ensure_ascii=False, indent=1))
    print(json.dumps({k: v for k, v in res.items() if not k.endswith("Diffs")}, ensure_ascii=False))
    for x in diffs2:
        print("   ", x)


if __name__ == "__main__":
    main()
