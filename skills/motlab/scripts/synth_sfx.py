"""Make a small set of sound effects from noise and sine waves, for when there is no sound library.

Writes 48 kHz stereo WAVs: three whooshes, a pop, a tick, a thud, a shutter, a riser and an air bed. They are plainer
than recorded sounds, but nothing is downloaded and nothing costs anything. Pass the folder to mix.py with --lib, and
add your own functions here when an ad needs a sound the set does not have.

    python3 synth_sfx.py <folder>
"""
import os
import sys
import wave

import numpy as np
from scipy.signal import butter, sosfilt

RATE = 48000
rng = np.random.default_rng(7)


def seconds(n):
    return np.arange(int(n * RATE)) / RATE


def bandpass(x, low, high, order=2):
    nyq = RATE / 2
    return sosfilt(butter(order, [low / nyq, min(high, nyq * 0.95) / nyq], 'bandpass', output='sos'), x)


def sweep(f0, f1, dur):
    """A sine whose frequency glides exponentially from f0 to f1."""
    t = seconds(dur)
    freq = f0 * (f1 / f0) ** (t / dur)
    return np.sin(2 * np.pi * np.cumsum(freq) / RATE)


def decay(dur, attack, half_life):
    t = seconds(dur)
    return np.clip(t / attack, 0, 1) * 0.5 ** (t / half_life)


def whoosh(dur, centre_lo, centre_hi):
    """Noise through a band that rises to centre_hi in the middle and falls back, swelling and fading with it."""
    t = seconds(dur)
    noise = rng.standard_normal(len(t))
    shape = np.sin(np.pi * t / dur)
    out = np.zeros_like(noise)
    hop = 512
    window = np.hanning(hop * 2)
    for start in range(0, len(t) - hop * 2, hop):
        centre = centre_lo + (centre_hi - centre_lo) * shape[start + hop]
        chunk = bandpass(noise[start:start + hop * 2], max(40, centre * 0.5), centre * 1.6)
        out[start:start + hop * 2] += chunk * window
    return out * shape ** 1.5


def write(folder, name, mono):
    mono = mono / (np.max(np.abs(mono)) + 1e-12) * 0.89
    delay = 9   # a few samples between left and right gives a little width
    stereo = np.stack([mono, np.concatenate([np.zeros(delay), mono[:-delay]])], axis=1)
    with wave.open(os.path.join(folder, name + '.wav'), 'wb') as f:
        f.setnchannels(2)
        f.setsampwidth(2)
        f.setframerate(RATE)
        f.writeframes((stereo * 32767).astype('<i2').tobytes())
    return name


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    folder = sys.argv[1]
    os.makedirs(folder, exist_ok=True)
    made = []

    for label, dur, lo, hi in [('short', 0.4, 600, 5200), ('medium', 0.7, 350, 3800), ('long', 1.1, 220, 2600)]:
        made.append(write(folder, f'synth whoosh {label}', whoosh(dur, lo, hi)))

    made.append(write(folder, 'synth pop', sweep(700, 170, 0.16) * decay(0.16, 0.002, 0.025)))

    click = bandpass(rng.standard_normal(int(0.05 * RATE)), 2800, 9500) * decay(0.05, 0.0004, 0.004)
    made.append(write(folder, 'synth tick', click + 0.4 * sweep(1900, 1700, 0.05) * decay(0.05, 0.0004, 0.007)))

    body = sweep(110, 45, 0.8) * decay(0.8, 0.003, 0.12)
    made.append(write(folder, 'synth thud', body + 0.15 * bandpass(rng.standard_normal(len(body)), 200, 1500) * decay(0.8, 0.001, 0.02)))

    made.append(write(folder, 'synth shutter', bandpass(rng.standard_normal(int(0.09 * RATE)), 1400, 8500) * decay(0.09, 0.0008, 0.012)))

    t = seconds(2.4)
    build = (t / t[-1]) ** 2.2
    made.append(write(folder, 'synth riser', (0.6 * bandpass(rng.standard_normal(len(t)), 900, 7500) + 0.4 * sweep(120, 480, 2.4)) * build))

    t = seconds(4.0)
    edges = np.clip(np.minimum(t, t[-1] - t) / 0.6, 0, 1)
    made.append(write(folder, 'synth air bed', bandpass(rng.standard_normal(len(t)), 1100, 8000) * edges))

    print(f'{len(made)} sounds in {folder}: ' + ', '.join(made))


if __name__ == '__main__':
    main()
