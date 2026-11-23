# The ad preset

A house style for short product, app and brand ads (about 8 to 20 seconds). Turn it on when the brief is that kind of
ad, when the user asks for it, or when their references look like it. Otherwise the references decide the look and only
`craft.md` applies. When the preset is on, apply all of it to every scene, not only to the scene a note was about.

## Structure

- Pick one path through the product and show it as 5 to 10 beats, one per line of voiceover: for an app, opening it,
  finding something, choosing, using it, then the brand. Each beat is a shot.
- Open on something that grabs the eye within a second: a flood of the brand colour, the logo flying in, a character
  caught mid-move.
- Leave time. Viewers need longer than a first draft gives them, especially for anything with text or a quick flip;
  when in doubt, slow a fast moment by half again.
- When the user wants several versions, make them differ in camera and look, not just in copy.

## Camera

- In 3D, one camera for the whole ad. Moves start quickly and settle slowly (an exponential ease out), with no sudden
  bursts of speed in the middle of a move.
- A move keeps its direction. Do not push in and then pull back on the same subject, and do not let an orbit swing back.
  If a card has to end facing the camera, let the move arrive there.
- Something is always moving, even if only a slow drift, so no frame looks frozen between two big moves.
- On a long scroll or pan, change the angle as it goes so the screen does not sit flat and still.

## Shot changes

- Each shot hands over to the next through a shape: an object in the outgoing shot (a button, a card, a logo, an
  avatar) grows until it fills the frame and becomes the next shot's background. Circles, rounded squares and cards
  turn into each other.
- Fill the growing shape with the next shot's colour first and let the next shot's content settle in a moment later,
  from slightly smaller to full size. Cutting straight to the next shot inside the shape looks abrupt by comparison.
- A small squash just before the shape grows gives it a push.
- Pieces that move together should share one speed and one spacing, and things meant to happen at once should happen at
  once.
- Curves keep bending the same way while they morph; one that flattens and flips looks broken.

## Framing and text

- Centre the subject, and keep the last shot perfectly still and centred, using the logo's visible bounds.
- Leave space for headlines, usually at the top, and keep them away from where things will move.
- Headlines in the brand's font, sentence case, short, with tight letter spacing (about -3%). Reveal them word by word,
  each word rising and sharpening with a short stagger (0.06 to 0.09 s), and take them away the same way. Avoid letters
  fading one by one, bouncing text and pops in scale.
- A gradient on text only on dark backgrounds. On a colour field use solid ink.
- On the end card, the tagline or URL is much smaller than the wordmark and sits below it. Typing the URL into a search
  field with a blinking caret is a clear call to action.

## Interfaces and assets

- Use the product's real screens, from the user's screenshots, cleaned up: personal names and photos replaced with
  neutral placeholders, notifications and unrelated apps removed, and every state correct (a playing track shows pause).
- Icons, wordmarks and buttons that the camera moves close to are drawn again as vector paths; a screenshot blurs at
  that size in 4K.
- A phone is built, not photographed: dark glass, a thin bezel, a frame with some depth. Side buttons only if their
  exact position is known.
- Characters from a brand's illustrations are cut out and puppeted; objects are redrawn as shapes (`engine-2d-puppet.md`).
- For a spec ad (made without the brand's involvement), add a small note at the end saying so, and do not borrow the
  brand's campaign lines.

## Finish

- Flat 2D work can hold poses (8 to 12 a second, rendered at 24 fps), with a pixel or two of jitter per pose and hard
  flat shadows, which gives it a hand-made feel.
- Reward the payoff beats with something small: a burst of short lines, a check mark stamping in, a little confetti
  in the brand colours, a quick flash as the logo lands, a light sweeping across the wordmark.
- In 3D, a shallow depth of field keeps the subject sharp and the rest soft, which makes it feel filmed. A physical
  product gets a single soft light (`blender.md`).
- Leave out soft drop shadows everywhere, lens flares, light leaks, wobbly text and glow on everything.
- End with what the viewer should do: download it, visit the URL, sign up.
