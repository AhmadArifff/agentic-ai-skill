# Craft: what makes a motlab video look expensive

These techniques come from a 12-second Spotify spec ad built with this workflow from nothing but eight phone
screenshots and two logo files. No generated images or video went into it. It looked good for the reasons below, and they apply to any video, not only ads.

## 1. Real assets, measured to the pixel

- Every picture on screen is the user's real material: screenshots, logos, photos, footage. Nothing is invented when
  a real version exists.
- Measure before you draw. The ad kept the logo's visible bounding box (`{ x: 13, y: 14, w: 913, h: 912 }`), the
  album cover's rectangle inside the screenshot (`[128, 267, 823, 823]`), and each tile's crop rectangle as constants.
  Centring and morphs then land exactly, and the end logo is centred by what you see, not by the file's canvas.
- Crop pieces out of screenshots and move them separately (tiles, a header, track rows), so a flat screenshot becomes
  a layered scene. Cover personal details (a profile photo became a grey circle).
- Rebuild anything the camera gets close to as vector shapes (the play button, the pause disc), so it stays sharp at
  4K while the screenshot around it would blur.

## 2. One block of beat times

```js
const B = { morph1: 1.05, tilesIn: 1.5, tap: 3.0, flood2: 3.15, artist: 3.7, press: 5.9, END: 12 };
window.EVENTS = [{ name: 'tap', t: B.tap }, { name: 'press_play', t: B.press }];
```

Every animation reads its times from `B`, and `EVENTS` is built from the same constants. Re-timing a note ("slower
here") is one number, and the sound effects follow automatically because the cues point at event names.

## 3. Shots become each other

There is not one cut or cross dissolve in the ad. Each shot hands its key shape to the next one:

| From | Becomes |
|---|---|
| the logo disc | the phone screen (circle to rounded rectangle, green to dark) |
| a round photo on a tile | the orange background of the artist page (it grows past the frame edges) |
| the mini player bar | the full-screen now-playing background |
| the album cover in the bar | the big cover in the centre, on one curve |
| the white pause disc | the green logo, then the wordmark slides out from behind it |

Two small tricks sell each handover. First, an anticipation: the source shape squashes about 8% one pose before it
grows (`1 - 0.08 * bump(prog(t, start - 0.14, start + 0.02))`). Second, the shape is painted in the next shot's
background colour as it grows, and the next shot appears inside it a beat later, scaling up from 93% to 100%.

## 4. A camera that only goes one way

Each "world" has one camera that keeps pushing in and never reverses. Distance is eased in log space, so the push feels
even from far to near:

```js
const D = Math.exp(lerp(Math.log(2500), Math.log(1700), outCubic(prog(t, 1.1, 3.75))));
```

Something is always moving: a 3 to 5% push on holds, a drift, rings pulsing behind the cover. A still frame reads as
a mistake.

## 5. Easing with intent

- Entrances: `outExpo` or `outCubic` (fast, then a long settle). First drafts are nearly always too fast.
- Shape morphs: `inOutCubic`. Fades: a sine, never an ease that ends abruptly.
- Staggers of 0.08 to 0.1 s between items in a cascade (tiles, list rows, words).

## 6. Depth and a filmed look

- UI panels sit in real 3D (`gl3d.js`) with a perspective camera and shallow depth of field, so the background goes soft.
- Motion blur: every frame averages 12 renders spread over half a frame's time. Fast moves smear like film instead of
  stepping.
- One soft light source, a gentle glow behind the hero, a single light sweep across the final logo. Nothing else.

## 7. Text that arrives softly

Words come in one at a time, 0.08 s apart: each rises 20 px while it goes from blurred to sharp, and they go out the
same way. Sentence
case, tight tracking (about -3%), a short line ending in a full stop, a gradient only on the lower half of the letters
on dark backgrounds. No bounces, no letter-by-letter typing, no hard wipe edge.

## 8. Sound mapped to meaning

`cues.json` lists every sound against an event name with an offset, a level, a pitch and a pan. Repeated ticks rise in
pitch (0.90, 1.00, 1.10, 1.20) and alternate pan. Whooshes only under movement, pops and soft hits on morphs and
landings, a riser that ends on the logo. The song comes in on the play press (`"event": "press_play"`), with a quiet air
bed underneath the whole ad. See `sound-and-music.md`.

## 9. A shot plan that says how shots connect

The Spotify ad was planned as six numbered shots, each with a time range, one line on what we see, one on what moves,
and one on how the shot becomes the next. That last line is the design: if you cannot write one, the transition is a
cut, and the shot needs rethinking.

## Checklist before opening the viewer

- [ ] Every transition has a shape that carries across it
- [ ] Nothing reverses direction, and nothing is ever fully still
- [ ] Subject centred by its visible bounds, end card dead still and centred
- [ ] Assets crisp at 4K where the camera gets close
- [ ] Stills checked at three or four points inside every transition, not only on the holds
- [ ] Beat times in one block, events derived from them
