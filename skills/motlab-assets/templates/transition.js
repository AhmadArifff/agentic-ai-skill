// A transition as a layer over the cut: shapes that cover the frame at the cut and uncover the next scene. In a video,
// name it in project.json on the scene it leads into, and motlab draws it over the cut:
//   { "file": "scenes/02.html", "transition": { "layer": "assets/kits/acme/transitions/swish/transition.js", "duration": 0.6 } }
// A scene that has to draw it itself (one page holding both shots) can use atEnd and atStart:
//
//   import * as swish from '../assets/kits/acme/transitions/swish/transition.js';
//   // last scene's renderAt, after everything else:  const p = swish.atEnd(t, TOTAL); if (p !== null) swish.draw(ctx, p, W, H);
//   // next scene's renderAt, after everything else:  const p = swish.atStart(t);    if (p !== null) swish.draw(ctx, p, W, H);
//
// draw() works in the page's own pixels (call it under ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0)). At p = 0.5 the
// frame must be fully covered, so the cut does not show. Colours come from the kit's tokens.json.
export const DURATION = 0.6;                                   // seconds, half on each side of the cut
const COLORS = ['#FF5A1F', '#FFC23D', '#111111'];              // back to front; the last one covers the cut
const ANGLE = -0.35;                                           // radians the bands lean

const clamp01 = v => Math.max(0, Math.min(1, v));
const inOut = k => (k = clamp01(k)) < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;

export function draw(ctx, p, W, H) {
  const reach = Math.hypot(W, H), lag = 0.08;                  // each band trails the one in front of it
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(ANGLE);
  const n = COLORS.length, span = 0.5 - (n - 1) * lag;       // each band covers in `span`; the last one is done exactly at the cut
  COLORS.forEach((col, i) => {                                 // back bands lead in, and the front band leaves first
    const a = inOut((p - i * lag) / span);                     // 0 -> 1 while covering
    const b = inOut((p - 0.5 - (n - 1 - i) * lag) / span);     // 0 -> 1 while uncovering
    const x0 = -reach / 2 + reach * b, x1 = -reach / 2 + reach * a;
    if (x1 > x0) { ctx.fillStyle = col; ctx.fillRect(x0, -reach / 2, x1 - x0, reach); }
  });
  ctx.restore();
}

export const atEnd = (t, total) => { const s = total - DURATION / 2; return t >= s ? 0.5 * (t - s) / (DURATION / 2) : null; };   // 0 -> 0.5
export const atStart = t => t < DURATION / 2 ? 0.5 + 0.5 * t / (DURATION / 2) : null;                                               // 0.5 -> 1
