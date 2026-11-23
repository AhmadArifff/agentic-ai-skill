# Colours of a kit. Reads the main colours out of references, and checks rendered assets against the kit's tokens.json.
#   python palette.py <image> ... [--k 8]              main colours of the references, with their share of the opaque pixels
#   python palette.py check <tokens.json> <image> ...   share of each asset's opaque pixels that is off the palette
# Colour distance is CIE76 delta E in Lab: under 2.3 is about the smallest visible step, over 10 is a different colour.
# Anti-aliased edges, shading and gradients are off-palette by nature, so read `check` as a trend across assets, not a pass mark.
import sys, json, os, glob
import numpy as np
from PIL import Image
from scipy.cluster.vq import kmeans2

def lab(rgb):   # sRGB 0..255 -> CIE Lab (D65)
    c = rgb / 255.0; c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    xyz = c @ np.array([[0.4124, 0.2126, 0.0193], [0.3576, 0.7152, 0.1192], [0.1805, 0.0722, 0.9505]]) / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 216 / 24389, np.cbrt(xyz), (24389 / 27 * xyz + 16) / 116)
    return np.stack([116 * f[:, 1] - 16, 500 * (f[:, 0] - f[:, 1]), 200 * (f[:, 1] - f[:, 2])], 1)

def pixels(path, n=200000):
    im = Image.open(path).convert('RGBA'); im.thumbnail((800, 800)); a = np.asarray(im).reshape(-1, 4)
    a = a[a[:, 3] > 200][:, :3].astype(np.float64)   # opaque pixels only
    if len(a) > n: a = a[np.random.default_rng(0).choice(len(a), n, replace=False)]
    return a

def files(args): return [f for s in args for f in (sorted(glob.glob(os.path.join(s, '*.png')) + glob.glob(os.path.join(s, '*.jpg'))) if os.path.isdir(s) else [s])]

def hexes(tokens):   # every "#rrggbb" string anywhere under "color"
    out = {}
    def walk(v, k):
        if isinstance(v, dict): [walk(x, f'{k}.{n}' if k else n) for n, x in v.items()]
        elif isinstance(v, list): [walk(x, f'{k}.{i}') for i, x in enumerate(v)]
        elif isinstance(v, str) and v.startswith('#') and len(v) == 7: out[k] = v
    walk(tokens.get('color', tokens), ''); return out

a = sys.argv[1:]
if a and a[0] == 'check':
    toks = hexes(json.load(open(a[1], encoding='utf-8'))); names = list(toks)
    if not toks: sys.exit('no "#rrggbb" colours under "color" in ' + a[1])
    T = lab(np.array([[int(h[i:i + 2], 16) for i in (1, 3, 5)] for h in toks.values()], np.float64))
    for f in files(a[2:]):
        L = lab(pixels(f)); d = np.sqrt(((L[:, None] - T[None]) ** 2).sum(-1)); near = d.argmin(1); dm = d.min(1)
        used = ', '.join(f'{names[i]} {np.mean(near == i) * 100:.0f}%' for i in np.argsort(-np.bincount(near, minlength=len(names)))[:4] if np.any(near == i))
        print(f'{os.path.basename(f)}: {np.mean(dm > 10) * 100:.1f}% off palette (dE > 10), median dE {np.median(dm):.1f}; nearest: {used}')
else:
    k = int(a[a.index('--k') + 1]) if '--k' in a else 8
    if '--k' in a: i = a.index('--k'); del a[i:i + 2]
    px = np.concatenate([pixels(f) for f in files(a)])
    cent, lbl = kmeans2(px, k, minit='++', seed=0); share = np.bincount(lbl, minlength=k) / len(lbl)
    for i in np.argsort(-share):
        if share[i] < 0.005: continue
        r, g, b = np.clip(cent[i], 0, 255).round().astype(int); print(f'#{r:02X}{g:02X}{b:02X}  {share[i] * 100:5.1f}%')
