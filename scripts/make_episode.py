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
import hashlib
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_audio import make_music, make_sfx  # noqa: E402
from tts import SAMPLE_RATE, VOICE_INFO, Voice, apply_say, post_process, resolve_voice, speakable, write_wav  # noqa: E402
from voice_fx import DELIVERY, EMOTIONS, NARRATOR, STYLES, accent_gain  # noqa: E402

PAUSE_MARK = "|"  # im Sprechtext: dramatische Pause (Länge: Preset bzw. Drehbuch-Feld pauseMs)

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
        if word == PAUSE_MARK:
            continue
        emph = inside or stars > 0
        inside = inside ^ (stars % 2 == 1)
        if word:
            out.append({"scene": scene, "word": word, "emph": emph})
    return out


def make_voice(ep: dict, override: bool = False) -> Voice:
    """Stimme der Episode laden. Optional "voiceStyle.blend" (docs/stimme-casting.md) mischt Stimmen;
    `override=True` (--voice auf der Kommandozeile) hat Vorrang vor einer Mischung im Drehbuch."""
    style = ep.get("voiceStyle", {})
    spec = ep["voice"] if override or "blend" not in style else style["blend"]
    if isinstance(spec, dict):  # {"am_fenrir": 0.6, "Max": 0.4} -> "am_fenrir:0.6+Max:0.4"
        spec = "+".join(f"{k}:{w}" for k, w in spec.items())
    return Voice(resolve_voice(spec), ep.get("speed", 1.0))


SENT_SPLIT = re.compile(r"(?<=[.!?…])\s+(?=\S)")


def sentences(text: str, min_words: int = 4) -> list[str]:
    """Stück in Sätze teilen; sehr kurze Sätze (< min_words, z. B. „Brooklyn.“, „Done? Cool.“) an den nächsten
    hängen – Chatterbox erzeugt bei 1–2 Wörtern eher Aussetzer."""
    out: list[str] = []
    carry = ""
    for s in SENT_SPLIT.split(text.strip()):
        s = (carry + " " + s).strip() if carry else s
        if len(s.split()) < min_words:
            carry = s
            continue
        out.append(s)
        carry = ""
    if carry:
        if out and len(carry.split()) < min_words:
            out[-1] = out[-1] + " " + carry
        else:
            out.append(carry)
    return out


def emotion_of(sc: dict) -> dict | None:
    emo = sc.get("emotion")
    if not emo:
        return None
    e = EMOTIONS.get(emo) if isinstance(emo, str) else {**EMOTIONS["calm"], **emo}
    if e is None:
        raise SystemExit(f"Szene {sc['id']}: unbekannte emotion {emo!r} – erlaubt: {', '.join(EMOTIONS)}")
    return e


def _frames_db(y: np.ndarray, hop: int) -> np.ndarray:
    n = len(y) // hop
    return 20 * np.log10(np.sqrt(np.mean(y[: n * hop].reshape(n, hop).astype(np.float64) ** 2, axis=1)) + 1e-9)


