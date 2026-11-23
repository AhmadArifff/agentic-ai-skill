# 2D: cut-outs, puppets and layers

For flat, illustrated scenes start from `templates/template-2d.html`. It is a working example of the pieces below:
shots on flat colour fields, a shot change that grows a shape from the outgoing shot, headlines that rise word by word,
a slow push on each shot, and optional held poses, jitter and flat shadows. Replace its `SHOTS` with the real ones.

Most illustrated briefs come with art as flat PNGs. The scripts here turn that art into parts that can move.

## From a flat image to a cut-out

`python3 scripts/key.py art.png figure.png` removes a flat background. It reads the background colour from the image's
border and removes only what is connected to the border, so a white shirt on a white background keeps its inside.

- `--tol 45` is how far a colour may be from the background and still count as background. Lower it if edges of the
  figure disappear, raise it if a halo is left.
- Patches of background colour enclosed by the figure (between an arm and the body) are removed too. When such a patch
  is part of the drawing (a yellow folder on a yellow field), add `--keep-pockets`.
- `--no-bottom` stops the removal from starting at the bottom edge, for a figure the frame cuts off at the legs.
- Check the result on a loud colour before using it: `python3 scripts/grid.py figure.png check.jpg` shows it on
  magenta with a numbered grid.

Art on a gradient or a paper texture will not key cleanly. Use the whole image as one layer, or redraw the scene.

## Finding coordinates

`python3 scripts/grid.py figure.png grid.jpg [--step 50]` draws a grid labelled in the image's own pixels. Read pin
positions, split polygons and transition shapes off it.

## Splitting into layers

`python3 scripts/split.py figure.png regions.json` writes one PNG per named polygon, each the size of the original and
in the same place, so they stack back exactly. Whatever no polygon covers goes to `figure-base.png`.

```json
{ "badge": [[620, 80], [760, 80], [760, 200], [620, 200]], "cloud": [[40, 30], [300, 30], [300, 180], [40, 180]] }
```

This suits parts that stand apart (a badge, a cloud, motion lines). Where objects overlap, the cut leaves a hole in
whatever was behind, which then shows when the front part moves. Redraw those as shapes instead (below).

## Puppet pins: `scripts/puppet.js`

A grid mesh over a cut-out, bent by pins. Each pin gets a move (shift, turn, scale about a pivot) and the art between
pins follows a blend of the nearby moves, so a figure can lean, wave or nod without being cut apart.

```js
const P = Puppet.create(img, [{ x: 200, y: 90 }, { x: 60, y: 198 }, ...], { cols: 64 });   // pins in image pixels
P.draw(ctx, moves, x * SCALE, y * SCALE, s * SCALE, cv.width, cv.height);
// moves[i] = { dx, dy, rot, s, ox, oy }: (ox, oy) is the pivot, for example the shoulder for an arm
```

- Pin every part that moves, and add pins that hold still (an empty `{}`) wherever the art must stay put, usually the
  feet. Without them the whole figure slides.
- An arm turns about its shoulder, the head about the neck. Give each its own pin with the pivot set.
- A pin's `r` (default 1) widens its reach; `power` in the options (default 3) sets how quickly a pin's pull fades.
- Life comes from small overlapping motions: a main gesture on the beat, a smaller follow-through after it, the head
  arriving a pose later than the body, a slow breathing bob.
- Puppet people and animals. Objects usually look better moved whole, as layers.
- `P.draw` copies the bent art onto `ctx` with `drawImage`, so whatever shadow `ctx` has set (offsets in device
  pixels) falls under the figure.
- It needs WebGL2, which motlab's Chrome has. A six-pin test figure rendered through `motlab stills` at 0, 0.5, 1 and
  1.5 s gave the same pixels in forward and reverse order.

## Redrawing as shapes

Overlapping objects (papers in a tray, a phone in a hand, coins in a pile) are better drawn again as canvas paths.
Use the original image's pixel coordinates so the new shapes line up with the rest. Then every object is its own layer and
nothing has holes. Match the art's style: if it uses dark outlines and flat fills, so do the shapes. Typical motions that
become easy: a paper sliding out from behind the tray's front, a coin spinning (scale its width by `|cos|`), a line
drawing itself with a dash offset, a speech bubble popping in with a slight overshoot.

## Held poses, jitter and flat shadows

Flat art often looks better moving like hand-drawn animation than perfectly smooth:

- Hold poses: `tp = Math.floor(t * POSES) / POSES` feeds every animation, with `POSES` at 12 (smoother) or 8 (rougher).
  At 24 fps that is a new pose every 2 or 3 frames, always the same number.
- Jitter: move each layer by a pixel or two per pose, from a hash of the pose number, so it is the same in every
  render.
- Flat shadows: a hard shadow with no blur, offset down and to the right, about a quarter opaque. Shadow offsets are
  in device pixels, so multiply them by `SCALE`.

## The last shot

End on a still frame: no push or drift, the logo centred by what is visible in it (not by the image file's size, which
may include empty margins), then the tagline and what to do next (a URL, a store badge the brand really uses).
