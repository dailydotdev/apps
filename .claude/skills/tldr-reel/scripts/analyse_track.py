#!/usr/bin/env python3
"""Derive the reel's timing from a music file.

    python3 analyse_track.py track.mp3 [more.mp3 ...]

Detects tempo, beat phase and the strongest usable in-point, then derives how
many bars each frame gets so the densest copy stays under the readable ceiling.
Runtime is an OUTPUT of bpm + word count, never a target.

Needs: ffmpeg on PATH, numpy, scipy.
"""
import json, math, pathlib, subprocess, sys
import numpy as np
from scipy.signal import stft

SR, HOP = 22050, 256
FPS = SR / HOP
W_THESIS, W_STORY = 9, 13     # words in the thesis frame / densest story frame
CEIL = 2.85                   # words/second: 5% under the ~3.0 readable ceiling
OUTRO_TARGET = 6.5            # seconds; the outro needs room for a staged reveal
MAX_TOTAL = 30.0


def decode(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def analyse(path):
    x = decode(path)
    if x.size == 0:
        raise SystemExit(f"could not decode {path}")
    dur = len(x) / SR

    # onset envelope: positive spectral flux
    f, _, Z = stft(x, fs=SR, nperseg=1024, noverlap=1024 - HOP)
    flux = np.maximum(0, np.diff(np.log1p(10 * np.abs(Z)), axis=1)).sum(axis=0)
    flux = (flux - flux.mean()) / (flux.std() + 1e-9)

    # tempo: autocorrelation, reinforced at 2x and 4x the lag so bar-level
    # periodicity outvotes a spurious half-time match
    ac = np.correlate(flux, flux, mode="full")[len(flux) - 1:]
    ac /= (ac[0] + 1e-9)
    best = None
    for bpm in np.arange(70, 171, 0.1):
        lag = int(round(60.0 / bpm * FPS))
        if lag < 2 or lag >= len(ac):
            continue
        score = ac[lag] + sum(0.5 * ac[lag * m] for m in (2, 4) if lag * m < len(ac))
        if best is None or score > best[1]:
            best = (float(bpm), float(score))
    bpm, conf = best
    beat = 60.0 / bpm
    bar = beat * 4

    # beat phase: correlate the flux against a pulse train
    period = beat * FPS
    phase = max(((np.arange(o, len(flux) - 1, period).astype(int), o) for o in np.arange(0, period, 0.25)),
                key=lambda t: flux[t[0]].mean())[1] / FPS

    # bar layout from the copy budget, quantised up to a half bar
    q = lambda need: max(1.0, math.ceil(need / bar * 2) / 2)
    b_story, b_thesis = q(W_STORY / CEIL), q(W_THESIS / CEIL)
    b_outro = round(OUTRO_TARGET / bar * 2) / 2
    bars = [b_thesis] + [b_story] * 4 + [b_outro]
    total = sum(bars) * bar
    # trade outro bars down before ever rushing the copy
    while total > MAX_TOTAL and b_outro > 2.5:
        b_outro -= 0.5
        bars = [b_thesis] + [b_story] * 4 + [b_outro]
        total = sum(bars) * bar

    # in-point: the strongest sustained window of `total`, snapped to a bar line
    win = int(0.25 * SR)
    rms = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, mode="same"))
    need = int(total * SR)
    if need >= len(rms):
        inpoint = phase
    else:
        c = np.cumsum(np.insert(rms, 0, 0))
        i = int(np.argmax((c[need:] - c[:-need]) / need))
        inpoint = phase + round((i / SR - phase) / bar) * bar
        if inpoint < 0 or inpoint + total > dur:
            inpoint = phase + max(0, math.floor((dur - total - phase) / bar)) * bar

    return {
        "file": pathlib.Path(path).name, "duration": round(dur, 2),
        "bpm": round(bpm, 1), "confidence": round(conf, 3),
        "beat": round(beat, 4), "bar": round(bar, 4), "phase": round(float(phase), 3),
        "inpoint": round(float(inpoint), 3), "bars": bars, "total": round(total, 3),
        "pace_story": round(W_STORY / (b_story * bar), 2),
        "fits": bool(total <= dur),
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    rows = [analyse(p) for p in sys.argv[1:]]
    print(json.dumps(rows, indent=1))
    print(f"\n{'track':32} {'bpm':>6} {'conf':>5} {'in':>7} {'total':>6} {'w/s':>5} {'fits':>5}",
          file=sys.stderr)
    for r in rows:
        print(f"{r['file'][:31]:32} {r['bpm']:6.1f} {r['confidence']:5.2f} {r['inpoint']:7.2f} "
              f"{r['total']:6.2f} {r['pace_story']:5.2f} {'yes' if r['fits'] else 'NO':>5}",
              file=sys.stderr)
        if r["confidence"] < 0.70:
            print(f"  ^ low tempo confidence — verify by ear", file=sys.stderr)
        if not r["fits"]:
            print(f"  ^ track is {r['duration']}s but the cut needs {r['total']}s", file=sys.stderr)