def narrate_sentence(y: np.ndarray, text: str, e: dict) -> np.ndarray:
    """Ein Chatterbox-Satz wie ein Erzähler (Nutzer 12.11.2026 abends): Anfang/Ende sauber, Ausklang behalten und weich
    ausblenden (kein harter Schnitt), Pausen an Komma/Doppelpunkt/inneren Satzenden auf Sollwert verlängern (nie kürzen),
    letzte ~0,45 s um end_db leiser. Keine Tonhöhen-Bearbeitung."""
    sr, hop = SAMPLE_RATE, SAMPLE_RATE // 100
    y = tighten_pauses(y, NARRATOR["inner_max_s"], NARRATOR["inner_keep_s"])
    db = _frames_db(y, hop)
    if len(db) < 5:
        return y
    level = float(np.median(db[db > np.percentile(db, 40)]))
    loud = np.nonzero(db >= level + NARRATOR["tail_thr_db"])[0]
    if not len(loud):
        return y
    head, tail = int(NARRATOR["head_keep_s"] * sr), int(NARRATOR["tail_keep_s"] * sr)
    s0 = max(0, loud[0] * hop - head)
    es = min(len(y), (loud[-1] + 1) * hop)  # Ende der Sprache
    y = y[s0: min(len(y), es + tail)].astype(np.float32).copy()
    es -= s0
    # innere Pausen (Komma, Doppelpunkt, Strich, Satzende im gebündelten Satz) an der erwarteten Stelle suchen
    db = _frames_db(y, hop)
    quiet = db < level - 30
    runs, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            if j - i >= 3 and i * hop > head and j * hop < es:
                runs.append((i, j))
            i = j
        else:
            i += 1
    span = max(1, es - head)
    marks = [(m.start(), m.group(1)) for m in re.finditer(r"([,;:—–.!?…])\s+(?=\S)", text)]
    used, inserts = set(), []
    for pos, ch in marks:
        rel = pos / max(1, len(text))
        if ch in ".!?…":
            target = e["gap_ms"] - 1000 * (NARRATOR["tail_keep_s"] + NARRATOR["head_keep_s"]) / 2 + (60 if ch == "?" else 0)
        else:
            target = e["comma_ms"] + (80 if ch in ":—–" else 0)
        cands = [r for r in runs if r not in used and abs(((r[0] + r[1]) / 2 * hop - head) / span - rel) <= 0.15]
        if not cands:
            continue
        r = max(cands, key=lambda r: r[1] - r[0])
        used.add(r)
        add = int((target - (r[1] - r[0]) * 10) / 1000 * sr)
        if add > 0:
            inserts.append(((r[0] + r[1]) // 2 * hop, add))
    for at, add in sorted(inserts, reverse=True):
        y = np.concatenate([y[:at], np.zeros(add, np.float32), y[at:]])
        if at < es:
            es += add
    # Satzende leiser (Frage nur halb, weil die Frage oben endet); Ausklang weich ausblenden
    drop = e["end_db"] * (0.5 if text.rstrip().endswith("?") else 1.0)
    g = np.zeros(len(y))
    w = int(NARRATOR["end_win_s"] * sr)
    ws = max(0, es - w)
    g[ws:es] = -drop * (1 - np.cos(np.linspace(0, np.pi, es - ws))) / 2
    g[es:] = -drop
    y = y * (10 ** (g / 20)).astype(np.float32)
    fi = min(len(y), int(0.01 * sr))
    y[:fi] *= np.linspace(0, 1, fi, dtype=np.float32)
    # Ausblendung über den Ausklang; endet die Aufnahme kurz nach dem letzten Laut (Chatterbox schneidet manchmal selbst),
    # beginnt sie früher, damit kein harter Schnitt entsteht (mind. 120 ms)
    f0 = min(es, len(y) - int(0.12 * sr))
    fo = len(y) - max(0, f0)
    if fo > 0:
        y[len(y) - fo:] *= ((1 + np.cos(np.linspace(0, np.pi, fo))) / 2).astype(np.float32)
    return y


_WHISPER = None


def spoken_tokens(text: str, ep: dict) -> list[str]:
    """Gesprochene Form zum Vergleich mit Whisper: „$50,000“ → „fifty thousand dollars“, Jahre, Bindestriche getrennt."""
    text = re.sub(r"\$([\d.,]*\d)((?:\s+(?:thousand|million|billion))?)(?!\s*(?:dollar|thousand|million|billion))", r"\1\2 dollars", text.replace("*", ""))
    text = speakable(apply_say(text, ep.get("years"), ep.get("say")))
    return [t for t in (norm(x) for x in re.split(r"[\s\-–—]+", text)) if t]


def qc_score(path: Path, tts_text: str, ep: dict, cache: dict) -> int:
    """Aussprache-Prüfung eines Satzes: fehlende + zusätzliche Wörter laut faster-whisper small.en (0 = alles erkannt)."""
    global _WHISPER
    key = path.name
    if key in cache:
        return cache[key]
    import soundfile as sf

    if _WHISPER is None:
        import os

        os.environ.setdefault("HF_HUB_DISABLE_XET", "1")
        from faster_whisper import WhisperModel

        _WHISPER = WhisperModel("small.en", device="cpu", compute_type="int8")
    y = sf.read(str(path), dtype="float32")[0]
    t16 = np.arange(0, len(y) / SAMPLE_RATE, 1 / 16000)
    y16 = np.interp(t16, np.arange(len(y)) / SAMPLE_RATE, np.convolve(y, np.ones(3) / 3, mode="same")).astype(np.float32)
    segs, _ = _WHISPER.transcribe(y16, language="en", beam_size=5)
    heard = "".join(s.text for s in segs)
    a, b = spoken_tokens(tts_text, ep), spoken_tokens(heard, ep)
    m = sum(x.size for x in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_matching_blocks())
    cache[key] = (len(a) - m) + (len(b) - m)
    return cache[key]


def chatterbox_scenes(ep: dict, preset: dict | None, voice_id: str) -> dict[tuple[str, int], np.ndarray]:
    """Alle Szenen-Stücke (an „ | “ getrennt) mit Chatterbox erzeugen (Modell lädt je Lauf nur einmal).
    Ohne `emotion`: exaggeration/cfg des Sprechstils (voicePreset) + Zuschlag der Szenen-Sprechweise (delivery),
    ein Stück am Stück (Stand bis 11.11.2026).
    Mit Szenen-Feld `emotion` (EMOTIONS in voice_fx.py): jedes Stück SATZ FÜR SATZ mit exaggeration/cfg/temperature der
    Emotion und festem Seed. Seit 12.11.2026 abends („wie ein echter Geschichtenerzähler“): Aussprache-Prüfung je Satz
    (Whisper; bis NARRATOR.qc_tries Aufnahmen, die beste gewinnt), Erzähler-Pausen und Satzende-Absenkung
    (narrate_sentence), kein Beschleunigen über NARRATOR.max_speed."""
    import soundfile as sf

    base = preset or STYLES["lebendig"]
    cache = ROOT / "out" / "cb-cache"
    cache.mkdir(parents=True, exist_ok=True)
    py = ROOT / ".venv-cb" / "bin" / "python"
    if not py.exists():
        raise SystemExit("Chatterbox fehlt: einmalig `bash scripts/setup_chatterbox.sh` ausführen")

    def job_path(job: dict) -> Path:
        # Zwischenspeicher je Stück (out/cb-cache): nach einer Textkorrektur werden nur geänderte Stücke neu erzeugt
        return cache / (hashlib.sha1(json.dumps(job, sort_keys=True).encode()).hexdigest()[:16] + ".wav")

    def run(jobs: list[dict]) -> None:
        jobs = [j for j in jobs if not Path(j["out"]).exists()]
        if not jobs:
            return
        with tempfile.TemporaryDirectory() as tmp:
            (Path(tmp) / "jobs.json").write_text(json.dumps(jobs))
            subprocess.run([str(py), "-W", "ignore", str(ROOT / "scripts" / "tts_chatterbox.py"), str(Path(tmp) / "jobs.json")], check=True)

    keys = []  # (scene, piece, [(sentence_text, job_without_seed, seed0)] | job, emotion)
    for sc in ep["scenes"]:
        spoken = apply_say(sc["text"].replace("*", ""), ep.get("years"), ep.get("say"))
        pieces = [x.strip() for x in spoken.split(PAUSE_MARK) if x.strip()]
        e = emotion_of(sc)
        for i, p in enumerate(pieces):
            if e:
                sents = []
                for s in sentences(p):
                    text = speakable(s)
                    seed = int(hashlib.sha1(text.encode()).hexdigest()[:8], 16)
                    job = {"text": text, "voice": voice_id, "exaggeration": e["exag"], "cfg": e["cfg"], "temperature": e["temp"]}
                    sents.append((text, job, seed))
                keys.append((sc["id"], i, sents, e))
            else:
                d = sc.get("delivery", base["delivery"])
                d = DELIVERY.get(d, DELIVERY["normal"]) if isinstance(d, str) else {**DELIVERY["normal"], **d}
                ex = min(1.2, max(0.25, base["exaggeration"] + d.get("exag", 0.0)))
                job = {"text": speakable(p), "voice": voice_id, "exaggeration": ex, "cfg": base["cfg"]}
                keys.append((sc["id"], i, {**job, "out": str(job_path(job))}, None))

    # Runde 0: alle Sätze mit Seed 0; dann Aussprache-Prüfung, durchgefallene Sätze mit neuem Seed erneut
    qc_file = cache / "qc.json"
    qc = json.loads(qc_file.read_text()) if qc_file.exists() else {}
    first = [k[2] for k in keys if k[3] is None]
    for k in keys:
        if k[3] is not None:
            first += [{**job, "seed": seed, "out": str(job_path({**job, "seed": seed}))} for _, job, seed in k[2]]
    print(f"Chatterbox: {sum(not Path(j['out']).exists() for j in first)} von {len(first)} Stücken neu, Stimme {voice_id}")
    run(first)
    chosen: dict[str, Path] = {}
    pending = [(text, job, seed) for k in keys if k[3] is not None for text, job, seed in k[2]]
    tries = {text: [] for text, _, _ in pending}
    for attempt in range(NARRATOR["qc_tries"]):
        retry = []
        for text, job, seed in pending:
            f = job_path({**job, "seed": seed + attempt})
            bad = qc_score(f, text, ep, qc)
            tries[text].append((bad, attempt, f))
            if bad == 0 or attempt == NARRATOR["qc_tries"] - 1:
                chosen[text] = min(tries[text], key=lambda t: (t[0], t[1]))[2]
            else:
                retry.append((text, job, seed))
        qc_file.write_text(json.dumps(qc, indent=0))
        if not retry:
            break
        print(f"Aussprache-Prüfung: {len(retry)} Sätze neu (Versuch {attempt + 2}): " + " · ".join(t[:40] for t, _, _ in retry))
        run([{**job, "seed": seed + attempt + 1, "out": str(job_path({**job, "seed": seed + attempt + 1}))} for _, job, seed in retry])
        pending = retry
    n_bad = sum(1 for t in tries.values() if min(x[0] for x in t) > 0)
    print(f"Aussprache-Prüfung: {len(tries) - n_bad}/{len(tries)} Sätze ohne Abweichung")
    for text, t in tries.items():
        if min(x[0] for x in t) > 0:
            print(f"   Rest-Abweichung {min(x[0] for x in t)} Wort/Wörter: {text}")

    tempo = float(ep.get("speed", 1.0))  # Chatterbox hat kein Tempo-Feld: tonhöhenneutral strecken (ffmpeg atempo)
    if tempo > NARRATOR["max_speed"]:
        print(f"speed {tempo} > {NARRATOR['max_speed']} – begrenzt (Erzähler-Regel 12.11.2026: nicht beschleunigen)")
        tempo = NARRATOR["max_speed"]
    cap = ep.get("maxPauseMs", 300) / 1000  # nur Modus ohne emotion (Stand bis 11.11.2026)

    with tempfile.TemporaryDirectory() as tmp:
        def load(i: int, parts, e: dict | None) -> np.ndarray:
            if e is None:
                y = tighten_pauses(sf.read(parts["out"], dtype="float32")[0], cap)
                t = tempo
            else:
                segs = []
                for k, (text, _, _) in enumerate(parts):
                    segs.append(narrate_sentence(sf.read(str(chosen[text]), dtype="float32")[0], text, e))
                    if k < len(parts) - 1:
                        gap = e["gap_ms"] / 1000 + (0.06 if text.rstrip().endswith("?") else 0) \
                            - NARRATOR["tail_keep_s"] - NARRATOR["head_keep_s"]
                        segs.append(np.zeros(int(max(0.0, gap) * SAMPLE_RATE), np.float32))
                y = np.concatenate(segs) * np.float32(10 ** (e["gain_db"] / 20))
                t = tempo * e["speed"]
            if abs(t - 1.0) < 0.005:
                return y
            a, b = Path(tmp) / f"t{i}a.wav", Path(tmp) / f"t{i}b.wav"
            sf.write(str(a), y, SAMPLE_RATE)
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(a), "-af", f"atempo={t:.3f}", str(b)], check=True)
            return sf.read(str(b), dtype="float32")[0]

        return {(sid, i): load(n, parts, e) for n, (sid, i, parts, e) in enumerate(keys)}


