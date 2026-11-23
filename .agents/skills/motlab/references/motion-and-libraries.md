# Motion helpers and animation libraries

Every frame must come from `t` alone, because the renderer asks for frames in any order and the viewer jumps around.
That rules out anything that runs on its own clock. The tools below all work by being told the time.

## motion.js: easing, springs, keyframes, motion blur

Served by the renderer and the viewer, so a scene imports it the same way in both:

```js
const { ease, cubicBezier, spring, tween, stagger, prog, lerp, clamp, motionBlur } = await import('/__motlab/motion.js');
```

| Helper | What it does |
|---|---|
| `ease.outCubic(k)` and the rest | the usual curves: `linear`, `in/out/inOut` + `Sine`, `Quad`, `Cubic`, `Quart`, `Expo`, `Back`, plus `outBounce` and the CSS presets `css`, `cssIn`, `cssOut`, `cssInOut` |
| `cubicBezier(x1, y1, x2, y2)` | a CSS `cubic-bezier()` as an easing, e.g. one copied from a design tool or an After Effects graph |
| `spring({ stiffness, damping, mass, velocity })` | a spring from 0 to 1 solved exactly, so frame order does not matter. `spring(...).duration` is when it has settled within 0.1%. `damping` 10 at `stiffness` 100 overshoots by 16%; 20 is critically damped (no overshoot) |
| `tween(t, [[0, 0], [0.4, 120, ease.outBack], [1.2, [10, 20]]])` | keyframes of numbers or arrays, each with the easing into it |
| `stagger(i, 0.06, 0.3, { n, from: 'center' })` | the start time of item `i` in a staggered group |
| `prog(t, a, b)` | 0 to 1 between seconds `a` and `b` |
| `await motionBlur(canvas, t, async time => drawFrame(time), { samples: 8, shutter: 0.5 / fps })` | draws the frame across the shutter and averages it on `canvas`. Use it only on fast moves; it costs `samples` times the drawing |

A spring for an element that pops in after a beat: `const s = spring({ stiffness: 180, damping: 12 }); scale = s(t - beat)`.

## Transitions between scenes

Set in `project.json` on the scene a transition leads into. The viewer and the render draw it with the same shader:

```json
{ "file": "scenes/02.html", "transition": { "type": "crosswarp", "duration": 0.5, "ease": "inOutCubic", "params": {} } }
```

The two scenes overlap for `duration`, so the video gets that much shorter and every later scene starts that much
earlier. Audio `start` times are times in the finished video, so move them when you add a transition before them.
Both scenes need content for the whole overlap: the outgoing scene keeps playing under it and the incoming one has
already started, so do not end a scene on its last frame of motion. The types, from gl-transitions (MIT):

| Type | Look | Params (default) |
|---|---|---|
| `fade` | crossfade | |
| `fadecolor` | dip through a colour | `color` ([0, 0, 0]), `colorPhase` (0.4) |
| `Directional` | push: the new scene slides in and pushes the old one out | `direction` ([0, 1]) |
| `directionalwipe` | soft-edged wipe | `direction` ([1, -1]), `smoothness` (0.5) |
| `directionalwarp` | wipe that stretches both scenes | `direction` ([-1, 1]) |
| `circleopen` | iris | `smoothness` (0.3), `opening` (true) |
| `CrossZoom` | zoom blur through the cut | `strength` (0.4) |
| `crosswarp` | warp from one side | |
| `SimpleZoom` | zoom into the old scene, then fade | `zoom_quickness` (0.8) |
| `LinearBlur` | blur dissolve | `intensity` (0.1) |
| `cube` | 3D cube turn | `persp` (0.7), `unzoom` (0.3), `reflection` (0.4), `floating` (3) |

Names are not case sensitive. `ease` is any name from `motion.js` (default `inOutCubic`). In an ad, prefer the
transitions in `craft.md` that carry a shape across the cut; these are for edits, explainers and talking heads, where
a designed morph is not worth building for every cut. A shader transition between two scenes that already morph into
each other only blurs the morph.

### A layer over the cut (only when asked)

