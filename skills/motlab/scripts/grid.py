"""Lay a numbered pixel grid over an image so coordinates can be read off it.

Used to find puppet pin positions, split polygons and transition shapes in a cut-out. Transparent areas are shown
on solid magenta, so the edge of the art is easy to see.

    python3 grid.py <image> <out.jpg> [--step 100]
"""
import argparse

from PIL import Image, ImageDraw


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('image')
    ap.add_argument('out')
    ap.add_argument('--step', type=int, default=100, help='grid spacing in image pixels')
    args = ap.parse_args()

    art = Image.open(args.image).convert('RGBA')
    sheet = Image.new('RGBA', art.size, (230, 0, 160, 255))
    sheet.alpha_composite(art)
    pen = ImageDraw.Draw(sheet)
    w, h = art.size
    line, label = (0, 255, 255, 255), (255, 255, 255, 255)

    for x in range(0, w, args.step):
        pen.line([(x, 0), (x, h - 1)], fill=line, width=1)
        pen.text((x + 3, 3), str(x), fill=label, stroke_width=2, stroke_fill=(0, 0, 0, 255))
    for y in range(args.step, h, args.step):
        pen.line([(0, y), (w - 1, y)], fill=line, width=1)
        pen.text((3, y + 3), str(y), fill=label, stroke_width=2, stroke_fill=(0, 0, 0, 255))

    sheet.convert('RGB').save(args.out, quality=90)
    print(f'{args.out}: {w}x{h}, grid every {args.step} px')


if __name__ == '__main__':
    main()
