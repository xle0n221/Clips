"""Schnittzeiten wie in tausch.tsx (W()-Anker) + Einstellungslängen; --fx schreibt Whoosh je Schnitt in soundBed.fx."""
import json, sys, re
from pathlib import Path
ROOT = Path("/home/user/clips"); FPS = 30
eid = "tausch-stadt"; d = ROOT / "public/episodes" / eid
ep = json.loads((ROOT / f"episodes/{eid}.json").read_text())
caps = json.loads((d / "captions.json").read_text()); tl = json.loads((d / "timeline.json").read_text())
ANCH = {"hook": [("family", -3)], "rules": [("No", -2)], "guy": [("His", -2)], "line": [("dragging", -2)], "scan": [],
        "sister": [("Low-key", -2)], "mom": [("store", -6)], "print": [("Bro", -2)], "deluxe": [("A", -2)], "creepy": [("Until", -2)],
        "back": [("taps", -3)], "twist": [("His", -2), ("They", -2)], "dog": [("What", -2)], "shelf": [("Still", -2)], "outro": [("With", -2)]}
norm = lambda t: re.sub(r"[^a-z0-9'-]", "", t.lower())
cuts = []  # (sec, scene, label, anchor word, anchor startMs)
for sc in tl["scenes"]:
    st = round(sc["startMs"] / 1000 * FPS); dur = round(sc["endMs"] / 1000 * FPS) - st
    t0, t1 = st / FPS * 1000, (st + dur) / FPS * 1000
    inside = [c for c in caps if c["startMs"] >= t0 - 60 and c["startMs"] < t1]
    cuts.append((st / FPS, sc["id"], "scene", inside[0]["text"].strip(), inside[0]["startMs"]))
    for w, off in ANCH[sc["id"]]:
        h = [c for c in inside if norm(c["text"]) == norm(w)]
        if not h: print("FEHLT", sc["id"], w); continue
        fr = max(1, round(h[0]["startMs"] / 1000 * FPS) - st + off)
        cuts.append(((st + fr) / FPS, sc["id"], "cut", h[0]["text"].strip(), h[0]["startMs"]))
end = tl["durationMs"] / 1000
times = [c[0] for c in cuts] + [end]
lens = [round(times[i + 1] - times[i], 2) for i in range(len(cuts))]
for c, l in zip(cuts, lens): print(f"{c[0]:6.2f} {c[1]:8s} {c[2]:5s} {l:5.2f}" + ("  >4!" if l > 4 else ""))
print("Einstellungen", len(cuts), "max", max(lens), "mittel", round(sum(lens) / len(lens), 2), "Ende", end)
if "--fx" in sys.argv:
    base = [x for x in ep["soundBed"]["fx"] if not x.get("cutWhoosh")]
    fx = []
    for k, (t, sid, kind, w, wms) in enumerate(cuts):
        if t < 0.3: continue
        off = int(round(t * 1000 - wms)) - 60
        word = norm(w)
        nth = 1
        fx.append({"scene": sid, "word": word, "nth": nth, "at": "start", "offsetMs": off, "kind": "poof", "ms": 260, "db": -21 if kind == "scene" else -23, "cutWhoosh": True})
    ep["soundBed"]["fx"] = base + fx
    (ROOT / f"episodes/{eid}.json").write_text(json.dumps(ep, indent=1, ensure_ascii=False))
    print("fx whooshes", len(fx))
