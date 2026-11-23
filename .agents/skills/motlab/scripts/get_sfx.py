"""Find and download openly licensed sound effects from Openverse (api.openverse.org) into a project.

  python get_sfx.py search "whoosh" [--license cc0|commercial] [--max 5] [--n 20]
      Lists matches: id, length, licence, creator and title (at most 20). --max drops sounds longer than that many seconds.
      --license cc0 (default) needs no credit; commercial also allows CC BY and BY-SA, which must be credited.

  python get_sfx.py get <id> [<id> ...] [--out audio/sfx]
      Downloads each sound as <title>-<id>.<ext> and adds its credit line to CREDITS.md in the same folder.

Without a key Openverse allows 20 requests a minute and 200 a day (its rate-limit headers, measured 2026-11-13).
A page is at most 20 results without a key (a larger page_size is a 401). Search is one request (up to 3 with --max),
and get is one per sound. Most sounds come from Freesound as its high-quality MP3 previews.
A licence on Openverse is what the source states; check the landing page in CREDITS.md before a paid use.
"""
import json, re, ssl, sys, urllib.error, urllib.parse, urllib.request
from pathlib import Path

API = 'https://api.openverse.org/v1/audio/'
UA = 'motlab-get-sfx'


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try: return urllib.request.urlopen(req, timeout=60).read()
    except urllib.error.HTTPError as e: sys.exit(f'{url}: HTTP {e.code} {e.read().decode("utf-8", "replace")[:300]}')
    except urllib.error.URLError as e:
        # A Windows certificate store can hold an expired intermediate that breaks a valid chain (seen with
        # cdn.freesound.org on 2026-11-13). certifi's bundle, when installed, verifies it.
        if not isinstance(e.reason, ssl.SSLCertVerificationError): raise
        try: import certifi
        except ImportError: sys.exit(f'{url}: {e.reason}. pip install certifi, then try again')
        return urllib.request.urlopen(req, timeout=60, context=ssl.create_default_context(cafile=certifi.where())).read()


def opt(args, name, default):
    if name in args:
        i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    return default


def search(args):
    lic, mx, n = opt(args, '--license', 'cc0'), float(opt(args, '--max', '0')), int(opt(args, '--n', '20'))
    if lic not in ('cc0', 'commercial'): sys.exit('--license is cc0 or commercial')
    if not args: sys.exit('search needs words, e.g. search "soft whoosh"')
    # Without a key Openverse answers a page_size above 20 with a 401, so --max reads up to 3 pages of 20 instead.
    q = {'q': ' '.join(args)[:200], 'page_size': 20 if mx else min(n, 20)}
    q.update({'license': 'cc0'} if lic == 'cc0' else {'license_type': 'commercial'})
    rows = []
    for page in range(1, 4 if mx else 2):
        d = json.loads(fetch(API + '?' + urllib.parse.urlencode({**q, 'page': page})))
        rows += [r for r in d['results'] if not mx or (r.get('duration') or 0) <= mx * 1000]
        if len(rows) >= n or page >= d.get('page_count', 1): break
    rows = rows[:n]
    if not rows: print('no matches'); return
    for r in rows:
        credit = '' if r['license'] in ('cc0', 'pdm') else '  (credit needed)'
        print(f"{r['id']}  {(r.get('duration') or 0) / 1000:5.1f} s  {r['license']:6s} {r['filetype'] or '?':4s} {r['creator'][:20]:20s} {r['title'][:50]}{credit}")
    print(f"{len(rows)} of {d['result_count']} matches. Get with: python get_sfx.py get <id> ... --out audio/sfx")


def get(args):
    out = Path(opt(args, '--out', 'audio/sfx')); out.mkdir(parents=True, exist_ok=True)
    if not args: sys.exit('get needs one or more ids from search')
    credits = out / 'CREDITS.md'
    text = credits.read_text(encoding='utf-8') if credits.exists() else '# Sound credits\n\nSounds found through Openverse. Keep this file with the project.\n\n'
    for id in args:
        r = json.loads(fetch(API + urllib.parse.quote(id) + '/'))
        slug = re.sub(r'[^a-z0-9]+', '-', r['title'].lower()).strip('-')[:40] or 'sound'
        ext = r.get('filetype') or Path(urllib.parse.urlparse(r['url']).path).suffix.lstrip('.') or 'mp3'
        f = out / f'{slug}-{id[:8]}.{ext}'
        if not f.exists(): f.write_bytes(fetch(r['url']))
        if id not in text: text += f"- `{f.name}`: {r['attribution']} Source: {r['foreign_landing_url']} (id {id})\n"
        print(f"{f}  {(r.get('duration') or 0) / 1000:.1f} s  {r['license']} {r.get('license_version') or ''}")
    credits.write_text(text, encoding='utf-8'); print(f'credits -> {credits}')


if __name__ == '__main__':
    a = sys.argv[1:]
    if not a or a[0] not in ('search', 'get'): sys.exit(__doc__)
    (search if a[0] == 'search' else get)(a[1:])
