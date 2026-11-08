"""Erzeugt Voiceover, wortgenaue Captions und Zeitplan für eine Episode.

  .venv/bin/python scripts/make_episode.py episodes/solar-system.json

Schritte:
 1. Sprachausgabe (Kokoro, scripts/tts.py) pro Szene, Szenen hintereinander
 2. Whisper.cpp liefert Wort-Zeitstempel für die gesamte Tonspur
 3. Abgleich mit dem Skript: Captions zeigen exakt den Skripttext (Whisper nur fürs Timing)
 4. Cues (Sticker, Soundeffekte, Beats) werden an Wörter gebunden -> Millisekunden
 5. Musik + Soundeffekte erzeugen (scripts/make_audio.py)
Ausgabe: public/episodes/<id>/{voice.wav, captions.json, timeline.json, music.wav}
"""

from __future__ import annotations

import difflib
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_audio import make_music, make_sfx  # noqa: E402
from tts import SAMPLE_RATE, VOICE_INFO, Voice, apply_say, post_process, resolve_voice, write_wav  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent


def norm(word: str) -> str:
    return re.sub(r"[^a-z0-9]", "", word.lower())


def align(script_words: list[str], whisper: list[dict]) -> list[dict]:
    """Ordnet jedem Skriptwort Start/Ende aus Whisper zu (difflib auf normalisierten Wörtern).
    Nicht zuordenbare Wörter werden zwischen den Nachbarn linear verteilt."""
    a = [norm(w) for w in script_words]
    b = [norm(c["text"]) for c in whisper]
    times: list[tuple[float, float] | None] = [None] * len(a)
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            c = whisper[blk.b + k]
            times[blk.a + k] = (c["startMs"], c["endMs"])
    # Lücken füllen: Ersetzungen ähnlicher Länge (z. B. "1,000" vs "1000") über opcodes
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "replace" and j2 > j1:
            start, end = whisper[j1]["startMs"], whisper[j2 - 1]["endMs"]
            n = i2 - i1
            for k in range(n):
                if times[i1 + k] is None:
                    times[i1 + k] = (
                        start + (end - start) * k / n,
                        start + (end - start) * (k + 1) / n,
                    )
    # Restliche Lücken interpolieren
    for i, t in enumerate(times):
        if t is None:
            prev = next((times[j] for j in range(i - 1, -1, -1) if times[j]), (0, 0))
            nxt = next((times[j] for j in range(i + 1, len(times)) if times[j]), None)
            s = prev[1]
            e = nxt[0] if nxt else s + 300
            times[i] = (s, max(s + 80, e))
    out = []
    for i, (w, (s, e)) in enumerate(zip(script_words, times)):
        out.append(
            {
                "text": w if i == 0 else " " + w,
                "startMs": round(s),
                "endMs": round(e),
                "timestampMs": round((s + e) / 2),
                "confidence": None,
            }
        )
    return out


def split_words(scene: str, text: str) -> list[dict]:
    """Text -> Wörter ohne Sternchen; "*Rome*" bzw. "*Western Empire*" markieren Akzentwörter."""
    out, inside = [], False
    for raw in text.split():
        stars = raw.count("*")
        word = raw.replace("*", "")
        emph = inside or stars > 0
        inside = inside ^ (stars % 2 == 1)
        if word:
            out.append({"scene": scene, "word": word, "emph": emph})
    return out


