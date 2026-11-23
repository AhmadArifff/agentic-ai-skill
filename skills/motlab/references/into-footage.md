# Ending an animation inside real footage

Sometimes the animation has to hand over to a real clip: the rendered product lands exactly where the real one sits in
the first frame of the next shot, and the clip plays on. The clip has to be the user's own or licensed for this.

There are two ways to build it:

- **In motlab (the usual way).** The clip is a layer in the same scene (see `footage.md`). The animation ends on the
  clip's first frame and the clip plays on in the same page, so the user reviews and exports it like any other scene.
- **Outside motlab.** `scripts/compose_into_clip.py` joins a folder of transparent PNG frames to a clip with ffmpeg. The
  frames have to come from a transparent Blender render (`blender.md`), because motlab cannot export alpha.

```
python3 scripts/compose_into_clip.py frames/ clip.mp4 out.mp4 --start 2.0 --end 8 --fade 6.2 7.5 --melt 7.45 7.95 --sfx ad.wav
```

The rendered frames play over black. During `--fade` the black gives way to the clip's frame at `--start`, held still;
during `--melt` the rendered object fades out over the real one; at `--end` the clip itself runs on from `--start`.
`--sfx` is the animation's sound from 0 s, and the clip's own sound follows from `--end`. Output is 4K at 25 fps unless
`--w`, `--h` and `--fps` say otherwise.

## Work backwards from the target frame

Ask early which clip comes next and where in it the hand-over happens, then design the ending from that frame.

1. Export the frame: `ffmpeg -ss <seconds> -i clip.mp4 -frames:v 1 target.png`.
2. Measure the object in it: position, size, angle, which side faces the camera. Keep these numbers together in the
   scene so the last pose uses them.
3. Overlay the render's last frame on `target.png` and adjust until they line up.
4. Check the clip's frame rate with ffprobe; it is often not what the file name suggests.

## Hiding the join

- **Fade the black away** when the object is already in place: it settles on its target over black, the held frame
  fades in behind it, and the render dissolves into the real object over about half a second. This is what
  `compose_into_clip.py` does.
- **Pull back out of a dark shape** when the next shot has one (a hand, a silhouette): start with the held frame scaled
  up so far that a dark area fills the screen, then shrink it and the rendered object together so they move as one, and
  bring the object along a natural path to where it ends up. Mask with the footage's dark shapes so fingers pass in
  front of the render.
- **Match the look** of the footage by the end. Shaded 3D does not melt into flat, silhouetted footage; render the flat
  look instead (`blender.md`).
- If the real object has to be painted out of the held frame while the render moves, grow the fill a few pixels beyond
  the object's edge, or a faint outline stays.
- A white object on a white background disappears. Give it a thin dark edge if the footage shows one.

## Checking it

- Compare neighbouring frames around the join (mean difference per frame). A spike is a visible jump.
- The held frame is still, and the clip starts moving at once. If the footage moves fast, the start can feel abrupt;
  ask the user to watch it at full speed.
- Text must not end up on a background of its own colour after the hand-over.
- Let the sound carry across the join instead of stopping with the animation.
