# Tile images into one labelled review sheet. Transparent PNGs sit on a grey checker, so a halo or a missing alpha shows.
# Put the user's references in the same call to see the assets next to them.
# Usage: python sheet.py <out.jpg> <image or folder> ... [--cols 4] [--cell 512]
import sys, os, glob
from PIL import Image, ImageDraw
a = sys.argv[1:]; opt = lambda k, d: int(a[a.index(k) + 1]) if k in a else d
cols, cell = opt('--cols', 4), opt('--cell', 512)
for k in ('--cols', '--cell'):
    if k in a: i = a.index(k); del a[i:i + 2]
out, srcs = a[0], a[1:]
fs = []
for s in srcs: fs += sorted(f for e in ('png', 'jpg', 'jpeg', 'webp') for f in glob.glob(os.path.join(s, f'*.{e}'))) if os.path.isdir(s) else [s]
if not fs: sys.exit('no images found')
def checker(n, sq=16):
    im = Image.new('RGB', (n, n), (200, 200, 200)); d = ImageDraw.Draw(im)
    for y in range(0, n, sq):
        for x in range((y // sq) % 2 * sq, n, sq * 2): d.rectangle([x, y, x + sq - 1, y + sq - 1], fill=(170, 170, 170))
    return im
lab = 28; sheet = Image.new('RGB', (cell * cols, (cell + lab) * ((len(fs) + cols - 1) // cols)), (24, 24, 24)); bg = checker(cell)
for i, f in enumerate(fs):
    im = Image.open(f).convert('RGBA'); w, h = im.size; k = min(cell / w, cell / h); im = im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
    tile = bg.copy(); tile.paste(im, ((cell - im.width) // 2, (cell - im.height) // 2), im)
    x, y = (i % cols) * cell, (i // cols) * (cell + lab); sheet.paste(tile, (x, y + lab))
    ImageDraw.Draw(sheet).text((x + 8, y + 8), f'{os.path.basename(f)}  {w}x{h}', fill='white')
sheet.save(out, quality=88); print(out, len(fs), 'images')