The default for every transition is still the one you design and draw frame by frame in the scene pages: a shape
that carries across the cut (`craft.md` §9), checked with stills inside it. Do not reach for a layer to save that
work. Use one only when the user asks for a ready-made sweep or wipe over the cut, or wants a kit's transition used
the same way at many cuts:
`"transition": { "layer": "assets/kits/<kit>/transitions/swish/transition.js", "duration": 0.6 }`. The module exports
`draw(ctx, p, W, H)` in page pixels, `p` runs 0 to 1 and the frame must be fully covered at 0.5, where the cut is.
The scenes keep their full length (nothing overlaps), so audio times do not move. The module comes from the asset
skill (`templates/transition.js`); motlab then draws it over the cut, so neither scene page draws it.

### A transition of your own, or one from a reference

When none of the 11 fits, write the shader into the project, for example `transitions/swipe.glsl`, and set
`"type": "transitions/swipe.glsl"`. It is a gl-transitions shader: define `vec4 transition(vec2 uv)`, read the scenes
with `getFromColor(uv)` and `getToColor(uv)`, use `progress` (0 to 1, eased) and `ratio` (width / height), and give
each uniform its default in a comment so `params` can change it:

```glsl
uniform float softness; // = 0.05
vec4 transition(vec2 uv) {
  float edge = progress * (1.0 + softness);
  return mix(getToColor(uv), getFromColor(uv), smoothstep(edge - softness, edge, uv.x));
}
```

Uniforms can be float, int, bool, vec2 to vec4 or ivec2 to ivec4, not textures; do not declare `progress` or
`ratio`. A shader from gl-transitions (github.com/gl-transitions/gl-transitions, all MIT) that uses no texture can be
copied in unchanged: keep its author and licence lines. The viewer shows a compile error with the line in the file when the project opens.

When the user shows a transition they like in another video, do not guess it from a description. Take frames across
it, about ten over the transition, named by their time so `contact_sheet.py` can lay them out:

```bash
for t in 3.20 3.25 3.30 3.35 3.40 3.45 3.50 3.55 3.60 3.65; do ffmpeg -v error -y -ss $t -i reference.mp4 -frames:v 1 ref/$t.png; done
python3 scripts/contact_sheet.py ref ref-sheet.jpg
```

Look at the sheet and write down what happens frame by frame: where the new scene first appears, the shape and
softness of the edge, its direction and speed (constant, or fast in the middle, which is the `ease`), and anything on
top such as blur, zoom, a colour flash or light. Build the shader from that, render the project, take frames from the
same stretch of your MP4 the same way, and compare the two sheets side by side. Change the shader or `ease` until the
moments match, then tell the user what still differs. Copy the movement, not the other video's pictures.

## Animation libraries

These were each checked with a box moving from x 100 to 1700 over 2 s: stills at 0.5, 1 and 1.5 s were identical
in forward and reverse order, the box was at 500, 900 and 1300, and the viewer showed it at 900 at 1 s. Pin the exact
version, as below. They load from jsDelivr, so a render needs the network.

