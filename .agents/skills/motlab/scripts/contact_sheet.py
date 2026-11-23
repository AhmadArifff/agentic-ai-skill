"""Put a folder of stills on one labelled sheet, in time order, for reviewing a video frame by frame.

The stills are the files `motlab stills` writes: <seconds>[-<occurrence>].png or .jpg.

    python3 contact_sheet.py <stills dir> <out.jpg> [--cols 4] [--width 640]
"""
import argparse
import math
import os
import re

from PIL import Image, ImageDraw

NAME = re.compile(r'^(\d+(?:\.\d+)?)(?:-(\d+))?\.(png|jpe?g)$', re.I)


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('folder')
    ap.add_argument('out')
    ap.add_argument('--cols', type=int, default=4)
    ap.add_argument('--width', type=int, default=640, help='width of one tile in pixels')
    args = ap.parse_args()

    stills = []
    for name in os.listdir(args.folder):
        m = NAME.match(name)
        if m:
            stills.append((float(m.group(1)), int(m.group(2) or 1), m.group(1), os.path.join(args.folder, name)))
    if not stills:
        raise SystemExit(f'no stills named <seconds>.png or <seconds>.jpg in {args.folder}')
    stills.sort()

    first = Image.open(stills[0][3])
    tw = args.width
    th = round(tw * first.height / first.width)
    rows = math.ceil(len(stills) / args.cols)
    gap = 4
    sheet = Image.new('RGB', (args.cols * (tw + gap) + gap, rows * (th + gap) + gap), (24, 24, 24))
    pen = ImageDraw.Draw(sheet)

    for n, (_, _, label, path) in enumerate(stills):
        x = gap + (n % args.cols) * (tw + gap)
        y = gap + (n // args.cols) * (th + gap)
        sheet.paste(Image.open(path).convert('RGB').resize((tw, th), Image.LANCZOS), (x, y))
        pen.text((x + 8, y + 6), f'{label} s', fill='white', stroke_width=2, stroke_fill='black')

    sheet.save(args.out, quality=88)
    print(f'{args.out}: {len(stills)} stills, {args.cols} per row')


if __name__ == '__main__':
    main()
