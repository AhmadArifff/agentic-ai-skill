# Footage: screen recordings, camera clips and edits

A scene page can decode a video file and draw any frame of it, so footage is just another layer on the canvas. Cuts,
trims, speed changes, zooms, captions and animated overlays are all code, rendered on the same frame grid as everything
else.

## Open a clip

```html
<canvas id="c"></canvas>
<script type="module">
const S = +(new URLSearchParams(location.search).get('scale') || 1), W = 1920, H = 1080;
const c = document.getElementById('c'); c.width = W * S; c.height = H * S; const ctx = c.getContext('2d');
let clip;
window.TOTAL = 4;
window.ready = (async () => {                       // set window.ready before any await
  const { openFootage } = await import('/__motlab/footage.js');
  clip = await openFootage('../footage/demo.mp4');   // relative to this page, inside the project folder
})();
window.renderAt = async t => {
  await window.ready;
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const f = await clip.frame(12.5 + t);              // 12.5 s into the file: the in-point of this shot
  f.draw(ctx, 0, 0, W, H);                           // rotation metadata from phones is applied here
};
</script>
```

- `clip.width`, `clip.height`, `clip.duration` describe the file. `clip.frame(t)` returns the frame shown at `t` seconds
  into the file. It stays valid until the next `frame()` call, so draw it straight away. For a WebGL texture use
  `f.toCanvasImageSource()`.
- `/__motlab/footage.js` is served by the renderer and by the viewer, so the page works in both. It does not work from
  `file://`; open pages through `motlab edit`.
- Sequential frames decode once each. Jumping backwards or far ahead seeks from the previous keyframe, which is fine.
- Footage must be inside the project folder, like every other asset.

## Probe before you plan

```bash
ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,duration:stream_side_data=rotation -of compact footage/demo.mp4
```

Note the frame rate (screen recordings are often 60 fps or variable), the size, any rotation, and whether there is an
audio track. Pull a contact sheet to see what is in it: `ffmpeg -i demo.mp4 -vf "fps=1,scale=320:-1,tile=6x6" -frames:v 1 sheet.jpg`.

## Editing moves

- **Trim and cut.** One scene per shot, each with its own in-point. A hard cut between scenes is a real cut now, which
  is right for edits even though ads avoid it.
- **Speed.** `clip.frame(in + t * 2)` plays at double speed. A speed ramp uses an eased time map:
  `in + 3 * outCubic(t / 3)`. Keep the audio in step or drop it under music.
- **Freeze frame.** `clip.frame(in)` for every `t`, with a slow push so it is not dead.
- **Zoom and pan on a screen recording.** Draw the frame scaled around the point of interest:
  `f.draw(ctx, sx, sy, sw, sh, 0, 0, W, H)`. Ease into the zoom before the action and out after it. Keep text on the
  recording readable: at 1080p output, UI text should stay at least as large as in the original.
- **Highlights.** A rounded rectangle outline, a dimmed surround (draw a dark layer with the target cut out), or a soft
  spotlight. Animate it in with the same easing as everything else.
- **Captions and labels.** Use the text rules of the chosen style. Burned-in subtitles: short lines, bottom third, a
  soft dark band behind for contrast.
- **Picture in picture, split screens, device frames.** Draw the frame into a clipped rounded rectangle, a phone body or
  a laptop shape.
- **Animation over footage.** Draw canvas or 3D elements on top of the frame. When footage has to meet an animation,
  see `into-footage.md`.

## Talking heads: cut the pauses

One scene per jump cut makes dozens of pages, each with its own decoder. Cut the pauses into a list instead and play
it in one scene, or in one scene per section (below):

```bash
python3 scripts/cut_pauses.py footage/talk.mp4 cuts.json --start 1.4 --audio-out audio/voice-cut.wav
```

```js
const { cutList } = await import('/__motlab/cuts.js');
const edit = cutList(await (await fetch('../cuts.json')).json(), clip, { punch: [1, 1.12], glide: 0.25, drift: 0.008, x: 0.5, y: 0.42 });
window.renderAt = async t => { await window.ready; await edit.draw(ctx, t, 0, 0, W, H); /* captions, overlays */ };
```

