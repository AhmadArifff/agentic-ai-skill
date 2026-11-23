# Level 3: Blender

Blender is for a product that should look photographed: real materials, soft light, a shallow lens. The user installs
Blender from blender.org but never has to open it. You run it with no window (`blender -b -P scene.py -- ...`), it
writes a numbered PNG sequence, and a scene page plays that sequence like any other scene, so the user still reviews in
the viewer and exports from there. Expect the build to take longer than a canvas scene.

Look for Blender before planning on it: `blender` on the PATH, `C:\Program Files\Blender Foundation\Blender <version>\
blender.exe` on Windows, `/Applications/Blender.app/Contents/MacOS/Blender` on a Mac.

## The scripts

All in `scripts/blender/`, plain Python files to copy next to the project's assets:

- `kit.py` runs inside Blender: an empty scene, Cycles on whatever GPU the machine has, materials, one area light, a
  camera, importing meshes and models, the flat look, and the render loop that keys every frame and skips frames
  already on disk.
- `tracks.py`: smooth curves for moves (`mono`, `tracks`) that never overshoot, so a move cannot wobble back.
- `mesh_from_sdf.py` runs in plain Python (numpy and scipy): describe a shape as a distance function and get a smooth
  quad mesh as `.npz`, which `kit.load_npz()` reads.
- `example_scene.py`: a complete small scene that uses all three.

Run the example once before building anything, so you know the machine works:

```
python3 example_scene.py mesh
blender -b -P example_scene.py -- frames 1280 24 0.5 2 3.5
```

The first line writes the meshes to `example_mesh/`. The arguments after `--`, in order: where to write the frames,
the image width in pixels, the Cycles sample count, the word `flat` for the flat look (optional), and any number of
times in seconds to render only those frames (none renders the whole animation). Frame f is the scene at (f - 1) / fps seconds, saved as `<folder>/<f:04d>.png` with a transparent
background. Frames already on disk are skipped, so after a crash the same command carries on. A relative output folder
is taken from the folder Blender runs in.

Measured on Blender 5.2 with an RTX 3060 Laptop (Cycles on OptiX): three 640 px stills at 8 samples took 8.9 s
including Blender's start-up, and all 100 frames (4 s at 25 fps) at 1280 px and 24 samples took 402 s.

## Playing the frames in a scene

A scene page loads each PNG only when it is asked for, so a long sequence never sits in memory at once:

```html
<canvas id="c"></canvas><script>
const q = new URLSearchParams(location.search), S = parseFloat(q.get('scale') || '1'), W = 1280, H = 720, FPS = 25, N = 100;
const c = document.getElementById('c'); c.width = W * S; c.height = H * S; const ctx = c.getContext('2d');
window.TOTAL = N / FPS; const cache = new Map();
function frame(k) {   // frame k of the scene is frames/<k + 1>.png
  k = Math.max(0, Math.min(N - 1, k));
  if (!cache.has(k)) { const img = new Image(); img.src = `frames/${String(k + 1).padStart(4, '0')}.png`; cache.set(k, img.decode().then(() => img));
    if (cache.size > 8) cache.delete(cache.keys().next().value); }
  return cache.get(k);
}
window.ready = frame(0).then(() => true);
window.renderAt = async t => { const k = Math.round(t * FPS), img = await frame(k); frame(k + 1); frame(k + 2);   // load ahead
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height); };
</script>
```

Render the project at the frames' fps. The example's 100 frames played this way and rendered with `motlab video` at
25 fps came out one PNG per video frame: every frame was closest to its own PNG (mean difference 0.22 of 255), none to
a neighbour.

## Getting the shape right

People notice a wrong shape before anything else, and it is easy to miss without a side-by-side comparison.

- If a model exists, use it: `kit.load_model(path, parent)` imports GLB, glTF, FBX and OBJ and returns the new
  objects. Check its licence when the video will be published.
- If not, build it in `mesh_from_sdf.py`. A body is usually a few `ellipsoid`s or `pill`s joined with `smin`; anything
  round (a bottle, a cap, a knob) is a `revolve` of an outline, rounded first with `chaikin`; a recess is `smax` with a
  `rounded_pocket`. Shapes are y-up; the example turns them upright with a parent rotated 90 degrees about x.
- Collect references from several angles. A screen recording of the product turning in a 3D viewer is ideal; pull
  frames from it with ffmpeg and measure proportions on them.
- Before animating, render a few still poses on a grey world and put them next to the references. Fix the shape until
  they agree. Each check takes seconds.

Things that go wrong with distance-function meshes:

- Heavy smoothing (`smooth=` in `load_npz`, 20 iterations by default) rounds off small parts and closes small holes.
  Use fewer iterations on small or detailed parts, as the example does for its band.
- A detail placed as a flat disc on a curved surface sticks out at its edges. Sink a flattened ellipsoid into the
  surface instead.
- Seams and grooves look heavier once lit than they do in a reference photo. Keep them shallow.
- A mirrored copy made with a negative scale can end up on the wrong side. Check left and right against the reference.
- Parts that move out of a closed object can pass through its walls. Move them straight out before they turn, and hide
  what is inside until it opens.

## Light and camera

- One light: `kit.key_light(position, size, power, target)` is a large soft area light, and `kit.setup` gives a world
  that is almost black. One source with a dark surround is most of the photographed look.
- Long focal lengths (70 to 90 mm) keep proportions calm and let the camera move in close for details.
- Give each move a single curve from `tracks.py` from start to end. Two curves joined in the middle leave a jolt in
  speed even when the positions match; render the frames around a join to check.
- Choose the camera path for the moment that matters: by then the side people recognise the product by should face
  the lens.
- The render keys every object passed to `kit.render` on every frame, with motion blur over half a frame.

## Render time

- Quick looks: a few times at 640 px and 8 samples. Final frames: 1280 or 1920 px at 24 samples, scaled up in the
  scene page if the export is larger. Close-ups and glass take longer.
- Cycles keeps the GPU busy and the machine sluggish. Tell the user before a long render and do not start other heavy
  work alongside it.
- After a change that affects only some frames, delete those PNGs and run the same command; the others are kept.

## The flat look

Pure white shapes with black only where the product is black, no shading and no lines. It reads as a bold graphic and
sits naturally next to footage shot in silhouette.

Pass `flat` on the command line to a scene that calls `kit.flat_mode(black_materials=('dark',))` when it sees it, as
the example does. Every mesh becomes flat white except those whose material is named in `black_materials`, which become
flat black; text objects are hidden. With no lighting to compute, 8 samples or so are plenty.

Keep black only for what is black on the real product, and leave out small details such as lettering, lights and
seams. Lines along the seams turn the look into a drawing, so add them only if the shape is unclear without them.
