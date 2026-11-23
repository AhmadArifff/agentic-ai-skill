"""Cut one transparent PNG into layer PNGs of the same size, one per named polygon.

Each layer keeps only the pixels inside its polygon, at their original position, so the layers stack back into the
original image and each part can move on its own. Pixels no polygon covers go to <stem>-base.png.

    python3 split.py <cutout.png> <regions>

<regions> is JSON, inline or a path to a .json file: {"card": [[x, y], [x, y], ...], "ticks": [...]}, with points in
the image's pixels (read them off with grid.py).
"""
import json
import os
import sys

from PIL import Image, ImageChops, ImageDraw


def polygon_mask(size, points):
    mask = Image.new('L', size, 0)
    ImageDraw.Draw(mask).polygon([(float(x), float(y)) for x, y in points], fill=255)
    return mask


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    path, spec = sys.argv[1], sys.argv[2]
    regions = json.load(open(spec, encoding='utf8')) if os.path.isfile(spec) else json.loads(spec)

    art = Image.open(path).convert('RGBA')
    stem = os.path.splitext(path)[0]
    claimed = Image.new('L', art.size, 0)
    alpha = art.getchannel('A')

    for name, points in regions.items():
        mask = polygon_mask(art.size, points)
        layer = art.copy()
        layer.putalpha(ImageChops.multiply(alpha, mask))
        layer.save(f'{stem}-{name}.png')
        claimed = ImageChops.lighter(claimed, mask)

    rest = art.copy()
    rest.putalpha(ImageChops.multiply(alpha, ImageChops.invert(claimed)))
    rest.save(f'{stem}-base.png')
    print('wrote', ', '.join(f'{os.path.basename(stem)}-{n}.png' for n in [*regions, 'base']))


if __name__ == '__main__':
    main()
