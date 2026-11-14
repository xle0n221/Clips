#!/usr/bin/env python3
"""Hörprobe für das Dashboard in einem Schritt (spart Handarbeit und Tokens).

    python3 scripts/hoerprobe.py <episode-id> [--sec 20] [--doc <dashboard-doc-id>]

Erzeugt aus public/episodes/<id>/ (voice.wav, music.wav, captions.json, timeline.json):
  out/<id>-hoerprobe.mp4   Wellenform + Stimme mit Musik in Video-Lautstärke (volume 0.13 wie Episode.tsx)
  out/<id>-hoerprobe.json  Messwerte + Text der Probe + fertiges `review`-Objekt (mediaUrl als Platzhalter)
Mit earshot (.venv-earshot) zusätzlich LUFS/True Peak der Probe (`earshot measure`).
Danach nur noch: Asset hochladen (Artifact publish asset) und ArtifactData update mit dem JSON (mediaUrl einsetzen).
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("id")
    ap.add_argument("--sec", type=float, default=20)
    a = ap.parse_args()
    ep = json.loads((ROOT / "episodes" / f"{a.id}.json").read_text())
    pub = ROOT / "public" / "episodes" / a.id
    caps = json.loads((pub / "captions.json").read_text())
    tl = json.loads((pub / "timeline.json").read_text())
    dur = tl["durationMs"] / 1000
    words = len(caps)
    wps = round(words / dur, 2)
    text = "".join(c["text"] for c in caps if c["startMs"] < a.sec * 1000).strip()
    out = ROOT / "out"
    out.mkdir(exist_ok=True)
    mp4 = out / f"{a.id}-hoerprobe.mp4"
    bed = pub / "bed.wav"  # Ambient-Bett (make_sound_bed.py), im Video mit volume 1 wie zeitwelt.ts
    bed_in = ["-t", str(a.sec), "-i", str(bed)] if bed.exists() else []
    mix = ("[1:a]volume=0.13[m];[0:a][m][2:a]amix=inputs=3:normalize=0:duration=first,asplit[a][w];" if bed_in
           else "[1:a]volume=0.13[m];[0:a][m]amix=inputs=2:normalize=0:duration=first,asplit[a][w];")
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-t", str(a.sec), "-i", str(pub / "voice.wav"), "-t", str(a.sec), "-i", str(pub / "music.wav"),
         *bed_in, "-filter_complex",
         mix +
         "[w]showwaves=s=720x400:mode=cline:colors=0xE63946,format=yuv420p[v]",
         "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
         "-movflags", "+faststart", str(mp4)],
        check=True,
    )
    meas = None
    es = ROOT / ".venv-earshot" / "bin" / "python"
    if es.exists():
        r = subprocess.run([str(es), "-m", "earshot", "measure", str(mp4), "--json"], capture_output=True, text=True)
        if r.returncode == 0:
            try:
                meas = json.loads(r.stdout)
            except json.JSONDecodeError:
                meas = None
    mus = ep.get("music") or {}
    lines = [
        f"Tempo: {words} Wörter in {dur:.1f} s = {wps:.2f} W/s (Ziel 2,3–2,6). Stimme {ep.get('voice')}, Sprechstil "
        f"{ep.get('voicePreset')}, speed {ep.get('speed')}.",
        f"Musik: Preset „{mus.get('mood', 'upbeat')}“ – komplett selbst erzeugt." + (" Mit Geräusch-Bett (bed.wav)." if bed_in else ""),
    ]
    if meas:
        lufs = meas.get("lufs") or meas.get("integrated_lufs") or (meas.get("loudness") or {}).get("integrated")
        if lufs is not None:
            lines.append(f"earshot measure (Probe): {lufs} LUFS.")
    lines += ["", "Gesprochener Text der Probe:", text + " …", "",
              "OK = weiter. Nicht OK = bitte sagen, was an Stimme, Tempo oder Musik nicht passt."]
    res = {
        "metrics": {"durationSec": round(dur, 1), "words": words, "wordsPerSec": wps, "voice": ep.get("voice")},
        "review": {"kind": "audio", "mediaUrl": "<ASSET>", "title": f"Hörprobe: Stimme + Musik – erste {a.sec:.0f} von {dur:.1f} s",
                   "text": "\n".join(lines)},
        "decision": None,
        "busy": False,
        "earshot": meas,
        "mp4": str(mp4),
    }
    (out / f"{a.id}-hoerprobe.json").write_text(json.dumps(res, ensure_ascii=False, indent=1))
    print(f"{mp4}  {dur:.1f} s  {wps:.2f} W/s  earshot={'ja' if meas else 'nein'}")


if __name__ == "__main__":
    sys.exit(main())