def main(path: Path, voice_name: str | None = None, speed: float | None = None, save: bool = False) -> None:
    ep = json.loads(path.read_text())
    # Stimme/Tempo können per Kommandozeile (z. B. vom Dashboard) überschrieben werden
    if voice_name:
        try:
            ep["voice"] = resolve_voice(voice_name)
        except ValueError as e:
            raise SystemExit(str(e))
    if speed:
        ep["speed"] = speed
    if save and (voice_name or speed):
        path.write_text(json.dumps(ep, indent=2, ensure_ascii=False) + "\n")
    out_dir = ROOT / "public" / "episodes" / ep["id"]
    out_dir.mkdir(parents=True, exist_ok=True)

    # Optional "voiceStyle" (docs/stimme-casting.md): Stimmen-Mischung, Tempo-Faktor je Szene,
    # Nachbearbeitung. Ohne das Feld bleibt alles wie bisher (Sonnensystem unverändert).
    style = ep.get("voiceStyle", {})
    base_speed = ep.get("speed", 1.0)
    # --voice auf der Kommandozeile hat Vorrang vor einer Mischung im Drehbuch
    spec = ep["voice"] if voice_name or "blend" not in style else style["blend"]
    voice = Voice(spec if isinstance(spec, dict) else resolve_voice(spec), base_speed)
    scene_speed = style.get("sceneSpeed", {})
    gap = np.zeros(int(SAMPLE_RATE * ep.get("sceneGapMs", 150) / 1000), np.float32)
    lead = np.zeros(int(SAMPLE_RATE * 0.15), np.float32)  # kurzer Vorlauf

    parts, scenes, words, cursor = [lead], [], [], len(lead)
    for sc in ep["scenes"]:
        # Sternchen markieren Akzentwörter ("*Rome*") – nur für die Untertitel, nicht vorlesen
        spoken = apply_say(sc["text"].replace("*", ""), ep.get("years"), ep.get("say"))
        audio = voice.synth(spoken, base_speed * scene_speed[sc["id"]] if sc["id"] in scene_speed else None)
        start = cursor / SAMPLE_RATE * 1000
        parts += [audio, gap]
        cursor += len(audio) + len(gap)
        scenes.append({"id": sc["id"], "startMs": round(start), "endMs": round(cursor / SAMPLE_RATE * 1000)})
        words += split_words(sc["id"], sc["text"])
        print(f"  {sc['id']:<8} {len(audio) / SAMPLE_RATE:5.2f} s")
    track = np.concatenate(parts)
    if style.get("post"):  # gleiche Länge, Szenen-/Wortzeiten bleiben gültig
        track = post_process(track, style["post"])
    write_wav(out_dir / "voice.wav", track)
    total_ms = round(len(track) / SAMPLE_RATE * 1000)
    print(f"Voiceover: {total_ms / 1000:.2f} s, {len(words)} Wörter")

    with tempfile.TemporaryDirectory() as tmp:
        wav16 = Path(tmp) / "voice16.wav"
        subprocess.run(
            ["ffmpeg", "-loglevel", "error", "-y", "-i", str(out_dir / "voice.wav"), "-ar", "16000", "-ac", "1", str(wav16)],
            check=True,
        )
        raw = Path(tmp) / "whisper.json"
        subprocess.run(["node", "scripts/whisper-words.mjs", str(wav16), str(raw), "en"], check=True, cwd=ROOT)
        whisper = [c for c in json.loads(raw.read_text()) if norm(c["text"])]

    captions = align([w["word"] for w in words], whisper)
    matched = sum(
        1 for blk in difflib.SequenceMatcher(
            a=[norm(w["word"]) for w in words], b=[norm(c["text"]) for c in whisper], autojunk=False
        ).get_matching_blocks() for _ in range(blk.size)
    )
    print(f"Abgleich: {matched}/{len(words)} Wörter direkt von Whisper getimt")
    (out_dir / "captions.json").write_text(json.dumps(captions, indent=1) + "\n")

    # Cues an Wörter binden
    cues = []
    for sc in ep["scenes"]:
        idx = [i for i, w in enumerate(words) if w["scene"] == sc["id"]]
        for cue in sc.get("cues", []):
            target = norm(cue["word"])
            hit = next((i for i in idx if norm(words[i]["word"]) == target), None)
            if hit is None:
                raise SystemExit(f"Cue-Wort {cue['word']!r} nicht in Szene {sc['id']} gefunden")
            entry = {k: v for k, v in cue.items() if k != "word"}
            entry.update({"scene": sc["id"], "atMs": captions[hit]["startMs"]})
            cues.append(entry)
        # Akzentwörter aus dem Text (*Wort*) als emph-Cues
        cues += [{"emph": True, "scene": sc["id"], "atMs": captions[i]["startMs"]} for i in idx if words[i]["emph"]]

    timeline = {
        "id": ep["id"],
        "title": ep["title"],
        "durationMs": total_ms + 600,
        "scenes": scenes,
        "cues": cues,
    }
    if "hud" in ep:  # Einsatz-Anzeige (src/episode/overlays/Hud.tsx)
        timeline["hud"] = ep["hud"]
    (out_dir / "timeline.json").write_text(json.dumps(timeline, indent=1) + "\n")

    make_music(out_dir / "music.wav", seconds=timeline["durationMs"] / 1000 + 1)
    make_sfx(ROOT / "public" / "sfx")
    print(f"Fertig: {out_dir.relative_to(ROOT)}")


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser(description="Voiceover, Captions und Zeitplan für eine Episode erzeugen")
    ap.add_argument("episode", type=Path, help="z. B. episodes/solar-system.json")
    names = ", ".join(f"{v['name']} ({v['id']})" for v in VOICE_INFO["voices"])
    ap.add_argument("--voice", help=f"Stimme überschreiben, Name oder ID: {names}")
    ap.add_argument("--speed", type=float, help="Sprechtempo überschreiben (Kokoro, 0.5–2.0)")
    ap.add_argument("--save", action="store_true", help="Stimme/Tempo zusätzlich ins Drehbuch schreiben")
    a = ap.parse_args()
    main(a.episode, a.voice, a.speed, a.save)