- Put `audio/voice-cut.wav` in `project.json` at the scene's start, not the recording itself: it has the same cuts.
- `punch` alternates the framing at every cut (wide, closer, wide), which makes jump cuts look meant. `glide` eases the
  zoom over that many seconds after a cut; 0 is a hard punch-in, 0.2 to 0.3 a quick settle. Keep `drift` at 0.005 to
  0.01: it adds up over a long part (0.012 is 14% closer after 12 s).
- `x`, `y` is the point that stays put (fractions of the recording, the face for a talking head). A segment in
  `cuts.json` can set its own `zoom`, `x` and `y`, for a closer shot on a key line.
- A dissolve (`--dissolve 0.12`) softens cuts in the picture and the sound but blurs the mouth for a moment; most
  talking heads look better with plain punch-ins. It needs `clip2`, a second `openFootage()` of the same file.
- `edit.parts[k].at` are the cut times, for a pop or swish on a cut. `edit.toOut(t)` maps a word time from a transcript
  of the recording to the edit. Whisper word times were about 0.23 s early in one take, so check captions by ear.
- Listen to the cut voice before building on it. Raise `--min-pause` if a deliberate pause was cut, and raise
  `--keep-tail` or `--keep-lead` if a cut clips the end or start of a word.

### One take, several scenes, captions

For a take longer than about 30 s, make one scene per section (hook, each point, the close), so the user's notes and
`--only` point at a section. Read the transcript, pick where each section starts, and pass the times in seconds of the
recording; each moves to the nearest cut and the script prints where every section lands:

```bash
python3 scripts/cut_pauses.py footage/talk.mp4 cuts.json --audio-out audio/voice-cut.wav --sections hook=0,tip1=18.2,tip2=47.9,close=81
```

```js
const cuts = await (await fetch('../cuts.json')).json();
const edit = cutList(cuts, clip, { section: 'tip1', punch: [1, 1.12], glide: 0.25 });
window.TOTAL = edit.duration;   // inside window.ready, before it resolves
const lines = edit.captions(await (await fetch('../transcript.json')).json(), { maxChars: 28 });
```

- List the section scenes in order with hard cuts and put `audio/voice-cut.wav` once at `start: 0`; the scenes add up
  to the cut voice. No scene transitions between sections: they shorten the video and the voice drifts.
- `edit.captions(transcript)` takes Whisper's JSON with word times (`whisper talk.mp4 --word_timestamps True
  --output_format json`) or a list of `{ text, start, end }`, in seconds of the recording, and returns lines
  `{ text, start, end, words }` in the scene's time. Draw the line where `start <= t < end` with the style's caption
  rules, and use `words` for a word-by-word highlight. `maxChars` 24 to 32 suits a phone; `shift` moves every word
  if the captions run early (0.23 s in one take). With a dissolve, words starting in the outgoing part's faded
  tail are dropped like cut words; crossing words end where the incoming part starts. `edit.toOut()` maps
  tail times to that start too. The last part keeps its full span, up to the section's end.
- motlab does not transcribe. If there is no transcript, ask the user for one or whether to install Whisper; do not
  install it unasked. Without one, ask the user where each section starts.

## Footage sound

List the video file in `project.json` like any audio file, with `from` (seconds into the file) and `duration`:

```json
{ "file": "footage/demo.mp4", "start": 4.0, "from": 12.5, "duration": 6, "volume": 1 }
```

`start` is where it begins in the finished video, `from` must match the in-point you pass to `clip.frame`. For a J or L
cut (sound starting before or running after its picture), give the audio entry an earlier `start` or a longer
`duration` than the scene. Duck music under speech by giving the music a lower `volume`, or split the music into two
entries around the speech.

## Limits

- Decoding uses WebCodecs, so the codec must be one Chrome decodes: H.264, HEVC, VP9 or AV1, in MP4, MOV, WebM or MKV.
  ProRes is not. Convert anything else first: `ffmpeg -i in.mov -c:v libx264 -crf 16 -c:a aac out.mp4`.
- The viewer decodes the whole audio of a video file to draw its waveform, so very long recordings load slowly there.
  Trim long recordings to the parts you use before listing them.
- No alpha output yet, so the result is always a flat MP4.
