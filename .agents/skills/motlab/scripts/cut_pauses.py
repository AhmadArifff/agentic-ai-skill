# Cuts the pauses out of a talking-head recording: finds them in its sound with ffmpeg silencedetect, keeps a little
# breath on each side, and writes the parts to keep as a cut list for /__motlab/cuts.js. Optionally writes the voice
# with the same cuts, so picture and sound stay in step.
#
#   python3 cut_pauses.py footage/talk.mp4 cuts.json [--audio-out audio/voice-cut.wav]
#       [--start 1.4] [--end 158.2]          the part of the take to use (seconds in the file)
#       [--noise -38] [--min-pause 0.35]     quieter than this many dB for at least this long is a pause
#       [--keep-tail 0.12] [--keep-lead 0.08] seconds kept after speech stops and before it starts again
#       [--drop 61.2-63.0,90-91.5]           more parts of the file to leave out (a fluffed line)
#       [--dissolve 0.12]                    parts overlap and fade by this long instead of cutting hard
#       [--sections hook=0,demo=41.5,end=96] one scene per section: names and where each starts (seconds in the
#                                            file, moved to the nearest cut), for cutList(..., { section: 'demo' })
#
# Run it from the project folder; the paths in cuts.json are relative to it. Listen to the result: a pause that was a
# deliberate beat may need --min-pause raised, and a cut that clips a word needs more --keep-tail or --keep-lead.
import json, os, re, subprocess, sys, tempfile

def opt(name, default, cast=float):
    return cast(sys.argv[sys.argv.index(name) + 1]) if name in sys.argv else default

def duration(path):   # the shorter of picture and sound, never subtitles or data
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,duration:format=duration', '-of', 'json', path], capture_output=True, text=True, check=True)
    data = json.loads(out.stdout)
    lengths = [float(s['duration']) for s in data['streams']
               if s.get('codec_type') in ('audio', 'video') and s.get('duration') not in (None, 'N/A')]
    return min(lengths) if lengths else float(data['format']['duration'])

def pauses(path, noise, min_pause):
    err = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-map', '0:a:0', '-af', f'highpass=f=80,silencedetect=noise={noise}dB:d={min_pause}',
                          '-f', 'null', '-'], capture_output=True, text=True).stderr
    if 'silence' not in err and 'Stream #0' not in err: sys.exit(f'ffmpeg could not read the sound of {path}')
    starts = [float(x) for x in re.findall(r'silence_start: (-?[\d.]+)', err)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', err)]
    return list(zip(starts, ends + [float('inf')] * (len(starts) - len(ends))))

def filter_file_option():
    with tempfile.NamedTemporaryFile('w', suffix='.txt', delete=False, encoding='utf-8') as g: g.write('anullsrc,atrim=end=0.01[out]')
    try:
        probe = subprocess.run(['ffmpeg', '-hide_banner', '-v', 'error', '-/filter_complex', g.name, '-map', '[out]', '-f', 'null', '-'], capture_output=True)
        return '-/filter_complex' if probe.returncode == 0 else '-filter_complex_script'
    finally: os.unlink(g.name)

def main():
    if len(sys.argv) < 3 or sys.argv[1].startswith('-'): sys.exit(__doc__ or open(__file__, encoding='utf-8').read().split('\nimport')[0])
    src, out = sys.argv[1], sys.argv[2]
    total = duration(src)
    start, end = opt('--start', 0.0), min(opt('--end', total), total)
    tail, lead, D = opt('--keep-tail', 0.12), opt('--keep-lead', 0.08), opt('--dissolve', 0.0)
    drops = [tuple(map(float, r.split('-'))) for r in opt('--drop', '', str).split(',') if r]
    gaps = [(a + tail, b - lead) for a, b in pauses(src, opt('--noise', -38.0), opt('--min-pause', 0.35))] + drops
    keep, cur = [], start
    for a, b in sorted(gaps):
        a, b = max(a, cur), min(b, end)
        if b - a < 0.12: continue   # too short to be worth a cut
        if a - cur > max(0.12, D): keep.append([cur, a])
        cur = max(cur, b)
        if cur >= end: break
    if end - cur > max(0.12, D): keep.append([cur, end])
    if not keep: sys.exit('nothing left to keep: check --start, --end and --noise')
    segs = [{'from': round(a, 3), 'to': round(b, 3)} for a, b in keep]
    length = sum(s['to'] - s['from'] for s in segs) - D * (len(segs) - 1)
    data = {'source': src.replace('\\', '/'), 'dissolve': D, 'duration': round(length, 3), 'segments': segs}
    sections = [(n.strip(), float(v)) for n, v in (x.split('=') for x in opt('--sections', '', str).split(',') if x)]
    # The same rule as cutList in cuts.js: a section starts at the cut nearest its time and runs to the next section.
    at = [sum(s['to'] - s['from'] - D for s in segs[:k]) for k in range(len(segs))]
    first = [min(range(len(segs)), key=lambda k: abs(segs[k]['from'] - v)) for _, v in sections] + [len(segs)]
    for i, (n, _) in enumerate(sections):
        if first[i + 1] <= first[i]: sys.exit(f'section {n} starts at the same cut as the next one: move one of them')
    if sections: data['sections'] = [{'name': n, 'from': v} for n, v in sections]
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    with open(out, 'w', encoding='utf-8') as f: json.dump(data, f, indent=1)
    print(f'{len(segs)} parts kept, {end - start:.2f} s of the take became {length:.2f} s -> {out}')
    for i, (n, _) in enumerate(sections):
        a, b = first[i], first[i + 1]
        print(f'  section {n}: from {segs[a]["from"]:.2f} s in the file, {at[a]:.2f} s into the edit, '
              f'{(at[b] if b < len(segs) else length) - at[a]:.2f} s long ({b - a} part{"s" if b - a > 1 else ""})')

    audio = opt('--audio-out', None, str)
    if audio:   # the same cuts on the sound: 5 ms fades at each cut so it does not click, or crossfades for a dissolve
        parts = [f'[0:a]atrim={s["from"]}:{s["to"]},asetpts=PTS-STARTPTS' + ('' if D else f',afade=t=in:d=0.005,afade=t=out:st={s["to"] - s["from"] - 0.005:.3f}:d=0.005') + f'[p{i}]'
                 for i, s in enumerate(segs)]
        if D and len(segs) > 1:
            chain, last = [], 'p0'
            for i in range(1, len(segs)): chain.append(f'[{last}][p{i}]acrossfade=d={D}:c1=tri:c2=tri[x{i}]'); last = f'x{i}'
            graph = ';'.join(parts + chain) + f';[{last}]anull[out]'
        else:
            graph = ';'.join(parts) + ';' + ''.join(f'[p{i}]' for i in range(len(segs))) + f'concat=n={len(segs)}:v=0:a=1[out]'
        with tempfile.NamedTemporaryFile('w', suffix='.txt', delete=False, encoding='utf-8') as g: g.write(graph)
        try:
            os.makedirs(os.path.dirname(os.path.abspath(audio)), exist_ok=True)
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, filter_file_option(), g.name, '-map', '[out]', '-ar', '48000', '-ac', '2', audio], check=True)
        finally: os.unlink(g.name)
        print(f'voice with the same cuts -> {audio} ({duration(audio):.2f} s)')

main()
