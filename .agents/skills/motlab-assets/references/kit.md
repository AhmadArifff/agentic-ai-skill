# The kit: tokens, style rules, names

A kit is only as consistent as its rules are measurable. "Friendly and bold" can't be checked; "6 px ink outlines at
1080p, 24 px corner radius, light from the upper left, no gradients on figures" can.

## tokens.json

The numbers every asset uses. Read them in code instead of typing values into each asset.

```json
{
  "color": {
    "ink": "#111111", "paper": "#FFF8EE",
    "brand": { "primary": "#FF5A1F", "secondary": "#FFC23D" },
    "skin": ["#F2B48C"]
  },
  "font": { "display": { "family": "Syne", "weight": 700, "licence": "OFL" }, "body": { "family": "Inter", "weight": 500, "licence": "OFL" } },
  "stroke": { "px@1080": 6, "join": "round", "cap": "round" },
  "radius": { "px@1080": 24 },
  "shadow": { "type": "flat", "offset@1080": [16, 18], "opacity": 0.25 },
  "light": { "from": "upper left", "blender": [-1, -1, 1.1] },
  "camera": { "lens_mm": 70, "elevation_deg": 12 }
}
```

- Colours are `#RRGGBB`. `palette.py check` reads every such string under `color`, in objects and lists alike.
- Sizes are given at 1080p (a 1920x1080 or 1080x1920 frame). An asset drawn at another size scales them.
- `light.blender` is the `light` argument of `asset3d.turntable()`; keep every 3D asset in a kit on the same one.

## style.md

Short and specific, one rule per line, in this order:

```markdown
# <kit name> style

## Shape
- Outlines: ink, 6 px at 1080p, round joins. Inner detail lines 4 px.
- Corners: 24 px radius on cards and panels; characters have no sharp corners.
- Proportions: characters are 3.5 heads tall; heads are circles.

## Colour
- Fills are flat. Gradients only on backgrounds, never on figures.
- Brand primary is for the hero object in a frame, at most one per frame.

## Light and depth
- Light from the upper left. Flat shadows 16/18 px down right, ink at 25%.
- 3D: one soft key light, upper left; 70 mm lens; 12 degree elevation.

## Don't
- No drop shadows with blur. No outlines on text. No pure white backgrounds (use paper).
```

When the user corrects an asset ("too thick", "warmer orange"), change the rule here first, then the asset, then any
other asset the rule touches.

## kit.json

```json
{
  "name": "acme",
  "version": 3,
  "refs": [ { "file": "refs/brand-guide.pdf", "from": "the user, Acme brand team" } ],
  "assets": [
    { "id": "kiko", "type": "char2d", "source": ["chars/kiko/parts.svg", "chars/kiko/rig.json"],
      "outputs": ["chars/kiko/kiko@4x.png", "chars/kiko/poses.png"], "size@1080": [400, 600] },
    { "id": "mug", "type": "model", "path": "main", "source": ["3d/mug/build.py"],
      "outputs": ["3d/mug/mug.glb", "3d/mug/mug.fbx", "3d/mug/mug.obj", "3d/mug/textures/", "3d/mug/turntable/"] },
    { "id": "swish", "type": "transition", "source": ["transitions/swish/transition.js"], "outputs": ["transitions/swish/frames/"], "duration": 0.6 }
  ],
  "credits": [ { "what": "studio_small_09 HDRI", "from": "Poly Haven", "licence": "CC0" } ]
}
```

Types: `svg` (icons, illustrations, logos, backgrounds, patterns), `char2d`, `model`, `char3d`, `texture`,
`transition`. Raise `version` when a change alters assets that videos already use, and say in the hand-over which ones
changed, so the user knows which videos to copy the kit into again.

## Names

- Folder and file names in lowercase with hyphens: `2d/icon-upload/`, `3d/coffee-mug/`.
- PNG outputs are `<asset>@<scale>x.png`, where the scale is relative to `size@1080`.
- SVG groups and rig parts use `snake_case` with `_l` / `_r` for the character's own left and right: `arm_l`,
  `eye_r`. Draw order in the SVG is back to front.
- A variant is its own asset with the base id and a suffix (`kiko-winter`), built from the same source with a
  parameter, not copied and edited.

## Consistency checks for every hand-over

- `sheet.py` with the new assets next to the hero asset and the references.
- `palette.py check tokens.json` on every new PNG. A flat 2D asset should be under about 3% off palette (edges and
  anti-aliasing); much more means a colour outside the tokens. Shaded 3D renders are mostly off palette by nature, so
  compare their base colour texture instead.
- Line weight: measure an outline in the 4x PNG (it should be 4x the token).
- The same light and lens on every 3D turntable.
