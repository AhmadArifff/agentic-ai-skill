"""Place sound effects from a local library on an animation's beats, write one WAV and report how well they sync.

    python3 mix.py cues.json <out.wav> --lib <folder> [--lib <folder> ...] [--events events.json] [--len 20.2]
                   [--gain 0] [--quant 12] [--voice voice.wav [--duck 9]]

--events   the page's window.EVENTS as JSON ([{name, t}], from `motlab events page.html events.json`). Cues that name
           an event move with it when the animation is re-timed.
--len      length of the mix in seconds (default: the event called "end", else 20).
--quant N  round event times up to the next 1/N s, for posterised animation that shows N poses a second: the sound
           lands on the pose where the change first shows.
--voice    the voiceover as it plays in the video, from 0 s. Effects are lowered by --duck dB while it speaks.

cues.json is a list. A one-shot cue:
    {"event": "card.open" or "at": 3.15, "offset": 0, "file": "part of a file name", "pick": 0,
     "role": "click", "db": -14, "align": "auto", "pitch": 1.0, "lp": 6000, "hp": 200, "dur": 2.0, "pan": 0}
  file    the first library file (or the pick-th) whose name contains this text, ignoring case
  role    hit, tap, click, ui, pop, key, tick, whoosh, riser or ambience: sets the level and where the sound sits
          on the beat. "db" (peak level in dBFS, before --gain) and "align" override it.
  align   which point of the sound lands on the beat: start (where it becomes audible), arrive (where it first
          gets within 3 dB of its peak), peak, or end (where its tail drops away). auto uses the role's point, or
          without a role measures the sound: start when it peaks within 60 ms, arrive when it is nearly full well
          before its peak, peak otherwise.
  pitch   playback speed (1.2 is higher and shorter). lp / hp: low-pass and high-pass in Hz. dur: cut to this
          many seconds with a short fade. pan: -1 left to 1 right.
A bed, looped if the file is shorter than the span:
    {"type": "bed", "file": ..., "event"/"at": start, "to_event"/"to": end, "db": -26, "from": 0,
     "fade_in": 0.5, "fade_out": 1.0, "lp", "hp", "env": [["event name or seconds", dB], ...]}
  from    where to start reading the file, in seconds. env: level changes over time, relative to db.
  fades   shortened in proportion when they do not fit, so the bed still reaches its level.
"""
import argparse
import json
import os
import subprocess
import sys

import numpy as np
from scipy.signal import butter, sosfilt

RATE = 48000
AUDIO = ('.wav', '.aif', '.aiff', '.mp3', '.flac', '.ogg', '.opus', '.m4a')

# Role -> (peak level in dBFS, the point that lands on the beat). The levels follow the Clipwing real-sfx skill
# (https://clipwing.pro/skills/real-sfx). Struck sounds start on the beat so they never come before the motion; a
# whoosh peaks on it, in the middle of the move; a riser ends on it, on the reveal.
ROLES = {
    'hit': (-4, 'start'), 'tap': (-14, 'start'), 'click': (-14, 'start'), 'ui': (-14, 'start'),
    'pop': (-14, 'start'), 'key': (-14, 'start'), 'tick': (-14, 'start'),
    'whoosh': (-9, 'peak'), 'riser': (-12, 'end'), 'ambience': (-24, 'start'),
}
# Closest spacing in ms between two cues of one role before they blur together, from earshot's launch kit.
CLOSEST = {'tick': 66, 'key': 87, 'pop': 114}
CEILING = -1.0   # dBFS peak of the finished mix


def db(x):
    return 10 ** (x / 20)


def fail(msg):
    sys.exit(f'mix.py: {msg}')


# ---- reading and shaping sounds -----------------------------------------------------------------------------------

def decode(path):
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(RATE), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).reshape(-1, 2).astype(np.float64)


def library(folders):
    found = []
    for folder in folders:
        for root, _, names in os.walk(folder):
            found += [os.path.join(root, n) for n in names if n.lower().endswith(AUDIO) and not n.startswith('._')]
    return sorted(found)


