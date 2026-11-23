"""Remove the flat background around an illustration and save the subject as a transparent, cropped PNG.

The background colour is read from the image's border. Pixels close to it count as background only when they are
connected to the border, so details inside the figure that share the background colour stay. Larger enclosed patches
of background colour (the gap between an arm and the body) are removed too, unless --keep-pockets is given.

    python3 key.py <in.png> <out.png> [--tol 45] [--keep-pockets] [--no-bottom]

--tol            colour distance (0 to 441) that still counts as background
--keep-pockets   keep enclosed patches of background colour (a yellow folder drawn on a yellow field)
--no-bottom      do not start from the bottom edge (a figure cut off by the frame, light trousers)
"""
import argparse

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

POCKET_MIN = 400   # enclosed background patches smaller than this many pixels are kept as part of the drawing
SPECK_MAX = 300    # foreground islands smaller than this are dropped
PAD = 12           # transparent margin left around the subject after cropping


def border_colour(rgb, depth=4):
    edges = [rgb[:depth], rgb[-depth:], rgb[:, :depth], rgb[:, -depth:]]
    return np.median(np.concatenate([e.reshape(-1, 3) for e in edges]), axis=0)


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('src')
    ap.add_argument('out')
    ap.add_argument('--tol', type=float, default=45)
    ap.add_argument('--keep-pockets', action='store_true')
    ap.add_argument('--no-bottom', action='store_true')
    args = ap.parse_args()

    img = Image.open(args.src).convert('RGB')
    rgb = np.asarray(img, dtype=np.float32)
    bg = border_colour(rgb)
    like_bg = np.linalg.norm(rgb - bg, axis=2) < args.tol

    regions, count = ndimage.label(like_bg)
    sides = [regions[0], regions[:, 0], regions[:, -1]]
    if not args.no_bottom:
        sides.append(regions[-1])
    outside = np.setdiff1d(np.unique(np.concatenate(sides)), [0])
    background = np.isin(regions, outside)

    if not args.keep_pockets:
        area = np.bincount(regions.ravel(), minlength=count + 1)
        background |= like_bg & (area[regions] > POCKET_MIN)

    subject = ~background
    islands, n = ndimage.label(subject)
    area = np.bincount(islands.ravel(), minlength=n + 1)
    area[0] = 0
    subject = area[islands] > SPECK_MAX

    alpha = Image.fromarray(subject.astype(np.uint8) * 255).filter(ImageFilter.GaussianBlur(0.8))
    out = img.convert('RGBA')
    out.putalpha(alpha)
    box = out.getbbox()
    if box is None:
        raise SystemExit('nothing left after removing the background; try a lower --tol')
    l, t, r, b = box
    out = out.crop((max(0, l - PAD), max(0, t - PAD), min(img.width, r + PAD), min(img.height, b + PAD)))
    out.save(args.out)
    print(f'{args.out}: {out.width}x{out.height}, background rgb {tuple(int(v) for v in bg)}')


if __name__ == '__main__':
    main()
