"""Run a transparent rendered sequence straight into a real clip, as one MP4.

The ad plays over black. During --fade the black gives way to the clip's frame at --start, held still. During --melt
the rendered object fades out over the real one in that frame, so there is no jump at the cut. At --end the clip
itself starts playing from --start.

    python3 compose_into_clip.py <frames dir> <clip> <out.mp4> [--start 0] [--end 8]
        [--fade 6.2 7.5] [--melt 7.45 7.95] [--sfx ad.wav] [--fps 25] [--w 3840] [--h 2160]

<frames dir> holds RGBA PNGs (a Blender render with a transparent film); they are spread evenly over 0 to --end.
--sfx is the ad's own sound, from 0 s; the clip's sound, if it has any, follows from --end.
"""
import argparse
import glob
import os
import subprocess

import numpy as np
from PIL import Image


def ease(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def window(t, span):
    a, b = span
    return ease((t - a) / (b - a)) if b > a else float(t >= b)


def grab_frame(clip, at, w, h):
    raw = subprocess.run(
        ['ffmpeg', '-v', 'error', '-ss', str(at), '-i', clip, '-frames:v', '1',
         '-vf', f'scale={w}:{h}:flags=lanczos', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
        capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(h, w, 3).astype(np.float32)


def has_audio(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index',
                          '-of', 'csv=p=0', path], capture_output=True, text=True).stdout
    return bool(out.strip())


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('frames')
    ap.add_argument('clip')
    ap.add_argument('out')
    ap.add_argument('--start', type=float, default=0.0, help='where in the clip the ad lands, in seconds')
    ap.add_argument('--end', type=float, default=8.0, help='length of the ad part, in seconds')
    ap.add_argument('--fade', type=float, nargs=2, default=[6.2, 7.5], metavar=('FROM', 'TO'))
    ap.add_argument('--melt', type=float, nargs=2, default=[7.45, 7.95], metavar=('FROM', 'TO'))
    ap.add_argument('--sfx')
    ap.add_argument('--fps', type=int, default=25)
    ap.add_argument('--w', type=int, default=3840)
    ap.add_argument('--h', type=int, default=2160)
    o = ap.parse_args()

    frames = sorted(glob.glob(os.path.join(o.frames, '*.png')))
    if len(frames) < 2:
        raise SystemExit(f'need at least two PNG frames in {o.frames}')
    count = round(o.end * o.fps)
    if count < 1:
        raise SystemExit('--end must be at least one frame long')
    held = grab_frame(o.clip, o.start, o.w, o.h)

    graph = (f'[0:v]format=yuv420p,setsar=1[ad];'
             f'[1:v]fps={o.fps},scale={o.w}:{o.h}:flags=lanczos,format=yuv420p,setsar=1[rest];'
             f'[ad][rest]concat=n=2:v=1:a=0[v]')
    inputs = ['-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{o.w}x{o.h}', '-r', str(o.fps), '-i', '-',
              '-ss', str(o.start), '-i', o.clip]
    audio = []
    clip_sound = has_audio(o.clip)
    ms = round(o.end * 1000)
    if o.sfx:
        inputs += ['-i', o.sfx]
        graph += (f';[1:a]adelay={ms}:all=1[late];[2:a][late]amix=inputs=2:normalize=0:duration=longest[a]'
                  if clip_sound else ';[2:a]anull[a]')
    elif clip_sound:
        graph += f';[1:a]adelay={ms}:all=1[a]'
    if o.sfx or clip_sound:
        audio = ['-map', '[a]', '-c:a', 'aac', '-b:a', '320k']

    enc = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', *inputs, '-filter_complex', graph, '-map', '[v]', *audio,
                            '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', o.out],
                           stdin=subprocess.PIPE)
    last = len(frames) - 1
    shown, rgba = None, None
    for n in range(count):
        t = n / o.fps
        path = frames[round(n * last / max(count - 1, 1))]
        if path != shown:
            rgba = np.asarray(Image.open(path).convert('RGBA').resize((o.w, o.h), Image.LANCZOS), dtype=np.float32)
            shown = path
        cover = rgba[..., 3:] / 255 * (1 - window(t, o.melt))
        under = held * window(t, o.fade)
        frame = rgba[..., :3] * cover + under * (1 - cover)
        enc.stdin.write(np.clip(frame + 0.5, 0, 255).astype(np.uint8).tobytes())
    enc.stdin.close()
    if enc.wait():
        raise SystemExit('ffmpeg failed')
    print(f'{o.out}: {len(frames)} rendered frames over {count} frames to {o.end:g} s, then the clip from {o.start:g} s')


if __name__ == '__main__':
    main()
