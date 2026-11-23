# Pitfalls

Problems that are easy to hit with motlab's scenes and scripts, what causes them and what to do.

## Rendering

| What you see | Why | What to do |
|---|---|---|
| A 3D scene renders black or empty | WebGL2 has no GPU to run on | motlab starts Chrome on the GPU and prints a `GPU:` line; if it names no GPU, fix the driver or Chrome first |
| Fast moves show separate copies instead of a blur | too few motion-blur sub-frames | 12 sub-frames over half a frame; fewer than 8 shows steps |
| Two renders at once fail or freeze the machine | GPU memory and encoder sessions run out | one or two renders at a time |
| A long Blender render stopped part way | a crash or a sleep | run the same command again; finished frames are skipped |
| A contact sheet made with ffmpeg's `tile` comes out empty | `-frames:v` counts output sheets, not input frames | trim with `-t` first, then `tile`, then `-frames:v 1`, or use `contact_sheet.py` on `motlab stills` |

## Drawing

| What you see | Why | What to do |
|---|---|---|
| Canvas shadows are the wrong size at 4K | shadow offsets and blur ignore the canvas transform | multiply them by `SCALE` |
| A thin grid flickers while the shot pushes in | lines of 1 to 2 px are resampled differently each frame | lines of about 3.5 px, low opacity, moved in whole pixels |
| Text slips behind a card in 3D | panels are ordered by depth | give the text panel a `bias` |
| An end logo sits off centre | the image file has empty margins, or the camera still drifts | centre it by its visible bounds and keep the last shot still |
| A gradient headline is hard to read on a colour field | low contrast between the gradient and the field | solid text on colour fields; gradients on dark backgrounds |
| Code after a `//` comment stopped running | the comment was put in the middle of a long one-line statement | put comments at the end of a line; check stills after editing |

## Motion

| What you see | Why | What to do |
|---|---|---|
| Held poses look uneven | 25 fps does not divide by 8 or 12 poses a second | render posed animation at 24 fps |
| A move has a bump in the middle | two curves joined at a hand-over | one `tracks.py` curve, or one easing, for the whole move |
| A fade ends with a snap | an easing that is still fast at its end | an ease that slows at both ends |
| A shape flips inside out while it morphs | it is interpolated towards a curve that bends the other way | change its curvature first, then move it |
| Morphing pieces collide | each piece moves at its own speed | drive them from one shared value with even spacing |

## Cut-outs and 3D shapes

| What you see | Why | What to do |
|---|---|---|
| A cut-out lost a part that shares the background colour | enclosed patches of that colour are removed, or the removal leaked in from the bottom edge | `key.py --keep-pockets` or `--no-bottom` |
| A moved layer leaves a hole behind it | the art was cut where objects overlap | redraw the scene as shapes |
| A small hole in a mesh closed up | too much smoothing | lower `smooth=` for that part |
| A white product disappears on a white background | nothing separates their edges | a thin dark outline where they meet |
| A fill in a frame shows a hard line round it | the fill stops at the anti-aliased edge | grow the fill mask by a few pixels |

## Files

| What you see | Why | What to do |
|---|---|---|
| A screen recording cannot be opened | it is still in the temporary folder the screenshot tool saves to | ask the user to save it to a normal folder |
