// A small WebGL2 stage for flat panels in 3D: each panel is a rectangle whose texture is a 2D canvas (so UI drawn
// with canvas code stays sharp), placed in space and seen through a perspective camera. It adds fog, depth of field
// (sharper or softer mip levels), a soft reflection on a glossy floor and an optional light band across a panel.
//
//   const stage = GL3D.create(width, height);
//   const tex = stage.texture(canvas2d);      // call tex.update() after drawing on canvas2d again
//   const out = stage.render(panels, view);   // returns the stage's canvas; draw it onto the page's canvas
//   const [px, py] = stage.project([x, y, z], view);   // a world point in the stage's pixels
//
// panels: [{ tex, w, h, pos: [x, y, z], rot: [rx, ry, rz] (radians, applied z, then x, then y), scale, alpha,
//            light (brightness multiplier), blur (extra softness), bias (draw-order nudge: higher draws later, on top),
//            reflect (false: no floor reflection), sheen (0..1 strength of a light band), sheenPos (0..1 across) }]
// view:   { eye, target, up = [0, 1, 0], fov (degrees, vertical), focus (distance kept sharp),
//           aperture (softness per unit of relative defocus), fog: { near, far, color: [r, g, b] in 0..1 },
//           floorY (reflect panels in the plane y = floorY), ground: [panels drawn first, sharp and unsorted] }
// Units: with fov 38 and the camera about 1600 from a panel, one unit is about one pixel at 1080p. y is up.
window.GL3D = (() => {
  // ---- 4x4 matrices, column-major as WebGL expects ----
  const mul = (a, b) => {
    const o = new Float32Array(16);
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        o[col * 4 + row] = a[row] * b[col * 4] + a[4 + row] * b[col * 4 + 1] + a[8 + row] * b[col * 4 + 2] + a[12 + row] * b[col * 4 + 3];
      }
    }
    return o;
  };
  const chain = (...ms) => ms.reduce((acc, m) => mul(acc, m));
  const translate = ([x, y, z]) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
  const scaling = s => [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1];
  const turnX = a => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]; };
  const turnY = a => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; };
  const turnZ = a => { const c = Math.cos(a), s = Math.sin(a); return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; };

  const minus = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const crossP = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const unit = a => { const n = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / n, a[1] / n, a[2] / n]; };

  const NEAR = 10, FAR = 40000;
  function viewProjection(view, aspect) {
    const f = 1 / Math.tan(view.fov * Math.PI / 360);
    const proj = [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (FAR + NEAR) / (NEAR - FAR), -1, 0, 0, 2 * FAR * NEAR / (NEAR - FAR), 0];
    const back = unit(minus(view.eye, view.target)), side = unit(crossP(view.up || [0, 1, 0], back)), up = crossP(back, side);
    const cam = [side[0], up[0], back[0], 0, side[1], up[1], back[1], 0, side[2], up[2], back[2], 0,
      -dot(side, view.eye), -dot(up, view.eye), -dot(back, view.eye), 1];
    return mul(proj, cam);
  }

  const VERTEX = `#version 300 es
    layout(location = 0) in vec2 corner;          // 0..1 across the panel, (0, 0) at its top left
    uniform mat4 viewProj, model;
    uniform vec2 size;
    out vec2 uv;
    out vec3 world;
    void main() {
      vec4 p = model * vec4((corner.x - 0.5) * size.x, (0.5 - corner.y) * size.y, 0.0, 1.0);
      world = p.xyz;
      uv = corner;
      gl_Position = viewProj * p;
    }`;
  const FRAGMENT = `#version 300 es
    precision highp float;
    in vec2 uv;
    in vec3 world;
    uniform sampler2D image;
    uniform float opacity, softness, brightness, band, bandAt, mirrored, floorY, fogNear, fogFar;
    uniform vec3 eye, fogColour;
    out vec4 colour;
    void main() {
      vec4 c = texture(image, uv, softness);                       // premultiplied
      c.rgb *= brightness;
      float across = uv.x * 0.65 + uv.y * 0.35;                     // a diagonal band of light
      c.rgb += band * max(0.0, 1.0 - abs(across - bandAt) * 5.0) * c.a;
      float haze = clamp((distance(world, eye) - fogNear) / (fogFar - fogNear), 0.0, 1.0) * 0.9;
      c.rgb = mix(c.rgb, fogColour * c.a, haze);
      float a = opacity;
      if (mirrored > 0.5) a *= 0.2 * exp(-max(0.0, floorY - world.y) / 160.0);   // fades with depth below the floor
      colour = c * a;
    }`;

  function create(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true, preserveDrawingBuffer: true });
    if (!gl) throw new Error('gl3d.js needs WebGL2');
    const shader = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const u = {};
    for (const name of ['viewProj', 'model', 'size', 'image', 'opacity', 'softness', 'brightness', 'band', 'bandAt',
      'mirrored', 'floorY', 'fogNear', 'fogFar', 'eye', 'fogColour']) u[name] = gl.getUniformLocation(program, name);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const anisotropy = gl.getExtension('EXT_texture_filter_anisotropic');

    function texture(src) {
      const handle = { t: gl.createTexture(), src };
      handle.update = () => {
        gl.bindTexture(gl.TEXTURE_2D, handle.t);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if (anisotropy) gl.texParameterf(gl.TEXTURE_2D, anisotropy.TEXTURE_MAX_ANISOTROPY_EXT, 8);
        return handle;
      };
      return handle.update();
    }

    const visible = p => p && p.tex && (p.alpha ?? 1) > 0.002;

    function drawPanel(p, view, softness, mirror) {
      let model = chain(translate(p.pos), turnY((p.rot || [])[1] || 0), turnX((p.rot || [])[0] || 0), turnZ((p.rot || [])[2] || 0), scaling(p.scale ?? 1));
      if (mirror) model = mul([1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 2 * view.floorY, 0, 1], model);
      gl.uniformMatrix4fv(u.model, false, model);
      gl.uniform2f(u.size, p.w, p.h);
      gl.uniform1f(u.opacity, p.alpha ?? 1);
      gl.uniform1f(u.softness, softness + (mirror ? 1.5 : 0));
      gl.uniform1f(u.brightness, p.light ?? 1);
      gl.uniform1f(u.band, mirror ? 0 : (p.sheen || 0));
      gl.uniform1f(u.bandAt, p.sheenPos ?? 0.5);
      gl.uniform1f(u.mirrored, mirror ? 1 : 0);
      gl.bindTexture(gl.TEXTURE_2D, p.tex.t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function render(panels, view) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const fog = view.fog || { near: 1e5, far: 2e5, color: [0, 0, 0] };
      gl.uniformMatrix4fv(u.viewProj, false, viewProjection(view, canvas.width / canvas.height));
      gl.uniform3fv(u.eye, view.eye);
      gl.uniform1f(u.fogNear, fog.near);
      gl.uniform1f(u.fogFar, fog.far);
      gl.uniform3fv(u.fogColour, fog.color);
      gl.uniform1f(u.floorY, view.floorY ?? -1e6);
      gl.activeTexture(gl.TEXTURE0);
      gl.uniform1i(u.image, 0);

      // Depth is measured along the view direction, not as straight distance, so stacked panels keep their order.
      const ahead = unit(minus(view.target, view.eye));
      const focus = view.focus;
      const items = panels.filter(visible).map(p => ({ p, depth: dot(minus(p.pos, view.eye), ahead) }))
        .sort((a, b) => (b.depth - (b.p.bias || 0)) - (a.depth - (a.p.bias || 0)));
      const softness = ({ p, depth }) => {
        const sharpAt = focus || depth;
        return Math.min(7, (p.blur ?? 0) + (view.aperture || 0) * Math.abs(depth - sharpAt) / Math.max(1, sharpAt));
      };

      for (const p of (view.ground || []).filter(visible)) drawPanel(p, view, p.blur ?? 0, false);
      if (view.floorY != null) for (const item of items) if (item.p.reflect !== false) drawPanel(item.p, view, softness(item), true);
      for (const item of items) drawPanel(item.p, view, softness(item), false);
      return canvas;
    }

    function project(point, view) {
      const m = viewProjection(view, canvas.width / canvas.height), [x, y, z] = point;
      const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
      const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
      const cw = m[3] * x + m[7] * y + m[11] * z + m[15];
      return [(cx / cw + 1) / 2 * canvas.width, (1 - cy / cw) / 2 * canvas.height];
    }

    return { gl, canvas, texture, render, project };
  }

  return { create };
})();