def tighten_pauses(y: np.ndarray, max_s: float = 0.30, keep_s: float = 0.25, thr_db: float = -40.0) -> np.ndarray:
    """Innere Stillen > max_s auf keep_s kürzen (10-ms-Raster, Schwelle −40 dB); Anfang/Ende bleiben.
    Gemessen an der vom Nutzer gelobten Probe (Finn, 09.11.2026): 39,4 → 37,8 s, längste Pause 0,48 s."""
    if max_s <= 0:
        return y
    hop = SAMPLE_RATE // 100
    n = len(y) // hop
    if n < 3:
        return y
    rms = np.sqrt(np.mean(y[: n * hop].reshape(n, hop) ** 2, axis=1)) + 1e-9
    quiet = 20 * np.log10(rms) < thr_db
    out, i = [], 0
    while i < n:
        j = i
        while j < n and quiet[j] == quiet[i]:
            j += 1
        seg = y[i * hop:j * hop]
        if quiet[i] and i > 0 and j < n and (j - i) * hop / SAMPLE_RATE > max_s:
            k = int(keep_s * SAMPLE_RATE)
            seg = np.concatenate([seg[: k // 2], seg[-(k - k // 2):]])
        out.append(seg)
        i = j
    return np.concatenate(out + [y[n * hop:]])


def synth_track(ep: dict, voice: Voice | None, post: bool = True, log=print) -> tuple[np.ndarray, list[dict], list[dict]]:
    """Sprachausgabe aller Szenen hintereinander (Vorlauf, Szenen-Lücken, Pausen „ | “, `years`/`say`,
    `voiceStyle.sceneSpeed`, `voicePreset`/`delivery`, optional `voiceStyle.post`). `engine`: "kokoro"
    (Standard, `voice` nötig) oder "chatterbox" (`voice` darf None sein). Rückgabe: Tonspur, Szenen (ms),
    Skript-Wörter. Genutzt von main() und scripts/calibrate_speed.py."""
    # Optional "voiceStyle" (docs/stimme-casting.md): Stimmen-Mischung, Tempo-Faktor je Szene,
    # Nachbearbeitung. Ohne das Feld bleibt alles wie bisher (Sonnensystem unverändert).
    style = ep.get("voiceStyle", {})
    base_speed = ep.get("speed", 1.0)
    engine = ep.get("engine", "kokoro")  # "chatterbox": ausdrucksstärker (scripts/tts_chatterbox.py), Standard für neue Videos
    scene_speed = style.get("sceneSpeed", {})
    # Optional "voicePreset" (Dashboard „Sprechstil“: lebendig | spannend | witzig | ruhig) und je Szene
    # "delivery" (punch | normal | hype | tense | calm): nur Tempo, Pausen und Lautstärke der *Akzentwörter* –
    # keine Tonhöhen-Bearbeitung (Nutzer 09.11.2026: klang unnatürlich). Werte: scripts/voice_fx.py.
    preset = STYLES.get(ep.get("voicePreset", ""))
    pause = np.zeros(int(SAMPLE_RATE * ep.get("pauseMs", preset["pause_ms"] if preset else 350) / 1000), np.float32)
    gap = np.zeros(int(SAMPLE_RATE * ep.get("sceneGapMs", 150) / 1000), np.float32)
    lead = np.zeros(int(SAMPLE_RATE * 0.15), np.float32)  # kurzer Vorlauf

    cb_audio: dict[tuple[str, int], np.ndarray] = {}
    if engine == "chatterbox":
        cb_audio = chatterbox_scenes(ep, preset, resolve_voice(ep["voice"]).split("+")[0].split(":")[0])

    parts, scenes, words, cursor = [lead], [], [], len(lead)
    for sc in ep["scenes"]:
        # Sternchen markieren Akzentwörter ("*Rome*") – nur für die Untertitel, nicht vorlesen
        spoken = apply_say(sc["text"].replace("*", ""), ep.get("years"), ep.get("say"))
        sp = base_speed * scene_speed[sc["id"]] if sc["id"] in scene_speed else None
        d = sc.get("delivery", preset["delivery"] if preset else None)
        if d is not None or preset:
            d = DELIVERY.get(d, DELIVERY["normal"]) if isinstance(d, str) or d is None else {**DELIVERY["normal"], **d}
            sp = (sp or base_speed) * d["speed"] * (preset["speed"] if preset else 1.0)
        pieces = [p.strip() for p in spoken.split(PAUSE_MARK) if p.strip()]
        synth = (lambda i, p: cb_audio[(sc["id"], i)]) if engine == "chatterbox" else (lambda i, p: voice.synth(p, sp))
        p_gap, s_gap = pause, gap
        e = emotion_of(sc) if engine == "chatterbox" else None
        if e:  # Erzähler-Pausen (12.11.2026 abends): „ | “ = Satzpause + 250 ms, Szenenwechsel mindestens NARRATOR.scene_gap_ms Stille
            edge = NARRATOR["tail_keep_s"] + NARRATOR["head_keep_s"]
            p_gap = np.zeros(int(SAMPLE_RATE * max(0.0, (e["gap_ms"] + NARRATOR["piece_extra_ms"]) / 1000 - edge)), np.float32)
            s_gap = np.zeros(int(SAMPLE_RATE * max(ep.get("sceneGapMs", 0), NARRATOR["scene_gap_ms"]) / 1000), np.float32)
        audio = np.concatenate([x for i, p in enumerate(pieces) for x in ((p_gap,) if i else ()) + (synth(i, p),)])
        start = cursor / SAMPLE_RATE * 1000
        parts += [audio, s_gap]
        cursor += len(audio) + len(s_gap)
        scenes.append({"id": sc["id"], "startMs": round(start), "endMs": round(cursor / SAMPLE_RATE * 1000)})
        words += split_words(sc["id"], sc["text"])
        if log:
            log(f"  {sc['id']:<8} {len(audio) / SAMPLE_RATE:5.2f} s")
    track = np.concatenate(parts)
    if post and style.get("post"):  # gleiche Länge, Szenen-/Wortzeiten bleiben gültig
        track = post_process(track, style["post"])
    return track, scenes, words


def bind_cues(ep: dict, words: list[dict], captions: list[dict]) -> list[dict]:
    """Cues an das erste passende Wort ihrer Szene binden (+ emph-Cues aus *Akzentwörtern*)."""
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
    return cues


def retime(path: Path) -> None:
    """Nur Cues neu binden (Beats/Sticker auf andere Wörter gelegt), Sprachspur und Wortzeiten bleiben.
    Spart die Neuvertonung – Chatterbox würfelt jede Aufnahme neu (Rom v3, 09.11.2026)."""
    ep = json.loads(path.read_text())
    out_dir = ROOT / "public" / "episodes" / ep["id"]
    tl = json.loads((out_dir / "timeline.json").read_text())
    captions = json.loads((out_dir / "captions.json").read_text())
    words = [w for sc in ep["scenes"] for w in split_words(sc["id"], sc["text"])]
    if len(words) != len(captions) or any(norm(w["word"]) != norm(c["text"]) for w, c in zip(words, captions)):
        raise SystemExit("--retime: Drehbuch-Text passt nicht mehr zu captions.json – Text geändert? Dann neu vertonen.")
    tl["cues"] = bind_cues(ep, words, captions)
    if "hud" in ep:
        tl["hud"] = ep["hud"]
    if "cover" in ep:
        tl["cover"] = ep["cover"]
    (out_dir / "timeline.json").write_text(json.dumps(tl, indent=1) + "\n")
    print(f"Cues neu gebunden: {len(tl['cues'])} ({out_dir.relative_to(ROOT)}/timeline.json)")


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

    engine = ep.get("engine", "kokoro")
    voice = make_voice(ep, override=bool(voice_name)) if engine == "kokoro" else None
    track, scenes, words = synth_track(ep, voice)
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
        if (ROOT / "whisper.cpp").exists():
            subprocess.run(["node", "scripts/whisper-words.mjs", str(wav16), str(raw), "en"], check=True, cwd=ROOT)
        else:  # Rückfall (Cloud-Container ohne whisper.cpp): faster-whisper in .venv
            subprocess.run([sys.executable, str(ROOT / "scripts" / "whisper_words_fw.py"), str(wav16), str(raw), "en"], check=True)
        whisper = [c for c in json.loads(raw.read_text()) if norm(c["text"])]
        (ROOT / "out").mkdir(exist_ok=True)  # Rohdaten für die Aussprache-Gegenprobe (nicht im Repo)
        (ROOT / "out" / f"{ep['id']}-whisper.json").write_text(json.dumps(whisper, indent=1) + "\n")

    captions = align([w["word"] for w in words], whisper)
    matched = sum(
        1 for blk in difflib.SequenceMatcher(
            a=[norm(w["word"]) for w in words], b=[norm(c["text"]) for c in whisper], autojunk=False
        ).get_matching_blocks() for _ in range(blk.size)
    )
    print(f"Abgleich: {matched}/{len(words)} Wörter direkt von Whisper getimt")
    (out_dir / "captions.json").write_text(json.dumps(captions, indent=1) + "\n")

    # *Akzentwörter* hörbar machen: nur Lautstärke (+emph_db), Timing bleibt gleich
    preset = STYLES.get(ep.get("voicePreset", ""))
    if preset:
        import soundfile as sf

        emph = [(captions[i]["startMs"] / 1000, captions[i]["endMs"] / 1000) for i, w in enumerate(words) if w["emph"]]
        x, sr = sf.read(str(out_dir / "voice.wav"), dtype="float32")
        sf.write(str(out_dir / "voice.wav"), accent_gain(x, sr, emph, preset["emph_db"]), sr)
        print(f"Sprechstil {ep['voicePreset']!r}: {len(emph)} Akzentwörter betont")

    cues = bind_cues(ep, words, captions)

    timeline = {
        "id": ep["id"],
        "title": ep["title"],
        "durationMs": total_ms + 600,
        "scenes": scenes,
        "cues": cues,
    }
    if "hud" in ep:  # Einsatz-Anzeige (src/episode/overlays/Hud.tsx)
        timeline["hud"] = ep["hud"]
    if "cover" in ep:  # Thumbnail-Cover in den ersten Bildern (src/episode/overlays/Cover.tsx)
        timeline["cover"] = ep["cover"]
    (out_dir / "timeline.json").write_text(json.dumps(timeline, indent=1) + "\n")

    mus = ep.get("music") or {}  # {"mood": "dark", "bpm": 140, "why": "..."} – fehlt: alter Loop "upbeat"
    make_music(out_dir / "music.wav", seconds=timeline["durationMs"] / 1000 + 1, bpm=mus.get("bpm"),
               mood=mus.get("mood", "upbeat"), seed=mus.get("seed", ep["id"]))
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
    ap.add_argument("--retime", action="store_true", help="nur Cues neu an vorhandene Wortzeiten binden (keine Neuvertonung)")
    a = ap.parse_args()
    retime(a.episode) if a.retime else main(a.episode, a.voice, a.speed, a.save)
