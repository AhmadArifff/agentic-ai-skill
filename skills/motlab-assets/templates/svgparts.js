// A 2D character (or any object with moving parts) from one SVG and its rig.json, for motlab scene pages.
// The SVG keeps each part as a top-level <g id="..."> in the root <svg>; rig.json names the parts back to front, each
// with a pivot in the SVG's own units and an optional parent, so a hand follows the forearm it hangs from.
//
//   rig.json: { "parts": [ { "id": "arm_r", "pivot": [412, 380] }, { "id": "torso", "pivot": [360, 520] },
//                          { "id": "head", "pivot": [360, 300], "parent": "torso" }, ... ] }
//
//   import { loadRig } from './svgparts.js';
//   const kiko = await loadRig('assets/kits/acme/chars/kiko/parts.svg', 'assets/kits/acme/chars/kiko/rig.json', 2 * SCALE);
//   kiko.draw(ctx, x, y, { head: { rot: -0.1 }, arm_r: { rot: 0.6 } }, 0.5);   // x, y: where the SVG's origin goes; 0.5: drawn size
//
// A pose entry is { rot, dx, dy, s } (radians, SVG units, scale), all optional and relative to the drawn SVG. Parts are
// rasterised once at `res` pixels per SVG unit, so pass at least the largest size the part is drawn at. Parts the
// rig does not name are drawn as they are, behind the named ones.
export async function loadRig(svgUrl, rigUrl, res = 1) {
  const [text, rig] = await Promise.all([fetch(svgUrl).then(r => r.text()), fetch(rigUrl).then(r => r.json())]);
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml'), root = doc.documentElement;
  const vb = (root.getAttribute('viewBox') || `0 0 ${parseFloat(root.getAttribute('width'))} ${parseFloat(root.getAttribute('height'))}`).split(/[\s,]+/).map(Number);
  const named = new Set(rig.parts.map(p => p.id)), groups = [...root.children].filter(e => e.tagName === 'g' && e.id);
  for (const id of named) if (!groups.some(g => g.id === id)) throw new Error(`rig.json names "${id}", but ${svgUrl} has no top-level <g id="${id}">`);
  const w = Math.ceil(vb[2] * res), h = Math.ceil(vb[3] * res);
  async function only(keep) {   // the SVG with only these top-level groups visible, as an image of the whole viewBox
    const s = root.cloneNode(true); s.setAttribute('width', w); s.setAttribute('height', h);
    for (const g of [...s.children]) if (g.tagName === 'g' && g.id && !keep(g.id)) g.setAttribute('display', 'none');
    const img = new Image(); img.src = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(s)], { type: 'image/svg+xml' }));
    await img.decode(); return img;
  }
  const rest = groups.some(g => !named.has(g.id)) ? await only(id => !named.has(id)) : null;
  const imgs = Object.fromEntries(await Promise.all(rig.parts.map(async p => [p.id, await only(id => id === p.id)])));
  const byId = Object.fromEntries(rig.parts.map(p => [p.id, p]));

  function matrix(id, pose, memo) {   // the part's transform in SVG units, after its parents'
    if (memo[id]) return memo[id];
    const p = byId[id], m = p.parent ? DOMMatrix.fromMatrix(matrix(p.parent, pose, memo)) : new DOMMatrix(), o = pose[id] || {};
    const [px, py] = p.pivot || [0, 0];
    m.translateSelf((o.dx || 0) + px, (o.dy || 0) + py).rotateSelf((o.rot || 0) * 180 / Math.PI).scaleSelf(o.s ?? 1).translateSelf(-px, -py);
    return (memo[id] = m);
  }
  return {
    viewBox: vb, parts: rig.parts.map(p => p.id),
    draw(ctx, x, y, pose = {}, size = 1) {
      const base = ctx.getTransform(), memo = {};
      ctx.save(); ctx.translate(x, y); ctx.scale(size, size); ctx.translate(-vb[0], -vb[1]);
      const at = ctx.getTransform();
      if (rest) { ctx.setTransform(at.multiply(new DOMMatrix([1 / res, 0, 0, 1 / res, vb[0], vb[1]]))); ctx.drawImage(rest, 0, 0); }
      for (const p of rig.parts) {
        ctx.setTransform(at.multiply(matrix(p.id, pose, memo)).multiply(new DOMMatrix([1 / res, 0, 0, 1 / res, vb[0], vb[1]])));
        ctx.drawImage(imgs[p.id], 0, 0);
      }
      ctx.restore(); ctx.setTransform(base);
    },
  };
}