def pick_file(files, text, index=0):
    matches = [f for f in files if text.lower() in os.path.basename(f).lower()]
    if not matches:
        fail(f'no file in the library has "{text}" in its name')
    return matches[min(index, len(matches) - 1)]


def speed(x, factor):
    if abs(factor - 1) < 1e-3:
        return x
    where = np.arange(0, len(x) - 1, factor)
    return np.stack([np.interp(where, np.arange(len(x)), x[:, ch]) for ch in (0, 1)], axis=1)


def filtered(x, hz, kind):
    return sosfilt(butter(2, hz / (RATE / 2), kind, output='sos'), x, axis=0)


def envelope(x):
    """Peak level across both channels, smoothed over 10 ms."""
    width = int(0.01 * RATE)
    return np.convolve(np.abs(x).max(axis=1), np.ones(width) / width, mode='same')


def landmarks(x):
    """Sample positions of a sound's start (-22 dB of its peak), arrival (-3 dB), peak and end (-26 dB)."""
    e = envelope(x)
    top = e.max() or 1.0
    above = lambda level: np.flatnonzero(e > top * level)
    tail = above(0.05)
    return {
        'start': int(above(0.08)[0]) if len(above(0.08)) else 0,
        'arrive': int(above(0.71)[0]) if len(above(0.71)) else 0,
        'peak': int(np.argmax(e)),
        'end': int(tail[-1]) if len(tail) else len(x),
    }


def guess_align(marks):
    if marks['peak'] - marks['start'] <= 0.06 * RATE:
        return 'start'
    if marks['peak'] - marks['arrive'] >= 0.10 * RATE and marks['arrive'] - marks['start'] < 0.45 * RATE:
        return 'arrive'
    return 'peak'


def ducking(voice, length, depth, attack=0.03, release=0.25):
    """A gain curve that is 1 while the voice is silent and -depth dB while it speaks, plus the speaking mask
    (one value per 10 ms)."""
    hop = RATE // 100
    level = np.abs(voice).max(axis=1)
    blocks = len(level) // hop
    if not blocks:
        return np.ones(length), np.zeros(1, bool)
    rms = np.sqrt((level[:blocks * hop].reshape(blocks, hop) ** 2).mean(axis=1))
    speaking = rms > np.percentile(rms, 95) * db(-30)
    target = np.where(speaking, db(-depth), 1.0)
    fall, rise = np.exp(-1 / (attack * 100)), np.exp(-1 / (release * 100))
    gain, now = np.empty_like(target), 1.0
    for n, want in enumerate(target):
        k = fall if want < now else rise
        now = want + (now - want) * k
        gain[n] = now
    return np.interp(np.arange(length), np.arange(blocks) * hop, gain, right=1.0), speaking


# ---- the mix ------------------------------------------------------------------------------------------------------

class Timeline:
    def __init__(self, events, quant):
        self.events = events
        self.quant = quant

    def snap(self, t):
        return np.ceil(t * self.quant - 1e-6) / self.quant if self.quant else t

    def event(self, name):
        if name not in self.events:
            fail(f'unknown event "{name}"')
        return self.snap(self.events[name])

    def time(self, value):
        return self.event(value) if isinstance(value, str) else float(value)

    def cue_time(self, cue, name_key='event', time_key='at'):
        base = self.event(cue[name_key]) if name_key in cue else float(cue[time_key])
        return base + cue.get('offset', 0)


