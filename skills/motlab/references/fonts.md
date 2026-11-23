# Fonts

The user's own fonts come first. If the reference folder has brand fonts or brand guidelines that name a typeface,
use those. Otherwise the choice is free: any of the roughly 1,950 families on Google Fonts, picked to fit the video's
vibe. The examples below are starting points, not a list to stay inside.

Google Fonts families are released under open licences (mostly the SIL Open Font License), which allow use in
commercial videos. Downloading needs the internet; rendering does not, because the files live in the project.

## Picking one

1. **Name the vibe in a few words** from the brief and the references: the era, the energy, the audience, how serious
   it is. "Calm premium skincare", "loud street football promo", "friendly fintech for students".
2. **Shortlist 4 to 8 families.** Search the catalog with `python3 scripts/get_font.py list <words> [--cat Serif]`
   (categories: Sans Serif, Serif, Display, Handwriting, Monospace; most popular first) and add what you know fits.
   Don't fall back on Inter, Poppins, Roboto, Montserrat or Open Sans unless the brand uses them or the brief asks for
   something neutral.
3. **Look before choosing.** Download the shortlist into `<video>/assets/fonts-try/`, copy
   `templates/font-specimen.html` next to `fonts.css`, and run
   `motlab stills <video>/assets/fonts-try/font-specimen.html <outDir> 0`. Put the video's real words in the copy's
   `text` line first. Read the image and compare against the references.
4. **Pick one family, two at most** (a display face for big words and a text face for small ones). One family across
   several weights is often the strongest choice for motion. Download the winner into `<video>/assets/fonts/` and
   delete `fonts-try/`.
5. Name the font and the reason in one line when you post the shot list. The user can change it during review.

## Where to start, by vibe

| Vibe | Direction | Try |
|---|---|---|
| Clean tech, SaaS, fintech | Geometric or grotesk sans | Manrope, Plus Jakarta Sans, DM Sans, Sora, Outfit |
| Loud, sport, street, sale | Condensed and heavy | Anton, Bebas Neue, Oswald, Barlow Condensed, Archivo (width axis) |
| Luxury, fashion, beauty, editorial | High-contrast serif | Instrument Serif, Playfair Display, DM Serif Display, Cormorant Garamond, Gloock |
| Warm, friendly, food, kids | Rounded or soft | Fredoka, Nunito, Baloo 2, Fraunces (SOFT axis), Young Serif |
| Creative, music, youth culture | Characterful display | Bricolage Grotesque, Syne, Unbounded, Space Grotesk, Shrikhand |
| Retro, 70s and 80s | Fat, rounded display | Righteous, Bagel Fat One, Shrikhand, Rubik Mono One |
| Developer tools, data, terminal | Monospace | JetBrains Mono, Space Mono, IBM Plex Mono; pixel: VT323, Press Start 2P |
| Handmade notes, annotations | Handwriting, a few words only | Caveat, Kalam, Gochi Hand, Permanent Marker |
| Documentary, history, literary | Classic book serif | EB Garamond, Newsreader, Lora, Libre Caslon Text |

## Type that survives motion and compression

- Weights under 300 break up at small sizes and in the encoder. Keep hairlines for big words.
- Handwriting and script faces for one to three words, never for a sentence.
- Small text on a 1080p frame stays above about 28 px at `?scale=1`; on portrait clips keep it clear of the top and
  bottom where the app's interface sits.
- Variable fonts let weight and width animate. Download the range (`get_font.py get "Archivo" "wdth,wght@62..125,100..900"`),
  then set the weight as a number in `ctx.font` and the width with `ctx.fontStretch` (keywords such as `'condensed'`).
- Check the font covers the script of every line. Indonesian and English only need Latin.

## Download and use

```bash
python3 scripts/get_font.py get "Bricolage Grotesque" "wght@200..800" --out <video>/assets/fonts
python3 scripts/get_font.py get "Instrument Serif" "ital@0;1" --out <video>/assets/fonts
```

Axes follow the Google Fonts css2 syntax: `wght@400;700` for two weights, `wght@200..800` for a variable range,
`ital,wght@0,400;1,400` for regular and italic. A static font only has the weights `list` prints. Each call writes
`<slug>.css` and the woff2 files, and rebuilds `fonts.css` from every family in the folder.

In a scene page, link `fonts.css` and wait for every face the page uses. Fail loudly if one is missing, so a render
never ships in a fallback font:

```html
<link rel="stylesheet" href="../assets/fonts/fonts.css">
<script>
const FONTS = ['800 120px "Bricolage Grotesque"', 'italic 400 64px "Instrument Serif"'];
window.ready = Promise.all(FONTS.map(f => document.fonts.load(f).then(faces => {
  if (!faces.length) throw new Error(`font not loaded: ${f}`);
})));
</script>
```

`document.fonts.load` resolves to an empty list when no `@font-face` matches, and rejects when a file is missing.
Don't use `document.fonts.check` for this: it returns true for a family that was never declared.

Then draw with the same strings, for example `ctx.font = '800 120px "Bricolage Grotesque"'`.
