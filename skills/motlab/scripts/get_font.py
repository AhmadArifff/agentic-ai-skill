"""Find and download Google Fonts for a motlab project.

  python get_font.py list [words...] [--cat "Sans Serif"|Serif|Display|Handwriting|Monospace] [--n 40]
      Searches the whole Google Fonts catalog (about 1,950 families), most popular first.
      Words match the family name, category, stroke or classification.

  python get_font.py get "Family Name" [axes] [--out assets/fonts]
      Downloads the family's woff2 files and writes <slug>.css next to them, then rebuilds fonts.css
      from every <slug>.css in the folder. Link fonts.css from scenes. axes is the css2 axis spec:
        "wght@400;700"       two weights
        "wght@200..800"      the variable weight range (animate weight)
        "ital,wght@0,400;1,400"   regular and italic
      Without axes you get the family's default style.
"""
import json, re, sys, urllib.parse, urllib.request
from pathlib import Path

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'


def fetch(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60).read()


def opt(args, name, default):
    if name in args:
        i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    return default


def catalog():
    text = fetch('https://fonts.google.com/metadata/fonts').decode('utf-8')
    return json.loads(text[text.index('{'):])['familyMetadataList']


def list_fonts(args):
    cat, n = opt(args, '--cat', None), int(opt(args, '--n', '40'))
    words = [w.lower() for w in args]
    rows = []
    for f in catalog():
        if cat and f['category'].lower() != cat.lower():
            continue
        hay = ' '.join([f['family'], f['category'], f.get('stroke') or '', *(f.get('classifications') or [])]).lower()
        if all(w in hay for w in words):
            rows.append(f)
    rows.sort(key=lambda f: f['popularity'])
    for f in rows[:n]:
        axes = ','.join(f"{a['tag']} {a['min']:g}-{a['max']:g}" for a in f['axes']) or 'static ' + ' '.join(f['fonts'])
        print(f"{f['family']:<32} {f['category']:<12} {f.get('stroke') or '':<11} {axes}")
    print(f'{len(rows)} match, {min(n, len(rows))} shown')


def get_font(args):
    out = Path(opt(args, '--out', 'assets/fonts'))
    family, axes = args[0], (args[1] if len(args) > 1 else '')
    q = urllib.parse.quote_plus(family) + (':' + axes if axes else '')
    try:
        css = fetch(f'https://fonts.googleapis.com/css2?family={q}&display=block').decode('utf-8')
    except urllib.error.HTTPError as e:
        sys.exit(f'Google Fonts refused "{family}" {axes} (HTTP {e.code}). Check the name with "list" and the axes '
                 'against what it prints, e.g. a static font only has the weights listed.')
    out.mkdir(parents=True, exist_ok=True)
    slug = re.sub(r'[^a-z0-9]+', '-', family.lower()).strip('-')
    for old in out.glob(f'{slug}-*.woff2'):
        old.unlink()
    urls = list(dict.fromkeys(re.findall(r'url\((https://[^)]+)\)', css)))
    for i, url in enumerate(urls):
        name = f'{slug}-{i}.woff2'
        (out / name).write_bytes(fetch(url))
        css = css.replace(url, name)
    (out / f'{slug}.css').write_text(css, encoding='utf-8')
    parts = [p.read_text(encoding='utf-8') for p in sorted(out.glob('*.css')) if p.name != 'fonts.css']
    (out / 'fonts.css').write_text('\n'.join(parts), encoding='utf-8')
    weights = sorted(set(re.findall(r'font-weight: ([^;]+);', css)))
    print(f'{family}: {len(urls)} files, weights {", ".join(weights)} -> {out / (slug + ".css")}, fonts.css updated')


if __name__ == '__main__':
    a = sys.argv[1:]
    if not a or a[0] not in ('list', 'get') or (a[0] == 'get' and len(a) < 2):
        sys.exit(__doc__)
    (list_fonts if a[0] == 'list' else get_font)(a[1:])
