# 3D: UI panels in space (gl3d.js) and real models (three.js)

There are two 3D paths. For screens, cards and text floating in space, use `scripts/gl3d.js` with
`templates/template-3d.html`. For real models (a product, a character, a room), use three.js with
`templates/template-three.html`. Both draw onto the page's 2D canvas, so 2D titles and overlays work the same way on
top. motlab runs Chrome on the GPU, so WebGL2 works without extra flags.

## Panels with gl3d.js

Every element is a flat rectangle. Its picture is an ordinary 2D canvas, drawn with the same code as any 2D scene, so
text and icons stay sharp; gl3d.js places the rectangle in 3D and looks at it through a perspective camera.

```js
const stage = GL3D.create(cv.width, cv.height);
const tex = stage.texture(canvas2d);        // tex.update() after drawing on canvas2d again
ctx.drawImage(stage.render(panels, view), 0, 0);
const [px, py] = stage.project([x, y, z], view);   // where a 3D point lands on screen
```

A panel is `{ tex, w, h, pos, rot, scale, alpha, light, blur, bias, reflect, sheen, sheenPos }` and the view is
`{ eye, target, up, fov, focus, aperture, fog: { near, far, color }, floorY, ground }`. The comment at the top of
`gl3d.js` explains each field.

- Scale: with `fov` 34 to 38 and the camera about 1600 units away, a unit is about a pixel at 1080p, so a 540 x 760
  panel looks like a 540 x 760 card. y points up.
- Draw order: panels are drawn far to near, by depth along the view direction. Things stacked almost on top of each
  other (a play button on a cover, a title on a card) can swap places as the camera moves; `bias` pulls a panel
  forward in the order without moving it. A few units is enough for art on a card; text that must always win can take
  hundreds.
- Depth of field: `focus` is the distance kept sharp and `aperture` how fast the rest softens. It works by reading
  smaller mip levels, which looks like a soft lens blur. `blur` softens one panel on its own.
- `fog` fades far panels into a colour, usually the background's. `floorY` adds a faint mirrored copy of every panel
  below that height, like a glossy floor; `reflect: false` leaves a panel out. `ground` panels (a floor texture,
  contact shadows) are drawn first, flat and sharp.
- `sheen` and `sheenPos` slide a diagonal band of light across a panel, for glass and glossy cards.
- `rot` is in radians and applied z first, then x, then y. A panel at `pos` faces a camera at `eye` with
  `ry = atan2(dx, dz)` and `rx = -asin(dy / distance)`, where `d = eye - pos`.

### How the template is put together

- Each element is a `panel(w, h, pad, paint)`. `pad` leaves room round it for a drop shadow. `panel.update(args)`
  redraws the picture only when its arguments changed, so animating a panel's content is cheap. Pictures are drawn at
  `TEX` (2) times their size, so they hold up when the camera comes close.
- One camera function `camera(t)` drives the whole scene, and `panels(t)` returns where everything is at time `t`.
- Motion blur renders `SUBFRAMES` (12) moments across half a frame and averages them. With only a handful, a fast move
  shows separate copies instead of a smear.

### Ideas that work with panels

- A glow behind the subject: `project()` its position and draw a soft radial gradient there on the 2D canvas before
  drawing the 3D layer.
- A circle that becomes a card: redraw the panel's picture step by step (circle, rounded square, the card's content)
  and move the panel to the card's place at the same time.
- A wall of tiles that seems endless: draw a small repeating set of tiles around the camera and skip the ones behind
  it or off screen (check with `project()`).
- A phone: a screen panel drawn at twice the screenshot's pixels, a dark glass body behind it, and a stack of thin
  slices behind that for the edge. To fly into one icon, fade the phone out gently and put the icon on its own sharp
  panel so it does not pixelate.
- Swapping what is on a card unseen: turn the camera round it and change the content on the frame where the card is
  edge-on to the camera.

## Real models with three.js

gl3d.js has no meshes. For models start from `templates/template-three.html`. It loads three.js 0.186.1 from jsDelivr
through an import map, so a render needs the network. Set `MODEL` to a `.glb` or `.gltf` next to the page; left empty,
it shows a placeholder box. The model is scaled to 1.6 units and stood on a shadow floor, lit by `RoomEnvironment` and
one key light, with a one-way camera and a 2D title over it.

- three.js draws into its own WebGL canvas, which `render()` copies onto `#c`. So `#c` stays a 2D canvas and titles,
  captions and glows are drawn with the same code as in the 2D template, after the copy.
- Everything comes from `t`. Model animations play through `AnimationMixer` with `mixer.setTime(t)`, never a
  `THREE.Clock` or `mixer.update(delta)`. Stills rendered in the order 0.5, 1.5, 3, 5.9 s and again in reverse were
  identical byte for byte, for the box and for an animated glTF.
- `SUB` above 1 averages that many renders across a half-frame shutter into motion blur, at that many times the cost.
- Measured on the test laptop (RTX 3060 Laptop) for the template's 6 s at 30 fps: 52 fps to encode at 1080p and 23
  fps at 4K for the box, 39 and 22 fps for the glTF. In the viewer `renderAt` took under 1 ms of script time, because
  the GPU work runs after it returns, so that number says nothing about the GPU.
- Ask where a model comes from: the user's own work or a licence that allows this use. GLB or glTF with textures is
  easiest; three.js also has `FBXLoader`
  and `OBJLoader` under `three/addons/loaders/`.
- Keep the light simple (the environment and one key light) and the camera on one continuous move. Flat UI goes on top
  as 2D overlays or as textured planes in the scene.
- A detailed character cannot be modelled from scratch here to a professional standard. Ask for the model files.
  A flat picture of a 3D render can still float in space as a gl3d.js panel, but it cannot turn.
