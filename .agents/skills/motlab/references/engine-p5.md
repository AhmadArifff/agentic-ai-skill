# p5.js: generative graphics

Start from `templates/template-p5.html`. It loads p5.js 2.3.4 from jsDelivr, so a render needs the network. p5 runs in
instance mode with `noLoop()`. `renderAt(t)` sets `T`, calls `redraw()` and copies the p5 canvas onto `#c`. The sketch
is drawn in 1920x1080 units, and `?scale=` is applied once with `p.scale(SCALE)`.

Use it for things p5 is good at: noise fields, flow lines, particles, grids and patterns, data drawn as shapes. For
type-led brand animation the 2D template is shorter, and for objects in 3D use three.js (`references/engine-3d.md`).

## Rules that keep frames right

The renderer asks for frames in any order and splits them over several Chrome processes, so a frame must not depend on
the one before it.

- Draw from `T` only. Never `frameCount`, `millis()`, `deltaTime` or `Date.now()`.
- No state carried between frames. A particle that moves "a little each frame" breaks. Compute where it is at `T`
  (`x = x0 + vx * T`, or from `noise(id, T * speed)`), or, for a real simulation, run it from 0 to `T` inside the draw
  with a fixed step and cache the steps you have computed.
- Call `noiseSeed()` and `randomSeed()` at the top of every draw. For values that change per frame, seed with the
  frame number (`Math.round(T * fps)`).
- Do not name a global function `draw`, `setup` or `preload`. p5 2.x then starts a second sketch in global mode, which
  calls it with no arguments. The template names its draw function `paint`.
- Keep `pixelDensity(1)`. The canvas size already includes `?scale=`.

## Checked

Stills at 0.5, 1.5, 3 and 5.9 s, rendered in that order and in reverse, were identical byte for byte. The template's
field of about 1,200 strokes took a median of 11.2 ms a frame in the viewer and encoded at 28 to 34 fps at 1080p (two runs) and
21 fps at 4K on the test laptop (RTX 3060 Laptop). Drawing is on the CPU, so a sketch with many more shapes gets slower in
proportion; at 30 fps a frame has 33 ms. A heavy sketch (6,000 particles traced 40 steps through the noise field from 0 to `T`, 240,000 vertices a frame) gave
identical stills both ways and encoded at 6.1 fps at 1080p.

WebGL mode works the same way: `p.createCanvas(cv.width, cv.height, p.WEBGL)` in `setup`, with the origin at the centre.
A test of 40 lit boxes and a torus gave identical stills forward and in reverse. Not tested: p5's own font loading
with `loadFont`, and p5 add-on libraries.
