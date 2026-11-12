"""Sprachausgabe mit Chatterbox (Resemble AI, MIT) – ausdrucksstärker als Kokoro.

Freigegeben vom Nutzer am 09.11.2026 („Ja passt“ zu den Hörproben im Dashboard).
Läuft in einer eigenen Umgebung, weil es PyTorch braucht:

    bash scripts/setup_chatterbox.sh          # einmalig: .venv-cb anlegen

Aufruf (macht scripts/make_episode.py automatisch bei "engine": "chatterbox"):

    .venv-cb/bin/python scripts/tts_chatterbox.py jobs.json

jobs.json: [{"text": "...", "out": "a.wav", "voice": "af_heart", "exaggeration": 0.6, "cfg": 0.4,
            "temperature": 0.8, "seed": 123}, ...]   (temperature/seed optional; Satz-Modus mit Szenen-`emotion`)

Klangvorlage je Stimme: assets/stimmvorlagen/<id>.wav (10 s unbearbeitetes Kokoro derselben Stimme),
damit Lily/Bella/Finn/Max ihren Klang behalten. Jede Ausgabe trägt das unhörbare PerTh-Wasserzeichen
von Resemble AI (Teil des Pakets). Gemessen auf 4 CPU-Kernen: ~30 s Rechenzeit für ~8–9 s Sprache.
"""

from __future__ import annotations

import json
import os
import sys
import time
import warnings
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REF_DIR = ROOT / "assets" / "stimmvorlagen"
SAMPLE_RATE = 24000


def main(jobs_path: Path) -> None:
    os.environ.setdefault("HF_HUB_DISABLE_XET", "1")  # xethub-Host ist in der Cloud-Umgebung gesperrt
    os.environ.setdefault("TQDM_DISABLE", "1")  # keine Fortschrittsbalken je Token im Log
    warnings.filterwarnings("ignore")
    import torch
    import torchaudio as ta
    from chatterbox.tts import ChatterboxTTS

    torch.set_num_threads(os.cpu_count() or 4)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = ChatterboxTTS.from_pretrained(device=device)
    jobs = json.loads(jobs_path.read_text())
    loaded = None  # Klangvorlage nur bei Stimmwechsel neu einlesen; generate() setzt exaggeration selbst neu
    for i, job in enumerate(jobs, 1):
        t = time.time()
        ref = REF_DIR / f"{job['voice']}.wav"
        if not ref.exists():
            raise SystemExit(f"Keine Klangvorlage {ref} – erlaubt: " + ", ".join(p.stem for p in REF_DIR.glob("*.wav")))
        ex = float(job.get("exaggeration", 0.6))
        if loaded != job["voice"]:
            model.prepare_conditionals(str(ref), exaggeration=ex)
            loaded = job["voice"]
        if "seed" in job:  # reproduzierbar (Satz-Modus mit `emotion`); sonst würfelt Chatterbox jede Aufnahme neu
            torch.manual_seed(int(job["seed"]))
        wav = model.generate(
            job["text"],
            exaggeration=ex,
            cfg_weight=float(job.get("cfg", 0.4)),
            temperature=float(job.get("temperature", 0.8)),  # 0.8 = Standard in chatterbox-tts 0.1.7
        )
        if model.sr != SAMPLE_RATE:
            wav = ta.functional.resample(wav, model.sr, SAMPLE_RATE)
        Path(job["out"]).parent.mkdir(parents=True, exist_ok=True)
        ta.save(job["out"], wav, SAMPLE_RATE)
        print(f"  [{i}/{len(jobs)}] {wav.shape[-1] / SAMPLE_RATE:5.2f} s Audio in {time.time() - t:4.0f} s", flush=True)


if __name__ == "__main__":
    main(Path(sys.argv[1]))