def add_bed(out, cue, sound, level, when, length):
    start = when.cue_time(cue)
    stop = when.time(cue['to_event']) if 'to_event' in cue else float(cue.get('to', length))
    n = int((stop - start) * RATE)
    if n <= 0:
        fail(f'bed {cue["file"]} ends before it starts')
    skip = int(cue.get('from', 0) * RATE)
    source = sound[skip:] if skip < len(sound) else sound
    body = np.tile(source, (n // max(1, len(source)) + 1, 1))[:n]
    gain = np.full(n, db(level))
    if cue.get('env'):
        points = sorted((when.time(t), d) for t, d in cue['env'])
        times = start + np.arange(n) / RATE
        gain *= db(np.interp(times, [p[0] for p in points], [p[1] for p in points]))
    fade_in = int(cue.get('fade_in', 0.5) * RATE)
    fade_out = int(cue.get('fade_out', 1.0) * RATE)
    if fade_in + fade_out > n:
        fade_in = int(n * fade_in / (fade_in + fade_out))
        fade_out = n - fade_in
    if fade_in:
        gain[:fade_in] *= np.linspace(0, 1, fade_in) ** 2
    if fade_out:
        gain[-fade_out:] *= np.linspace(1, 0, fade_out) ** 2
    at = int(start * RATE)
    fit = min(n, len(out) - at)
    out[at:at + fit] += body[:fit] * gain[:fit, None]
    print(f'BED {start:6.2f}-{stop:5.2f}  {level:+5.1f} dB  {os.path.basename(cue["file"])[:60]}')


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0], formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('cues')
    ap.add_argument('out')
    ap.add_argument('--lib', action='append', required=True)
    ap.add_argument('--events')
    ap.add_argument('--len', type=float)
    ap.add_argument('--gain', type=float, default=0.0)
    ap.add_argument('--quant', type=float, default=0.0)
    ap.add_argument('--voice')
    ap.add_argument('--duck', type=float, default=9.0)
    opt = ap.parse_args()

    files = library(opt.lib)
    events = {e['name']: e['t'] for e in json.load(open(opt.events, encoding='utf8'))} if opt.events else {}
    when = Timeline(events, opt.quant)
    length = opt.len or events.get('end') or 20.0
    total = int(length * RATE)
    out = np.zeros((total + 4 * RATE, 2))
    decoded, placed, outside = {}, [], []

    for cue in json.load(open(opt.cues, encoding='utf8')):
        role = cue.get('role')
        if role is not None and role not in ROLES:
            fail(f'unknown role "{role}"; use one of {", ".join(ROLES)}')
        level = cue.get('db', ROLES[role][0] if role else None)
        if level is None:
            fail(f'cue {json.dumps(cue)} needs "db" or "role"')
        path = pick_file(files, cue['file'], cue.get('pick', 0))
        if path not in decoded:
            raw = decode(path)
            decoded[path] = raw / (np.abs(raw).max() + 1e-9)
        sound = speed(decoded[path], cue.get('pitch', 1.0))
        if cue.get('lp'):
            sound = filtered(sound, cue['lp'], 'lowpass')
        if cue.get('hp'):
            sound = filtered(sound, cue['hp'], 'highpass')

        if cue.get('type') == 'bed':
            add_bed(out, dict(cue, file=path), sound, level, when, length)
            continue

        if cue.get('dur'):
            sound = sound[:int(cue['dur'] * RATE)].copy()
            fade = min(len(sound), int(0.08 * RATE))
            sound[len(sound) - fade:] *= np.linspace(1, 0, fade)[:, None]
        pan = cue.get('pan', 0)
        sound = sound * db(level) * np.sqrt(2) * np.array([np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)])

        align = cue.get('align', 'auto')
        chosen = align == 'auto'
        marks = landmarks(sound)
        if chosen:
            align = ROLES[role][1] if role else guess_align(marks)
        if align not in marks:
            fail(f'unknown align "{align}"; use auto, start, arrive, peak or end')
        anchor = marks[align]

        beat = when.cue_time(cue)
        if not 0 <= beat < length:
            outside.append((beat, cue.get('event', ''), os.path.basename(path)))
        first = int(beat * RATE) - anchor
        if first < 0:   # the sound would start before 0 s: drop its head so the anchor still lands on the beat
            sound, anchor, first = sound[-first:], anchor + first, 0
        fit = max(0, min(len(sound), len(out) - first))
        out[first:first + fit] += sound[:fit]
        placed.append({'t': beat, 'align': align, 'auto': chosen, 'event': cue.get('event', ''), 'name': os.path.basename(path),
                       'role': role, 'db': level, 'actual': (first + anchor) / RATE})

    out = out[:total] * db(opt.gain)
    speaking = None
    if opt.voice:
        gain, speaking = ducking(decode(opt.voice), total, opt.duck)
        out *= gain[:, None]
    tail = min(total, int(0.6 * RATE))
    out[total - tail:] *= np.linspace(1, 0, tail)[:, None]
    peak = np.abs(out).max()
    if peak > db(CEILING):
        out *= db(CEILING) / peak
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(RATE), '-ac', '2', '-i', '-',
                    '-c:a', 'pcm_s24le', opt.out], input=out.astype(np.float32).tobytes(), check=True)

    report(placed, outside, out, length, speaking, opt)