**GSAP 3.15.0** (free, its own licence from Webflow, not MIT: it may not be used in a no-code visual animation
builder that competes with Webflow, and Webflow can change the terms). A paused timeline only moves when sought:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script>
const state = { x: 100 };
const tl = gsap.timeline({ paused: true }).to(state, { x: 1700, duration: 2, ease: 'power3.out' });
window.renderAt = t => { tl.seek(t, false); draw(state); };
</script>
```

**Anime.js 4.5.0** (MIT). Times are in milliseconds:

```js
const { createTimeline } = await import('https://cdn.jsdelivr.net/npm/animejs@4.5.0/dist/bundles/anime.esm.min.js');
const tl = createTimeline({ autoplay: false }).add(state, { x: 1700, duration: 2000, ease: 'outExpo' });
window.renderAt = t => { tl.seek(t * 1000); draw(state); };
```

**Lottie (lottie-web 5.13.0, MIT)** plays After Effects animations exported with Bodymovin as JSON. Use the canvas
build. It draws into a canvas it makes inside the container (it ignores `rendererSettings.context`), so size the
container to the frame and copy that canvas:

```html
<div id="lot" style="position:fixed;left:-99999px;top:0"></div>
<script src="https://cdn.jsdelivr.net/npm/lottie-web@5.13.0/build/player/lottie_canvas.min.js"></script>
<script>
Object.assign(lot.style, { width: c.width / devicePixelRatio + 'px', height: c.height / devicePixelRatio + 'px' });
let anim;
window.ready = fetch('anim.json').then(r => r.json()).then(data => new Promise(ok => {
  anim = lottie.loadAnimation({ container: lot, renderer: 'canvas', loop: false, autoplay: false, animationData: data });
  anim.addEventListener('DOMLoaded', () => ok(true));
}));
window.renderAt = async t => {
  await window.ready; anim.goToAndStop(t * anim.frameRate, true);   // in frames; fractions draw in-between frames
  ctx.drawImage(anim.renderer.canvasContext.canvas, 0, 0, c.width, c.height);
};
</script>
```

**Theatre.js core 0.7.2** (Apache-2.0) plays keyframes made in Theatre's visual editor (the studio, AGPL-3.0, used only
while editing and not shipped in the page). Export the project state from the studio as JSON and load it:

```js
const { getProject } = await import('https://cdn.jsdelivr.net/npm/@theatre/core@0.7.2/+esm');
const project = getProject('motlab', { state: await (await fetch('theatre-state.json')).json() });
await project.ready;
const sheet = project.sheet('Scene'), box = sheet.object('Box', { x: 0 });
window.renderAt = t => { sheet.sequence.position = t; draw(box.value); };   // seconds
```

The test used a state file written by hand, not one exported from the studio. Running the studio inside the motlab
viewer has not been tried.

Lottie files with image layers work, also with the image inside the JSON as a data URL. **Text layers need their
glyphs**: lottie-web's canvas build throws on a text layer exported without them (Bodymovin's "Glyphs" option), and it
swallows the error, so the whole animation stays on its first frame. Export with glyphs, or play the file with dotLottie.

**GSAP plugins** (SplitText, MorphSVGPlugin and DrawSVGPlugin ship in `gsap@3.15.0/dist/`). They change DOM and SVG
elements, so keep those elements hidden in the page and draw what they hold onto the canvas:

```js
gsap.registerPlugin(SplitText, MorphSVGPlugin, DrawSVGPlugin);
const split = SplitText.create('#title', { type: 'chars' });          // #title: visibility:hidden, same font as the canvas
const tl = gsap.timeline({ paused: true })
  .to('#shape', { morphSVG: '#target', duration: 2 }, 0)              // read back: new Path2D(shape.getAttribute('d'))
  .fromTo('#line', { drawSVG: '0%' }, { drawSVG: '100%', duration: 2 }, 0)   // read back: line.style.strokeDasharray and strokeDashoffset
  .from(split.chars, { y: 160, opacity: 0, stagger: 0.1, duration: 0.5 }, 0);
window.renderAt = t => { tl.seek(t, false);
  for (const ch of split.chars) { ctx.globalAlpha = +gsap.getProperty(ch, 'opacity'); ctx.fillText(ch.textContent, x0 + ch.offsetLeft, y0 + gsap.getProperty(ch, 'y')); } };
```

Wait for `document.fonts.ready` before `SplitText.create`, or the letters are measured in the fallback font. All three
gave the same stills forward and in reverse order.

**dotLottie (`@lottiefiles/dotlottie-web` 0.82.0, MIT)** plays `.lottie` and Lottie JSON with its own renderer (ThorVG,
WebAssembly) and handles text layers without glyphs, in its own font when the file has none:

```js
const { DotLottie } = await import('https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web@0.82.0/+esm');
const player = new DotLottie({ canvas: off, src: 'anim.lottie', autoplay: false, loop: false, renderConfig: { autoResize: false, devicePixelRatio: 1 } });
window.ready = new Promise((ok, no) => { player.addEventListener('load', () => ok(true)); player.addEventListener('loadError', no); });
window.renderAt = async t => { await window.ready; player.setFrame(Math.min(t * FPS, player.totalFrames - 1)); ctx.drawImage(off, 0, 0, c.width, c.height); };
```

`off` is a second canvas the size of `#c`, kept off screen. A `.lottie` file it cannot read fires neither `load` nor
`loadError`, so the page never becomes ready; the render then says it is still waiting after 30 s. Stills were the
same forward and in reverse.

Not tested: Rive.
