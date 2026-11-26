"""Satzenden mit < TARGET ms Stille (Pegel wie stimm_messung) -> --at Argumente für insert_pauses."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
ROOT = Path("/home/user/clips"); sys.path.insert(0, str(ROOT / "scripts"))
from stimm_messung import script_words, HOP_S
eid = sys.argv[1]; TARGET = int(sys.argv[2]) if len(sys.argv) > 2 else 490
d = ROOT / "public/episodes" / eid
ep = json.loads((ROOT / f"episodes/{eid}.json").read_text()); caps = json.loads((d / "captions.json").read_text())
words = script_words(ep); assert len(words) == len(caps), (len(words), len(caps))
y, sr = sf.read(str(d / "voice.wav"), dtype="float32"); y = y.mean(1) if y.ndim > 1 else y
hop = int(sr * HOP_S); n = len(y) // hop
db = 20 * np.log10(np.sqrt(np.mean(y[: n * hop].reshape(n, hop).astype(np.float64) ** 2, axis=1)) + 1e-9)
speech = np.median(db[db > np.percentile(db, 40)]); quiet = db < speech - 35
fr = lambda ms: int(min(n - 1, max(0, ms / 1000 / HOP_S)))
out = []; ps = []
for i, w in enumerate(words[:-1]):
    if w["end"] != "sent": continue
    i0, i1 = fr(caps[i]["startMs"]), fr(caps[i + 1]["endMs"])
    best = cur = 0; bs = st = i0
    for k in range(i0, i1 + 1):
        if quiet[k]:
            if cur == 0: st = k
            cur += 1
            if cur > best: best, bs = cur, st
        else: cur = 0
    p = best * 10; ps.append(p)
    if p < TARGET: out.append((int((bs + best / 2) * 10), TARGET - p, w["w"], p))
print("Satzpausen median", np.median(ps), "n", len(ps))
for o in out: print(o)
print(" ".join(f"--at {a}:{b}" for a, b, _, _ in out))