def report(placed, outside, out, length, speaking, opt):
    placed.sort(key=lambda p: p['t'])
    worst = 0.0
    for p in placed:
        off = (p['actual'] - p['t']) * 1000
        worst = max(worst, abs(off))
        print(f"{p['t']:6.3f}s  {p['event'][:14]:14s} {p['align'] + ('*' if p['auto'] else ''):7s} {off:+6.1f} ms  {p['name'][:58]}")
    peak = 20 * np.log10(np.abs(out).max() + 1e-9)
    print(f'sync: {len(placed)} cues, worst offset {worst:.1f} ms (one frame at 24 fps is 41.7 ms), '
          f'peak {peak:.1f} dBFS (* = align chosen automatically)')
    if speaking is not None:
        print(f'voice: effects lowered {opt.duck:g} dB while it speaks ({speaking.mean() * 100:.0f}% of the voice file)')

    for t, event, name in outside:
        print(f'WARNING: cue at {t:.3f} s ({event or "at"}, {name[:40]}) is outside 0-{length:.3f} s, so it is cut or silent')
    start = 0
    for n in range(1, len(placed) + 1):   # one recording five or more times in a row sounds mechanical
        if n < len(placed) and placed[n]['name'] == placed[start]['name']:
            continue
        if n - start >= 5 and placed[start]['role'] not in ('tick', 'key'):
            print(f"WARNING: {placed[start]['name'][:40]} plays {n - start} times in a row from {placed[start]['t']:.2f} s; "
                  'vary the file or its pitch')
        start = n
    for role, gap in CLOSEST.items():
        times = [p['t'] for p in placed if p['role'] == role]
        close = [(a, b) for a, b in zip(times, times[1:]) if (b - a) * 1000 < gap]
        if close:
            a, b = close[0]
            print(f'WARNING: {len(close)} pairs of {role} cues are closer than {gap} ms and blur together '
                  f'(first at {a:.3f} s, {(b - a) * 1000:.0f} ms apart)')

    if not placed:
        return
    # Numbers cannot judge taste, so name the few moments most worth listening to.
    times = np.array([p['t'] for p in placed])
    moments = [(placed[0]['t'], 'the first sound')]
    loud = max(placed, key=lambda p: p['db'])
    moments.append((loud['t'], f"the loudest cue ({loud['name'][:30]}, {loud['db']:+.0f} dB)"))
    per_second = [((times >= t) & (times < t + 1)).sum() for t in times]
    busy = int(np.argmax(per_second))
    moments.append((times[busy], f'the busiest second ({per_second[busy]} cues)'))
    edges = np.concatenate([[0.0], times, [length]])
    gap = int(np.argmax(np.diff(edges)))
    if edges[gap + 1] - edges[gap] > 2.5:
        moments.append((edges[gap], f'{edges[gap + 1] - edges[gap]:.1f} s with no sound (finished SFX reels rarely leave more than 2.5 s)'))
    if speaking is not None:
        over = [p for p in placed if speaking[min(len(speaking) - 1, int(p['t'] * 100))]]
        if over:
            top = max(over, key=lambda p: p['db'])
            moments.append((top['t'], f"the loudest cue over the voice ({top['name'][:30]}): is the word still clear?"))
    grouped = {}
    for t, why in moments:
        grouped.setdefault(round(float(t), 2), []).append(why)
    print('listen by ear:')
    for t, why in list(grouped.items())[:5]:
        print(f'  {t:6.2f}s  {"; ".join(why)}')


if __name__ == '__main__':
    main()
